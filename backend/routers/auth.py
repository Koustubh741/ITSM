"""
Authentication Router - Login, Logout, Token Management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from typing import Optional

from database import get_db
from models import User, UserRole
from config import settings

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# Pydantic schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    role: UserRole
    employee_id: Optional[str]
    is_active: bool
    
    class Config:
        from_attributes = True


# Helper functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        with open("debug_auth.log", "a") as f:
            f.write(f"DEBUG: Token received: {token[:10]}...\n")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = payload.get("sub")
        with open("debug_auth.log", "a") as f:
            f.write(f"DEBUG: User ID from token: {user_id}\n")
        if user_id is None:
            with open("debug_auth.log", "a") as f:
                f.write("DEBUG: No sub in payload\n")
            raise credentials_exception
    except JWTError as e:
        with open("debug_auth.log", "a") as f:
            f.write(f"DEBUG: JWT Error: {e}\n")
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        with open("debug_auth.log", "a") as f:
            f.write(f"DEBUG: User {user_id} not found in DB\n")
        raise credentials_exception
    return user


# Routes
@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login with email and password
    Returns JWT access token
    """
    # Find user by email (using username field from OAuth2PasswordRequestForm)
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Handle role safely (whether Enum or string)
    try:
        if hasattr(user.role, 'value'):
            role_val = user.role.value
        else:
            role_val = str(user.role)
    except Exception:
        role_val = "end_user" # Fallback
        
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": role_val},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": role_val,
            "employee_id": user.employee_id,
            "is_active": user.is_active
        }
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@router.post("/logout")
async def logout():
    """Logout (client should discard token)"""
    return {"message": "Successfully logged out"}
