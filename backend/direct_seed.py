import psycopg2

# Direct database connection
conn = psycopg2.connect(
    host="127.0.0.1",
    database="ITSM",
    user="postgres",
    password="Prakhyat@15"
)

cur = conn.cursor()

try:
    # Create admin user
    cur.execute("""
        INSERT INTO users (email, password_hash, first_name, last_name, role, employee_id, is_active, created_at)
        VALUES ('admin@itsm.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaOYKGO', 'System', 'Admin', 'system_admin', 'EMP001', true, NOW())
        ON CONFLICT (email) DO NOTHING
    """)
    
    # Create departments
    cur.execute("""
        INSERT INTO departments (name, code, description, created_at)
        VALUES 
            ('IT', 'IT', 'Information Technology', NOW()),
            ('HR', 'HR', 'Human Resources', NOW()),
            ('Finance', 'FIN', 'Finance Department', NOW())
        ON CONFLICT (code) DO NOTHING
    """)
    
    # Create locations
    cur.execute("""
        INSERT INTO locations (name, code, city, state, country, created_at)
        VALUES 
            ('Mumbai Office', 'MUM', 'Mumbai', 'Maharashtra', 'India', NOW()),
            ('Delhi Office', 'DEL', 'Delhi', 'Delhi', 'India', NOW()),
            ('Bangalore Office', 'BLR', 'Bangalore', 'Karnataka', 'India', NOW())
        ON CONFLICT (code) DO NOTHING
    """)
    
    # Create asset categories
    cur.execute("""
        INSERT INTO asset_categories (name, segment, description, created_at)
        VALUES 
            ('Laptops', 'IT', 'Laptop computers', NOW()),
            ('Desktops', 'IT', 'Desktop computers', NOW()),
            ('Monitors', 'IT', 'Display monitors', NOW()),
            ('Furniture', 'NON_IT', 'Office furniture', NOW())
        ON CONFLICT (name) DO NOTHING
    """)
    
    # Create sample assets
    cur.execute("""
        INSERT INTO assets (asset_tag, name, segment, category_id, location_id, status, condition, purchase_date, purchase_cost, current_value, serial_number, model_number,manufacturer, created_at)
        SELECT 
            'LAP-001',
            'Dell Latitude 5520',
            'IT',
            (SELECT id FROM asset_categories WHERE name = 'Laptops'),
            (SELECT id FROM locations WHERE code = 'MUM'),
            'in_use',
            'good',
            '2023-05-15',
            65000,
            65000,
            'SN-IT-001',
            'Latitude 5520',
            'Dell',
            NOW()
        WHERE NOT EXISTS (SELECT 1 FROM assets WHERE asset_tag = 'LAP-001')
    """)
    
    cur.execute("""
        INSERT INTO assets (asset_tag, name, segment, category_id, location_id, status, condition, purchase_date, purchase_cost, current_value, serial_number, model_number, manufacturer, created_at)
        SELECT 
            'LAP-002',
            'HP EliteBook 840',
            'IT',
            (SELECT id FROM asset_categories WHERE name = 'Laptops'),
            (SELECT id FROM locations WHERE code = 'DEL'),
            'available',
            'good',
            '2023-06-20',
            72000,
            72000,
            'SN-IT-002',
            'EliteBook 840',
            'HP',
            NOW()
        WHERE NOT EXISTS (SELECT 1 FROM assets WHERE asset_tag = 'LAP-002')
    """)
    
    cur.execute("""
        INSERT INTO assets (asset_tag, name, segment, category_id, location_id, status, condition, purchase_date, purchase_cost, current_value, serial_number, model_number, manufacturer, created_at)
        SELECT 
            'LAP-003',
            'MacBook Pro M1',
            'IT',
            (SELECT id FROM asset_categories WHERE name = 'Laptops'),
            (SELECT id FROM locations WHERE code = 'BLR'),
            'in_use',
            'excellent',
            '2023-07-10',
            145000,
            145000,
            'SN-IT-003',
            'MacBook Pro 14',
            'Apple',
            NOW()
        WHERE NOT EXISTS (SELECT 1 FROM assets WHERE asset_tag = 'LAP-003')
    """)
    
    conn.commit()
    
    # Verify
    cur.execute("SELECT COUNT(*) FROM users")
    print(f"Users: {cur.fetchone()[0]}")
    
    cur.execute("SELECT COUNT(*) FROM departments")
    print(f"Departments: {cur.fetchone()[0]}")
    
    cur.execute("SELECT COUNT(*) FROM locations")
    print(f"Locations: {cur.fetchone()[0]}")
    
    
    cur.execute("SELECT COUNT(*) FROM asset_categories")
    print(f"Asset Categories: {cur.fetchone()[0]}")
    
    cur.execute("SELECT COUNT(*) FROM assets")
    print(f"Assets: {cur.fetchone()[0]}")
    
    print("\nData seeded successfully!")
    print("\nLogin with:")
    print("  Email: admin@itsm.com")
    print("  Password: admin123")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
finally:
    cur.close()
    conn.close()
