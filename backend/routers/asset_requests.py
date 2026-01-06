"""
Asset Request endpoints for manager approvals
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.asset_request_schema import (
    AssetRequestCreate,
    AssetRequestResponse,
    ManagerApprovalRequest,
    ManagerRejectionRequest,
    ByodRegisterRequest,
    ProcurementApprovalRequest,
    ProcurementRejectionRequest,
    QCPerformRequest,
    UserAcceptanceRequest,
    ITApprovalRequest,
    ITRejectionRequest,
)
from services import asset_request_service
from schemas.user_schema import UserResponse
from models import ByodDevice, Asset, AssetAssignment, PurchaseRequest
from services import asset_service

router = APIRouter(
    prefix="/asset-requests",
    tags=["asset-requests"]
)

@router.get("", response_model=List[AssetRequestResponse])
def get_asset_requests(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    requester_id: Optional[str] = None,
    domain: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all asset requests.
    Supports filtering by status and requester_id.
    """
    return asset_request_service.get_all_asset_requests(
        db, skip=skip, limit=limit, status=status, requester_id=requester_id, domain=domain
    )


def verify_active_end_user(
    requester_id: str,
    db: Session = Depends(get_db)
):
    """
    Verify that the user is an ACTIVE END_USER
    Returns user object
    """
    user = asset_request_service.get_user_by_id_db(db, requester_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role != "END_USER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with role=END_USER can create asset requests"
        )
    
    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active"
        )
    
    return user

