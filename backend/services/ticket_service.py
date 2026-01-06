from sqlalchemy.orm import Session
from sqlalchemy import cast, String
from models import Ticket, User
from schemas.ticket_schema import TicketCreate, TicketUpdate
import uuid

def get_tickets(db: Session, requestor_id: str = None, skip: int = 0, limit: int = 100):
    # Cast User.id to String to avoid Postgres "operator does not exist: character varying = uuid" error
    # since Ticket.requestor_id is String but User.id is UUID in the DB.
    query = db.query(Ticket, User.full_name)\
        .outerjoin(User, Ticket.requestor_id == cast(User.id, String))
    
    if requestor_id:
        query = query.filter(Ticket.requestor_id == requestor_id)
        
    results = query.offset(skip).limit(limit).all()
        
    tickets = []
    for t, user_name in results:
        # Dynamically attach requestor_name so Pydantic can pick it up
        if user_name:
            t.requestor_name = user_name
        tickets.append(t)
    return tickets

def get_ticket(db: Session, ticket_id: str):
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()

def create_ticket(db: Session, ticket: TicketCreate):
    db_ticket = Ticket(
        id=str(uuid.uuid4()),
        **ticket.model_dump()
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def update_ticket(db: Session, ticket_id: str, ticket_update: TicketUpdate):
    db_ticket = get_ticket(db, ticket_id)
    if not db_ticket:
        return None
    
    update_data = ticket_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_ticket, key, value)
        
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def delete_ticket(db: Session, ticket_id: str):
    db_ticket = get_ticket(db, ticket_id)
    if db_ticket:
        db.delete(db_ticket)
        db.commit()
        return True
    return False
