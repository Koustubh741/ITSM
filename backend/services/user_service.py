from sqlalchemy.orm import Session
from models import User
from schemas.user_schema import UserCreate, UserUpdate
import uuid

from passlib.context import CryptContext

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback to plain text comparison for dev seeds if they are not hashed
        return plain_password == hashed_password

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        id=str(uuid.uuid4()),
        email=user.email,
        full_name=user.full_name,
        password_hash=hashed_password,
        role=user.role or "END_USER",
        status=user.status if user.status else "PENDING",
        position=user.position,
        domain=user.domain,
        department=user.department,
        location=user.location,
        phone=user.phone,
        company=user.company
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    # Check if user is active
    if user.status != "ACTIVE":
        return None
    return user

def activate_user(db: Session, user_id: str) -> User:
    """
    Activate a user by setting their status to ACTIVE.
    Returns the updated user or None if not found.
    """
    user = get_user(db, user_id)
    if not user:
        return None
    user.status = "ACTIVE"
    db.commit()
    db.refresh(user)
    return user

def get_users(db: Session, status: str = None):
    query = db.query(User)
    if status:
        query = query.filter(User.status == status)
    return query.all()