@router.post("", response_model=AssetRequestResponse, status_code=201)
def create_asset_request(
    request: AssetRequestCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new asset request.
    Only ACTIVE END_USER can create requests.
    Creates request with status=SUBMITTED. Does NOT create asset.
    """
    # Verify requester is ACTIVE END_USER
    requester = verify_active_end_user(request.requester_id, db)
    
    # Create the asset request
    created_request = asset_request_service.create_asset_request(request, initial_status="SUBMITTED")
    
    return created_request

def verify_manager_authorization(
    manager_id: str,
    db: Session = Depends(get_db)
):
    """
    Verify that the user is a valid manager (END_USER with position=MANAGER)
    Returns manager user object
    """
    manager = asset_request_service.get_user_by_id_db(db, manager_id)
    
    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manager user not found"
        )
    
    if manager.role != "END_USER" or manager.position != "MANAGER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with role=END_USER and position=MANAGER can approve/reject requests"
        )
    
    if manager.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager account is not active"
        )
    
    return manager

@router.post("/{request_id}/manager/approve", response_model=AssetRequestResponse)
def approve_asset_request(
    request_id: str,
    approval: ManagerApprovalRequest,
    db: Session = Depends(get_db)
):
    """
    Approve an asset request. Only managers in the same domain as the requester can approve.
    """
    # Verify manager authorization
    manager = verify_manager_authorization(approval.manager_id, db)
    
    # Get the asset request
    db_request = asset_request_service.get_asset_request_by_id_db(db, request_id)
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset request not found"
        )
    
    # Check if request is already decided
    if db_request.status != "SUBMITTED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request has already been processed. Current status: {db_request.status}"
        )
    
    # Get requester to check domain match
    requester = asset_request_service.get_user_by_id_db(db, db_request.requester_id)
    if not requester:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requester user not found"
        )
    
    # Verify department OR domain match
    department_match = manager.department and requester.department and manager.department == requester.department
    domain_match = manager.domain and requester.domain and manager.domain == requester.domain
    
    if not (department_match or domain_match):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Manager must share same department or domain as requester. Manager: dept={manager.department}, domain={manager.domain}; Requester: dept={requester.department}, domain={requester.domain}"
        )
    
    # Approve the request
    updated_request = asset_request_service.update_asset_request_status(
        db=db,
        request_id=request_id,
        new_status="MANAGER_APPROVED",
        manager_id=manager.id,
        manager_name=manager.full_name,
        decision="APPROVED"
    )
    
    if not updated_request:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update asset request"
        )
    
    return updated_request

@router.post("/{request_id}/manager/reject", response_model=AssetRequestResponse)
def reject_asset_request(
    request_id: str,
    rejection: ManagerRejectionRequest,
    db: Session = Depends(get_db)
):
    """
    Reject an asset request. Only managers in the same domain as the requester can reject.
    Requires a reason for rejection.
    """
    # Verify manager authorization
    manager = verify_manager_authorization(rejection.manager_id, db)
    
    # Get the asset request
    db_request = asset_request_service.get_asset_request_by_id_db(db, request_id)
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset request not found"
        )
    
    # Check if request is already decided
    if db_request.status != "SUBMITTED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request has already been processed. Current status: {db_request.status}"
        )
    
    # Get requester to check department or domain match
    requester = asset_request_service.get_user_by_id_db(db, db_request.requester_id)
    if not requester:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requester user not found"
        )
    
    # Verify department OR domain match
    department_match = manager.department and requester.department and manager.department == requester.department
    domain_match = manager.domain and requester.domain and manager.domain == requester.domain
    
    if not (department_match or domain_match):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Manager must share same department or domain as requester. Manager: dept={manager.department}, domain={manager.domain}; Requester: dept={requester.department}, domain={requester.domain}"
        )
    
    # Reject the request
    updated_request = asset_request_service.update_asset_request_status(
        db=db,
        request_id=request_id,
        new_status="MANAGER_REJECTED",
        manager_id=manager.id,
        manager_name=manager.full_name,
        decision="REJECTED",
        reason=rejection.reason
    )
    
    if not updated_request:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update asset request"
        )
    
    return updated_request

# New endpoints with required path format
@router.post("/{id}/manager/approve", response_model=AssetRequestResponse)
def manager_approve_request(
    id: str,
    approval: ManagerApprovalRequest,
    db: Session = Depends(get_db)
):
    """
    Manager approval for an asset request.
    Rules:
    - Only MANAGER (role=END_USER, position=MANAGER) can call
    - Manager must share same department OR domain as requester
    - Request must be in status SUBMITTED
    On approve:
    - Inserts record into asset.manager_approvals
    - Updates asset_requests.status = MANAGER_APPROVED
    """
    # Verify manager authorization
    manager = verify_manager_authorization(approval.manager_id, db)
    
    # Get the asset request
    db_request = asset_request_service.get_asset_request_by_id_db(db, id)
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset request not found"
        )
    
    # Check if request is in SUBMITTED status
    if db_request.status != "SUBMITTED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request must be in SUBMITTED status. Current status: {db_request.status}"
        )
    
    # Get requester to check department or domain match
    requester = asset_request_service.get_user_by_id_db(db, db_request.requester_id)
    if not requester:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requester user not found"
        )
    
    # Verify department OR domain match
    department_match = manager.department and requester.department and manager.department == requester.department
    domain_match = manager.domain and requester.domain and manager.domain == requester.domain
    
    if not (department_match or domain_match):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Manager must share same department or domain as requester. Manager: dept={manager.department}, domain={manager.domain}; Requester: dept={requester.department}, domain={requester.domain}"
        )
    
    # Approve the request
    updated_request = asset_request_service.update_asset_request_status(
        db=db,
        request_id=id,
        new_status="MANAGER_APPROVED",
        manager_id=manager.id,
        manager_name=manager.full_name,
        decision="APPROVED"
    )
    
    if not updated_request:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update asset request"
        )
    
    return updated_request

@router.post("/{id}/manager/reject", response_model=AssetRequestResponse)
def manager_reject_request(
    id: str,
    rejection: ManagerRejectionRequest,
    db: Session = Depends(get_db)
):
    """
    Manager rejection for an asset request.
    Rules:
    - Only MANAGER (role=END_USER, position=MANAGER) can call
    - Manager must share same department OR domain as requester
    - Request must be in status SUBMITTED
    - Rejection reason is mandatory
    On reject:
    - Updates asset_requests.status = MANAGER_REJECTED
    - Stops workflow
    """
    # Verify manager authorization
    manager = verify_manager_authorization(rejection.manager_id, db)
    
    # Get the asset request
    db_request = asset_request_service.get_asset_request_by_id_db(db, id)
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset request not found"
        )
    
    # Check if request is in SUBMITTED status
    if db_request.status != "SUBMITTED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request must be in SUBMITTED status. Current status: {db_request.status}"
        )
    
    # Get requester to check department or domain match
    requester = asset_request_service.get_user_by_id_db(db, db_request.requester_id)
    if not requester:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requester user not found"
        )
    
    # Verify department OR domain match
    department_match = manager.department and requester.department and manager.department == requester.department
    domain_match = manager.domain and requester.domain and manager.domain == requester.domain
    
    if not (department_match or domain_match):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Manager must share same department or domain as requester. Manager: dept={manager.department}, domain={manager.domain}; Requester: dept={requester.department}, domain={requester.domain}"
        )
    
    # Reject the request
    updated_request = asset_request_service.update_asset_request_status(
        db=db,
        request_id=id,
        new_status="MANAGER_REJECTED",
        manager_id=manager.id,
        manager_name=manager.full_name,
        decision="REJECTED",
        reason=rejection.reason
    )
    
    if not updated_request:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update asset request"
        )
    
    return updated_request


# ---------------- IT APPROVAL ROUTES ----------------

def verify_it_management(user_id: str, db: Session) -> UserResponse:
    """
    Verify that the user is IT management (role=IT_MANAGEMENT) and active
    """
    user = asset_request_service.get_user_by_id_db(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if user.role != "IT_MANAGEMENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with role=IT_MANAGEMENT can perform this action"
        )
    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active"
        )
    return user


@router.post("/{request_id}/it/approve", response_model=AssetRequestResponse)
def it_approve_request(
    request_id: str,
    approval: ITApprovalRequest,
    db: Session = Depends(get_db)
):
    """
    IT approval for an asset request.
    Preconditions:
    - Reviewer must have role=IT_MANAGEMENT
    """
    reviewer = verify_it_management(approval.reviewer_id, db)
    db_request = asset_request_service.get_asset_request_by_id_db(db, request_id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset request not found")

    if db_request.status != "MANAGER_APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request must be MANAGER_APPROVED before IT review. Current status: {db_request.status}"
        )

    if db_request.status in ["IT_APPROVED", "IT_REJECTED"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request has already been decided by IT. Current status: {db_request.status}"
        )

    updated_request = asset_request_service.update_it_review_status(
        db=db,
        request_id=request_id,
        new_status="IT_APPROVED",
        reviewer_id=reviewer.id,
        reviewer_name=reviewer.full_name,
        decision="IT_APPROVED",
    )

    if not updated_request:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update asset request")

    return updated_request


@router.post("/{request_id}/it/reject", response_model=AssetRequestResponse)
def it_reject_request(
    request_id: str,
    rejection: ITRejectionRequest,
    db: Session = Depends(get_db)
):
    """
    IT rejection for an asset request.
    Preconditions:
    - Request status must be MANAGER_APPROVED
    - Reviewer must have role=IT_MANAGEMENT
    - Requires a reason
    """
    reviewer = verify_it_management(rejection.reviewer_id, db)

    db_request = asset_request_service.get_asset_request_by_id_db(db, request_id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset request not found")

    if db_request.status != "MANAGER_APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request must be MANAGER_APPROVED before IT review. Current status: {db_request.status}"
        )

    if db_request.status in ["IT_APPROVED", "IT_REJECTED"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request has already been decided by IT. Current status: {db_request.status}"
        )

    updated_request = asset_request_service.update_it_review_status(
        db=db,
        request_id=request_id,
        new_status="IT_REJECTED",
        reviewer_id=reviewer.id,
        reviewer_name=reviewer.full_name,
        decision="IT_REJECTED",
        reason=rejection.reason,
    )

    if not updated_request:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update asset request")

    return updated_request


# New IT review endpoints aligned with workflow naming
@router.post("/{id}/it-approve", response_model=AssetRequestResponse)
def it_approve_request_v2(
    id: str,
    reviewer_id: str,
    db: Session = Depends(get_db)
):
    """
    IT approval for an asset request (new workflow endpoint).

    Rules:
    - Only IT_MANAGEMENT role
    - Request must be MANAGER_APPROVED

    On approve:
    - status = IT_APPROVED
    - Branching based on asset_type / ownership can be handled by downstream flows
    """
    # Reuse existing IT approval logic
    reviewer = verify_it_management(reviewer_id, db)

    db_request = asset_request_service.get_asset_request_by_id_db(db, id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset request not found")

    if db_request.status != "MANAGER_APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request must be MANAGER_APPROVED before IT review. Current status: {db_request.status}"
        )

    if db_request.status in ["IT_APPROVED", "IT_REJECTED"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request has already been decided by IT. Current status: {db_request.status}"
        )

    updated_request = asset_request_service.update_it_review_status(
        db=db,
        request_id=id,
        new_status="IT_APPROVED",
        reviewer_id=reviewer.id,
        reviewer_name=reviewer.full_name,
        decision="IT_APPROVED",
    )

    if not updated_request:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update asset request")

    # Branching based on asset_type / ownership_type can be implemented by callers
    # Example (non-persistent) branching idea:
    # if updated_request.asset_ownership_type == "BYOD": handle BYOD-specific flow
    # else: handle COMPANY_OWNED procurement flow

    return updated_request


@router.post("/{id}/it-reject", response_model=AssetRequestResponse)
def it_reject_request_v2(
    id: str,
    reviewer_id: str,
    reason: str,
    db: Session = Depends(get_db)
):
    """
    IT rejection for an asset request (new workflow endpoint).

    Rules:
    - Only IT_MANAGEMENT role
    - Request must be MANAGER_APPROVED
    - Rejection reason is mandatory

    On reject:
    - status = IT_REJECTED
    - Workflow ends for this request
    """
    reviewer = verify_it_management(reviewer_id, db)

    db_request = asset_request_service.get_asset_request_by_id_db(db, id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset request not found")

    if db_request.status != "MANAGER_APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request must be MANAGER_APPROVED before IT review. Current status: {db_request.status}"
        )

    if db_request.status in ["IT_APPROVED", "IT_REJECTED"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request has already been decided by IT. Current status: {db_request.status}"
        )

    updated_request = asset_request_service.update_it_review_status(
        db=db,
        request_id=id,
        new_status="IT_REJECTED",
        reviewer_id=reviewer.id,
        reviewer_name=reviewer.full_name,
        decision="IT_REJECTED",
        reason=reason,
    )

    if not updated_request:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update asset request")

    return updated_request


# ---------------- BYOD REGISTRATION ROUTE ----------------

@router.post("/{id}/byod/register", response_model=AssetRequestResponse)
def byod_register_device(
    id: str,
    payload: ByodRegisterRequest,
    reviewer_id: str,
    db: Session = Depends(get_db),
):
    """
    Register a BYOD device for an IT-approved asset request.

    Trigger:
    - asset_requests.asset_ownership_type = BYOD (or asset_type == BYOD)
    - status = IT_APPROVED

    Rules:
    - Only IT_MANAGEMENT can call

    Flow:
    - Perform mock compliance check
      - If failed → status = BYOD_REJECTED
      - If passed:
          - Insert into asset.byod_devices
          - status = IN_USE
    - Does NOT create records in asset.assets
    """
    reviewer = verify_it_management(reviewer_id, db)

    db_request = asset_request_service.get_asset_request_by_id_db(db, id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset request not found")

    # Ensure request is IT-approved
    if db_request.status != "IT_APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"BYOD registration only allowed after IT approval. Current status: {db_request.status}",
        )

    # Ensure this is a BYOD request (ownership or type)
    is_byod = (
        (getattr(db_request, "asset_ownership_type", None) == "BYOD")
        or (getattr(db_request, "asset_type", None) == "BYOD")
    )
    if not is_byod:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="BYOD registration is only allowed for BYOD asset requests",
        )

    # Mock compliance check
    os_lower = payload.os_version.lower()
    model_lower = payload.device_model.lower()

    # Simple mock rules: block obviously insecure/legacy patterns
    non_compliant = False
    if "windows xp" in os_lower or "windows 7" in os_lower:
        non_compliant = True
    if "jailbroken" in model_lower or "rooted" in model_lower:
        non_compliant = True

    if non_compliant:
        # Mark request as BYOD_REJECTED and end workflow
        db_request.status = "BYOD_REJECTED"
        db.commit()
        db.refresh(db_request)
        return AssetRequestResponse.model_validate(db_request)

    # Compliance passed: register BYOD device, set status to IN_USE
    byod = ByodDevice(
        request_id=db_request.id,
        owner_id=db_request.requester_id,
        device_model=payload.device_model,
        os_version=payload.os_version,
        serial_number=payload.serial_number,
        compliance_status="COMPLIANT",
    )
    db.add(byod)

    db_request.status = "IN_USE"
    db.commit()
    db.refresh(db_request)

    return AssetRequestResponse.model_validate(db_request)


# ---------------- COMPANY-OWNED FULFILLMENT ROUTE ----------------

def verify_asset_inventory_manager(user_id: str, db: Session) -> UserResponse:
    """
    Verify that the user is an Asset & Inventory Manager.
    For now we use a dedicated role string ASSET_INVENTORY_MANAGER.
    """
    user = asset_request_service.get_user_by_id_db(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role not in ["ASSET_INVENTORY_MANAGER", "ASSET_MANAGER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with role=ASSET_INVENTORY_MANAGER or ASSET_MANAGER can perform this action",
        )
    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active",
        )
    return user


@router.post("/{id}/company-owned/fulfill", response_model=AssetRequestResponse)
def fulfill_company_owned_request(
    id: str,
    inventory_manager_id: str,
    db: Session = Depends(get_db),
):
    """
    Fulfill a company-owned asset request.

    Trigger:
    - asset_requests.asset_ownership_type = COMPANY_OWNED
    - status = IT_APPROVED

    Steps:
    1. Inventory check by ASSET_INVENTORY_MANAGER
    2. If available:
       - Create/allocate asset from inventory
       - Create assignment record in asset.asset_assignments
       - Set asset_request.status = IN_USE
    3. If not available:
       - Create procurement.purchase_request
       - Link to a placeholder asset with procurement_status='Requested'
       - Set asset_request.status = PROCUREMENT_REQUESTED
       - Further steps follow existing /workflows/procurement logic
    """
    # Verify inventory manager
    inventory_manager = verify_asset_inventory_manager(inventory_manager_id, db)

    # Load request
    db_request = asset_request_service.get_asset_request_by_id_db(db, id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset request not found")

    # Ensure company-owned & IT-approved
    ownership = getattr(db_request, "asset_ownership_type", None)
    if ownership != "COMPANY_OWNED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company-owned fulfillment is only allowed for COMPANY_OWNED asset requests",
        )

    if db_request.status != "IT_APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Company-owned fulfillment only allowed after IT approval. Current status: {db_request.status}",
        )

    # Try to find available inventory: simple heuristic by type/model/vendor and status In Stock
    candidate_asset = (
        db.query(Asset)
        .filter(
            Asset.type == db_request.asset_type,
            Asset.model == db_request.asset_model,
            Asset.vendor == db_request.asset_vendor,
            Asset.status == "In Stock",
        )
        .first()
    )

    # Helper: resolve requester user (for assignment)
    requester = asset_request_service.get_user_by_id_db(db, db_request.requester_id)
    requester_name = requester.full_name if requester else db_request.requester_id

    if candidate_asset:
        # Use existing asset from inventory
        # Also keep link on the request
        db_request.asset_id = candidate_asset.id

        # Use existing asset_service to mark as assigned / active
        # assign_asset updates status to "Active" and assignment fields
        from datetime import date

        assigned = asset_service.assign_asset(
            asset_id=candidate_asset.id,
            user=requester_name,
            location=candidate_asset.location or requester.location if requester else "Unknown",
            assign_date=date.today(),
        )
        if not assigned:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to assign asset from inventory",
            )

        # Record assignment in asset.asset_assignments
        assignment = AssetAssignment(
            asset_id=candidate_asset.id,
            user_id=db_request.requester_id,
            assigned_by=inventory_manager.id,
            location=candidate_asset.location or requester.location if requester else None,
        )
        db.add(assignment)

        # Mark request as fulfilled / in use
        db_request.status = "IN_USE"
        db.commit()
        db.refresh(db_request)
        return AssetRequestResponse.model_validate(db_request)

    # No inventory available -> create purchase request and placeholder asset for procurement workflow
    # Create placeholder asset with procurement_status='Requested'
    from schemas.asset_schema import AssetCreate
    import uuid as _uuid

    placeholder_asset = Asset(
        id=str(_uuid.uuid4()),
        name=db_request.asset_name,
        type=db_request.asset_type,
        model=db_request.asset_model or db_request.asset_name,
        vendor=db_request.asset_vendor or "Unknown",
        serial_number=f"PR-{db_request.id}-{_uuid.uuid4()}",
        segment="IT",
        status="Pending",
        location=requester.location if requester else None,
        procurement_status="Requested",
    )
    db.add(placeholder_asset)
    db.flush()  # ensure ID is available

    # Link asset to request
    db_request.asset_id = placeholder_asset.id

    # Create purchase request
    purchase_request = PurchaseRequest(
        asset_request_id=db_request.id,
        asset_id=placeholder_asset.id,
        requester_id=db_request.requester_id,
        asset_name=db_request.asset_name,
        asset_type=db_request.asset_type,
        asset_model=db_request.asset_model,
        asset_vendor=db_request.asset_vendor,
        cost_estimate=db_request.cost_estimate,
        status="Requested",
    )
    db.add(purchase_request)

    # Mark request as procurement requested
    db_request.status = "PROCUREMENT_REQUESTED"
    db.commit()
    db.refresh(db_request)

    return AssetRequestResponse.model_validate(db_request)

# New endpoints to append to asset_requests.py

# ---------------- PROCUREMENT & FINANCE APPROVAL ROUTES ----------------


def verify_procurement_finance(user_id: str, db: Session) -> UserResponse:
    """
    Verify that the user is PROCUREMENT_FINANCE role and active
    """
    user = asset_request_service.get_user_by_id_db(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if user.role not in ["PROCUREMENT_FINANCE", "FINANCE"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with role=PROCUREMENT_FINANCE or FINANCE can perform this action"
        )
    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active"
        )
    return user


@router.post("/{id}/procurement/approve", response_model=AssetRequestResponse)
def procurement_approve_request(
    id: str,
    approval: ProcurementApprovalRequest,
    db: Session = Depends(get_db)
):
    """
    Procurement & Finance approval for an asset request.
    
    Rules:
    - Only PROCUREMENT_FINANCE role
    - Request must be PROCUREMENT_REQUESTED
    
    On approve:
    - status = PROCUREMENT_APPROVED
    - Moves to QC_PENDING (after asset received)
    """
    reviewer = verify_procurement_finance(approval.reviewer_id, db)
    
    db_request = asset_request_service.get_asset_request_by_id_db(db, id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset request not found")
    
    if db_request.status != "PROCUREMENT_REQUESTED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request must be PROCUREMENT_REQUESTED before finance approval. Current status: {db_request.status}"
        )
    
    try:
        updated_request = asset_request_service.update_procurement_finance_status(
            db=db,
            request_id=id,
            new_status="PROCUREMENT_APPROVED",
            reviewer_id=reviewer.id,
            reviewer_name=reviewer.full_name,
            reason=None
        )
        
        if not updated_request:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update asset request")
        
        return updated_request
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{id}/procurement/reject", response_model=AssetRequestResponse)
def procurement_reject_request(
    id: str,
    rejection: ProcurementRejectionRequest,
    db: Session = Depends(get_db)
):
    """
    Procurement & Finance rejection for an asset request.
    
    Rules:
    - Only PROCUREMENT_FINANCE role
    - Request must be PROCUREMENT_REQUESTED
    - Rejection reason is mandatory
    
    On reject:
    - status = PROCUREMENT_REJECTED
    - Workflow ends
    """
    reviewer = verify_procurement_finance(rejection.reviewer_id, db)
    
    db_request = asset_request_service.get_asset_request_by_id_db(db, id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset request not found")
    
    if db_request.status != "PROCUREMENT_REQUESTED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request must be PROCUREMENT_REQUESTED before finance rejection. Current status: {db_request.status}"
        )
    
    if not rejection.reason or not rejection.reason.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rejection reason is mandatory"
        )
    
    try:
        updated_request = asset_request_service.update_procurement_finance_status(
            db=db,
            request_id=id,
            new_status="PROCUREMENT_REJECTED",
            reviewer_id=reviewer.id,
            reviewer_name=reviewer.full_name,
            reason=rejection.reason
        )
        
        if not updated_request:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update asset request")
        
        return updated_request
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{id}/procurement/confirm-delivery", response_model=AssetRequestResponse)
def procurement_confirm_delivery(
    id: str,
    reviewer_id: str,
    db: Session = Depends(get_db)
):
    """
    Confirm delivery of a procured asset.
    Moves request from PROCUREMENT_APPROVED to QC_PENDING.
    This routes the request back to Inventory for final allocation/QC.
    """
    reviewer = verify_procurement_finance(reviewer_id, db)
    
    db_request = asset_request_service.get_asset_request_by_id_db(db, id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset request not found")
    
    # In some cases it might stay in PROCUREMENT_REQUIRED if no PO step was taken, 
    # but usually it should be PROCUREMENT_APPROVED (Finance Approved)
    if db_request.status not in ["PROCUREMENT_APPROVED", "PROCUREMENT_REQUIRED"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cannot confirm delivery for request in status: {db_request.status}"
        )
    
    try:
        # Update status to QC_PENDING
        db_request.status = "QC_PENDING"
        db_request.procurement_finance_status = "DELIVERED"
        
        # Update linked asset if exists
        if db_request.asset_id:
            asset = db.query(Asset).filter(Asset.id == db_request.asset_id).first()
            if asset:
                asset.procurement_status = "Delivered"
                asset.status = "In Stock" # Ready for final allocation by Inventory Manager

        db.commit()
        db.refresh(db_request)
        
        return AssetRequestResponse.model_validate(db_request)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# ---------------- QC WORKFLOW ROUTE ----------------


@router.post("/{id}/qc/perform", response_model=AssetRequestResponse)
def perform_qc(
    id: str,
    qc_request: QCPerformRequest,
    db: Session = Depends(get_db)
):
    """
    Perform Quality Check (QC) on received asset.
    
    Rules:
    - Only ASSET_INVENTORY_MANAGER can perform QC
    - Request must be QC_PENDING (after procurement approved and asset received)
    
    On QC PASSED:
    - status = USER_ACCEPTANCE_PENDING
    - Asset ready for user acceptance
    
    On QC FAILED:
    - status = QC_FAILED
    - Asset returned to vendor, may trigger reorder
    """
    # Verify inventory manager
    inventory_manager = verify_asset_inventory_manager(qc_request.qc_performer_id, db)
    
    db_request = asset_request_service.get_asset_request_by_id_db(db, id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset request not found")
    
    if db_request.status != "QC_PENDING":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"QC can only be performed when status is QC_PENDING. Current status: {db_request.status}"
        )
    
    if qc_request.qc_status not in ["PASSED", "FAILED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="qc_status must be PASSED or FAILED"
        )
    
    try:
        updated_request = asset_request_service.perform_qc_check(
            db=db,
            request_id=id,
            qc_status=qc_request.qc_status,
            performer_id=inventory_manager.id,
            performer_name=inventory_manager.full_name,
            qc_notes=qc_request.qc_notes
        )
        
        if not updated_request:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to perform QC")
        
        return updated_request
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ---------------- USER ACCEPTANCE ROUTES ----------------


@router.post("/{id}/user/accept", response_model=AssetRequestResponse)
def user_accept_asset(
    id: str,
    acceptance: UserAcceptanceRequest,
    db: Session = Depends(get_db)
):
    """
    User acceptance of allocated asset.
    
    Rules:
    - Only the requester (END_USER) can accept
    - Request must be USER_ACCEPTANCE_PENDING
    
    On accept:
    - status = IN_USE
    - Asset officially assigned to user
    """
    # Verify user is the requester
    requester = verify_active_end_user(acceptance.user_id, db)
    
    db_request = asset_request_service.get_asset_request_by_id_db(db, id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset request not found")
    
    if db_request.requester_id != acceptance.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the requester can accept the asset"
        )
    
    if db_request.status != "USER_ACCEPTANCE_PENDING":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User acceptance can only be performed when status is USER_ACCEPTANCE_PENDING. Current status: {db_request.status}"
        )
    
    try:
        updated_request = asset_request_service.update_user_acceptance(
            db=db,
            request_id=id,
            user_id=acceptance.user_id,
            acceptance_status="ACCEPTED"
        )
        
        if not updated_request:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update user acceptance")
        
        return updated_request
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{id}/user/reject", response_model=AssetRequestResponse)
def user_reject_asset(
    id: str,
    acceptance: UserAcceptanceRequest,
    db: Session = Depends(get_db)
):
    """
    User rejection of allocated asset.
    
    Rules:
    - Only the requester (END_USER) can reject
    - Request must be USER_ACCEPTANCE_PENDING
    
    On reject:
    - status = USER_REJECTED
    - Asset returned to inventory
    - Request closed
    """
    # Verify user is the requester
    requester = verify_active_end_user(acceptance.user_id, db)
    
    db_request = asset_request_service.get_asset_request_by_id_db(db, id)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset request not found")
    
    if db_request.requester_id != acceptance.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the requester can reject the asset"
        )
    
    if db_request.status != "USER_ACCEPTANCE_PENDING":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User rejection can only be performed when status is USER_ACCEPTANCE_PENDING. Current status: {db_request.status}"
        )
    
    try:
        updated_request = asset_request_service.update_user_acceptance(
            db=db,
            request_id=id,
            user_id=acceptance.user_id,
            acceptance_status="REJECTED"
        )
        
        if not updated_request:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update user acceptance")
        
        # Return asset to inventory if asset_id exists
        if db_request.asset_id:
            asset = db.query(Asset).filter(Asset.id == db_request.asset_id).first()
            if asset:
                asset.status = "In Stock"
                asset.assigned_to = None
                asset.assigned_by = None
                asset.assignment_date = None
                db.commit()
        
        # Close the request
        db_request.status = "CLOSED"
        db.commit()
        db.refresh(db_request)
        
        return AssetRequestResponse.model_validate(db_request)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{request_id}/inventory/allocate", response_model=AssetRequestResponse)
def inventory_allocate_asset(
    request_id: str,
    asset_id: str,
    inventory_manager_id: str,
    db: Session = Depends(get_db)
):
    """
    Inventory manager allocates an available asset to fulfill a request.
    Changes request status to FULFILLED.
    """
    from datetime import date
    
    # Get the asset request
    db_request = asset_request_service.get_asset_request_by_id_db(db, request_id)
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset request not found"
        )
    
    # Verify request is in a state that allows allocation
    if db_request.status not in ["IT_APPROVED", "QC_PENDING"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request must be IT_APPROVED or QC_PENDING. Current status: {db_request.status}"
        )
    
    # Verify asset exists
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset {asset_id} not found"
        )
    
    # Get requester info
    requester = asset_request_service.get_user_by_id_db(db, db_request.requester_id)
    if not requester:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requester not found"
        )
    
    # Assign the asset
    asset.assigned_to = requester.full_name
    asset.assigned_by = inventory_manager_id
    asset.status = "Active"
    asset.assignment_date = date.today()
    
    # Update request status
    db_request.status = "FULFILLED"
    db_request.asset_id = asset_id
    
    db.commit()
    db.refresh(db_request)
    
    return AssetRequestResponse.model_validate(db_request)


@router.post("/{request_id}/inventory/not-available", response_model=AssetRequestResponse)
def inventory_mark_not_available(
    request_id: str,
    inventory_manager_id: str,
    db: Session = Depends(get_db)
):
    """
    Inventory manager marks asset as not available.
    Routes request to procurement for purchasing.
    """
    # Get the asset request
    db_request = asset_request_service.get_asset_request_by_id_db(db, request_id)
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset request not found"
        )
    
    # Verify request is IT_APPROVED
    if db_request.status != "IT_APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Request must be IT_APPROVED. Current status: {db_request.status}"
        )
    
    # Update request status to route to procurement
    db_request.status = "PROCUREMENT_REQUESTED"
    
    # NEW: Create placeholder asset for procurement workflow (so it shows in dashboard)
    import uuid as _uuid
    from models import Asset, PurchaseRequest
    
    # Helper: resolve requester user (for location)
    requester = asset_request_service.get_user_by_id_db(db, db_request.requester_id)

    placeholder_asset = Asset(
        id=str(_uuid.uuid4()),
        name=db_request.asset_name or f"New {db_request.asset_type}",
        type=db_request.asset_type,
        model=db_request.asset_model or db_request.asset_name or "TBD",
        vendor=db_request.asset_vendor or "TBD",
        serial_number=f"PR-{db_request.id}-{str(_uuid.uuid4())[:8]}", # Unique but related
        segment="IT",
        status="Pending",
        location=requester.location if requester else None,
        procurement_status="Requested",
    )
    db.add(placeholder_asset)
    db.flush() # ensure ID is available
    
    # Link asset to request
    db_request.asset_id = placeholder_asset.id
    
    # Create purchase request entry for record keeping
    purchase_request = PurchaseRequest(
        asset_request_id=db_request.id,
        asset_id=placeholder_asset.id,
        requester_id=db_request.requester_id,
        asset_name=db_request.asset_name or db_request.asset_type,
        asset_type=db_request.asset_type,
        asset_model=db_request.asset_model,
        asset_vendor=db_request.asset_vendor,
        cost_estimate=db_request.cost_estimate,
        status="Requested",
    )
    db.add(purchase_request)
    
    db.commit()
    db.refresh(db_request)
    
    return AssetRequestResponse.model_validate(db_request)
