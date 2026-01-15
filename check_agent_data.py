import sys
import os
import json
from datetime import datetime

# Add the 'backend' folder to sys.path so we can import modules from it
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from database import SessionLocal
    from models import AuditLog, Asset
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

def check_data():
    db = SessionLocal()
    try:
        print("--- LATEST AUDIT LOG (RAW PAYLOAD) ---")
        # Get the latest data collection log
        log = db.query(AuditLog).filter(
            AuditLog.action == "DATA_COLLECT"
        ).order_by(AuditLog.timestamp.desc()).first()
        
        if log:
            print(f"Timestamp: {log.timestamp}")
            print(json.dumps(log.details, indent=2))
        else:
            print("No data collection logs found.")

        print("\n--- LATEST ASSET STATUS (NORMALIZED CMDB) ---")
        # Get the latest updated asset
        asset = db.query(Asset).order_by(Asset.updated_at.desc()).first()
        if asset:
            print(f"Asset: {asset.name} (SN: {asset.serial_number})")
            print(f"Status: {asset.type} | {asset.status}")
            print("Specifications:")
            print(json.dumps(asset.specifications, indent=2))
        else:
            print("No assets found.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_data()
