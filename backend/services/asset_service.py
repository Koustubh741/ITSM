import uuid
from datetime import datetime, date, timedelta
from typing import List, Optional
from schemas.asset_schema import AssetCreate, AssetUpdate, AssetResponse
import random
import math

# Mock Database
assets_db = []

def _generate_mock_data():
    if assets_db:
        return
    
    # Create some initial mock assets
    
    # Pre-defined mock assets
    base_assets = [
        {
            "name": "MacBook Pro 16",
            "type": "Laptop",
            "model": "M3 Max",
            "vendor": "Apple",
            "serial_number": "C02XYZ123",
            "purchase_date": date.today() - timedelta(days=30),
            "warranty_expiry": date.today() + timedelta(days=335),
            "status": "Active",
            "location": "New York HQ",
            "specifications": {"cpu": "M3 Max", "ram": "32GB", "storage": "1TB"},
            "assigned_to": "alice@example.com",
            "assignment_date": date.today() - timedelta(days=10),
            "segment": "IT"
        },
        # ... (keeping one or two for consistency if needed, but the loop below handles bulk)
    ]

    # Helper lists for random generation
    locations = ["New York HQ", "London Office", "Singapore Branch", "Remote", "Data Center A", "Berlin Hub", "Tokyo Office"]
    types = ["Laptop", "Desktop", "Server", "Monitor", "Printer", "Mobile", "Network Gear", "Office Chair", "Desk", "Projector", "Whiteboard", "Vehicle"]
    statuses = ["Active", "In Stock", "Repair", "Retired", "Maintenance"]
    vendors = ["Apple", "Dell", "Lenovo", "HP", "Cisco", "Samsung", "Herman Miller", "Steelcase", "Toyota"]
    segments = ["IT", "NON-IT"]
    users = ["John Doe", "Jane Smith", "Michael Johnson", "Emily Davis", "David Wilson", "Sarah Brown", "Chris Evans", "Jessica Taylor", "Daniel Anderson", "Laura Martinez"]

    # Generate ~60 assets
    for i in range(60):
        asset_type = random.choice(types)
        
        # Determine segment based on type logic for realism
        segment = "IT"
        if asset_type in ["Office Chair", "Desk", "Whiteboard", "Vehicle"]: 
            segment = "NON-IT"
        elif asset_type in ["Printer", "Monitor", "Projector"]:
            segment = random.choice(["IT", "NON-IT"])
            
        # is_assigned = True # Forced assignment for all assets as per user request
        
        create_asset(AssetCreate(
            name=f"{random.choice(vendors)} {asset_type} {i+1}",
            type=asset_type,
            model=f"Model-{random.randint(100, 999)}",
            vendor=random.choice(vendors),
            serial_number=f"SN-{uuid.uuid4().hex[:8].upper()}",
            purchase_date=date.today() - timedelta(days=random.randint(1, 1000)),
            warranty_expiry=date.today() + timedelta(days=random.randint(-100, 500)),
            status=random.choice(statuses),
            location=random.choice(locations),
            specifications={"cpu": "Generic", "ram": "8GB"} if segment == "IT" else {"material": "Wood"},
            assigned_to=random.choice(users),
            assigned_by="ADMIN/IT",
            assignment_date=date.today() - timedelta(days=random.randint(1, 30)),
            segment=segment,
            renewal_status=random.choice([None, None, None, "Requested", "IT_Approved", "Finance_Approved"]) if random.random() > 0.8 else None,
            renewal_cost=random.randint(100, 5000) if random.random() > 0.8 else None,
            
            # 10% chance to be in Procurement Phase (Onboarding)
            procurement_status=random.choice(["Requested", "Approved", "Ordered"]) if random.random() > 0.9 else None,
            
            # 10% chance to be in Disposal Phase (Expired/Retired)
            disposal_status=random.choice(["Pending_Validation", "Ready_For_Wipe", "Wiped"]) if random.random() > 0.9 else None,
            
            # Asset Value / Cost
            cost=random.randint(20000, 250000) # Rupees
        ))

def get_all_assets() -> List[AssetResponse]:
    _generate_mock_data()
    return assets_db

def get_asset_by_id(asset_id: str) -> Optional[AssetResponse]:
    for asset in assets_db:
        if asset.id == asset_id:
            return asset
    return None

def create_asset(asset: AssetCreate) -> AssetResponse:
    new_asset = AssetResponse(
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        updated_at=datetime.now(),
        **asset.dict()
    )
    assets_db.append(new_asset)
    return new_asset

def update_asset(asset_id: str, asset_update: AssetUpdate) -> Optional[AssetResponse]:
    for i, asset in enumerate(assets_db):
        if asset.id == asset_id:
            update_data = asset_update.dict(exclude_unset=True)
            updated_asset = asset.copy(update=update_data)
            updated_asset.updated_at = datetime.now()
            assets_db[i] = updated_asset
            return updated_asset
    return None

def assign_asset(asset_id: str, user: str, location: str, assign_date: date) -> Optional[AssetResponse]:
    return update_asset(asset_id, AssetUpdate(assigned_to=user, location=location, assignment_date=assign_date, status="Active"))

