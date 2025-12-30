# Database Setup Guide

## Prerequisites

- PostgreSQL 15 or higher installed
- Database user with CREATE DATABASE privileges

## Quick Setup

### Step 1: Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE asset_management;

# Exit psql
\q
```

### Step 2: Run Schema

```bash
# Execute the schema file
psql -U postgres -d asset_management -f schema.sql
```

**OR** using Windows PowerShell:

```powershell
# Navigate to database directory
cd "C:\Users\HP\OneDrive\Desktop\Asset management\asset-management\database"

# Run schema
psql -U postgres -d asset_management -f schema.sql
```

## Database Schema Overview

### Core Tables

#### **Users & Authentication**
- `users` - User accounts with roles (end_user, it_support, inventory_manager, asset_owner, system_admin)
- `permissions` - Granular permissions
- `role_permissions` - RBAC mapping

#### **Organization Structure**
- `departments` - Company departments
- `locations` - Physical locations/offices

#### **Asset Management**
- `assets` - Main asset inventory (IT & NON-IT)
- `asset_categories` - Asset categorization hierarchy
- `asset_lifecycle_events` - Complete lifecycle tracking
- `asset_documents` - Document attachments (invoices, warranties, manuals)

#### **IT & Segment Fields in Assets**
The `specifications` JSONB column stores IT-specific details:
```json
{
  "cpu": "Intel i7-12700",
  "ram": "16GB DDR4",
  "os": "Windows 11 Pro",
  "storage": "512GB NVMe SSD",
  "gpu": "Intel Iris Xe",
  "screen_size": "15.6 inch",
  "serial_number": "SN123456",
  "license_key": "XXXXX-XXXXX"
}
```

#### **Requests & Workflows**
- `requests` - All request types (new_asset, transfer, renewal, service, disposal, repair, upgrade)
- `workflows` - Approval routing and stages
- `workflow_history` - Complete workflow audit trail

#### **Procurement**
- `vendors` - Vendor master data
- `purchase_orders` - PO management
- `purchase_order_items` - Line items

#### **Compliance & Audit**
- `audit_logs` - System-wide audit trail with before/after states
- `compliance_checks` - Scheduled compliance validations
- `notifications` - User alerts (warranty expiry, maintenance due, etc.)

#### **File Processing**
- `file_uploads` - Smart upload tracking and processing status

#### **System Configuration**
- `system_settings` - Application settings
- `email_templates` - Notification templates

## Key Features

### 1. **Flexible Asset Specifications**
Uses JSONB for `specifications` field - supports any asset type without schema changes.

### 2. **Complete Audit Trail**
- `audit_logs` table tracks ALL CRUD operations
- `asset_lifecycle_events` tracks asset state changes
- `workflow_history` tracks approval processes

### 3. **Role-Based Access Control (RBAC)**
5 user roles with granular permissions:
- **End User** - View assigned assets, create requests
- **IT Support** - Process requests, assign assets
- **Inventory Manager** - Manage inventory, procurement
- **Asset Owner** - Verify and manage specific assets
- **System Admin** - Full access

### 4. **Multi-Stage Workflows**
Approval chains defined in `workflows.approval_chain` JSONB:
```json
[
  {"stage": "submitted", "approver_id": null, "status": "completed"},
  {"stage": "it_support_review", "approver_id": 5, "status": "pending"},
  {"stage": "manager_approval", "approver_id": 12, "status": "pending"}
]
```

### 5. **Automatic Timestamps**
All tables have `created_at` and `updated_at` with automatic triggers.

## Views

### Pre-built Views for Common Queries

- `v_asset_summary` - Assets with joined location, department, user details
- `v_request_summary` - Requests with workflow status and approvers

**Usage:**
```sql
SELECT * FROM v_asset_summary WHERE status = 'in_use';
```

## Indexes

Optimized for:
- Asset searches by tag, status, location, assigned user
- Request filtering by status, type, requester
- Audit log queries by entity and timestamp
- Notification lookups by user

## Sample Queries

### Get all assets assigned to a user
```sql
SELECT * FROM v_asset_summary 
WHERE assigned_to_name = 'John Doe';
```

### Get assets with warranty expiring in next 30 days
```sql
SELECT asset_tag, name, warranty_end_date 
FROM assets 
WHERE warranty_end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30
AND is_deleted = false;
```

### Get pending requests for IT Support
```sql
SELECT * FROM v_request_summary 
WHERE status = 'pending' 
AND type = 'service';
```

### Asset lifecycle history
```sql
SELECT 
    event_type,
    event_timestamp,
    CONCAT(u.first_name, ' ', u.last_name) as performed_by_name,
    notes
FROM asset_lifecycle_events ale
LEFT JOIN users u ON ale.performed_by = u.id
WHERE asset_id = 1
ORDER BY event_timestamp DESC;
```

### Audit trail for specific asset
```sql
SELECT 
    action,
    timestamp,
    CONCAT(u.first_name, ' ', u.last_name) as user_name,
    changes
FROM audit_logs al
LEFT JOIN users u ON al.performed_by = u.id
WHERE entity_type = 'asset' AND entity_id = 1
ORDER BY timestamp DESC;
```

## Environment Variables

Add these to your backend `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asset_management
DB_USER=postgres
DB_PASSWORD=your_password

DATABASE_URL=postgresql://postgres:your_password@localhost:5432/asset_management
```

## Next Steps

1. ✅ Run the schema
2. Create a backend API user (optional):
   ```sql
   CREATE USER asset_app_user WITH PASSWORD 'your_secure_password';
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO asset_app_user;
   GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO asset_app_user;
   ```

3. Verify installation:
   ```sql
   -- Check tables
   \dt
   
   -- Check views
   \dv
   
   -- Check enums
   \dT
   ```

4. Insert your first admin user (hash password with bcrypt first):
   ```sql
   INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
   VALUES ('admin@company.com', '$2b$12$...', 'Admin', 'User', 'system_admin', true);
   ```

## Backup & Restore

### Backup
```bash
pg_dump -U postgres asset_management > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
psql -U postgres -d asset_management < backup_20251226.sql
```

## Maintenance

### Analyze Tables (for query optimization)
```sql
ANALYZE;
```

### Reindex (if needed)
```sql
REINDEX DATABASE asset_management;
```

## Troubleshooting

### Issue: Permission denied
**Solution:** Ensure your PostgreSQL user has sufficient privileges.

### Issue: Extension not found
**Solution:** Install extensions as superuser:
```sql
-- As postgres superuser
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Issue: Triggers not firing
**Solution:** Verify triggers are enabled:
```sql
SELECT * FROM pg_trigger WHERE tgname LIKE '%updated_at%';
```

## Support

For issues or questions, refer to the main project documentation or PostgreSQL documentation at https://www.postgresql.org/docs/
