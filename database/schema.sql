-- ============================================
-- Asset Management & ITSM Platform - Database Schema
-- PostgreSQL 15+
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM (
    'end_user',
    'it_support',
    'inventory_manager',
    'asset_owner',
    'system_admin'
);

CREATE TYPE asset_status AS ENUM (
    'available',
    'in_use',
    'in_repair',
    'maintenance',
    'retired',
    'disposed'
);

CREATE TYPE asset_segment AS ENUM (
    'IT',
    'NON_IT'
);

CREATE TYPE asset_condition AS ENUM (
    'excellent',
    'good',
    'fair',
    'poor',
    'needs_repair'
);

CREATE TYPE request_type AS ENUM (
    'new_asset',
    'transfer',
    'renewal',
    'service',
    'disposal',
    'repair',
    'upgrade'
);

CREATE TYPE request_status AS ENUM (
    'pending',
    'under_review',
    'approved',
    'rejected',
    'in_progress',
    'completed',
    'cancelled'
);

CREATE TYPE urgency_level AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

CREATE TYPE workflow_stage AS ENUM (
    'submitted',
    'it_support_review',
    'inventory_review',
    'manager_approval',
    'finance_approval',
    'procurement',
    'completed',
    'rejected'
);

CREATE TYPE notification_type AS ENUM (
    'request_submitted',
    'request_approved',
    'request_rejected',
    'asset_assigned',
    'warranty_expiry',
    'maintenance_due',
    'compliance_alert',
    'system_notification'
);

CREATE TYPE audit_action AS ENUM (
    'created',
    'updated',
    'deleted',
    'assigned',
    'unassigned',
    'approved',
    'rejected',
    'status_changed',
    'transferred',
    'verified'
);

-- ============================================
-- CORE TABLES
-- ============================================

-- Departments
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) UNIQUE,
    description TEXT,
    manager_id INTEGER,
    budget DECIMAL(15, 2),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'India',
    postal_code VARCHAR(10),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role user_role NOT NULL DEFAULT 'end_user',
    phone VARCHAR(20),
    employee_id VARCHAR(50) UNIQUE,
    department_id INTEGER REFERENCES departments(id),
    location_id INTEGER REFERENCES locations(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key for department manager
ALTER TABLE departments 
ADD CONSTRAINT fk_department_manager 
FOREIGN KEY (manager_id) REFERENCES users(id);

-- Permissions (for granular RBAC)
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    module VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions (many-to-many)
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role user_role NOT NULL,
    permission_id INTEGER REFERENCES permissions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, permission_id)
);

-- ============================================
-- ASSET MANAGEMENT
-- ============================================

