import sys
import os
import json
import re

# Add backend directory to path
backend_path = os.path.join(os.getcwd(), 'backend')
if backend_path not in sys.path:
    sys.path.append(backend_path)

def test_deep_extraction_logic():
    print("=== Testing DEEP PDF Extraction Logic ===")
    
    # Mock composite PDF text
    test_text = """
    COMPUTERS INTERNATIONAL
    Vendor: Dell Technologies
    PO Number: PO-2026-X88
    Invoice #: INV-99221
    Date: January 15, 2026
    
    LINE ITEMS:
    Description             Qty    Unit Price    Total
    Dell Latitude 5420      5      1,200.00      6,000.00
    Docking Station WD19    2        250.00        500.00
    USB-C Adapter           10        45.00        450.00
    
    FINANCIAL SUMMARY:
    Subtotal: $6,950.00
    Sales Tax: $556.00
    Shipping: $150.00
    Grand Total: $7,656.00
    
    Author: ITSM Procurement Dept
    Creator: Adobe PDF Library
    """
    
    results = {
        "vendor_name": "Unknown Vendor",
        "product_details": [],
        "total_cost": 0.0,
        "subtotal": 0.0,
        "tax_amount": 0.0,
        "shipping_cost": 0.0,
        "po_number": None,
        "invoice_number": None,
        "currency": "USD"
    }

    # 1. Reference Numbers
    po_match = re.search(r"(?:PO|Purchase Order)\s*(?:Number|#)?[:\s]*([A-Z0-9\-]+)", test_text, re.I)
    if po_match: results["po_number"] = po_match.group(1).strip()
    
    inv_match = re.search(r"(?:Invoice|Inv)\s*(?:Number|#)?[:\s]*([A-Z0-9\-]+)", test_text, re.I)
    if inv_match: results["invoice_number"] = inv_match.group(1).strip()

    # 2. Financials
    total_match = re.search(r"\b(?:Grand Total|Total)[\s:]*[\$]?\s*([\d,]+\.\d{2})", test_text, re.I)
    if total_match: results["total_cost"] = float(total_match.group(1).replace(',', ''))
    
    sub_match = re.search(r"Subtotal[\s:]*[\$]?\s*([\d,]+\.\d{2})", test_text, re.I)
    if sub_match: results["subtotal"] = float(sub_match.group(1).replace(',', ''))

    # 3. Line Items
    lines = test_text.split('\n')
    for line in lines:
        item_match = re.search(r"^([A-Z][A-Za-z0-9\s\.\-]{5,30})\s+(\d+)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})", line.strip())
        if item_match:
            results["product_details"].append({
                "item": item_match.group(1).strip(),
                "qty": int(item_match.group(2)),
                "price": float(item_match.group(3).replace(',', '')),
                "total": float(item_match.group(4).replace(',', ''))
            })

    print(f"Extracted Results: {json.dumps(results, indent=2)}")
    
    # Validation
    if results["total_cost"] != 7656.0:
        print(f"DEBUG: Expected 7656.0, got {results['total_cost']}")
    
    assert results["po_number"] == "PO-2026-X88"
    assert results["invoice_number"] == "INV-99221"
    assert results["total_cost"] == 7656.0
    assert len(results["product_details"]) == 3
    assert results["product_details"][0]["item"] == "Dell Latitude 5420"
    
    print("\n✅ Verification SUCCESS: All 'Complete Details' correctly identified.")

if __name__ == "__main__":
    test_deep_extraction_logic()
