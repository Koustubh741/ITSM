"""
Departments Router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from database import get_db
from models import Department, User
from routers.auth import get_current_user

router = APIRouter()


class DepartmentResponse(BaseModel):
    id: int
    name: str
    code: str | None
    description: str | None
    active: bool
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[DepartmentResponse])
async def get_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all departments"""
    departments = db.query(Department).filter(Department.active == True).all()
    return departments
