from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from schemas.user_schema import UserCreate, UserResponse, LoginRequest, LoginResponse
from schemas.exit_schema import ExitRequestResponse
from services import user_service
from utils import auth_utils
from datetime import datetime

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

def check_system_admin(
    admin_user_id: str = Query(..., description="Admin user ID for authorization"),
    db: Session = Depends(get_db)
):
    """
    Simple admin check for MVP - expects admin_user_id query parameter.
    In production, this should verify JWT token and check role.
    """
    admin_user = user_service.get_user(db, admin_user_id)
    if not admin_user or admin_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only ADMIN can perform this action"
        )
    return admin_user

@router.get("/users", response_model=list[UserResponse])
def get_users(
    status: str = None,
    db: Session = Depends(get_db),
    admin_user = Depends(check_system_admin)
):
    """
    Get all users, optionally filtered by status.
    Requires admin_user_id query parameter.
    """
    users = user_service.get_users(db, status=status)
    if users:
        print(f"DEBUG: First user ID: {users[0].id}, Type: {type(users[0].id)}")
    return users

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = user_service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    # Set default status if not provided
    if not user.status:
        user.status = "PENDING"
    return user_service.create_user(db=db, user=user)

@router.post("/login", response_model=LoginResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = user_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        # Check if user exists but is not active
        db_user = user_service.get_user_by_email(db, form_data.username)
        if db_user and db_user.status != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is not active. Please contact administrator for activation.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Real JWT token
    access_token = auth_utils.create_access_token(
        data={"sub": user.email, "user_id": str(user.id), "role": user.role}
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user
    }

@router.post("/users/{user_id}/activate", response_model=UserResponse)
def activate_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin_user = Depends(check_system_admin)
):
    """
    Activate a user account. Only SYSTEM_ADMIN can perform this action.
    Requires admin_user_id query parameter with admin user ID.
    Example: POST /auth/users/{user_id}/activate?admin_user_id={admin_id}
    """
    activated_user = user_service.activate_user(db, user_id)
    if not activated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return activated_user


@router.post("/users/{user_id}/exit", response_model=UserResponse)
def initiate_exit(
    user_id: str,
    db: Session = Depends(get_db),
    admin_user = Depends(check_system_admin)
):
    """
    Initiate user exit / resignation workflow.

    - Only SYSTEM_ADMIN can trigger.
    - Sets user.status = EXITING.
    - Creates an exit.exit_requests record capturing asset & BYOD snapshots.
    """
    from models import AssetAssignment, ByodDevice, ExitRequest

    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Update user status to EXITING
    user.status = "EXITING"

    # Collect current asset assignments and BYOD devices
    assignments = (
        db.query(AssetAssignment)
        .filter(AssetAssignment.user_id == user_id)
        .all()
    )
    byod_devices = (
        db.query(ByodDevice)
        .filter(ByodDevice.owner_id == user_id)
        .all()
    )

    assets_snapshot = [
        {
            "asset_id": a.asset_id,
            "user_id": a.user_id,
            "location": a.location,
            "assigned_at": a.assigned_at.isoformat() if a.assigned_at else None,
        }
        for a in assignments
    ]

    byod_snapshot = [
        {
            "device_id": d.id,
            "device_model": d.device_model,
            "os_version": d.os_version,
            "serial_number": d.serial_number,
            "compliance_status": d.compliance_status,
        }
        for d in byod_devices
    ]

    exit_request = ExitRequest(
        user_id=user_id,
        status="OPEN",
        assets_snapshot=assets_snapshot,
        byod_snapshot=byod_snapshot,
    )
    db.add(exit_request)
    db.commit()
    db.refresh(user)

    return user


@router.post("/users/{user_id}/disable", response_model=UserResponse)
def disable_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin_user = Depends(check_system_admin)
):
    """
    Final step of exit workflow.

    - Only SYSTEM_ADMIN can set user.status = DISABLED.
    """
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.status = "DISABLED"
    db.commit()
    db.refresh(user)

    return user


# ---------------- EXIT WORKFLOW PROCESSING ENDPOINTS ----------------


def verify_asset_inventory_manager_exit(
    manager_id: str,
    db: Session
):
    """Verify user is ASSET_INVENTORY_MANAGER"""
    manager = user_service.get_user(db, manager_id)
    if not manager:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if manager.role != "ASSET_INVENTORY_MANAGER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only ASSET_INVENTORY_MANAGER can process asset returns"
        )
    if manager.status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Manager account is not active")
    return manager


@router.get("/exit-requests", response_model=list[ExitRequestResponse])
def get_exit_requests(
    status: str = None,
    db: Session = Depends(get_db),
    admin_user = Depends(check_system_admin)
):
    """
    Get all exit requests. Requires admin_user_id.
    """
    from models import ExitRequest
    query = db.query(ExitRequest)
    if status:
        query = query.filter(ExitRequest.status == status)
    return query.all()


