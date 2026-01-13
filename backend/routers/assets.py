"""
Asset CRUD endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from schemas.asset_schema import AssetCreate, AssetUpdate, AssetResponse, AssetAssignmentRequest, URLRequest
from services import asset_service
from services import asset_request_service

router = APIRouter(
    prefix="/assets",
    tags=["assets"]
)


@router.get("", response_model=List[AssetResponse])
async def get_all_assets():
    """
    Get all assets
    """
    try:
        return asset_service.get_all_assets()
    except Exception as e:
        # Log full traceback to server logs for debugging
        import traceback
        traceback.print_exc()
        # Return a safe JSON response so the client sees a JSON 500
        from fastapi.responses import JSONResponse
        # Include CORS header explicitly for error responses to avoid browser blocking
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error while fetching assets"},
            headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
        )


@router.get("/my-assets", response_model=List[AssetResponse])
async def get_my_assets(user: str):
    """
    Get assets assigned to a specific user (by name for now)
    """
    return asset_service.get_assets_by_assigned_to(user)


@router.get("/stats")
async def get_asset_stats():
    """
    Get asset statistics for dashboard
    """
    return asset_service.get_asset_stats()


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(asset_id: str):
    """
    Get asset by ID
    """
    asset = asset_service.get_asset_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@router.get("/search/by-id-or-serial")
async def search_asset_by_id_or_serial(
    asset_id: Optional[str] = Query(None, description="Asset ID (UUID)"),
    serial_number: Optional[str] = Query(None, description="Serial Number")
):
    """
    Search for an asset by ID or Serial Number
    """
    if not asset_id and not serial_number:
        raise HTTPException(
            status_code=400,
            detail="Either asset_id or serial_number must be provided"
        )
    
    asset = asset_service.search_asset_by_id_or_serial(
        asset_id=asset_id,
        serial_number=serial_number
    )
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@router.post("", response_model=AssetResponse, status_code=201)
async def create_asset(
    asset: AssetCreate,
    request_id: Optional[str] = Query(None, description="Asset request ID - if provided, validates request is IT_APPROVED")
):
    """
    Create a new asset (INTERNAL/ADMIN USE ONLY)
    
    Note: For normal asset requests, use POST /asset-requests instead.
    This endpoint is reserved for:
    - Admin/internal asset creation
    - Creating assets after IT approval workflow
    
    If request_id is provided, validates that the asset request is IT_APPROVED
    """
    # Validate asset request if request_id is provided
    if request_id:
        asset_request = asset_request_service.get_asset_request_by_id(request_id)
        if not asset_request:
            raise HTTPException(status_code=404, detail="Asset request not found")
        if asset_request.status != "IT_APPROVED":
            raise HTTPException(
                status_code=403,
                detail="Asset request not IT approved"
            )
    
    return asset_service.create_asset(asset)


@router.patch("/{asset_id}", response_model=AssetResponse)
async def update_asset(asset_id: str, asset_update: AssetUpdate):
    """
    Update an asset
    """
    updated_asset = asset_service.update_asset(asset_id, asset_update)
    if not updated_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return updated_asset


@router.patch("/{asset_id}/assign", response_model=AssetResponse)
async def assign_asset(
    asset_id: str,
    assignment: AssetAssignmentRequest,
    request_id: Optional[str] = Query(None, description="Asset request ID - if provided, validates request is IT_APPROVED")
):
    """
    Assign an asset to a user
    If request_id is provided, validates that the asset request is IT_APPROVED
    """
    from datetime import date
    from sqlalchemy.orm import Session
    from database import SessionLocal
    
    # Validate asset request if request_id is provided
    if request_id:
        asset_request = asset_request_service.get_asset_request_by_id(request_id)
        if not asset_request:
            raise HTTPException(status_code=404, detail="Asset request not found")
        if asset_request.status != "IT_APPROVED":
            raise HTTPException(
                status_code=403,
                detail="Asset request not IT approved"
            )
    else:
        # If no request_id provided, try to find request by asset_id
        # This handles cases where asset was created from a request
        db = SessionLocal()
        try:
            from models import AssetRequest
            asset_request_db = db.query(AssetRequest).filter(
                AssetRequest.asset_id == asset_id
            ).first()
            if asset_request_db and asset_request_db.status != "IT_APPROVED":
                raise HTTPException(
                    status_code=403,
                    detail="Asset request not IT approved"
                )
        finally:
            db.close()
    
    assign_date = assignment.assignment_date or date.today()
    
    assigned_asset = asset_service.assign_asset(
        asset_id, 
        assignment.assigned_to, 
        assignment.location or "Office", 
        assign_date
    )
    if not assigned_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return assigned_asset


@router.patch("/{asset_id}/status", response_model=AssetResponse)
async def update_asset_status(asset_id: str, status: str):
    """
    Update asset status
    """
    updated_asset = asset_service.update_asset(asset_id, AssetUpdate(status=status))
    if not updated_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return updated_asset


@router.get("/{asset_id}/events")
async def get_asset_events(asset_id: str):
    """
    Get asset event history
    """
    events = asset_service.get_asset_events(asset_id)
    if events is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return events
    

@router.post("/fetch-from-url")
async def fetch_asset_from_url(request: URLRequest):
    """
    Fetch asset information from manufacturer website URL (e.g., Lenovo, HP, Dell)
    
    This endpoint scrapes manufacturer websites to extract asset specifications
    when a QR code contains a URL pointing to a product page.
    
    Args:
        request: JSON body with url field containing manufacturer website URL
        
    Returns:
        Dictionary with asset information including:
        - vendor, model, type, specifications (cpu, ram, storage), etc.
    """
    from services.manufacturer_scraper import fetch_asset_from_url as scrape_url
    
    if not request.url or not request.url.startswith(('http://', 'https://')):
        raise HTTPException(
            status_code=400,
            detail="Invalid URL. Must start with http:// or https://"
        )
    
    try:
        asset_data = scrape_url(request.url)
        
        # If there's an error in the data, still return what we have
        # The frontend can handle partial data
        return asset_data
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch asset data from URL: {str(e)}"
        )