def get_asset_stats():
    _generate_mock_data()
    total = len(assets_db)
    active = sum(1 for a in assets_db if a.status == "Active")
    in_stock = sum(1 for a in assets_db if a.status == "In Stock")
    repair = sum(1 for a in assets_db if a.status == "Repair")
    retired = sum(1 for a in assets_db if a.status == "Retired")
    
    # Warranty expiring soon (next 30 days) or expired
    today = date.today()
    warranty_risk = sum(1 for a in assets_db if a.warranty_expiry and a.warranty_expiry <= today + timedelta(days=30))

    # Total Value
    total_value = sum(a.cost for a in assets_db if a.cost)

    # Location Breakdown
    location_counts = {}
    type_counts = {}
    segment_counts = {}
    status_counts = {}

    for asset in assets_db:
        # Location
        loc = asset.location or "Unknown"
        location_counts[loc] = location_counts.get(loc, 0) + 1
        
        # Type
        type_ = asset.type or "Unknown"
        type_counts[type_] = type_counts.get(type_, 0) + 1

        # Segment
        seg = asset.segment or "Unknown"
        segment_counts[seg] = segment_counts.get(seg, 0) + 1

        # Status
        stat = asset.status or "Unknown"
        status_counts[stat] = status_counts.get(stat, 0) + 1
    
    # Convert to list for frontend chart
    by_location = [{"name": k, "value": v} for k, v in location_counts.items()]
    by_type = [{"name": k, "value": v} for k, v in type_counts.items()]
    by_segment = [{"name": k, "value": v} for k, v in segment_counts.items()]
    by_status = [{"name": k, "value": v} for k, v in status_counts.items()]

    # Trend Data Generation (Mock)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    quarters = ["Q1", "Q2", "Q3", "Q4"]
    
    # Generate some realistic looking trend lines
    monthly_trends = []
    for i, month in enumerate(months):
        monthly_trends.append({
            "name": month,
            "repaired": int(5 + 3 * math.sin(i * 0.5) + random.randint(0, 3)),
            "renewed": int(8 + 4 * math.cos(i * 0.5) + random.randint(0, 5))
        })
        
    quarterly_trends = []
    for i, q in enumerate(quarters):
        quarterly_trends.append({
            "name": q,
            "repaired": int(15 + 5 * math.sin(i * 1.5) + random.randint(2, 5)),
            "renewed": int(25 + 8 * math.cos(i * 1.5) + random.randint(3, 8))
        })

    return {
        "total": total,
        "total_value": total_value,
        "active": active,
        "in_stock": in_stock,
        "repair": repair,
        "retired": retired,
        "warranty_risk": warranty_risk,
        "by_location": by_location,
        "by_type": by_type,
        "by_segment": by_segment,
        "by_status": by_status,
        "trends": {
            "monthly": monthly_trends,
            "quarterly": quarterly_trends
        }
    }

def get_asset_events(asset_id: str) -> List[dict]:
    asset = get_asset_by_id(asset_id)
    if not asset:
        return []
    
    events = []
    
    # 1. Procurement/Onboarding (Based on purchase date)
    purchase_date = asset.purchase_date if asset.purchase_date else date.today() - timedelta(days=60)
    events.append({
        "date": purchase_date.strftime("%Y-%m-%d"),
        "event": "Procurement Initiated",
        "description": f"PO Generated for {asset.vendor} {asset.model}",
        "user": "Finance Dept",
        "status": "completed"
    })
    
    # 2. Received/Onboarded (5 days after purchase)
    received_date = purchase_date + timedelta(days=5)
    events.append({
        "date": received_date.strftime("%Y-%m-%d"),
        "event": "Asset Onboarded",
        "description": "Received at New York HQ, Tagged & Scanned",
        "user": "System Admin",
        "status": "completed"
    })
    
    # 3. Quality Check (1 day after received)
    qc_date = received_date + timedelta(days=1)
    events.append({
        "date": qc_date.strftime("%Y-%m-%d"),
        "event": "Quality Check",
        "description": "Passed diagnostics and hardware verification",
        "user": "IT Technician",
        "status": "completed"
    })
    
    # 4. Assignment (If assigned)
    if asset.assigned_to:
        assign_date = asset.assignment_date if asset.assignment_date else qc_date + timedelta(days=2)
        events.append({
            "date": assign_date.strftime("%Y-%m-%d"),
            "event": "Asset Assigned",
            "description": f"Assigned to {asset.assigned_to}",
            "user": asset.assigned_by or "IT Manager",
            "status": "completed"
        })
        
    # 5. Current Status Events (Mock based on status)
    if asset.status == "Repair":
        repair_date = date.today() - timedelta(days=2)
        events.append({
            "date": repair_date.strftime("%Y-%m-%d"),
            "event": "Maintenance Request",
            "description": "Ticket #INC-9982: Hardware malfunction reported",
            "user": asset.assigned_to,
            "status": "active"
        })
    elif asset.status == "Retired":
        retire_date = date.today()
        events.append({
            "date": retire_date.strftime("%Y-%m-%d"),
            "event": "Asset Retired",
            "description": "End of lifecycle processing",
            "user": "Asset Manager",
            "status": "completed"
        })

    # Sort by date descending
    events.sort(key=lambda x: x['date'], reverse=True)
    return events
