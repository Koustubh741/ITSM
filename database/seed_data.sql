-- ============================================
-- Initial Admin User Setup
-- ============================================
-- Run this in pgAdmin Query Tool after creating the database schema

-- Create initial admin user
-- Email: admin@company.com
-- Password: admin123 (CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN!)

INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, employee_id)
VALUES (
    'admin@company.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaOYKGO',
    'System',
    'Administrator',
    'system_admin',
    true,
    'EMP001'
);

-- Verify user was created
SELECT id, email, first_name, last_name, role, is_active 
FROM users 
WHERE email = 'admin@company.com';

-- ============================================
-- Sample Master Data (Optional)
-- ============================================

-- Sample Departments
INSERT INTO departments (name, code, description, active) VALUES
('Information Technology', 'IT', 'IT Department - Manages technology infrastructure', true),
('Human Resources', 'HR', 'HR Department - Employee management', true),
('Finance', 'FIN', 'Finance Department - Financial operations', true),
('Operations', 'OPS', 'Operations Department', true),
('Marketing', 'MKT', 'Marketing Department', true);

-- Sample Locations
INSERT INTO locations (name, code, city, state, country, active) VALUES
('Mumbai Office', 'MUM', 'Mumbai', 'Maharashtra', 'India', true),
('Delhi Office', 'DEL', 'Delhi', 'Delhi', 'India', true),
('Bangalore Office', 'BLR', 'Bangalore', 'Karnataka', 'India', true),
('Pune Office', 'PUN', 'Pune', 'Maharashtra', 'India', true),
('Hyderabad Office', 'HYD', 'Hyderabad', 'Telangana', 'India', true);

-- Sample Asset Categories (already seeded in schema.sql, but here for reference)
-- INSERT INTO asset_categories (name, segment, description, depreciation_rate, useful_life_years) VALUES
-- ('Laptops', 'IT', 'Laptop computers', 20.00, 5),
-- ('Desktops', 'IT', 'Desktop computers', 20.00, 5),
-- ('Servers', 'IT', 'Server hardware', 15.00, 7),
-- ('Network Equipment', 'IT', 'Routers, switches, firewalls', 15.00, 7),
-- ('Furniture', 'NON_IT', 'Office furniture', 10.00, 10),
-- ('Vehicles', 'NON_IT', 'Company vehicles', 15.00, 7);

-- ============================================
-- Sample Test Users (Optional - for testing different roles)
-- ============================================

-- End User (Password: user123)
INSERT INTO users (email, password_hash, first_name, last_name, role, employee_id, department_id, location_id, is_active)
VALUES (
    'user@company.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaOYKGO',
    'John',
    'Doe',
    'end_user',
    'EMP002',
    1,  -- IT Department
    1,  -- Mumbai Office
    true
);

-- IT Support (Password: support123)
INSERT INTO users (email, password_hash, first_name, last_name, role, employee_id, department_id, location_id, is_active)
VALUES (
    'support@company.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaOYKGO',
    'Sarah',
    'Smith',
    'it_support',
    'EMP003',
    1,  -- IT Department
    1,  -- Mumbai Office
    true
);

-- Inventory Manager (Password: inventory123)
INSERT INTO users (email, password_hash, first_name, last_name, role, employee_id, department_id, location_id, is_active)
VALUES (
    'inventory@company.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaOYKGO',
    'Mike',
    'Johnson',
    'inventory_manager',
    'EMP004',
    1,  -- IT Department
    1,  -- Mumbai Office
    true
);

-- Asset Owner (Password: owner123)
INSERT INTO users (email, password_hash, first_name, last_name, role, employee_id, department_id, location_id, is_active)
VALUES (
    'owner@company.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaOYKGO',
    'Emily',
    'Brown',
    'asset_owner',
    'EMP005',
    1,  -- IT Department
    2,  -- Delhi Office
    true
);

-- ============================================
-- Sample Assets (Optional - for testing)
-- ============================================

