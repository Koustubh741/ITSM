"""
SQLAlchemy ORM Models for Asset Management System
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Numeric, Text, ForeignKey, Enum as SQLEnum, ARRAY
from sqlalchemy.dialects.postgresql import JSONB, INET
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


# Enums
class UserRole(str, enum.Enum):
    END_USER = "end_user"
    IT_SUPPORT = "it_support"
    INVENTORY_MANAGER = "inventory_manager"
    ASSET_OWNER = "asset_owner"
    SYSTEM_ADMIN = "system_admin"


class AssetStatus(str, enum.Enum):
    AVAILABLE = "available"
    IN_USE = "in_use"
    IN_REPAIR = "in_repair"
    MAINTENANCE = "maintenance"
    RETIRED = "retired"
    DISPOSED = "disposed"


class AssetSegment(str, enum.Enum):
    IT = "IT"
    NON_IT = "NON_IT"


class AssetCondition(str, enum.Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    NEEDS_REPAIR = "needs_repair"


class RequestType(str, enum.Enum):
    NEW_ASSET = "new_asset"
    TRANSFER = "transfer"
    RENEWAL = "renewal"
    SERVICE = "service"
    DISPOSAL = "disposal"
    REPAIR = "repair"
    UPGRADE = "upgrade"


class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class UrgencyLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# Models
class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True)
    description = Column(Text)
    manager_id = Column(Integer, ForeignKey("users.id"))
    budget = Column(Numeric(15, 2))
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="department", foreign_keys="User.department_id")


class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True)
    address = Column(Text)
    city = Column(String(50))
    state = Column(String(50))
    country = Column(String(50), default="India")
    postal_code = Column(String(10))
    contact_person = Column(String(100))
    contact_phone = Column(String(20))
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="location")
    assets = relationship("Asset", back_populates="location")


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    role = Column(String(50), nullable=False, default="end_user", index=True)
    phone = Column(String(20))
    employee_id = Column(String(50), unique=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), index=True)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True))
    password_reset_token = Column(String(255))
    password_reset_expires = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    department = relationship("Department", back_populates="users", foreign_keys=[department_id])
    location = relationship("Location", back_populates="users")
    assigned_assets = relationship("Asset", back_populates="assigned_user", foreign_keys="Asset.assigned_to")
    owned_assets = relationship("Asset", back_populates="owner", foreign_keys="Asset.owner_id")
    requests = relationship("Request", back_populates="requester", foreign_keys="Request.requester_id")


class AssetCategory(Base):
    __tablename__ = "asset_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    segment = Column(String(50), nullable=False)
    description = Column(Text)
    depreciation_rate = Column(Numeric(5, 2))
    useful_life_years = Column(Integer)
    parent_category_id = Column(Integer, ForeignKey("asset_categories.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    assets = relationship("Asset", back_populates="category")


class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_tag = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    category_id = Column(Integer, ForeignKey("asset_categories.id"), index=True)
    segment = Column(String(50), nullable=False, index=True)
    status = Column(String(50), default="available", index=True)
    condition = Column(String(50), default="good")
    
    # Assignment
    assigned_to = Column(Integer, ForeignKey("users.id"), index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), index=True)
    
    # Financial
    purchase_date = Column(Date)
    purchase_cost = Column(Numeric(15, 2))
    current_value = Column(Numeric(15, 2))
    currency = Column(String(3), default="INR")
    vendor = Column(String(100))
    invoice_number = Column(String(50))
    
    # Specifications (JSONB)
    specifications = Column(JSONB, default={})
    
    # Warranty & Maintenance
    warranty_start_date = Column(Date)
    warranty_end_date = Column(Date, index=True)
    warranty_provider = Column(String(100))
    last_maintenance_date = Column(Date)
    next_maintenance_date = Column(Date, index=True)
    maintenance_frequency_days = Column(Integer)
    
    # Compliance & Audit
    compliance_status = Column(Boolean, default=True)
    last_audit_date = Column(Date, index=True)
    next_audit_date = Column(Date)
    verification_status = Column(String(50))
    verified_at = Column(DateTime(timezone=True))
    verified_by = Column(Integer, ForeignKey("users.id"))
    
    # QR & Barcode
    qr_code_url = Column(Text)
    barcode_url = Column(Text)
    
    # Additional Info
    serial_number = Column(String(100))
    model_number = Column(String(100))
    manufacturer = Column(String(100))
    notes = Column(Text)
    
    # Soft Delete
    is_deleted = Column(Boolean, default=False, index=True)
    deleted_at = Column(DateTime(timezone=True))
    deleted_by = Column(Integer, ForeignKey("users.id"))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    category = relationship("AssetCategory", back_populates="assets")
    assigned_user = relationship("User", back_populates="assigned_assets", foreign_keys=[assigned_to])
    owner = relationship("User", back_populates="owned_assets", foreign_keys=[owner_id])
    location = relationship("Location", back_populates="assets")
    lifecycle_events = relationship("AssetLifecycleEvent", back_populates="asset")


class AssetLifecycleEvent(Base):
    __tablename__ = "asset_lifecycle_events"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    performed_by = Column(Integer, ForeignKey("users.id"))
    event_timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # State tracking
    previous_status = Column(String(50))
    new_status = Column(String(50))
    previous_assigned_to = Column(Integer, ForeignKey("users.id"))
    new_assigned_to = Column(Integer, ForeignKey("users.id"))
    previous_location_id = Column(Integer, ForeignKey("locations.id"))
    new_location_id = Column(Integer, ForeignKey("locations.id"))
    
    # Additional metadata
    event_metadata = Column(JSONB, default={})
    notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    asset = relationship("Asset", back_populates="lifecycle_events")


class Request(Base):
    __tablename__ = "requests"
    
    id = Column(Integer, primary_key=True, index=True)
    request_number = Column(String(50), unique=True, nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)
    status = Column(String(50), default="pending", index=True)
    urgency = Column(String(50), default="medium")
    
    # Requester Info
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True)
    
    # Asset Related
    asset_id = Column(Integer, ForeignKey("assets.id"), index=True)
    
    # Request Details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    reason = Column(Text)
    justification = Column(Text)
    
    # Financial
    estimated_cost = Column(Numeric(15, 2))
    approved_budget = Column(Numeric(15, 2))
    currency = Column(String(3), default="INR")
    
    # Dates
    requested_date = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    required_by_date = Column(Date)
    approved_date = Column(DateTime(timezone=True))
    rejected_date = Column(DateTime(timezone=True))
    completed_date = Column(DateTime(timezone=True))
    
    # Approvals
    approved_by = Column(Integer, ForeignKey("users.id"))
    rejected_by = Column(Integer, ForeignKey("users.id"))
    rejection_reason = Column(Text)
    
    # Assignment
    assigned_to = Column(Integer, ForeignKey("users.id"))
    
    # Additional metadata
    request_metadata = Column(JSONB, default={})
    attachments = Column(JSONB, default=[])
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    requester = relationship("User", back_populates="requests", foreign_keys=[requester_id])


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    
    # Related entities
    related_asset_id = Column(Integer, ForeignKey("assets.id"))
    related_request_id = Column(Integer, ForeignKey("requests.id"))
    
    # Link/Action
    action_url = Column(Text)
    
    # Status
    is_read = Column(Boolean, default=False, index=True)
    read_at = Column(DateTime(timezone=True))
    
    # Priority
    priority = Column(String(50), default="medium")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(Integer, nullable=False, index=True)
    action = Column(String(50), nullable=False)
    performed_by = Column(Integer, ForeignKey("users.id"), index=True)
    changes = Column(JSONB, default={})
    ip_address = Column(INET)
    user_agent = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
