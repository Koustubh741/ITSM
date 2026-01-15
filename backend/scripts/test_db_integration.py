import sys
import os
import asyncio
import uuid
import json
from unittest.mock import MagicMock, AsyncMock

# Add backend directory to path
backend_path = os.path.join(os.getcwd(), 'backend')
if backend_path not in sys.path:
    sys.path.append(backend_path)

from app.services import procurement_service
from app.models.models import PurchaseOrder

async def test_db_mapping():
    print("=== Testing Database Mapping Logic ===")
    
    # Mock Data
    request_id = uuid.uuid4()
    uploader_id = uuid.uuid4()
    file_path = "uploads/procurement/test.pdf"
    
    mock_extracted = {
        "vendor_name": "Test Vendor",
        "total_cost": 1000.0,
        "quantity": 2,
        "unit_price": 500.0,
        "product_details": [
            {"item": "Item 1", "qty": 1, "price": 500.0, "total": 500.0},
            {"item": "Item 2", "qty": 1, "price": 500.0, "total": 500.0}
        ],
        "metadata": {"Author": "Tester"},
        "raw_text": "Full PDF text content here"
    }
    
    # Mock DB Session
    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    mock_db.execute = AsyncMock()
    
    # Mock pdf_extraction_service
    import app.services.pdf_extraction_service as pdf_service
    original_extract_po = pdf_service.extract_po_details
    pdf_service.extract_po_details = MagicMock(return_value=mock_extracted)
    
    try:
        # We need to mock the AssetRequest query inside handle_po_upload
        mock_result = MagicMock()
        mock_result.scalars().first.return_value = MagicMock()
        mock_db.execute.return_value = mock_result
        
        # Call the service
        po = await procurement_service.handle_po_upload(mock_db, request_id, uploader_id, file_path)
        
        # Verify Mapping
        print(f"PO Vendor: {po.vendor_name}")
        print(f"PO Total Cost: {po.total_cost}")
        print(f"PO Product Details Type: {type(po.product_details)}")
        print(f"PO Extracted Data Keys: {list(po.extracted_data.keys())}")
        
        assert po.vendor_name == "Test Vendor"
        assert po.total_cost == 1000.0
        assert len(po.product_details) == 2
        assert "raw_text" in po.extracted_data
        
        print("\n✅ Verification SUCCESS: Mapping logic correctly handled deep extraction data.")
        
    finally:
        # Restore original service
        pdf_service.extract_po_details = original_extract_po

if __name__ == "__main__":
    asyncio.run(test_db_mapping())
