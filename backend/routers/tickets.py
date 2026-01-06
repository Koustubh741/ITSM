from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.ticket_schema import TicketCreate, TicketUpdate, TicketResponse, ITDiagnosisRequest
from services import ticket_service
from services import asset_request_service
from schemas.user_schema import UserResponse
from models import Asset, ByodDevice

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
def read_tickets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tickets = ticket_service.get_tickets(db, skip=skip, limit=limit)
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
    Notification stub: "Notify END_USER about ongoing investigation"
    """
    verify_it_management(payload.reviewer_id, db)
    
    db_ticket = ticket_service.get_ticket(db, ticket_id)
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    # Check status case-insensitively
    if db_ticket.status and db_ticket.status.upper() == "OPEN":
        db_ticket.status = "IN_PROGRESS"
        # Notification stub: print to console for now
        print(f"[NOTIFICATION] User {db_ticket.requestor_id} notified: IT has acknowledged ticket {ticket_id}")
        
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@router.post("/{ticket_id}/resolve", response_model=TicketResponse)
def resolve_ticket(ticket_id: str, payload: ITDiagnosisRequest, db: Session = Depends(get_db)):
    """
    IT Management resolves the ticket explicitly.
    """
    verify_it_management(payload.reviewer_id, db)
    
    db_ticket = ticket_service.get_ticket(db, ticket_id)
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    db_ticket.status = "RESOLVED"
    # Notification stub
    print(f"[NOTIFICATION] User {db_ticket.requestor_id} notified: Ticket {ticket_id} has been resolved")
    
    db.commit()
    db.refresh(db_ticket)
    return db_ticket
