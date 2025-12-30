"""
Seed initial data for the database
"""
from database import SessionLocal
from models import User, Department, Location, Asset, AssetCategory, AssetSegment, AssetStatus, AssetCondition
from routers.auth import get_password_hash
from datetime import date

def seed_data():
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == "admin@itsm.com").first()
        if existing_admin:
            print("✅ Admin user already exists")
        else:
            # Create admin user
            admin = User(
                email="admin@itsm.com",
                password_hash=get_password_hash("admin123"),
                first_name="System",
                last_name="Admin",
                role="system_admin",
                employee_id="EMP001",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("✅ Created admin user: admin@itsm.com / admin123")
        
        # Create departments
        if db.query(Department).count() == 0:
            departments = [
                Department(name="IT", code="IT", description="Information Technology"),
                Department(name="HR", code="HR", description="Human Resources"),
                Department(name="Finance", code="FIN", description="Finance Department"),
            ]
            db.add_all(departments)
            db.commit()
            print("✅ Created departments")
        
        # Create locations
        if db.query(Location).count() == 0:
            locations = [
                Location(name="Mumbai Office", code="MUM", city="Mumbai", state="Maharashtra", country="India"),
                Location(name="Delhi Office", code="DEL", city="Delhi", state="Delhi", country="India"),
                Location(name="Bangalore Office", code="BLR", city="Bangalore", state="Karnataka", country="India"),
            ]
            db.add_all(locations)
            db.commit()
            print("✅ Created locations")
        
        # Create asset categories
        if db.query(AssetCategory).count() == 0:
            categories = [
                AssetCategory(name="Laptops", segment=AssetSegment.IT, description="Laptop computers"),
                AssetCategory(name="Desktops", segment=AssetSegment.IT, description="Desktop computers"),
                AssetCategory(name="Monitors", segment=AssetSegment.IT, description="Display monitors"),
                AssetCategory(name="Furniture", segment=AssetSegment.NON_IT, description="Office furniture"),
            ]
            db.add_all(categories)
            db.commit()
            print("✅ Created asset categories")
        
        # Create sample assets
        if db.query(Asset).count() == 0:
            laptop_cat = db.query(AssetCategory).filter(AssetCategory.name == "Laptops").first()
            mumbai = db.query(Location).filter(Location.code == "MUM").first()
            delhi = db.query(Location).filter(Location.code == "DEL").first()
            
            assets = [
                Asset(
                    asset_tag="LAP-001",
                    name="Dell Latitude 5520",
                    segment=AssetSegment.IT,
                    category_id=laptop_cat.id if laptop_cat else None,
                    location_id=mumbai.id if mumbai else None,
                    status=AssetStatus.IN_USE,
                    condition=AssetCondition.GOOD,
                    purchase_date=date(2023, 5, 15),
                    purchase_cost=65000,
                    current_value=65000,
                    serial_number="SN-IT-001",
                    model_number="Latitude 5520",
                    manufacturer="Dell"
                ),
                Asset(
                    asset_tag="LAP-002",
                    name="HP EliteBook 840",
                    segment=AssetSegment.IT,
                    category_id=laptop_cat.id if laptop_cat else None,
                    location_id=delhi.id if delhi else None,
                    status=AssetStatus.AVAILABLE,
                    condition=AssetCondition.GOOD,
                    purchase_date=date(2023, 6, 20),
                    purchase_cost=72000,
                    current_value=72000,
                    serial_number="SN-IT-002",
                    model_number="EliteBook 840",
                    manufacturer="HP"
                ),
                Asset(
                    asset_tag="LAP-003",
                    name="MacBook Pro M1",
                    segment=AssetSegment.IT,
                    category_id=laptop_cat.id if laptop_cat else None,
                    location_id=mumbai.id if mumbai else None,
                    status=AssetStatus.IN_USE,
                    condition=AssetCondition.EXCELLENT,
                    purchase_date=date(2023, 7, 10),
                    purchase_cost=145000,
                    current_value=145000,
                    serial_number="SN-IT-003",
                    model_number="MacBook Pro 14",
                    manufacturer="Apple"
                ),
            ]
            db.add_all(assets)
            db.commit()
            print("✅ Created sample assets")
        
        print("\n✅ Database seeded successfully!")
        print("\nLogin credentials:")
        print("  Email: admin@itsm.com")
        print("  Password: admin123")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
