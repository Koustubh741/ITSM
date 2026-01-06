from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.ticket_schema import TicketCreate, TicketUpdate, TicketResponse, ITDiagnosisRequest, ResolutionUpdate
from services import ticket_service
from services import asset_request_service
from schemas.user_schema import UserResponse
from models import Asset, ByodDevice
from datetime import datetime

router = APIRouter(
    prefix="/tickets",
    tags=["tickets"]
)


def verify_it_management(user_id: str, db: Session) -> UserResponse:
    """
    Verify that the user is IT management (role=IT_MANAGEMENT) and active
    """
    user = asset_request_service.get_user_by_id_db(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "IT_MANAGEMENT":
        raise HTTPException(
            status_code=403,
            detail="Only users with role=IT_MANAGEMENT can perform this action",
        )
    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=403,
            detail="User account is not active",
        )
    return user


@router.post("/", response_model=TicketResponse)
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    # If ticket is linked to an asset, ensure the ID refers to either an Asset or a BYOD device
    if ticket.related_asset_id:
        asset = db.query(Asset).filter(Asset.id == ticket.related_asset_id).first()
        if not asset:
            byod = db.query(ByodDevice).filter(ByodDevice.id == ticket.related_asset_id).first()
            if not byod:
                raise HTTPException(
                    status_code=400,
                    detail="related_asset_id must reference a valid asset or BYOD device",
                )
    # Create ticket as-is (schema unchanged)
    return ticket_service.create_ticket(db=db, ticket=ticket)

