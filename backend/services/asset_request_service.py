"""
Asset Request service layer - Database operations for asset requests
"""
import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from database import SessionLocal
from models import AssetRequest, User
from schemas.asset_request_schema import AssetRequestCreate, AssetRequestUpdate, AssetRequestResponse
from utils.state_machine import validate_state_transition, is_terminal_state

def _populate_requester_info(db: Session, db_request: AssetRequest) -> AssetRequestResponse:
    """Helper to add requester name/email to response"""
    user = db.query(User).filter(User.id == db_request.requester_id).first()
    res = AssetRequestResponse.model_validate(db_request)
    if user:
        res.requester_name = user.full_name
        res.requester_email = user.email
    return res

def get_asset_request_by_id(request_id: str) -> Optional[AssetRequestResponse]:
    """
    Get an asset request by ID
    """
    db = SessionLocal()
    try:
        request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
        if request:
            return _populate_requester_info(db, request)
        return None
    finally:
        db.close()

def get_asset_request_by_id_db(db: Session, request_id: str) -> Optional[AssetRequest]:
    """
    Get an asset request by ID (returns DB model, not response)
    """
    return db.query(AssetRequest).filter(AssetRequest.id == request_id).first()

def get_user_by_id(user_id: str) -> Optional[User]:
    """
    Get a user by ID
    """
    db = SessionLocal()
    try:
        return db.query(User).filter(User.id == user_id).first()
    finally:
        db.close()

def get_user_by_id_db(db: Session, user_id: str) -> Optional[User]:
    """
    Get a user by ID (returns DB model, not response)
    """
    return db.query(User).filter(User.id == user_id).first()

def create_asset_request(request: AssetRequestCreate, initial_status: str = "SUBMITTED") -> AssetRequestResponse:
    """
    Create a new asset request
    """
    db = SessionLocal()
    try:
        db_request = AssetRequest(
            id=str(uuid.uuid4()),
            requester_id=request.requester_id,
            asset_id=request.asset_id,
            asset_name=request.asset_name,
            asset_type=request.asset_type,
            asset_ownership_type=request.asset_ownership_type,
            asset_model=request.asset_model,
            asset_vendor=request.asset_vendor,
            serial_number=request.serial_number,
            os_version=request.os_version,
            cost_estimate=request.cost_estimate,
            justification=request.justification,
            business_justification=request.business_justification,
            status=initial_status,
            manager_approvals=[]
        )
        db.add(db_request)
        db.commit()
        db.refresh(db_request)
        return _populate_requester_info(db, db_request)
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

def update_asset_request_status(
    db: Session,
    request_id: str,
    new_status: str,
    manager_id: str,
    manager_name: str,
    decision: str,
    reason: Optional[str] = None
) -> Optional[AssetRequestResponse]:
    """
    Update asset request status and add manager approval record
    """
    db_request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not db_request:
        return None
    
    # Update status
    db_request.status = new_status
    
    # Add manager approval record
    if db_request.manager_approvals is None:
        db_request.manager_approvals = []
    
    approval_record = {
        "manager_id": manager_id,
        "manager_name": manager_name,
        "decision": decision,
        "reason": reason,
        "timestamp": datetime.now().isoformat()
    }
    db_request.manager_approvals.append(approval_record)
    
    db.commit()
    db.refresh(db_request)
    return _populate_requester_info(db, db_request)


