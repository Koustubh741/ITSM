"""
Asset CRUD endpoints (Asynchronous)
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..schemas.asset_schema import AssetCreate, AssetUpdate, AssetResponse, AssetAssignmentRequest
from ..services import asset_service
from ..services import asset_request_service
from ..database.database import get_db
from ..models.models import AssetRequest
from datetime import date

router = APIRouter(
    prefix="/assets",
    tags=["assets"]
)


@router.get("", response_model=List[AssetResponse])
async def get_all_assets(db: AsyncSession = Depends(get_db)):
    """
    Get all assets (Asynchronous).
    """
    try:
        return await asset_service.get_all_assets(db)
    except Exception as e:
        import traceback
        traceback.print_exc()
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal server error: {str(e)}"},
            headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
        )


@router.get("/my-assets", response_model=List[AssetResponse])
async def get_my_assets(user: str, db: AsyncSession = Depends(get_db)):
    """
    Get assets assigned to a specific user (Asynchronous).
    """
    return await asset_service.get_assets_by_assigned_to(db, user)


@router.get("/stats")
async def get_asset_stats(db: AsyncSession = Depends(get_db)):
    """
    Get asset statistics for dashboard (Asynchronous).
    """
    return await asset_service.get_asset_stats(db)


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(asset_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Get asset by ID (Asynchronous).
    """
    asset = await asset_service.get_asset_by_id(db, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@router.post("", response_model=AssetResponse, status_code=201)
async def create_asset(
    asset: AssetCreate,
    db: AsyncSession = Depends(get_db),
    request_id: Optional[UUID] = Query(None, description="Asset request ID")
):
    """
    Create a new asset (Asynchronous).
    """
    if request_id:
        asset_request = await asset_request_service.get_asset_request_by_id(db, request_id)
        if not asset_request:
            raise HTTPException(status_code=404, detail="Asset request not found")
        if asset_request.status != "IT_APPROVED":
            raise HTTPException(status_code=403, detail="Asset request not IT approved")
    
    return await asset_service.create_asset(db, asset)


@router.patch("/{asset_id}", response_model=AssetResponse)
async def update_asset(asset_id: UUID, asset_update: AssetUpdate, db: AsyncSession = Depends(get_db)):
    """
    Update an asset (Asynchronous).
    """
    updated_asset = await asset_service.update_asset(db, asset_id, asset_update)
    if not updated_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return updated_asset


@router.patch("/{asset_id}/assign", response_model=AssetResponse)
async def assign_asset(
    asset_id: UUID,
    assignment: AssetAssignmentRequest,
    db: AsyncSession = Depends(get_db),
    request_id: Optional[UUID] = Query(None, description="Asset request ID")
):
    """
    Assign an asset to a user (Asynchronous).
    """
    if request_id:
        asset_request = await asset_request_service.get_asset_request_by_id(db, request_id)
        if not asset_request:
            raise HTTPException(status_code=404, detail="Asset request not found")
        if asset_request.status != "IT_APPROVED":
            raise HTTPException(status_code=403, detail="Asset request not IT approved")
    else:
        # Try to find request by asset_id
        result = await db.execute(select(AssetRequest).filter(AssetRequest.asset_id == asset_id))
        asset_request_db = result.scalars().first()
        if asset_request_db and asset_request_db.status != "IT_APPROVED":
            raise HTTPException(status_code=403, detail="Asset request not IT approved")
    
    assign_date = assignment.assignment_date or date.today()
    
    assigned_asset = await asset_service.assign_asset(
        db,
        asset_id, 
        assignment.assigned_to, 
        assignment.location or "Office", 
        assign_date
    )
    if not assigned_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return assigned_asset


@router.patch("/{asset_id}/status", response_model=AssetResponse)
async def update_asset_status(asset_id: UUID, status: str, db: AsyncSession = Depends(get_db)):
    """
    Update asset status (Asynchronous).
    """
    updated_asset = await asset_service.update_asset(db, asset_id, AssetUpdate(status=status))
    if not updated_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return updated_asset


@router.get("/{asset_id}/events")
async def get_asset_events(asset_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Get asset event history (Asynchronous).
    """
    events = await asset_service.get_asset_events(db, asset_id)
    if events is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return events
