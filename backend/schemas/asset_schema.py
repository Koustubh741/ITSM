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

from uuid import UUID
from typing import Union

class AssetResponse(AssetBase):
    id: Union[str, UUID]
    created_at: datetime
    updated_at: datetime
    assignment_date: Optional[date] = None

    class Config:
        json_encoders = {
            UUID: lambda v: str(v)
        }
        from_attributes = True
class AssetAssignmentRequest(BaseModel):
    assigned_to: str
    assigned_to_id: Optional[str] = None
    location: Optional[str] = "Office"
    assignment_date: Optional[date] = None


from pydantic import field_validator
from urllib.parse import urlparse
import ipaddress

class URLRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        parsed = urlparse(v)
        if parsed.scheme not in ("http", "https"):
            raise ValueError("URL must start with http:// or https://")

        host = parsed.hostname
        if not host:
            raise ValueError("URL must include a hostname")

        try:
            ip = ipaddress.ip_address(host)
            if ip.is_private or ip.is_loopback or ip.is_link_local:
                raise ValueError("Private or loopback IP addresses are not allowed")
        except ValueError:
            # Not an IP address; reject obvious local hostnames
            if host in ("localhost",):
                raise ValueError("Local hostnames are not allowed")

        return v