def update_asset_request_status_with_validation(
    db: Session,
    request_id: str,
    new_status: str,
    user_role: str,
    reviewer_id: Optional[str] = None,
    reviewer_name: Optional[str] = None,
    reason: Optional[str] = None
) -> Optional[AssetRequestResponse]:
    """
    Update asset request status with state machine validation
    """
    db_request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not db_request:
        return None
    
    # Validate state transition
    is_valid, error_msg = validate_state_transition(
        current_status=db_request.status,
        new_status=new_status,
        user_role=user_role,
        asset_ownership_type=db_request.asset_ownership_type
    )
    
    if not is_valid:
        raise ValueError(error_msg)
    
    # Update status
    db_request.status = new_status
    
    # Update timestamps
    db_request.updated_at = datetime.now()
    
    # Record reviewer info if provided
    if reviewer_id:
        if db_request.manager_approvals is None:
            db_request.manager_approvals = []
        db_request.manager_approvals.append({
            "reviewer_id": reviewer_id,
            "reviewer_name": reviewer_name or reviewer_id,
            "decision": new_status,
            "reason": reason,
            "timestamp": datetime.now().isoformat(),
            "type": "STATUS_CHANGE"
        })
    
    db.commit()
    db.refresh(db_request)
    return _populate_requester_info(db, db_request)


def update_it_review_status(
    db: Session,
    request_id: str,
    new_status: str,
    reviewer_id: str,
    reviewer_name: str,
    decision: str,
    reason: Optional[str] = None
) -> Optional[AssetRequestResponse]:
    """
    Update IT review status - uses unified status field
    Maintains backward compatibility while using new state machine
    """
    db_request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not db_request:
        return None

    # Use state machine validation
    is_valid, error_msg = validate_state_transition(
        current_status=db_request.status,
        new_status=new_status,
        user_role="IT_MANAGEMENT",
        asset_ownership_type=db_request.asset_ownership_type
    )
    
    if not is_valid:
        raise ValueError(error_msg)

    db_request.status = new_status
    db_request.it_reviewed_by = str(reviewer_id)
    db_request.it_reviewed_at = datetime.now()

    # Append to manager_approvals for audit trail
    if db_request.manager_approvals is None:
        db_request.manager_approvals = []
    db_request.manager_approvals.append(
        {
            "reviewer_id": str(reviewer_id),
            "reviewer_name": reviewer_name,
            "decision": decision,
            "reason": reason,
            "timestamp": datetime.now().isoformat(),
            "type": "IT_REVIEW",
        }
    )

    db.commit()
    db.refresh(db_request)
    return _populate_requester_info(db, db_request)


def update_procurement_finance_status(
    db: Session,
    request_id: str,
    new_status: str,
    reviewer_id: str,
    reviewer_name: str,
    reason: Optional[str] = None
) -> Optional[AssetRequestResponse]:
    """
    Update procurement & finance approval status
    """
    db_request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not db_request:
        return None
    
    # Validate state transition
    is_valid, error_msg = validate_state_transition(
        current_status=db_request.status,
        new_status=new_status,
        user_role="PROCUREMENT_FINANCE",
        asset_ownership_type=db_request.asset_ownership_type
    )
    
    if not is_valid:
        raise ValueError(error_msg)
    
    db_request.status = new_status
    db_request.procurement_finance_status = "APPROVED" if new_status == "PROCUREMENT_APPROVED" else "REJECTED"
    db_request.procurement_finance_reviewed_by = str(reviewer_id)
    db_request.procurement_finance_reviewed_at = datetime.now()
    if reason:
        db_request.procurement_finance_rejection_reason = reason
    
    # Audit trail
    if db_request.manager_approvals is None:
        db_request.manager_approvals = []
    db_request.manager_approvals.append({
        "reviewer_id": str(reviewer_id),
        "reviewer_name": reviewer_name,
        "decision": new_status,
        "reason": reason,
        "timestamp": datetime.now().isoformat(),
        "type": "PROCUREMENT_FINANCE_REVIEW"
    })
    
    db.commit()
    db.refresh(db_request)
    return _populate_requester_info(db, db_request)


