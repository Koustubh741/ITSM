from pydantic import BaseModel
from typing import Optional, List, Union
from datetime import datetime
from uuid import UUID

class TicketBase(BaseModel):
    subject: str
    description: str
    priority: str = "Medium" # Low, Medium, High
    category: Optional[str] = "Hardware"

class TicketCreate(TicketBase):
    related_asset_id: Optional[str] = None
    requestor_id: Optional[str] = None # Optional for MVP, can infer from auth token later

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to_id: Optional[str] = None


class ITDiagnosisRequest(BaseModel):
    """
    Request body for IT Management diagnosis of a ticket
    """
    reviewer_id: str  # IT management user ID
    outcome: str  # "repair" for company assets, "secure" for BYOD
    notes: Optional[str] = None

class ResolutionUpdate(BaseModel):
    reviewer_id: str
    checklist: List[dict]
    notes: Optional[str] = None
    percentage: float

class TicketResponse(TicketBase):
    id: Union[str, UUID]
    status: str
    requestor_id: Optional[str] = None
    requestor_name: Optional[str] = None
    assigned_to_id: Optional[str] = None
    related_asset_id: Optional[str] = None
    
    # Resolution Details
    resolution_notes: Optional[str] = None
    resolution_checklist: Optional[List[dict]] = None
    resolution_percentage: Optional[float] = 0.0
    timeline: Optional[List[dict]] = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
