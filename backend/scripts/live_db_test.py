import sys
import os
import asyncio
import uuid
from datetime import datetime
import dotenv

# Load environment variables
dotenv.load_dotenv('backend/.env')

# Add backend directory to path
backend_path = os.path.join(os.getcwd(), 'backend')
if backend_path not in sys.path:
    sys.path.append(backend_path)

from app.database.database import SessionLocal, AsyncSessionLocal
from app.models.models import PurchaseOrder, AssetRequest, User

async def run_live_test():
    print("=== LIVE DATABASE INTEGRATION TEST ===")
    
    async with AsyncSessionLocal() as db:
        try:
            # 1. Find or create a test AssetRequest
            from sqlalchemy.future import select
            res = await db.execute(select(AssetRequest).limit(1))
            request = res.scalars().first()
            
            if not request:
                print("No AssetRequest found. Creating one...")
                request = AssetRequest(
                    id=uuid.uuid4(),
                    requester_id=uuid.uuid4(),
                    asset_name="Test MacBook",
                    asset_type="Laptop",
                    status="SUBMITTED"
                )
                db.add(request)
                await db.commit()
                await db.refresh(request)
            
            # 2. Simulate Extraction Data
            extracted_info = {
                "vendor_name": "Apple Inc.",
                "total_cost": 2499.00,
                "quantity": 1,
                "unit_price": 2499.00,
                "product_details": [
                    {"item": "MacBook Pro 16-inch", "qty": 1, "price": 2499.00, "total": 2499.00}
                ],
                "po_number": "PO-TEST-123",
                "currency": "USD",
                "metadata": {"Author": "ITSM System Robot"},
                "raw_text": "Purchase Order: PO-TEST-123\nVendor: Apple Inc.\nItems: MacBook Pro 16-inch - 1 @ 2499.00\nTotal: $2,499.00"
            }
            
            # 3. Create PurchaseOrder record just like handle_po_upload does
            # Note: We'll use a fixed uploader_id for testing
            uploader_id = uuid.uuid4()
            
            po = PurchaseOrder(
                id=uuid.uuid4(),
                asset_request_id=request.id,
                uploaded_by=uploader_id,
                po_pdf_path="uploads/procurement/test_live.pdf",
                vendor_name=extracted_info.get("vendor_name"),
                total_cost=extracted_info.get("total_cost"),
                quantity=extracted_info.get("quantity"),
                unit_price=extracted_info.get("unit_price"),
                product_details=extracted_info.get("product_details"),
                extracted_data=extracted_info,
                status="UPLOADED"
            )
            
            db.add(po)
            await db.commit()
            await db.refresh(po)
            
            print(f"✅ SUCCESS: Purchase Order stored in DB with ID: {po.id}")
            print(f"   Vendor: {po.vendor_name}")
            print(f"   Total Details Captured: {len(po.product_details)} items")
            
            # 4. Clean up (Optional, but let's keep it for records)
            # await db.delete(po)
            # await db.commit()
            
        except Exception as e:
            print(f"❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(run_live_test())
