import sys
import os
import json
from datetime import datetime

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models import AuditLog, Asset

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

db = SessionLocal()

# Get latest audit log
log = db.query(AuditLog).filter(
    AuditLog.action == "DATA_COLLECT"
).order_by(AuditLog.timestamp.desc()).first()

if log:
    with open('latest_agent_payload.json', 'w') as f:
        json.dump(log.details, f, indent=2, cls=DateTimeEncoder)
    print("Saved to latest_agent_payload.json")

# Get latest asset
asset = db.query(Asset).order_by(Asset.updated_at.desc()).first()
if asset:
    asset_data = {
        "id": asset.id,
        "name": asset.name,
        "serial_number": asset.serial_number,
        "type": asset.type,
        "vendor": asset.vendor,
        "model": asset.model,
        "status": asset.status,
        "created_at": asset.created_at.isoformat() if asset.created_at else None,
        "updated_at": asset.updated_at.isoformat() if asset.updated_at else None,
        "specifications": asset.specifications
    }
    with open('latest_asset_cmdb.json', 'w') as f:
        json.dump(asset_data, f, indent=2, cls=DateTimeEncoder)
    print("Saved to latest_asset_cmdb.json")

db.close()
