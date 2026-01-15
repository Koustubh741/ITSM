import sys
import os
import asyncio
import dotenv

# Load environment variables
dotenv.load_dotenv('backend/.env')

# Add backend directory to path
backend_path = os.path.join(os.getcwd(), 'backend')
if backend_path not in sys.path:
    sys.path.append(backend_path)

from app.database.database import AsyncSessionLocal
from app.models.models import PurchaseOrder
from sqlalchemy.future import select

async def check():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(PurchaseOrder).order_by(PurchaseOrder.created_at.desc()).limit(1))
        po = res.scalars().first()
        if po:
            print(f"LATEST PO IN DB:")
            print(f"ID: {po.id}")
            print(f"Vendor: {po.vendor_name}")
            print(f"Total: {po.total_cost}")
            print(f"Line Items: {po.product_details}")
            print(f"Status: {po.status}")
        else:
            print("NO PURCHASE ORDERS FOUND")

if __name__ == "__main__":
    asyncio.run(check())