def perform_qc_check(
    db: Session,
    request_id: str,
    qc_status: str,
    performer_id: str,
    performer_name: str,
    qc_notes: Optional[str] = None
) -> Optional[AssetRequestResponse]:
    """
    Perform quality check on received asset
    """
    db_request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not db_request:
        return None
    
    if db_request.status != "QC_PENDING":
        raise ValueError(f"QC can only be performed when status is QC_PENDING. Current status: {db_request.status}")
    
    if qc_status not in ["PASSED", "FAILED"]:
        raise ValueError("qc_status must be PASSED or FAILED")
    
    db_request.qc_status = qc_status
    db_request.qc_performed_by = str(performer_id)
    db_request.qc_performed_at = datetime.now()
    db_request.qc_notes = qc_notes
    
    # Determine next status based on QC result
    if qc_status == "PASSED":
        db_request.status = "USER_ACCEPTANCE_PENDING"
    else:
        db_request.status = "QC_FAILED"
    
    # Audit trail
    if db_request.manager_approvals is None:
        db_request.manager_approvals = []
    db_request.manager_approvals.append({
        "reviewer_id": str(performer_id),
        "reviewer_name": performer_name,
        "decision": qc_status,
        "reason": qc_notes,
        "timestamp": datetime.now().isoformat(),
        "type": "QC_CHECK"
    })
    
    db.commit()
    db.refresh(db_request)
    return _populate_requester_info(db, db_request)


def update_user_acceptance(
    db: Session,
    request_id: str,
    user_id: str,
    acceptance_status: str
) -> Optional[AssetRequestResponse]:
    """
    Update user acceptance status
    """
    db_request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not db_request:
        return None
    
    # Verify user is the requester
    if db_request.requester_id != user_id:
        raise ValueError("Only the requester can accept/reject the asset")
    
    if db_request.status != "USER_ACCEPTANCE_PENDING":
        raise ValueError(f"User acceptance can only be performed when status is USER_ACCEPTANCE_PENDING. Current status: {db_request.status}")
    
    if acceptance_status not in ["ACCEPTED", "REJECTED"]:
        raise ValueError("acceptance_status must be ACCEPTED or REJECTED")
    
    db_request.user_acceptance_status = acceptance_status
    db_request.user_accepted_at = datetime.now()
    
    # Determine next status
    if acceptance_status == "ACCEPTED":
        db_request.status = "IN_USE"
    else:
        db_request.status = "USER_REJECTED"
        # Asset should be returned to inventory (handled by endpoint)
    
    # Audit trail
    if db_request.manager_approvals is None:
        db_request.manager_approvals = []
    db_request.manager_approvals.append({
        "reviewer_id": str(user_id),
        "reviewer_name": "END_USER",
        "decision": acceptance_status,
        "timestamp": datetime.now().isoformat(),
        "type": "USER_ACCEPTANCE"
    })
    
    db.commit()
    db.refresh(db_request)
    return _populate_requester_info(db, db_request)


def get_all_asset_requests(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    requester_id: Optional[str] = None,
    domain: Optional[str] = None
) -> List[AssetRequestResponse]:
    """
    Get all asset requests with optional filtering
    """
    # SIMPLIFIED QUERY FOR DEBUGGING
    print(f"DEBUG: Filtering requests - status={status}, requester_id={requester_id}, domain={domain}")
    
    query = db.query(AssetRequest)

    if status:
        query = query.filter(AssetRequest.status == status)
        
    if requester_id:
        query = query.filter(AssetRequest.requester_id == str(requester_id))
        
    # Domain filter - join with User table to filter by requester's domain
    if domain:
        query = query.join(User, AssetRequest.requester_id == User.id).filter(User.domain == domain)
        
    results = query.offset(skip).limit(limit).all()
    print(f"DEBUG: Found {len(results)} results (domain={domain})")
    
    response_list = []
    for req in results:
        # Manually populate user info
        user = db.query(User).filter(User.id == req.requester_id).first()
        res = AssetRequestResponse.model_validate(req)
        if user:
            res.requester_name = user.full_name
            res.requester_email = user.email
        response_list.append(res)
        
    return response_list

