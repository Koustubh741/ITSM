from fastapi import APIRouter, HTTPException
from typing import List, Optional
from services.asset_service import get_all_assets, update_asset, get_asset_by_id, assign_asset
from schemas.asset_schema import AssetUpdate
from database import SessionLocal
from models import AssetRequest, PurchaseRequest
from services import asset_request_service

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
    
    # Check if there's a linked asset request and validate IT approval
    db = SessionLocal()
    try:
        asset_request = db.query(AssetRequest).filter(
            AssetRequest.asset_id == asset_id
        ).first()
        
        if asset_request:
            if asset_request.status != "IT_APPROVED":
                raise HTTPException(
                    status_code=403,
                    detail="Procurement not allowed before IT approval"
                )
    finally:
        db.close()
    
    current = asset.procurement_status
    new_status = current
    
    if action == "approve":
        if current == "Requested": new_status = "Approved"
        elif current == "Approved": new_status = "Ordered"
        elif current == "Ordered": new_status = "Received"
    
    if new_status == "Received":
        # Asset becomes active inventory
        update_asset(asset_id, AssetUpdate(procurement_status=None, status="In Stock"))

        # Attempt to fulfill any linked asset request
        db = SessionLocal()
        try:
            asset_request = (
                db.query(AssetRequest)
                .filter(AssetRequest.asset_id == asset_id)
                .first()
            )
            if asset_request:
                # Check if procurement was approved
                if asset_request.status == "PROCUREMENT_APPROVED":
                    # Move to QC_PENDING for quality check
                    asset_request.status = "QC_PENDING"
                    db.commit()
                    return {"status": "success", "message": "Asset Received, moved to In Stock, status set to QC_PENDING"}
                elif asset_request.status in ["PROCUREMENT_REQUESTED", "IT_APPROVED"]:
                    # Legacy support: direct assignment if procurement not yet approved
                    requester = asset_request_service.get_user_by_id_db(db, asset_request.requester_id)
                    requester_name = requester.full_name if requester else asset_request.requester_id

                    from datetime import date

                    # Assign asset to requester using existing service
                    assigned = assign_asset(
                        asset_id=asset_id,
                        user=requester_name,
                        location=asset.location or (requester.location if requester else None) or "Unknown",
                        assign_date=date.today(),
                    )
                    if assigned:
                        asset_request.status = "IN_USE"
                        db.commit()
        finally:
            db.close()

        return {"status": "success", "message": "Asset Received, moved to In Stock, and assigned if linked to a request"}

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
