"""
Dashboard Router - Statistics and metrics
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Asset, Request, User, AssetStatus, AssetSegment, RequestStatus
from routers.auth import get_current_user

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics based on user role"""
    
    # Asset statistics
    total_assets = db.query(Asset).filter(Asset.is_deleted == False).count()
    
    assets_by_status = {}
    for status in AssetStatus:
        count = db.query(Asset).filter(
            Asset.status == status,
            Asset.is_deleted == False
        ).count()
        assets_by_status[status.value] = count
    
    assets_by_segment = {}
    for segment in AssetSegment:
        count = db.query(Asset).filter(
            Asset.segment == segment,
            Asset.is_deleted == False
        ).count()
        assets_by_segment[segment.value] = count
    
    # Request statistics
    total_requests = db.query(Request).count()
    pending_requests = db.query(Request).filter(Request.status == RequestStatus.PENDING).count()
    
    # Asset value
    total_value = db.query(func.sum(Asset.current_value)).filter(
        Asset.is_deleted == False
    ).scalar() or 0
    
    # Role-specific stats
    role_val = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    if role_val == "end_user":
        my_assets = db.query(Asset).filter(
            Asset.assigned_to == current_user.id,
            Asset.is_deleted == False
        ).count()
        
        my_requests = db.query(Request).filter(
            Request.requester_id == current_user.id
        ).count()
        
        return {
            "my_assets": my_assets,
            "my_requests": my_requests,
            "pending_requests": db.query(Request).filter(
                Request.requester_id == current_user.id,
                Request.status == RequestStatus.PENDING
            ).count()
        }
    
    # Admin/Manager stats
    return {
        "total_assets": total_assets,
        "assets_by_status": assets_by_status,
        "assets_by_segment": assets_by_segment,
        "total_requests": total_requests,
        "pending_requests": pending_requests,
        "total_value": float(total_value),
        "currency": "INR"
    }


@router.get("/assets-by-location")
async def get_assets_by_location(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get asset distribution by location"""
    from models import Location
    
    locations = db.query(Location).filter(Location.active == True).all()
    
    distribution = []
    for location in locations:
        count = db.query(Asset).filter(
            Asset.location_id == location.id,
            Asset.is_deleted == False
        ).count()
        
        distribution.append({
            "location": location.name,
            "count": count
        })
    
    return distribution


@router.get("/recent-assets")
async def get_recent_assets(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recently added assets"""
    assets = db.query(Asset).filter(
        Asset.is_deleted == False
    ).order_by(Asset.created_at.desc()).limit(limit).all()
    
    return [{
        "id": asset.id,
        "asset_tag": asset.asset_tag,
        "name": asset.name,
        "status": asset.status.value,
        "created_at": asset.created_at
    } for asset in assets]