-- IT Assets
INSERT INTO assets (
    asset_tag, name, category_id, segment, status, condition,
    location_id, department_id,
    purchase_date, purchase_cost, current_value, currency,
    specifications, serial_number, manufacturer, model_number,
    warranty_start_date, warranty_end_date,
    created_by
) VALUES
(
    'LAP-001',
    'Dell Latitude 5420',
    1,  -- Laptops category
    'IT',
    'available',
    'excellent',
    1,  -- Mumbai Office
    1,  -- IT Department
    '2024-01-15',
    75000.00,
    75000.00,
    'INR',
    '{"cpu": "Intel Core i7-1185G7", "ram": "16GB DDR4", "storage": "512GB NVMe SSD", "os": "Windows 11 Pro", "screen": "14 inch FHD"}',
    'SN-LAP001-DEL-2024',
    'Dell',
    'Latitude 5420',
    '2024-01-15',
    '2027-01-15',
    1  -- Created by admin
),
(
    'LAP-002',
    'HP EliteBook 840 G8',
    1,  -- Laptops category
    'IT',
    'in_use',
    'good',
    1,  -- Mumbai Office
    1,  -- IT Department
    '2024-02-20',
    82000.00,
    82000.00,
    'INR',
    '{"cpu": "Intel Core i7-1165G7", "ram": "16GB DDR4", "storage": "1TB NVMe SSD", "os": "Windows 11 Pro", "screen": "14 inch FHD"}',
    'SN-LAP002-HP-2024',
    'HP',
    'EliteBook 840 G8',
    '2024-02-20',
    '2027-02-20',
    1
),
(
    'DSK-001',
    'Dell OptiPlex 7090',
    2,  -- Desktops category
    'IT',
    'in_use',
    'good',
    2,  -- Delhi Office
    1,  -- IT Department
    '2023-11-10',
    55000.00,
    55000.00,
    'INR',
    '{"cpu": "Intel Core i5-11500", "ram": "16GB DDR4", "storage": "512GB SSD", "os": "Windows 11 Pro"}',
    'SN-DSK001-DEL-2023',
    'Dell',
    'OptiPlex 7090',
    '2023-11-10',
    '2026-11-10',
    1
);

-- NON-IT Assets
INSERT INTO assets (
    asset_tag, name, category_id, segment, status, condition,
    location_id, department_id,
    purchase_date, purchase_cost, current_value, currency,
    notes,
    created_by
) VALUES
(
    'FURN-001',
    'Executive Office Desk',
    9,  -- Furniture category
    'NON_IT',
    'in_use',
    'excellent',
    1,  -- Mumbai Office
    2,  -- HR Department
    '2023-06-15',
    25000.00,
    22500.00,
    'INR',
    'Large executive desk with drawer storage',
    1
),
(
    'FURN-002',
    'Ergonomic Office Chair',
    9,  -- Furniture category
    'NON_IT',
    'in_use',
    'good',
    1,  -- Mumbai Office
    2,  -- HR Department
    '2023-06-15',
    15000.00,
    13500.00,
    'INR',
    'Height adjustable with lumbar support',
    1
);

-- Assign some assets to users
UPDATE assets SET assigned_to = 2 WHERE asset_tag = 'LAP-002';  -- Assign to John Doe
UPDATE assets SET assigned_to = 3 WHERE asset_tag = 'DSK-001';  -- Assign to Sarah Smith

-- ============================================
-- Verify Sample Data
-- ============================================

-- Check users
SELECT COUNT(*) as user_count FROM users;

-- Check departments
SELECT COUNT(*) as department_count FROM departments;

-- Check locations
SELECT COUNT(*) as location_count FROM locations;

-- Check assets
SELECT COUNT(*) as asset_count FROM assets WHERE is_deleted = false;

-- Check asset distribution
SELECT segment, COUNT(*) as count 
FROM assets 
WHERE is_deleted = false 
GROUP BY segment;

-- ============================================
-- Setup Complete!
-- ============================================
-- You can now login with:
-- Email: admin@company.com
-- Password: admin123
-- 
-- Or test other roles:
-- - user@company.com (end_user)
-- - support@company.com (it_support)
-- - inventory@company.com (inventory_manager)
-- - owner@company.com (asset_owner)
-- All passwords are the same as their role name + "123"
-- 
-- IMPORTANT: Change all passwords after first login!
