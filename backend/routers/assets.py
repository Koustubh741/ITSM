from fastapi import APIRouter, HTTPException, status
from typing import List
from schemas.asset_schema import AssetCreate, AssetUpdate, AssetResponse
from services import asset_service

router = APIRouter(
    prefix="/assets",
    tags=["assets"]
)

@router.get("/", response_model=List[AssetResponse])
def get_assets():
    return asset_service.get_all_assets()

@router.get("/stats")
def get_stats():
    return asset_service.get_asset_stats()

@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: str):
    asset = asset_service.get_asset_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("/", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
def create_asset(asset: AssetCreate):
    return asset_service.create_asset(asset)

@router.patch("/{asset_id}/assign", response_model=AssetResponse)
def assign_asset(asset_id: str, assign_data: AssetUpdate):
    # We expect assigned_to, location, and assignment_date in the body
    if not assign_data.assigned_to or not assign_data.location:
         raise HTTPException(status_code=400, detail="assigned_to and location are required")
    
    updated_asset = asset_service.assign_asset(
        asset_id, 
        assign_data.assigned_to, 
        assign_data.location, 
        assign_data.assignment_date
    )
    if not updated_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return updated_asset

@router.patch("/{asset_id}/status", response_model=AssetResponse)
def update_status(asset_id: str, status_data: AssetUpdate):
    if not status_data.status:
        raise HTTPException(status_code=400, detail="status is required")
        
    updated_asset = asset_service.update_asset(asset_id, AssetUpdate(status=status_data.status))
    if not updated_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return updated_asset

@router.get("/{asset_id}/events")
def get_asset_events(asset_id: str):
    events = asset_service.get_asset_events(asset_id)
    if not events:
        # Fallback if no asset found or no events generated (shouldn't happen with valid ID)
        raise HTTPException(status_code=404, detail="Asset not found")
    return events

@router.get("/{asset_id}/relationships")
def get_asset_relationships(asset_id: str):
    # Mock CMDB relationships
    return {
        "upstream": [{"id": "srv-001", "name": "App Server 1", "type": "Server"}],
        "downstream": [{"id": "app-crm", "name": "CRM System", "type": "Application"}]
    }
