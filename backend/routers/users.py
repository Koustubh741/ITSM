"""
Users Router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, EmailStr

from database import get_db
from models import User, UserRole
from routers.auth import get_current_user, get_password_hash

router = APIRouter()


class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    role: UserRole
    employee_id: str | None
    department_id: int | None
    location_id: int | None
    is_active: bool
    
    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: UserRole
    employee_id: str | None = None
    department_id: int | None = None
    location_id: int | None = None


@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users"""
    users = db.query(User).filter(User.is_active == True).offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/", response_model=UserResponse)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new user (admin only)"""
    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if email exists
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    db_user = User(
        **user.model_dump(exclude={"password"}),
        password_hash=get_password_hash(user.password)
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user