@router.get("/", response_model=List[TicketResponse])
def read_tickets(requestor_id: str = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tickets = ticket_service.get_tickets(db, requestor_id=requestor_id, skip=skip, limit=limit)
    return tickets

@router.get("/{ticket_id}", response_model=TicketResponse)
def read_ticket(ticket_id: str, db: Session = Depends(get_db)):
    db_ticket = ticket_service.get_ticket(db, ticket_id=ticket_id)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return db_ticket

@router.patch("/{ticket_id}", response_model=TicketResponse)
def update_ticket(ticket_id: str, ticket_update: TicketUpdate, db: Session = Depends(get_db)):
    db_ticket = ticket_service.update_ticket(db, ticket_id=ticket_id, ticket_update=ticket_update)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return db_ticket


@router.post("/{ticket_id}/it/diagnose", response_model=TicketResponse)
def it_diagnose_ticket(
    ticket_id: str,
    payload: ITDiagnosisRequest,
    db: Session = Depends(get_db),
):
    """
    IT Management diagnosis for tickets.

    - Tickets remain unchanged in schema.
    - related_asset_id can point to either an Asset or a BYOD device.

    Behavior:
    - If related_asset_id refers to a company asset (Asset):
        - outcome == "repair" -> mark asset.status = "Repair"
    - If related_asset_id refers to a BYOD device (ByodDevice):
        - outcome == "secure" -> mark byod.compliance_status = "MDM_ENFORCED"
        - outcome == "repair" -> mark byod.compliance_status = "NON_COMPLIANT"
    """
    reviewer = verify_it_management(payload.reviewer_id, db)

    db_ticket = ticket_service.get_ticket(db, ticket_id)
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if not db_ticket.related_asset_id:
        raise HTTPException(
            status_code=400,
            detail="Ticket is not linked to any asset or BYOD device",
        )

    # Try to resolve as company asset
    asset = db.query(Asset).filter(Asset.id == db_ticket.related_asset_id).first()
    if asset:
        # Company-owned asset path
        if payload.outcome == "repair":
            asset.status = "Repair"
            db_ticket.status = "IN_PROGRESS" # moved to ongoing repair
        elif payload.outcome == "secure":
            # For company-owned, a 'secure' outcome means security fix applied
            asset.status = asset.status or "Active"
            db_ticket.status = "RESOLVED" # Security fix applied -> Resolved
            
        db.commit()
        db.refresh(db_ticket)
        return db_ticket

    # Otherwise treat as BYOD device
    byod = db.query(ByodDevice).filter(ByodDevice.id == db_ticket.related_asset_id).first()
    if not byod:
        raise HTTPException(
            status_code=400,
            detail="related_asset_id does not match any asset or BYOD device",
        )

    # BYOD-specific handling
    if payload.outcome == "secure":
        # Mock security fix / MDM enforcement
        byod.compliance_status = "MDM_ENFORCED"
        db_ticket.status = "RESOLVED" # Security fix applied -> Resolved
    elif payload.outcome == "repair":
        # For BYOD, a 'repair' could be treated as non-compliance needing owner action
        byod.compliance_status = "NON_COMPLIANT"
        db_ticket.status = "IN_PROGRESS" # Waiting for user/owner action
        
    if payload.outcome == "repair" and asset: # Fix logic for company asset above (copy-paste block fix)
         db_ticket.status = "IN_PROGRESS" # Asset moved to repair -> ticket still in progress

    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@router.post("/{ticket_id}/acknowledge", response_model=TicketResponse)
def acknowledge_ticket(ticket_id: str, payload: ITDiagnosisRequest, db: Session = Depends(get_db)):
    """
    IT Management acknowledges the ticket, moving it to IN_PROGRESS.
    """
    reviewer = verify_it_management(payload.reviewer_id, db)
    
    db_ticket = ticket_service.get_ticket(db, ticket_id)
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if db_ticket.status and db_ticket.status.upper() == "OPEN":
        db_ticket.status = "IN_PROGRESS"
        
        # Add to timeline
        new_event = {
            "action": "ACKNOWLEDGED",
            "byRole": "IT_MANAGEMENT",
            "byUser": reviewer.full_name,
            "timestamp": datetime.utcnow().isoformat(),
            "comment": payload.notes or "Ticket acknowledged and moved to Investigation"
        }
        
        # Standard append and re-assign for SQLAlchemy JSON tracking
        current_timeline = list(db_ticket.timeline) if db_ticket.timeline else []
        current_timeline.append(new_event)
        db_ticket.timeline = current_timeline
        
        # Also update resolution notes if provided
        if payload.notes:
            db_ticket.resolution_notes = payload.notes

        print(f"[NOTIFICATION] User {db_ticket.requestor_id} notified: IT has acknowledged ticket {ticket_id}")
        
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@router.post("/{ticket_id}/progress", response_model=TicketResponse)
def update_ticket_progress(ticket_id: str, payload: ResolutionUpdate, db: Session = Depends(get_db)):
    """
    Update resolution progress (checklist, notes, percentage) without closing the ticket.
    Notify End User of progress.
    """
    reviewer = verify_it_management(payload.reviewer_id, db)
    
    db_ticket = ticket_service.get_ticket(db, ticket_id)
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    # Update resolution details
    db_ticket.resolution_notes = payload.notes
    db_ticket.resolution_checklist = payload.checklist
    db_ticket.resolution_percentage = payload.percentage
    
    # Ensure status is IN_PROGRESS (if not already) or keep as is
    if db_ticket.status != "IN_PROGRESS" and db_ticket.status != "RESOLVED":
        db_ticket.status = "IN_PROGRESS"

    # Add to timeline
    new_event = {
        "action": "PROGRESS_UPDATE",
        "byRole": "IT_MANAGEMENT",
        "byUser": reviewer.full_name,
        "timestamp": datetime.utcnow().isoformat(),
        "comment": f"Resolution progress updated to {payload.percentage}%"
    }
    current_timeline = list(db_ticket.timeline) if db_ticket.timeline else []
    current_timeline.append(new_event)
    db_ticket.timeline = current_timeline

    # Notification stub
    print(f"[NOTIFICATION] User {db_ticket.requestor_id} notified: Ticket {ticket_id} progress updated to {payload.percentage}%")

    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@router.post("/{ticket_id}/resolve", response_model=TicketResponse)
def resolve_ticket(ticket_id: str, payload: ResolutionUpdate, db: Session = Depends(get_db)):
    """
    IT Management resolves the ticket explicitly with full resolution details.
    """
    reviewer = verify_it_management(payload.reviewer_id, db)
    
    db_ticket = ticket_service.get_ticket(db, ticket_id)
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    # Update resolution details
    db_ticket.resolution_notes = payload.notes
    db_ticket.resolution_checklist = payload.checklist
    db_ticket.resolution_percentage = 100.0 # Force 100% on resolve
    
    db_ticket.status = "RESOLVED"

    # Add to timeline
    new_event = {
        "action": "RESOLVED",
        "byRole": "IT_MANAGEMENT",
        "byUser": reviewer.full_name,
        "timestamp": datetime.utcnow().isoformat(),
        "comment": payload.notes or "Ticket has been marked as Resolved"
    }
    current_timeline = list(db_ticket.timeline) if db_ticket.timeline else []
    current_timeline.append(new_event)
    db_ticket.timeline = current_timeline
    
    # Notification stub
    print(f"[NOTIFICATION] User {db_ticket.requestor_id} notified: Ticket {ticket_id} has been resolved")
    
    db.commit()
    db.refresh(db_ticket)
    return db_ticket
