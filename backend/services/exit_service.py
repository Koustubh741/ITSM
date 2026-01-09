"""
Exit service layer - Handles user offboarding, asset return, and inventory reintegration.
"""
from datetime import datetime
from typing import Dict, Any, List
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import User, Asset, AssetAssignment, AssetInventory, ByodDevice, AuditLog

def handle_user_exit(db: Session, user_id: str, actor_id: str = "SYSTEM", qc_results: Dict[str, str] = None) -> Dict[str, Any]:
    """
    Handles the atomic exit workflow for a user.
    Reintegrates company assets into inventory and decommissions BYOD devices.
    
    Args:
        db: Database session
        user_id: UUID of the exiting user
        actor_id: ID of the admin performing the action
        qc_results: Optional mapping of asset_id -> qc_outcome ('PASSED', 'FAILED', 'EOL')
    
    Returns:
        Summary of the exit processing results
    """
    qc_results = qc_results or {}
    
    # 1. Fetch User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise Exception(f"User {user_id} not found")

    # 2. Fetch all currently assigned assets
    # Standard assets
    assets = db.query(Asset).filter(Asset.assigned_to == user.full_name).all()
    # BYOD devices
    byod_devices = db.query(ByodDevice).filter(ByodDevice.owner_id == user_id).all()

    summary = {
        "total_assets": len(assets) + len(byod_devices),
        "returned_to_inventory": 0,
        "sent_for_repair": 0,
        "scrapped": 0,
        "byod_decommissioned": 0,
        "processed_ids": []
    }

    try:
        # START TRANSACTION (handled by caller or via db.begin() if not already in one)
        # Using nested transaction/savepoint if needed, but usually the caller provides the session.
        
        # A) Process COMPANY_OWNED assets
        for asset in assets:
            old_status = asset.status
            qc_outcome = qc_results.get(asset.id, 'PASSED') # Default to PASSED if not specified
            
            new_status = "In Stock"
            availability = True
            
            if qc_outcome == 'FAILED':
                new_status = "Repair"
                availability = False
                summary["sent_for_repair"] += 1
            elif qc_outcome == 'EOL':
                new_status = "Scrap"
                availability = False
                summary["scrapped"] += 1
            else:
                summary["returned_to_inventory"] += 1
            
            # Update Asset record
            asset.status = new_status
            asset.assigned_to = None
            asset.assigned_by = None
            asset.assignment_date = None
            asset.disposal_status = "WIPE_PENDING" # Trigger secure data wipe flag
            
            # Update Inventory Table
            inventory_item = db.query(AssetInventory).filter(AssetInventory.asset_id == asset.id).first()
            if not inventory_item:
                inventory_item = AssetInventory(
                    id=str(uuid.uuid4()),
                    asset_id=asset.id,
                    location=asset.location,
                )
                db.add(inventory_item)
            
            inventory_item.status = "Available" if new_status == "In Stock" else new_status
            inventory_item.availability_flag = availability
            inventory_item.last_checked_at = datetime.now()
            inventory_item.location = asset.location
            
            # Audit Log
            audit = AuditLog(
                id=str(uuid.uuid4()),
                entity_type="Asset",
                entity_id=asset.id,
                action="ASSET_RETURNED_ON_EXIT",
                performed_by=actor_id,
                details={
                    "old_status": old_status,
                    "new_status": new_status,
                    "qc_outcome": qc_outcome,
                    "user_id": user_id,
                    "reason": "User Exit/Resignation"
                }
            )
            db.add(audit)
            summary["processed_ids"].append(asset.id)

        # B) Process BYOD devices
        for byod in byod_devices:
            old_compliance = byod.compliance_status
            
            # Mark as DECOMMISSIONED (Requirement 2.b)
            byod.compliance_status = "DECOMMISSIONED"
            
            # Audit Log
            audit = AuditLog(
                id=str(uuid.uuid4()),
                entity_type="ByodDevice",
                entity_id=byod.id,
                action="BYOD_DECOMMISSIONED_ON_EXIT",
                performed_by=actor_id,
                details={
                    "old_status": old_compliance,
                    "new_status": "DECOMMISSIONED",
                    "user_id": user_id
                }
            )
            db.add(audit)
            summary["byod_decommissioned"] += 1
            summary["processed_ids"].append(byod.id)

        # 3. Update User Status
        user.status = "DISABLED"
        
        # 4. Commit (caller's responsibility if they want full atomicity across multiple services, 
        # but here we can commit if we own the session)
        db.commit()
        
    except Exception as e:
        db.rollback()
        raise e

    return summary
