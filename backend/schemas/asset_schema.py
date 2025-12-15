from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, datetime

class AssetBase(BaseModel):
    name: str
    type: str  # Laptop, Server, License, etc.
    model: str
    vendor: str
    serial_number: str
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None
    status: str  # Active, In Stock, Retired, Repair
    location: Optional[str] = None
    segment: str = "IT" # IT or NON-IT
    assigned_to: Optional[str] = None
    assigned_by: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = {}
    cost: Optional[float] = 0.0

    # Renewal Workflow Fields
    renewal_status: Optional[str] = None # None, "Requested", "IT_Approved", "Finance_Approved", "Commercial_Approved", "Renewed"
    renewal_cost: Optional[float] = None
    renewal_reason: Optional[str] = None
    renewal_urgency: Optional[str] = None # Low, Medium, High

    # Procurement & Disposal Fields
    procurement_status: Optional[str] = None # None, "Requested", "Approved", "Ordered", "Received"
    disposal_status: Optional[str] = None # None, "Pending_Validation", "Ready_For_Wipe", "Wiped", "Disposed"

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    model: Optional[str] = None
    vendor: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None
    status: Optional[str] = None
    location: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    assigned_to: Optional[str] = None
    assigned_by: Optional[str] = None
    assignment_date: Optional[date] = None
    segment: Optional[str] = None
    renewal_status: Optional[str] = None
    renewal_cost: Optional[float] = None

class AssetResponse(AssetBase):
    id: str
    created_at: datetime
    updated_at: datetime
    assignment_date: Optional[date] = None

    class Config:
        from_attributes = True
