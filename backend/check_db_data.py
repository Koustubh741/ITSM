from database import SessionLocal
from models import User, Asset, Department, Location
import sys

db = SessionLocal()
try:
    users = db.query(User).all()
    assets = db.query(Asset).all()
    departments = db.query(Department).all()
    locations = db.query(Location).all()
    
    print(f"Users: {len(users)}")
    for u in users:
        print(f"  - {u.email} ({u.role})")
    
    print(f"\nDepartments: {len(departments)}")
    for d in departments:
        print(f"  - {d.name}")
    
    print(f"\nLocations: {len(locations)}")
    for l in locations:
        print(f"  - {l.name}")
    
    print(f"\nAssets: {len(assets)}")
    for a in assets[:5]:  # Show first 5
        print(f"  - {a.name} ({a.asset_tag})")
    
    if len(users) == 0:
        print("\n⚠️  WARNING: No users found! Run seed_data.py")
        sys.exit(1)
    if len(assets) == 0:
        print("\n⚠️  WARNING: No assets found! Run seed_data.py")
        sys.exit(1)
    
    print("\n✅ Database has data!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
finally:
    db.close()
