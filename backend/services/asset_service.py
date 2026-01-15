"""
Asset service layer - Database operations using SQLAlchemy
"""
import uuid
from datetime import datetime, date, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from database import SessionLocal
from models import Asset, ByodDevice, User
from schemas.asset_schema import AssetCreate, AssetUpdate, AssetResponse


def get_all_assets() -> List[AssetResponse]:
    """
    Get all assets from the database
    """
    db = SessionLocal()
    try:
        # 1. Fetch standard assets
        standard_assets = db.query(Asset).all()
        results = [AssetResponse.model_validate(asset) for asset in standard_assets]
        
        # 2. Fetch BYOD devices and map them to AssetResponse
        byods = db.query(ByodDevice, User).join(User, ByodDevice.owner_id == User.id).all()
        for byod, owner in byods:
            results.append(AssetResponse(
                id=byod.id,
                name=f"BYOD: {byod.device_model}",
                type="BYOD",
                model=byod.device_model,
                vendor="Personal",
                serial_number=byod.serial_number,
                status="Active",
                assigned_to=owner.full_name,
                location=owner.location or "Remote",
                segment="IT",
                specifications={"os_version": byod.os_version},
                created_at=byod.created_at or datetime.now(),
                updated_at=byod.created_at or datetime.now()
            ))
            
        return results
    finally:
        db.close()


def get_asset_by_id(asset_id: str) -> Optional[AssetResponse]:
    """
    Get a single asset by ID from the database
    """
    db = SessionLocal()
    try:
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if asset:
            return AssetResponse.model_validate(asset)
        return None
    finally:
        db.close()


def search_asset_by_id_or_serial(asset_id: str = None, serial_number: str = None) -> Optional[AssetResponse]:
    """
    Search for an asset by ID or Serial Number
    """
    db = SessionLocal()
    try:
        asset = None
        if asset_id:
            asset = db.query(Asset).filter(Asset.id == asset_id).first()
        elif serial_number:
            asset = db.query(Asset).filter(Asset.serial_number == serial_number).first()
        
        if asset:
            return AssetResponse.model_validate(asset)
        return None
    finally:
        db.close()


def get_assets_by_assigned_to(user_name: str) -> List[AssetResponse]:
    """
    Get all assets assigned to a specific user
    """
    db = SessionLocal()
    try:
        # Case insensitive search for better UX
        # 1. Standard assets
        standard_assets = db.query(Asset).filter(func.lower(Asset.assigned_to) == user_name.lower()).all()
        results = [AssetResponse.model_validate(asset) for asset in standard_assets]
        
        # 2. BYOD devices for this user
        byods = db.query(ByodDevice, User).join(User, ByodDevice.owner_id == User.id).filter(func.lower(User.full_name) == user_name.lower()).all()
        for byod, owner in byods:
            results.append(AssetResponse(
                id=byod.id,
                name=f"BYOD: {byod.device_model}",
                type="BYOD",
                model=byod.device_model,
                vendor="Personal",
                serial_number=byod.serial_number,
                status="Active",
                assigned_to=owner.full_name,
                location=owner.location or "Remote",
                segment="IT",
                specifications={"os_version": byod.os_version},
                created_at=byod.created_at or datetime.now(),
                updated_at=byod.created_at or datetime.now()
            ))
            
        return results
    finally:
        db.close()


def create_asset(asset: AssetCreate) -> AssetResponse:
    """
    Create a new asset in the database
    """
    db = SessionLocal()
    try:
        # Convert Pydantic model to dict, excluding None values for optional fields
        asset_dict = asset.model_dump(exclude_unset=True)
        
        # Create SQLAlchemy model instance
        db_asset = Asset(
            id=str(uuid.uuid4()),
            **asset_dict
        )
        
        db.add(db_asset)
        db.commit()
        db.refresh(db_asset)
        
        # Convert to Pydantic response model
        return AssetResponse.model_validate(db_asset)
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def update_asset(asset_id: str, asset_update: AssetUpdate) -> Optional[AssetResponse]:
    """
    Update an existing asset in the database
    """
    db = SessionLocal()
    try:
        # Find the asset
        db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if not db_asset:
            return None
        
        # Update only provided fields
        update_data = asset_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_asset, field, value)
        
        db.commit()
        db.refresh(db_asset)
        
        # Convert to Pydantic response model
        return AssetResponse.model_validate(db_asset)
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def assign_asset(asset_id: str, user: str, location: str, assign_date: date) -> Optional[AssetResponse]:
    """
    Assign an asset to a user
    """
    return update_asset(
        asset_id,
        AssetUpdate(
            assigned_to=user,
            location=location,
            assignment_date=assign_date,
            status="Active"
        )
    )


def get_asset_stats():
    """
    Get aggregated statistics from the database
    """
    db = SessionLocal()
    try:
        # Total count
        total = db.query(Asset).count()
        
        # Status counts
        active = db.query(Asset).filter(Asset.status == "Active").count()
        in_stock = db.query(Asset).filter(Asset.status == "In Stock").count()
        repair = db.query(Asset).filter(Asset.status == "Repair").count()
        retired = db.query(Asset).filter(Asset.status == "Retired").count()
        
        # Warranty expiring soon (next 30 days) or expired
        today = date.today()
        warranty_cutoff = today + timedelta(days=30)
        warranty_risk = db.query(Asset).filter(
            and_(
                Asset.warranty_expiry.isnot(None),
                Asset.warranty_expiry <= warranty_cutoff
            )
        ).count()
        
        # Total value
        total_value_result = db.query(func.sum(Asset.cost)).scalar()
        total_value = float(total_value_result) if total_value_result else 0.0
        
        # Location breakdown
        location_results = db.query(
            Asset.location,
            func.count(Asset.id).label('count')
        ).group_by(Asset.location).all()
        by_location = [
            {"name": loc or "Unknown", "value": count}
            for loc, count in location_results
        ]
        
        # Type breakdown
        type_results = db.query(
            Asset.type,
            func.count(Asset.id).label('count')
        ).group_by(Asset.type).all()
        by_type = [
            {"name": asset_type or "Unknown", "value": count}
            for asset_type, count in type_results
        ]
        
        # Segment breakdown
        segment_results = db.query(
            Asset.segment,
            func.count(Asset.id).label('count')
        ).group_by(Asset.segment).all()
        by_segment = [
            {"name": seg or "Unknown", "value": count}
            for seg, count in segment_results
        ]
        
        # Status breakdown
        status_results = db.query(
            Asset.status,
            func.count(Asset.id).label('count')
        ).group_by(Asset.status).all()
        by_status = [
            {"name": stat or "Unknown", "value": count}
            for stat, count in status_results
        ]
        
        # Trend Data Generation (Mock - can be replaced with real data later)
        import random
        import math
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        quarters = ["Q1", "Q2", "Q3", "Q4"]
        
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
    finally:
        db.close()


def get_asset_events(asset_id: str) -> List[dict]:
    """
    Get asset event history (mock implementation based on asset data)
    """
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
        "description": f"Received at {asset.location or 'Headquarters'}, Tagged & Scanned",
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
    
    # 5. Current Status Events (Based on status)
    if asset.status == "Repair":
        repair_date = date.today() - timedelta(days=2)
        events.append({
            "date": repair_date.strftime("%Y-%m-%d"),
            "event": "Maintenance Request",
            "description": "Ticket #INC-9982: Hardware malfunction reported",
            "user": asset.assigned_to or "System",
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
