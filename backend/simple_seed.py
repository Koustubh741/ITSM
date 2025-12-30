"""
Simple seed script - directly add sample data
"""
from database import SessionLocal, engine
from models import User, Department, Location, Asset, AssetCategory, AssetSegment, AssetStatus, AssetCondition, UserRole
from passlib.context import CryptContext
from datetime import date
import sys

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed():
    db = SessionLocal()
    try:
        print("Starting database seed...")
        
        # 1. Create admin user
        existing_user = db.query(User).filter(User.email == "admin@itsm.com").first()
        if not existing_user:
            admin = User(
                email="admin@itsm.com",
                password_hash=pwd_context.hash("admin123"),
                first_name="System",
                last_name="Admin",
                role=UserRole.SYSTEM_ADMIN,
                employee_id="EMP001",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("Created admin user")
        else:
            print("Admin user already exists")
        
        # 2. Create departments
        if db.query(Department).count() == 0:
            depts = [
                Department(name="IT", code="IT", description="Information Technology"),
                Department(name="HR", code="HR", description="Human Resources"),
                Department(name="Finance", code="FIN", description="Finance"),
            ]
            db.add_all(depts)
            db.commit()
            print("Created departments")
        else:
            print("Departments already exist")
        
        # 3. Create locations  
        if db.query(Location).count() == 0:
            locs = [
                Location(name="Mumbai Office", code="MUM", city="Mumbai", state="Maharashtra", country="India"),
                Location(name="Delhi Office", code="DEL", city="Delhi", state="Delhi", country="India"),
                Location(name="Bangalore Office", code="BLR", city="Bangalore", state="Karnataka", country="India"),
            ]
            db.add_all(locs)
            db.commit()
            print("Created locations")
        else:
            print("Locations already exist")
        
        # 4. Create asset categories
        if db.query(AssetCategory).count() == 0:
            cats = [
                AssetCategory(name="Laptops", segment=AssetSegment.IT, description="Laptop computers"),
                AssetCategory(name="Desktops", segment=AssetSegment.IT, description="Desktop computers"),
                AssetCategory(name="Monitors", segment=AssetSegment.IT, description="Display monitors"),
                AssetCategory(name="Furniture", segment=AssetSegment.NON_IT, description="Office furniture"),
            ]
            db.add_all(cats)
            db.commit()
            print("Created asset categories")
        else:
            print("Asset categories already exist")
        
        # 5. Create assets
        asset_count = db.query(Asset).count()
        if asset_count == 0:
            laptop_cat = db.query(AssetCategory).filter(AssetCategory.name == "Laptops").first()
            mumbai = db.query(Location).filter(Location.code == "MUM").first()
            delhi = db.query(Location).filter(Location.code == "DEL").first()
            bangalore = db.query(Location).filter(Location.code == "BLR").first()
            
            assets = [
                Asset(
                    asset_tag="LAP-001",
                    name="Dell Latitude 5520",
                    segment=AssetSegment.IT,
                    category_id=laptop_cat.id if laptop_cat else None,
                    location_id=mumbai.id if mumbai else None,
                    status=AssetStatus.IN_USE,
                    condition=AssetCondition. GOOD,
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
                    location_id=bangalore.id if bangalore else None,
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
            print(f"Created {len(assets)} assets")
        else:
            print(f"Assets already exist ({asset_count} found)")
        
        print("\n=== Seed Complete ===")
        print(f"Users: {db.query(User).count()}")
        print(f"Departments: {db.query(Department).count()}")
        print(f"Locations: {db.query(Location).count()}")
        print(f"Asset Categories: {db.query(AssetCategory).count()}")
        print(f"Assets: {db.query(Asset).count()}")
        print("\nLogin with:")
        print("  Email: admin@itsm.com")
        print("  Password: admin123")
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed()
