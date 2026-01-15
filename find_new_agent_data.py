import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models import Asset

db = SessionLocal()

# Find asset by the new agent's serial number
new_agent_asset = db.query(Asset).filter(
    Asset.serial_number == "MP2J0D13"
).first()

if new_agent_asset:
    print("✅ NEW AGENT DATA FOUND IN DATABASE:")
    print(f"ID: {new_agent_asset.id}")
    print(f"Name: {new_agent_asset.name}")
    print(f"Serial: {new_agent_asset.serial_number}")
    print(f"Vendor: {new_agent_asset.vendor}")
    print(f"Model: {new_agent_asset.model}")
    print(f"Type: {new_agent_asset.type}")
    print(f"Updated: {new_agent_asset.updated_at}")
else:
    print("❌ NEW AGENT DATA NOT FOUND")
    print("The agent may be failing to push data to the API")

# Count total assets
total = db.query(Asset).count()
print(f"\nTotal assets in database: {total}")

db.close()
