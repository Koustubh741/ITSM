from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Asset, AuditLog
from utils import auth_utils
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/disposal",
    tags=["disposal"]
)

def check_disposal_access(
    current_user = Depends(auth_utils.get_current_user)
):
    """
    Verify user has permission to manage asset disposal.
    """
    allowed_roles = ["ADMIN", "SYSTEM_ADMIN", "ASSET_MANAGER", "ASSET_INVENTORY_MANAGER", "IT_MANAGEMENT", "IT_SUPPORT"]
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User role {current_user.role} does not have permission to manage asset disposal"
        )
    return current_user

@router.get("/queue")
def get_disposal_queue(
    db: Session = Depends(get_db),
    user = Depends(check_disposal_access)
):
    """
    Get all assets that are in some stage of disposal.
    """
    print(f"DEBUG: Fetching disposal queue for user {user.id} ({user.role})")
    assets = db.query(Asset).filter(
        Asset.disposal_status.in_(["SCRAP_CANDIDATE", "WIPE_PENDING", "WIPED"])
    ).all()
    print(f"DEBUG: Found {len(assets)} assets in disposal queue")
    return assets

@router.post("/{asset_id}/initiate")
def initiate_disposal(
    asset_id: str,
    db: Session = Depends(get_db),
    user = Depends(check_disposal_access)
):
    """
    Mark an asset for disposal.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset.disposal_status = "SCRAP_CANDIDATE"
    asset.status = "Scrap"
    
    # Audit trail
    audit = AuditLog(
        id=str(uuid.uuid4()),
        entity_type="Asset",
        entity_id=asset.id,
        action="DISPOSAL_INITIATED",
        performed_by=user.id,
        details={"status": "SCRAP_CANDIDATE"}
    )
    db.add(audit)
    db.commit()
    return {"status": "success", "disposal_status": "SCRAP_CANDIDATE"}

@router.post("/{asset_id}/validate")
def validate_disposal(
    asset_id: str,
    db: Session = Depends(get_db),
    user = Depends(check_disposal_access)
):
    """
    Confirm asset is ready for data wipe.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset.disposal_status = "WIPE_PENDING"
    
    db.commit()
    return {"status": "success", "disposal_status": "WIPE_PENDING"}

@router.post("/{asset_id}/wipe")
def record_wipe(
    asset_id: str,
    db: Session = Depends(get_db),
    user = Depends(check_disposal_access)
):
    """
    Record that the asset has been securely wiped.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset.disposal_status = "WIPED"
    
    audit = AuditLog(
        id=str(uuid.uuid4()),
        entity_type="Asset",
        entity_id=asset.id,
        action="DATA_WIPE_COMPLETED",
        performed_by=user.id,
        details={"method": "DoD 5220.22-M"}
    )
    db.add(audit)
    db.commit()
    return {"status": "success", "disposal_status": "WIPED"}

@router.post("/{asset_id}/finalize")
def finalize_disposal(
    asset_id: str,
    db: Session = Depends(get_db),
    user = Depends(check_disposal_access)
):
    """
    Permanently retire the asset.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset.disposal_status = "RETIRED"
    asset.status = "Retired"
    asset.assigned_to = None
    asset.location = "Disposal Archive"
    
    audit = AuditLog(
        id=str(uuid.uuid4()),
        entity_type="Asset",
        entity_id=asset.id,
        action="ASSET_RETIRED",
        performed_by=user.id,
        details={"final_status": "RETIRED"}
    )
    db.add(audit)
    db.commit()
    return {"status": "success", "disposal_status": "RETIRED"}
