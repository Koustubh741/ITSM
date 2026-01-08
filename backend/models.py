from sqlalchemy import Column, String, Date, Float, DateTime, JSON, Text, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from datetime import datetime
from database import Base

class Asset(Base):
    """
    Asset model matching the AssetBase schema
    """
    __tablename__ = "assets"
    __table_args__ = {"schema": "asset"}

    # Primary key
    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )

    # Basic Asset Information
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(100), nullable=False)
    model = Column(String(255), nullable=False)
    vendor = Column(String(255), nullable=False)
    serial_number = Column(String(255), nullable=False, unique=True, index=True)
    segment = Column(String(50), nullable=False, default="IT")

    # Dates
    purchase_date = Column(Date, nullable=True)
    warranty_expiry = Column(Date, nullable=True, index=True)
    assignment_date = Column(Date, nullable=True)

    # Status and Location
    status = Column(String(50), nullable=False, index=True)
    location = Column(String(255), nullable=True)

    # Assignment
    assigned_to = Column(String(255), nullable=True)
    assigned_by = Column(String(255), nullable=True)

    # Specifications
    specifications = Column(JSON, nullable=True, default={})

    # Financial
    cost = Column(Float, nullable=True, default=0.0)

    # Renewal Workflow Fields
    renewal_status = Column(String(50), nullable=True)
    renewal_cost = Column(Float, nullable=True)
    renewal_reason = Column(Text, nullable=True)
    renewal_urgency = Column(String(20), nullable=True)

    # Procurement & Disposal Fields
    procurement_status = Column(String(50), nullable=True)
    disposal_status = Column(String(50), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<Asset(id={self.id}, name={self.name}, status={self.status})>"


class AssetAssignment(Base):
    """
    Asset assignment history
    """
    __tablename__ = "asset_assignments"
    __table_args__ = {"schema": "asset"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    asset_id = Column(String, nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    assigned_by = Column(String, nullable=True)
    location = Column(String(255), nullable=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class User(Base):
    """
    User model for authentication and role management
    """
    __tablename__ = "users"
    __table_args__ = {"schema": "auth"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="END_USER")
    status = Column(String(50), nullable=False, default="PENDING", index=True)  # PENDING | ACTIVE | EXITING | DISABLED
    position = Column(String(50), nullable=True)  # MANAGER | TEAM_MEMBER
    domain = Column(String(50), nullable=True)  # DATA_AI | CLOUD | SECURITY | DEVELOPMENT
    department = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    company = Column(String(255), nullable=True) # New field
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role}, status={self.status})>"

class Ticket(Base):
    """
    Ticket model for Help Desk/Incidents
    """
    __tablename__ = "tickets"
    __table_args__ = {"schema": "support"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    # Using a readable ID like TCK-101 is common, but basic UUID is safer for MVP.
    # We can add a sequence or display_id later.
    
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    
    status = Column(String(50), default="Open", index=True) # Open, Pending, Closed
    priority = Column(String(20), default="Medium") # Low, Medium, High
    category = Column(String(50), nullable=True) # Hardware, Software, Network
    
    # Relations (Using string IDs to avoid complex foreign key constraints for MVP if simple)
    # Ideally should use ForeignKey("auth.users.id") but cross-schema FKs need care.
    requestor_id = Column(String, nullable=True) 
    assigned_to_id = Column(String, nullable=True)
    related_asset_id = Column(String, nullable=True)
    
    # Resolution Details
    resolution_notes = Column(Text, nullable=True)
    resolution_checklist = Column(JSON, nullable=True)
    resolution_percentage = Column(Float, default=0.0)
    timeline = Column(JSON, nullable=True, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<Ticket(id={self.id}, subject={self.subject}, status={self.status})>"

class AssetRequest(Base):
    """
    Asset Request model for managing asset requests and approvals
    """
    __tablename__ = "asset_requests"
    __table_args__ = {"schema": "asset"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    
    # Requester information
    requester_id = Column(String, nullable=False, index=True)
    
    # Asset details (can be linked to existing asset or new asset request)
    asset_id = Column(String, nullable=True)  # If requesting existing asset
    asset_name = Column(String(255), nullable=False)
    asset_type = Column(String(100), nullable=False)  # Laptop, Server, etc. (asset category)
    asset_ownership_type = Column(String(50), nullable=True)  # COMPANY_OWNED | BYOD
    asset_model = Column(String(255), nullable=True)
    asset_vendor = Column(String(255), nullable=True)
    serial_number = Column(String(255), nullable=True)
    os_version = Column(String(100), nullable=True)
    cost_estimate = Column(Float, nullable=True)
    justification = Column(Text, nullable=True)
    business_justification = Column(Text, nullable=True)  # Required for new requests
    reason = Column(Text, nullable=True) # Matches DB column
    priority = Column(String(20), default="Medium")
    
    # Status tracking - Unified state machine
    # Valid states: SUBMITTED | MANAGER_APPROVED | MANAGER_REJECTED | IT_APPROVED | IT_REJECTED | 
    # PROCUREMENT_REQUESTED | PROCUREMENT_APPROVED | PROCUREMENT_REJECTED | QC_PENDING | QC_FAILED |
    # BYOD_COMPLIANCE_CHECK | BYOD_REJECTED | USER_ACCEPTANCE_PENDING | USER_REJECTED | IN_USE | CLOSED
    status = Column(String(50), nullable=False, default="SUBMITTED", index=True)
    
    # Manager approvals (JSON array of approval decisions)
    manager_approvals = Column(JSON, nullable=True, default=list)

    # IT review tracking (for audit trail - status field is source of truth)
    it_reviewed_by = Column(String, nullable=True)
    it_reviewed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Procurement & Finance approval tracking
    procurement_finance_status = Column(String(50), nullable=True)  # APPROVED | REJECTED
    procurement_finance_reviewed_by = Column(String, nullable=True)
    procurement_finance_reviewed_at = Column(DateTime(timezone=True), nullable=True)
    procurement_finance_rejection_reason = Column(Text, nullable=True)
    
    # Quality Check (QC) fields
    qc_status = Column(String(50), nullable=True)  # PENDING | PASSED | FAILED
    qc_performed_by = Column(String, nullable=True)
    qc_performed_at = Column(DateTime(timezone=True), nullable=True)
    qc_notes = Column(Text, nullable=True)
    
    # User acceptance tracking
    user_acceptance_status = Column(String(50), nullable=True)  # PENDING | ACCEPTED | REJECTED
    user_accepted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.now, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.now, onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<AssetRequest(id={self.id}, requester_id={self.requester_id}, status={self.status})>"


class ByodDevice(Base):
    """
    BYOD device registry - tracks approved personal devices
    """
    __tablename__ = "byod_devices"
    __table_args__ = {"schema": "asset"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    request_id = Column(String, nullable=False, index=True)
    owner_id = Column(String, nullable=False, index=True)

    device_model = Column(String(255), nullable=False)
    os_version = Column(String(100), nullable=False)
    serial_number = Column(String(255), nullable=False, index=True)

    compliance_status = Column(String(50), nullable=False, default="COMPLIANT")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class PurchaseRequest(Base):
    """
    Purchase request for company-owned assets
    """
    __tablename__ = "purchase_requests"
    __table_args__ = {"schema": "procurement"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    asset_request_id = Column(String, nullable=False, index=True)
    asset_id = Column(String, nullable=True, index=True)

    requester_id = Column(String, nullable=False, index=True)
    asset_name = Column(String(255), nullable=False)
    asset_type = Column(String(100), nullable=False)
    asset_model = Column(String(255), nullable=True)
    asset_vendor = Column(String(255), nullable=True)
    cost_estimate = Column(Float, nullable=True)

    status = Column(String(50), nullable=False, default="Requested")  # Requested | Approved | Ordered | Received
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class ExitRequest(Base):
    """
    User exit / resignation workflow
    """
    __tablename__ = "exit_requests"
    __table_args__ = {"schema": "exit"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, nullable=False, index=True)
    status = Column(String(50), nullable=False, default="OPEN")  # OPEN | ASSETS_PROCESSED | BYOD_PROCESSED | COMPLETED

    assets_snapshot = Column(JSON, nullable=True)
    byod_snapshot = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class AuditLog(Base):
    """
    Audit Log for system events
    """
    __tablename__ = "audit_logs"
    __table_args__ = {"schema": "system"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    entity_type = Column(String(50), nullable=False) # Asset, Ticket, User
    entity_id = Column(String, nullable=False)
    action = Column(String(50), nullable=False) # Created, Updated, Deleted, Login
    performed_by = Column(String, nullable=True) # User ID or Name
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
