"""
Assets Router - CRUD operations for assets
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from pydantic import BaseModel
from datetime import date, datetime

from database import get_db
from models import Asset, AssetStatus, AssetSegment, AssetCondition, User
from routers.auth import get_current_user

router = APIRouter()


# Pydantic Schemas
class AssetBase(BaseModel):
    asset_tag: str
    name: str
    segment: AssetSegment
    status: Optional[AssetStatus] = AssetStatus.AVAILABLE
    condition: Optional[AssetCondition] = AssetCondition.GOOD
    category_id: Optional[int] = None
    assigned_to: Optional[int] = None
    owner_id: Optional[int] = None
    department_id: Optional[int] = None
    location_id: Optional[int] = None
    purchase_date: Optional[date] = None
    purchase_cost: Optional[float] = None
    current_value: Optional[float] = None
    specifications: Optional[dict] = {}
    serial_number: Optional[str] = None
    model_number: Optional[str] = None
    manufacturer: Optional[str] = None
    notes: Optional[str] = None


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[AssetStatus] = None
    condition: Optional[AssetCondition] = None
    assigned_to: Optional[int] = None
    location_id: Optional[int] = None
    specifications: Optional[dict] = None
    notes: Optional[str] = None


class AssetResponse(AssetBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Routes
@router.get("/", response_model=List[AssetResponse])
async def get_assets(
    skip: int = 0,
    limit: int = 100,
    status: Optional[AssetStatus] = None,
    segment: Optional[AssetSegment] = None,
    location_id: Optional[int] = None,
    assigned_to: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all assets with optional filters
    """
    query = db.query(Asset).filter(Asset.is_deleted == False)
    
    # Apply filters
    if status:
        query = query.filter(Asset.status == status)
    
    if segment:
        query = query.filter(Asset.segment == segment)
    
    if location_id:
        query = query.filter(Asset.location_id == location_id)
    
    if assigned_to:
        query = query.filter(Asset.assigned_to == assigned_to)
    
    if search:
        search_filter = or_(
            Asset.asset_tag.ilike(f"%{search}%"),
            Asset.name.ilike(f"%{search}%"),
            Asset.serial_number.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Role-based filtering (end users see only their assets)
    # Check role value safely
    role_val = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    if role_val == "end_user":
        query = query.filter(Asset.assigned_to == current_user.id)
    
    assets = query.offset(skip).limit(limit).all()
    return assets


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single asset by ID"""
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.is_deleted == False
    ).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Check permissions
    role_val = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    if role_val == "end_user" and asset.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this asset")
    
    return asset


@router.post("/", response_model=AssetResponse)
async def create_asset(
    asset: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new asset"""
    # Check if asset tag already exists
    existing = db.query(Asset).filter(Asset.asset_tag == asset.asset_tag).first()
    if existing:
        raise HTTPException(status_code=400, detail="Asset tag already exists")
    
    # Create asset
    db_asset = Asset(
        **asset.model_dump(),
        created_by=current_user.id
    )
    
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    
    return db_asset


@router.put("/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: int,
    asset_update: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update asset"""
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.is_deleted == False
    ).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Update fields
    update_data = asset_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(asset, field, value)
    
    db.commit()
    db.refresh(asset)
    
    return asset


@router.delete("/{asset_id}")
async def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft delete asset"""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Soft delete
    asset.is_deleted = True
    asset.deleted_at = datetime.utcnow()
    asset.deleted_by = current_user.id
    
    db.commit()
    
    return {"message": "Asset deleted successfully"}


@router.get("/stats/summary")
async def get_asset_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get asset statistics"""
    total = db.query(Asset).filter(Asset.is_deleted == False).count()
    
    by_status = {}
    for status in AssetStatus:
        count = db.query(Asset).filter(
            Asset.status == status,
            Asset.is_deleted == False
        ).count()
        by_status[status.value] = count
    
    by_segment = {}
    for segment in AssetSegment:
        count = db.query(Asset).filter(
            Asset.segment == segment,
            Asset.is_deleted == False
        ).count()
        by_segment[segment.value] = count
    
    return {
        "total": total,
        "by_status": by_status,
        "by_segment": by_segment
    }