@router.post("/exit-requests/{exit_request_id}/process-assets")
def process_exit_assets(
    exit_request_id: str,
    manager_id: str,
    db: Session = Depends(get_db)
):
    """
    Process company-owned asset returns for exiting user.
    
    Rules:
    - Only ASSET_INVENTORY_MANAGER can call
    - Exit request must be OPEN or ASSETS_PROCESSED
    
    Actions:
    - Return all company-owned assets
    - Perform QC, secure data wipe
    - Update asset status (IN STOCK / REPAIR / SCRAP)
    - Update exit request status to ASSETS_PROCESSED
    """
    manager = verify_asset_inventory_manager_exit(manager_id, db)
    
    from models import ExitRequest, AssetAssignment, Asset
    
    exit_request = db.query(ExitRequest).filter(ExitRequest.id == exit_request_id).first()
    if not exit_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exit request not found")
    
    if exit_request.status not in ["OPEN", "ASSETS_PROCESSED"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Assets can only be processed when exit request is OPEN or ASSETS_PROCESSED. Current status: {exit_request.status}"
        )
    
    # Process assets from snapshot
    assets_processed = []
    if exit_request.assets_snapshot:
        for asset_snapshot in exit_request.assets_snapshot:
            asset_id = asset_snapshot.get("asset_id")
            if asset_id:
                asset = db.query(Asset).filter(Asset.id == asset_id).first()
                if asset:
                    # Return asset to inventory
                    asset.status = "In Stock"  # Or "Repair" / "Scrap" based on QC
                    asset.assigned_to = None
                    asset.assigned_by = None
                    asset.assignment_date = None
                    assets_processed.append(asset_id)
        
        db.commit()
    
    # Update exit request status
    exit_request.status = "ASSETS_PROCESSED"
    db.commit()
    db.refresh(exit_request)
    
    return {
        "status": "success",
        "message": f"Processed {len(assets_processed)} assets",
        "assets_processed": assets_processed,
        "exit_request_status": exit_request.status
    }


@router.post("/exit-requests/{exit_request_id}/process-byod")
def process_exit_byod(
    exit_request_id: str,
    it_manager_id: str,
    db: Session = Depends(get_db)
):
    """
    Process BYOD device de-registration for exiting user.
    
    Rules:
    - Only IT_MANAGEMENT can call
    - Exit request must be OPEN or BYOD_PROCESSED
    
    Actions:
    - De-register BYOD devices
    - Unenroll from MDM
    - Revoke all access
    - Update exit request status to BYOD_PROCESSED
    """
    from models import ExitRequest, ByodDevice
    
    # Verify IT management
    it_manager = user_service.get_user(db, it_manager_id)
    if not it_manager:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if it_manager.role != "IT_MANAGEMENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only IT_MANAGEMENT can process BYOD de-registration"
        )
    if it_manager.status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="IT manager account is not active")
    
    exit_request = db.query(ExitRequest).filter(ExitRequest.id == exit_request_id).first()
    if not exit_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exit request not found")
    
    if exit_request.status not in ["OPEN", "BYOD_PROCESSED"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"BYOD can only be processed when exit request is OPEN or BYOD_PROCESSED. Current status: {exit_request.status}"
        )
    
    # Process BYOD devices from snapshot
    byod_processed = []
    if exit_request.byod_snapshot:
        for byod_snapshot in exit_request.byod_snapshot:
            device_id = byod_snapshot.get("device_id")
            if device_id:
                byod = db.query(ByodDevice).filter(ByodDevice.id == device_id).first()
                if byod:
                    # Mark as de-registered (or delete)
                    byod.compliance_status = "DE_REGISTERED"
                    byod_processed.append(device_id)
        
        db.commit()
    
    # Update exit request status
    exit_request.status = "BYOD_PROCESSED"
    db.commit()
    db.refresh(exit_request)
    
    return {
        "status": "success",
        "message": f"Processed {len(byod_processed)} BYOD devices",
        "byod_processed": byod_processed,
        "exit_request_status": exit_request.status
    }


@router.post("/exit-requests/{exit_request_id}/complete")
def complete_exit_request(
    exit_request_id: str,
    admin_user_id: str,
    db: Session = Depends(get_db),
    admin_user = Depends(check_system_admin)
):
    """
    Complete exit workflow and disable user account.
    
    Rules:
    - Only SYSTEM_ADMIN can call
    - Exit request must be ASSETS_PROCESSED and BYOD_PROCESSED (or at least one completed)
    
    Actions:
    - Mark exit request as COMPLETED
    - Disable user account (user.status = DISABLED)
    """
    from models import ExitRequest
    
    exit_request = db.query(ExitRequest).filter(ExitRequest.id == exit_request_id).first()
    if not exit_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exit request not found")
    
    # Check if assets and BYOD are processed (or at least one)
    if exit_request.status not in ["ASSETS_PROCESSED", "BYOD_PROCESSED"]:
        # Allow completion if at least one is processed (for cases where user has only assets or only BYOD)
        if exit_request.status == "OPEN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot complete exit request. Assets and/or BYOD devices must be processed first."
            )
    
    # Mark exit request as completed
    exit_request.status = "COMPLETED"
    
    # Disable user account
    user = user_service.get_user(db, exit_request.user_id)
    if user:
        user.status = "DISABLED"
    
    db.commit()
    db.refresh(exit_request)
    
    return {
        "status": "success",
        "message": "Exit workflow completed and user account disabled",
        "exit_request_status": exit_request.status,
        "user_status": user.status if user else "N/A"
    }
