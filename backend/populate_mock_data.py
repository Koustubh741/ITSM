"""
Populate the asset.assets table with mock data for testing
"""
from database import SessionLocal
import models
from datetime import datetime, timedelta
import random

def populate_mock_assets():
    db = SessionLocal()
    
    # Clear existing assets first
    try:
        db.query(models.Asset).delete()
        db.commit()
        print("✅ Cleared existing assets")
    except Exception as e:
        print(f"Note: {e}")
        db.rollback()
    
    # Mock data templates
    categories = ["IT", "IT", "IT", "Non-IT", "Non-IT"]
    it_types = ["Laptop", "Desktop", "Server", "Monitor", "Printer", "Router", "Tablet"]
    non_it_types = ["Chair", "Desk", "Cabinet", "Projector", "Whiteboard"]
    statuses = ["Active", "Active", "Active", "In Stock", "In Repair", "Maintenance", "Retired"]
    locations = ["Mumbai Office", "Delhi Office", "Bangalore Office", "Pune Office", "Hyderabad Office", "Warehouse"]
    vendors = ["Dell", "HP", "Lenovo", "Apple", "Samsung", "Cisco", "Wipro Furniture", "Godrej"]
    
    mock_assets = []
    
    for i in range(1, 51):  # Create 50 assets
        category = random.choice(categories)
        if category == "IT":
            asset_type = random.choice(it_types)
            models_list = ["HP EliteBook", "Dell Latitude", "ThinkPad X1", "MacBook Pro", "OptiPlex", "PowerEdge"]
        else:
            asset_type = random.choice(non_it_types)
            models_list = ["Executive", "Standard", "Premium", "Deluxe", "Basic"]
        
        purchase_date = datetime.now() - timedelta(days=random.randint(30, 730))
        warranty_expiry = purchase_date + timedelta(days=random.randint(365, 1095))
        
        asset = models.Asset(
            name=f"{asset_type} {i:03d}",
            category=category,
            type=asset_type,
            model=random.choice(models_list),
            serial_number=f"SN{i:05d}",
            status=random.choice(statuses),
            purchase_date=purchase_date,
            warranty_expiry=warranty_expiry,
            cost=random.randint(5000, 150000),
            vendor=random.choice(vendors),
            location=random.choice(locations),
            assigned_to_id=None  # No user assignments for now
        )
        mock_assets.append(asset)
    
    # Insert all assets
    try:
        db.bulk_save_objects(mock_assets)
        db.commit()
        print(f"\n✅ Successfully inserted {len(mock_assets)} mock assets!")
        
        # Verify
        total = db.query(models.Asset).count()
        print(f"✅ Total assets in database: {total}")
        
        # Show sample
        print("\n📋 Sample assets:")
        sample = db.query(models.Asset).limit(5).all()
        for asset in sample:
            print(f"  - {asset.name} ({asset.type}) - {asset.status} - {asset.location}")
        
    except Exception as e:
        print(f"\n❌ Error inserting assets: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Populating asset database with mock data...\n")
    populate_mock_assets()