-- Asset Categories
CREATE TABLE asset_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    segment asset_segment NOT NULL,
    description TEXT,
    depreciation_rate DECIMAL(5, 2),
    useful_life_years INTEGER,
    parent_category_id INTEGER REFERENCES asset_categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    asset_tag VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    category_id INTEGER REFERENCES asset_categories(id),
    segment asset_segment NOT NULL,
    status asset_status DEFAULT 'available',
    condition asset_condition DEFAULT 'good',
    
    -- Assignment
    assigned_to INTEGER REFERENCES users(id),
    owner_id INTEGER REFERENCES users(id),
    department_id INTEGER REFERENCES departments(id),
    location_id INTEGER REFERENCES locations(id),
    
    -- Financial
    purchase_date DATE,
    purchase_cost DECIMAL(15, 2),
    current_value DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'INR',
    vendor VARCHAR(100),
    invoice_number VARCHAR(50),
    
    -- Specifications (flexible JSONB for IT assets)
    specifications JSONB DEFAULT '{}',
    -- Example: {"cpu": "Intel i7", "ram": "16GB", "os": "Windows 11", "storage": "512GB SSD"}
    
    -- Warranty & Maintenance
    warranty_start_date DATE,
    warranty_end_date DATE,
    warranty_provider VARCHAR(100),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_frequency_days INTEGER,
    
    -- Compliance & Audit
    compliance_status BOOLEAN DEFAULT true,
    last_audit_date DATE,
    next_audit_date DATE,
    verification_status VARCHAR(50),
    verified_at TIMESTAMP,
    verified_by INTEGER REFERENCES users(id),
    
    -- QR & Barcode
    qr_code_url TEXT,
    barcode_url TEXT,
    
    -- Additional Info
    serial_number VARCHAR(100),
    model_number VARCHAR(100),
    manufacturer VARCHAR(100),
    notes TEXT,
    
    -- Soft Delete
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    deleted_by INTEGER REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Asset Lifecycle Events
CREATE TABLE asset_lifecycle_events (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    -- Values: provisioned, assigned, transferred, returned, maintenance_started, maintenance_completed, 
    -- repaired, upgraded, retired, disposed, verified, warranty_renewed
    
    performed_by INTEGER REFERENCES users(id),
    event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- State tracking
    previous_status asset_status,
    new_status asset_status,
    previous_assigned_to INTEGER REFERENCES users(id),
    new_assigned_to INTEGER REFERENCES users(id),
    previous_location_id INTEGER REFERENCES locations(id),
    new_location_id INTEGER REFERENCES locations(id),
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Documents
CREATE TABLE asset_documents (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    -- Values: invoice, warranty_card, user_manual, service_report, certificate, other
    
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REQUESTS & WORKFLOWS
-- ============================================

-- Requests
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    request_number VARCHAR(50) NOT NULL UNIQUE,
    type request_type NOT NULL,
    status request_status DEFAULT 'pending',
    urgency urgency_level DEFAULT 'medium',
    
    -- Requester Info
    requester_id INTEGER NOT NULL REFERENCES users(id),
    department_id INTEGER REFERENCES departments(id),
    
    -- Asset Related (if applicable)
    asset_id INTEGER REFERENCES assets(id),
    
    -- Request Details
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    reason TEXT,
    justification TEXT,
    
    -- Financial
    estimated_cost DECIMAL(15, 2),
    approved_budget DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Dates
    requested_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    required_by_date DATE,
    approved_date TIMESTAMP,
    rejected_date TIMESTAMP,
    completed_date TIMESTAMP,
    
    -- Approvals
    approved_by INTEGER REFERENCES users(id),
    rejected_by INTEGER REFERENCES users(id),
    rejection_reason TEXT,
    
    -- Assignment (for processing)
    assigned_to INTEGER REFERENCES users(id),
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Stages (for approval routing)
CREATE TABLE workflows (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    current_stage workflow_stage DEFAULT 'submitted',
    
    -- Approval chain (array of user IDs in order)
    approval_chain JSONB DEFAULT '[]',
    -- Example: [{"stage": "it_support_review", "approver_id": 5, "status": "pending"}, ...]
    
    current_approver_id INTEGER REFERENCES users(id),
    
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow History
CREATE TABLE workflow_history (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    request_id INTEGER NOT NULL REFERENCES requests(id),
    
    stage workflow_stage NOT NULL,
    actor_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    -- Values: submitted, approved, rejected, forwarded, returned, completed
    
    comments TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PROCUREMENT
-- ============================================

-- Vendors
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50),
    postal_code VARCHAR(10),
    
    -- Ratings & Performance
    rating DECIMAL(3, 2),
    total_orders INTEGER DEFAULT 0,
    
    -- Banking
    bank_account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    pan_number VARCHAR(20),
    gst_number VARCHAR(20),
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Orders
CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id),
    request_id INTEGER REFERENCES requests(id),
    
    -- Financial
    total_amount DECIMAL(15, 2) NOT NULL,
    tax_amount DECIMAL(15, 2),
    discount_amount DECIMAL(15, 2),
    final_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft',
    -- Values: draft, sent, acknowledged, in_transit, delivered, cancelled
    
    -- Dates
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- People
    created_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    
    -- Additional
    terms_and_conditions TEXT,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Order Items
CREATE TABLE purchase_order_items (
    id SERIAL PRIMARY KEY,
    po_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    
    item_name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES asset_categories(id),
    
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2),
    discount_rate DECIMAL(5, 2),
    total_price DECIMAL(15, 2) NOT NULL,
    
    specifications JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entities
    related_asset_id INTEGER REFERENCES assets(id),
    related_request_id INTEGER REFERENCES requests(id),
    
    -- Link/Action
    action_url TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    -- Priority
    priority urgency_level DEFAULT 'medium',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AUDIT & COMPLIANCE
-- ============================================

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    
    -- Entity info
    entity_type VARCHAR(50) NOT NULL,
    -- Values: asset, request, user, workflow, purchase_order, etc.
    entity_id INTEGER NOT NULL,
    
    -- Action
    action audit_action NOT NULL,
    
    -- Actor
    performed_by INTEGER REFERENCES users(id),
    
    -- Changes (before/after state)
    changes JSONB DEFAULT '{}',
    -- Example: {"field": "status", "old_value": "available", "new_value": "in_use"}
    
    -- Request metadata
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(performed_by);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Compliance Checks
CREATE TABLE compliance_checks (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    
    check_type VARCHAR(50) NOT NULL,
    -- Values: warranty_expiry, maintenance_due, audit_due, license_expiry, certification_due
    
    status VARCHAR(50) DEFAULT 'pending',
    -- Values: pending, passed, failed, waived
    
    scheduled_date DATE,
    performed_date DATE,
    performed_by INTEGER REFERENCES users(id),
    
    findings TEXT,
    remediation_actions TEXT,
    
    next_check_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FILE UPLOADS & PROCESSING
-- ============================================

CREATE TABLE file_uploads (
    id SERIAL PRIMARY KEY,
    
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Processing
    upload_type VARCHAR(50),
    -- Values: smart_upload, bulk_import, asset_document, invoice, other
    
    processing_status VARCHAR(50) DEFAULT 'pending',
    -- Values: pending, processing, completed, failed
    
    extracted_data JSONB DEFAULT '{}',
    processing_errors JSONB DEFAULT '[]',
    
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    
    -- Associated records created
    created_assets INTEGER[],
    created_requests INTEGER[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SYSTEM CONFIGURATION
-- ============================================

CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    data_type VARCHAR(20) DEFAULT 'string',
    -- Values: string, number, boolean, json
    
    category VARCHAR(50),
    description TEXT,
    
    is_editable BOOLEAN DEFAULT true,
    updated_by INTEGER REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Templates
CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    template_type notification_type,
    
    variables JSONB DEFAULT '[]',
    -- Example: ["user_name", "asset_name", "request_number"]
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_location ON users(location_id);

-- Assets
CREATE INDEX idx_assets_tag ON assets(asset_tag);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_segment ON assets(segment);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_assigned_to ON assets(assigned_to);
CREATE INDEX idx_assets_owner ON assets(owner_id);
CREATE INDEX idx_assets_location ON assets(location_id);
CREATE INDEX idx_assets_department ON assets(department_id);
CREATE INDEX idx_assets_warranty_end ON assets(warranty_end_date);
CREATE INDEX idx_assets_next_maintenance ON assets(next_maintenance_date);
CREATE INDEX idx_assets_created_at ON assets(created_at);
CREATE INDEX idx_assets_deleted ON assets(is_deleted);

-- Asset Lifecycle
CREATE INDEX idx_lifecycle_asset ON asset_lifecycle_events(asset_id);
CREATE INDEX idx_lifecycle_event_type ON asset_lifecycle_events(event_type);
CREATE INDEX idx_lifecycle_timestamp ON asset_lifecycle_events(event_timestamp);

-- Requests
CREATE INDEX idx_requests_number ON requests(request_number);
CREATE INDEX idx_requests_type ON requests(type);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_requester ON requests(requester_id);
CREATE INDEX idx_requests_asset ON requests(asset_id);
CREATE INDEX idx_requests_department ON requests(department_id);
CREATE INDEX idx_requests_created_at ON requests(created_at);

-- Workflows
CREATE INDEX idx_workflows_request ON workflows(request_id);
CREATE INDEX idx_workflows_stage ON workflows(current_stage);
CREATE INDEX idx_workflows_approver ON workflows(current_approver_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Purchase Orders
CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_po_status ON purchase_orders(status);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_categories_updated_at BEFORE UPDATE ON asset_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_checks_updated_at BEFORE UPDATE ON compliance_checks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Optional - Common Permissions)
-- ============================================

INSERT INTO permissions (name, description, module) VALUES
('view_all_assets', 'View all assets across organization', 'assets'),
('create_asset', 'Create new assets', 'assets'),
('edit_asset', 'Edit asset details', 'assets'),
('delete_asset', 'Delete assets', 'assets'),
('assign_asset', 'Assign assets to users', 'assets'),
('view_own_assets', 'View only assigned assets', 'assets'),

('create_request', 'Create new requests', 'requests'),
('approve_request', 'Approve requests', 'requests'),
('reject_request', 'Reject requests', 'requests'),
('view_all_requests', 'View all requests', 'requests'),
('view_own_requests', 'View only own requests', 'requests'),

('manage_users', 'Manage users', 'users'),
('view_users', 'View users', 'users'),

('manage_procurement', 'Manage procurement', 'procurement'),
('view_procurement', 'View procurement', 'procurement'),

('view_reports', 'View reports and analytics', 'reports'),
('export_data', 'Export data', 'reports'),

('manage_workflows', 'Manage workflows', 'workflows'),
('view_audit_logs', 'View audit logs', 'audit'),

('system_admin', 'Full system administration', 'system');

-- Sample Asset Categories
INSERT INTO asset_categories (name, segment, description, depreciation_rate, useful_life_years) VALUES
('Laptops', 'IT', 'Laptop computers', 20.00, 5),
('Desktops', 'IT', 'Desktop computers', 20.00, 5),
('Servers', 'IT', 'Server hardware', 15.00, 7),
('Network Equipment', 'IT', 'Routers, switches, firewalls', 15.00, 7),
('Printers', 'IT', 'Printers and scanners', 20.00, 5),
('Mobile Devices', 'IT', 'Smartphones and tablets', 33.33, 3),
('Monitors', 'IT', 'Display monitors', 20.00, 5),
('Software Licenses', 'IT', 'Software and licenses', 0.00, null),

('Furniture', 'NON_IT', 'Office furniture', 10.00, 10),
('Vehicles', 'NON_IT', 'Company vehicles', 15.00, 7),
('Office Equipment', 'NON_IT', 'General office equipment', 10.00, 10),
('Building Infrastructure', 'NON_IT', 'Building and infrastructure', 5.00, 20);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Asset Summary View
CREATE VIEW v_asset_summary AS
SELECT 
    a.id,
    a.asset_tag,
    a.name,
    a.status,
    a.segment,
    ac.name as category_name,
    l.name as location_name,
    d.name as department_name,
    CONCAT(u.first_name, ' ', u.last_name) as assigned_to_name,
    CONCAT(o.first_name, ' ', o.last_name) as owner_name,
    a.purchase_cost,
    a.current_value,
    a.warranty_end_date,
    a.next_maintenance_date,
    a.last_audit_date,
    a.created_at
FROM assets a
LEFT JOIN asset_categories ac ON a.category_id = ac.id
LEFT JOIN locations l ON a.location_id = l.id
LEFT JOIN departments d ON a.department_id = d.id
LEFT JOIN users u ON a.assigned_to = u.id
LEFT JOIN users o ON a.owner_id = o.id
WHERE a.is_deleted = false;

-- Request Summary View
CREATE VIEW v_request_summary AS
SELECT 
    r.id,
    r.request_number,
    r.type,
    r.status,
    r.urgency,
    r.title,
    CONCAT(u.first_name, ' ', u.last_name) as requester_name,
    d.name as department_name,
    a.asset_tag,
    r.estimated_cost,
    r.requested_date,
    w.current_stage,
    CONCAT(approver.first_name, ' ', approver.last_name) as current_approver_name
FROM requests r
INNER JOIN users u ON r.requester_id = u.id
LEFT JOIN departments d ON r.department_id = d.id
LEFT JOIN assets a ON r.asset_id = a.id
LEFT JOIN workflows w ON r.id = w.request_id
LEFT JOIN users approver ON w.current_approver_id = approver.id;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE assets IS 'Core asset inventory table';
COMMENT ON TABLE asset_lifecycle_events IS 'Tracks all state changes and events in asset lifecycle';
COMMENT ON TABLE requests IS 'All types of requests (new asset, renewal, service, etc.)';
COMMENT ON TABLE workflows IS 'Workflow and approval routing for requests';
COMMENT ON TABLE audit_logs IS 'Complete audit trail of all system actions';
COMMENT ON TABLE notifications IS 'User notifications and alerts';

-- ============================================
-- GRANTS (Adjust based on your DB users)
-- ============================================

-- Example: Grant permissions to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO asset_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO asset_app_user;
