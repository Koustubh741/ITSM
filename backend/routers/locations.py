"""
Locations Router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from database import get_db
from models import Location, User
from routers.auth import get_current_user

router = APIRouter()


class LocationResponse(BaseModel):
    id: int
    name: str
    code: str | None
    city: str | None
    state: str | None
    country: str | None
    active: bool
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[LocationResponse])
async def get_locations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all locations"""
    locations = db.query(Location).filter(Location.active == True).all()
    return locations
