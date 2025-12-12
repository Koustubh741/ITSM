from fastapi import APIRouter, HTTPException
from typing import List, Optional
from services.asset_service import get_all_assets, update_asset, get_asset_by_id
from schemas.asset_schema import AssetUpdate

router = APIRouter(
    prefix="/workflows",
    tags=["workflows"]
)

@router.post("/review/{asset_id}")
async def review_renewal(asset_id: str, action: str, comments: Optional[str] = None):
    # Action: "approve" or "reject"
    # Logic: 
    # Current "Requested" -> Approve -> "IT_Approved"
    # Current "IT_Approved" -> Approve -> "Finance_Approved"
    # Current "Finance_Approved" -> Approve -> "Commercial_Approved" -> PO Gen -> "Renewed"
    
    asset = get_asset_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    current_status = asset.renewal_status
    new_status = current_status
    
    if action == "reject":
        new_status = "Rejected"
    elif action == "approve":
        if current_status == "Requested":
            new_status = "IT_Approved"
        elif current_status == "IT_Approved":
            new_status = "Finance_Approved"
        elif current_status == "Finance_Approved":
            new_status = "Commercial_Approved" 
            # Ideally here we'd trigger PO generation logic
            
    if new_status != current_status:
        update_asset(asset_id, AssetUpdate(renewal_status=new_status))
        return {"status": "success", "new_status": new_status}
    
    return {"status": "no_change", "current_status": current_status}

@router.post("/procurement/{asset_id}")
async def manage_procurement(asset_id: str, action: str):
    asset = get_asset_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    current = asset.procurement_status
    new_status = current
    
    if action == "approve":
        if current == "Requested": new_status = "Approved"
        elif current == "Approved": new_status = "Ordered"
        elif current == "Ordered": new_status = "Received"
    
    if new_status == "Received":
        # Asset becomes active inventory
        update_asset(asset_id, AssetUpdate(procurement_status=None, status="In Stock"))
        return {"status": "success", "message": "Asset Received and moved to In Stock"}

    if new_status != current:
        update_asset(asset_id, AssetUpdate(procurement_status=new_status))
        return {"status": "success", "new_status": new_status}
        
    return {"status": "no_change"}

@router.post("/disposal/{asset_id}")
async def manage_disposal(asset_id: str, action: str):
    asset = get_asset_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    current = asset.disposal_status
    new_status = current
    
    if action == "validate":
        new_status = "Ready_For_Wipe"
    elif action == "wipe":
        new_status = "Wiped"
    elif action == "dispose":
        new_status = "Disposed"
        
    if new_status != current:
        update_asset(asset_id, AssetUpdate(disposal_status=new_status))
        # If disposed, maybe mark asset status as Retired/Disposed
        if new_status == "Disposed":
             update_asset(asset_id, AssetUpdate(status="Retired"))
             
        return {"status": "success", "new_status": new_status}

    return {"status": "no_change"}
