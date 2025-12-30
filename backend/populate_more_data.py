from database import SessionLocal
from models import Asset, Request, User, AssetCategory, AssetSegment, AssetStatus, AssetCondition, RequestStatus, RequestType, UrgencyLevel, Department, Location
from datetime import datetime, timedelta
import random

def populate_more():
    db = SessionLocal()
    try:
        print("🌱 Populating more data...")
        
        # Fetch dependencies
        admin = db.query(User).filter(User.email == "admin@itsm.com").first()
        laptop_cat = db.query(AssetCategory).filter(AssetCategory.name == "Laptops").first()
        categories = db.query(AssetCategory).all()
        locations = db.query(Location).all()
        departments = db.query(Department).all()
        
        if not admin:
            print("❌ Admin user not found. Run seed_data.py first.")
            return

        # 1. Create more Assets (20 items)
        statuses = [AssetStatus.AVAILABLE.value, AssetStatus.IN_USE.value, AssetStatus.IN_REPAIR.value, AssetStatus.MAINTENANCE.value]
        conditions = [AssetCondition.EXCELLENT.value, AssetCondition.GOOD.value, AssetCondition.FAIR.value]
        
        for i in range(20):
            cat = random.choice(categories)
            loc = random.choice(locations)
            
            asset = Asset(
                asset_tag=f"AST-{1000+i}",
                name=f"{cat.name} - {i}", 
                segment=cat.segment, 
                category_id=cat.id,
                location_id=loc.id,
                status=random.choice(statuses),
                condition=random.choice(conditions),
                purchase_date=datetime.now().date() - timedelta(days=random.randint(10, 700)),
                purchase_cost=random.randint(5000, 150000),
                current_value=random.randint(1000, 100000),
                serial_number=f"SN-{random.randint(10000, 99999)}",
                created_by=admin.id
            )
            db.add(asset)
        
        db.commit()
        print("✅ Added 20 assets")

        # 2. Create Requests (10 requests)
        # We need assets for requests? Some are for new assets.
        req_types = [RequestType.NEW_ASSET.value, RequestType.REPAIR.value, RequestType.UPGRADE.value]
        req_statuses = [RequestStatus.PENDING.value, RequestStatus.APPROVED.value, RequestStatus.REJECTED.value, RequestStatus.COMPLETED.value]
        
        for i in range(10):
            r_type = random.choice(req_types)
            status = random.choice(req_statuses)
            
            req = Request(
                request_number=f"REQ-{1000+i}",
                type=r_type,
                status=status,
                urgency=random.choice(list(UrgencyLevel)).value,
                title=f"{r_type} Request {i}",
                description=f"Auto generated request for {r_type}",
                requester_id=admin.id,
                department_id=admin.department_id,
                requested_date=datetime.now() - timedelta(days=random.randint(1, 30))
            )
            
            if status == RequestStatus.APPROVED.value:
                req.approved_by = admin.id
                req.approved_date = datetime.now()
            elif status == RequestStatus.REJECTED.value:
                req.rejected_by = admin.id
                req.rejected_date = datetime.now()
                req.rejection_reason = "Auto rejected"
                
            db.add(req)
            
        db.commit()
        print("✅ Added 10 requests")
        
        print("\n🎉 Population complete!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_more()
