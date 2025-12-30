"""
Requests Router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models import Request, RequestType, RequestStatus, UrgencyLevel, User
from routers.auth import get_current_user

router = APIRouter()


class RequestResponse(BaseModel):
    id: int
    request_number: str
    type: RequestType
    status: RequestStatus
    urgency: UrgencyLevel
    title: str
    description: str
    requester_id: int
    asset_id: int | None
    estimated_cost: float | None
    requested_date: datetime
    reason: str | None = None
    rejection_reason: str | None = None
    
    class Config:
        from_attributes = True


class RequestCreate(BaseModel):
    type: RequestType
    title: str
    description: str
    urgency: UrgencyLevel = UrgencyLevel.MEDIUM
    asset_id: int | None = None
    estimated_cost: float | None = None
    reason: str | None = None


@router.get("/", response_model=List[RequestResponse])
async def get_requests(
    skip: int = 0,
    limit: int = 100,
    status: Optional[RequestStatus] = None,
    type: Optional[RequestType] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all requests"""
    query = db.query(Request)
    
    if status:
        query = query.filter(Request.status == status)
    
    if type:
        query = query.filter(Request.type == type)
    
    # Role-based filtering (Disabled for Dev/Demo to allow UI Role Switching)
    # if current_user.role.value == "end_user":
    #    query = query.filter(Request.requester_id == current_user.id)
    
    requests = query.offset(skip).limit(limit).all()
    return requests


@router.post("/", response_model=RequestResponse)
async def create_request(
    request: RequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new request"""
    # Generate request number
    count = db.query(Request).count()
    request_number = f"REQ-{count + 1:05d}"
    
    db_request = Request(
        **request.model_dump(),
        request_number=request_number,
        requester_id=current_user.id,
        department_id=current_user.department_id
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    return db_request


@router.put("/{request_id}/approve")
async def approve_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve request"""
    request = db.query(Request).filter(Request.id == request_id).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    request.status = RequestStatus.APPROVED
    request.approved_by = current_user.id
    request.approved_date = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Request approved"}


class RequestReject(BaseModel):
    reason: str


@router.put("/{request_id}/reject")
async def reject_request(
    request_id: int,
    rejection: RequestReject,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reject request"""
    print(f"DEBUG: Rejecting request {request_id} with reason: {rejection.reason}")
    request = db.query(Request).filter(Request.id == request_id).first()
    
    if not request:
        print(f"DEBUG: Request {request_id} not found")
        raise HTTPException(status_code=404, detail="Request not found")
    
    try:
        request.status = RequestStatus.REJECTED
        request.rejected_by = current_user.id
        request.rejected_date = datetime.utcnow()
        request.rejection_reason = rejection.reason
        
        print(f"DEBUG: Committing rejection for {request_id}")
        db.commit()
        print(f"DEBUG: Successfully rejected {request_id}")
    except Exception as e:
        print(f"DEBUG: Error rejecting request: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"message": "Request rejected"}
