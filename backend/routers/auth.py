from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from schemas.user_schema import UserCreate, UserResponse, LoginRequest, LoginResponse
from schemas.exit_schema import ExitRequestResponse
from services import user_service, exit_service
from utils import auth_utils
from datetime import datetime

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

def check_system_admin(
    current_user = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify user is SYSTEM_ADMIN or ADMIN via JWT token.
    """
    if current_user.role not in ["ADMIN", "SYSTEM_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only SYSTEM_ADMIN or ADMIN can perform this action"
        )
    return current_user

@router.get("/users", response_model=list[UserResponse])
def get_users(
    status: str = None,
    db: Session = Depends(get_db),
    admin_user = Depends(check_system_admin)
):
    """
    Get all users, optionally filtered by status.
    Validated via JWT token.
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
    Validated via JWT token.
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
    try:
        from models import AssetAssignment, ByodDevice, ExitRequest

        print(f"DEBUG: Initiating exit for user {user_id} by admin {admin_user.id}")

        user = user_service.get_user(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Update user status to EXITING
        user.status = "EXITING"

        # Collect current asset assignments
        assignments = (
            db.query(AssetAssignment)
            .filter(AssetAssignment.user_id == user_id)
            .all()
        )
        print(f"DEBUG: Found {len(assignments)} assets")
        
        byod_devices = (
            db.query(ByodDevice)
            .filter(ByodDevice.owner_id == user_id)
            .all()
        )
        print(f"DEBUG: Found {len(byod_devices)} byod devices")

        assets_snapshot = []
        for a in assignments:
            # Handle potential None for assigned_at
            assigned_at_str = None
            if hasattr(a, 'assigned_at') and a.assigned_at:
                assigned_at_str = a.assigned_at.isoformat()
            
            assets_snapshot.append({
                "asset_id": str(a.asset_id),
                "user_id": str(a.user_id),
                "location": a.location,
                "assigned_at": assigned_at_str,
            })

        byod_snapshot = [
            {
                "device_id": str(d.id),
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
    except Exception as e:
        print(f"ERROR in initiate_exit: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


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
    allowed_roles = ["ASSET_INVENTORY_MANAGER", "ASSET_MANAGER", "SYSTEM_ADMIN", "ADMIN", "IT_MANAGEMENT"]
    if manager.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Only Asset Managers or Admins can process asset returns (Current role: {manager.role})"
        )
    if manager.status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Manager account is not active")
    return manager


def check_exit_access(
    current_user = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allow access to System Admin, Asset Manager, and IT Management via JWT token.
    """
    allowed_roles = ["ADMIN", "SYSTEM_ADMIN", "ASSET_INVENTORY_MANAGER", "ASSET_MANAGER", "IT_MANAGEMENT"]
    if current_user.role not in allowed_roles:
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role {current_user.role} not authorized to view exit requests"
        )
    return current_user

@router.get("/exit-requests", response_model=list[ExitRequestResponse])
def get_exit_requests(
    status: str = None,
    db: Session = Depends(get_db),
    admin_user = Depends(check_exit_access)
):
    """
    Get all exit requests. Validated via JWT token.
    """
    from models import ExitRequest
    query = db.query(ExitRequest)
    if status:
        query = query.filter(ExitRequest.status == status)
    return query.all()


@router.post("/exit-requests/{exit_request_id}/process-assets")
def process_exit_assets(
    exit_request_id: str,
    db: Session = Depends(get_db),
    manager = Depends(check_exit_access)
):
    """
    Process company-owned asset returns for exiting user.
    
    Rules:
    - Only ASSET_MANAGER, ASSET_INVENTORY_MANAGER, or ADMIN can call (via JWT)
    - Exit request must be OPEN or ASSETS_PROCESSED
    """
    # Verify manager role for this specific action
    allowed_roles = ["ASSET_INVENTORY_MANAGER", "ASSET_MANAGER", "SYSTEM_ADMIN", "ADMIN"]
    if manager.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Only Asset Managers or Admins can process asset returns (Current role: {manager.role})"
        )

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
    db: Session = Depends(get_db),
    it_manager = Depends(check_exit_access)
):
    """
    Process BYOD device de-registration for exiting user.
    
    Rules:
    - Only IT_MANAGEMENT or ADMIN can call (via JWT)
    - Exit request must be OPEN or BYOD_PROCESSED
    """
    if it_manager.role not in ["IT_MANAGEMENT", "SYSTEM_ADMIN", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only IT_MANAGEMENT or Admins can process BYOD de-registration"
        )
    
    from models import ExitRequest, ByodDevice
    
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
    db: Session = Depends(get_db),
    admin_user = Depends(check_system_admin)
):
    """
    Complete exit workflow and disable user account.
    
    Rules:
    - Only SYSTEM_ADMIN can call (via JWT)
    - Exit request must be ASSETS_PROCESSED and BYOD_PROCESSED (or at least one completed)
    """
    from models import ExitRequest
    
    exit_request = db.query(ExitRequest).filter(ExitRequest.id == exit_request_id).first()
    if not exit_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exit request not found")
    
    # Check if assets and BYOD are processed
    if exit_request.status == "OPEN":
        has_assets = bool(exit_request.assets_snapshot and len(exit_request.assets_snapshot) > 0)
        has_byod = bool(exit_request.byod_snapshot and len(exit_request.byod_snapshot) > 0)
        
        if has_assets or has_byod:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot complete exit request. Assets and/or BYOD devices must be processed first."
            )
    elif exit_request.status == "COMPLETED":
        return {
            "status": "success",
            "message": "Exit request is already completed",
            "exit_request_status": "COMPLETED"
        }
    
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
@router.post("/users/{user_id}/finalize-exit")
def finalize_user_exit(
    user_id: str,
    db: Session = Depends(get_db),
    admin_user = Depends(check_system_admin)
):
    """
    Atomic exit processing: Reintegrates assets and deactivates user.
    Returns a summary of processed items.
    """
    try:
        # We can optionally pass QC results here if the frontend provides them
        # For now, we'll use defaults as defined in the service
        summary = exit_service.handle_user_exit(db, user_id, actor_id=admin_user.id)
        return {
            "status": "success",
            "message": "User exit finalized and assets reintegrated",
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
