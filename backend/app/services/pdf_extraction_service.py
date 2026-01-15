import pypdf
import re
from typing import Dict, Any, Optional
import os
import traceback

def extract_po_details(file_path: str, debug: bool = False) -> Dict[str, Any]:
    """
    Internal service to extract structured data from Purchase Order PDFs.
    Uses pypdf for text extraction and regex for pattern matching.
    
    Args:
        file_path: Path to the PDF file
        debug: If True, prints detailed extraction information
    
    Returns:
        Dictionary containing extracted PO details
    """
    results = {
        "vendor_name": "Unknown Vendor",
        "product_details": [], # Changed to list for line items
        "quantity": 1,
        "unit_price": 0.0,
        "total_cost": 0.0,
        "subtotal": 0.0,
        "tax_amount": 0.0,
        "shipping_cost": 0.0,
        "currency": "USD",
        "po_number": None,
        "invoice_number": None,
        "purchase_date": None,
        "confidence_score": 0.0,
        "metadata": {},
        "raw_text": ""
    }
    
    if not os.path.exists(file_path):
        if debug:
            print(f"ERROR: File not found at {file_path}")
        return results

    try:
        reader = pypdf.PdfReader(file_path)
        
        # STEP 1: Enhanced Metadata Capture
        if reader.metadata:
            results["metadata"] = {str(k): str(v) for k, v in reader.metadata.items()}
            
        meta = reader.metadata
        if meta and debug:
            print(f"\n--- Metadata ---")
            for k, v in results["metadata"].items():
                print(f"{k}: {v}")
        
        if meta and meta.author and len(str(meta.author).strip()) > 2:
            author_clean = str(meta.author).strip()
            if author_clean.lower() not in ['details', 'name', 'unknown', 'user']:
                results["vendor_name"] = author_clean
                results["confidence_score"] += 0.1
        
        # STEP 2: Raw Text Extraction
        text = ""
        for i, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            except Exception as e:
                if debug: print(f"Page {i} error: {e}")
                continue
        
        results["raw_text"] = text
        if not text.strip():
            return results
            
        # STEP 3: Reference Numbers (PO / Invoice)
        po_match = re.search(r"(?:PO|P\.O\.|Purchase Order)\s*(?:Number|#|No\.?)?[:\s]*([A-Z0-9\-]{5,20})", text, re.I)
        if po_match:
            results["po_number"] = po_match.group(1).strip()
            results["confidence_score"] += 0.2
            
        inv_match = re.search(r"(?:Invoice|Inv)\s*(?:Number|#|No\.?)?[:\s]*([A-Z0-9\-]{5,20})", text, re.I)
        if inv_match:
            results["invoice_number"] = inv_match.group(1).strip()
            results["confidence_score"] += 0.2

        # STEP 4: Financial Deep Dive
        # Total Cost
        total_patterns = [
            r"\b(?:Total|Grand Total|Amount Due)[\s:]*[\$€£₹¥]?\s*([\d,]+\.\d{2})",
            r"\b(?:TOTAL|AMOUNT)[\s:]*[\$€£₹¥]?\s*([\d,]+\.\d{2})"
        ]
        for pattern in total_patterns:
            match = re.search(pattern, text, re.I)
            if match:
                results["total_cost"] = float(match.group(1).replace(',', ''))
                results["confidence_score"] += 0.3
                break

        # Subtotal, Tax, Shipping
        sub_match = re.search(r"\b(?:Subtotal|Sub-Total)[\s:]*[\$€£₹¥]?\s*([\d,]+\.\d{2})", text, re.I)
        if sub_match: results["subtotal"] = float(sub_match.group(1).replace(',', ''))
        
        tax_match = re.search(r"\b(?:Tax|VAT|GST|Sales Tax)[\s:]*[\$€£₹¥]?\s*([\d,]+\.\d{2})", text, re.I)
        if tax_match: results["tax_amount"] = float(tax_match.group(1).replace(',', ''))
        
        ship_match = re.search(r"\b(?:Shipping|Freight|Delivery)[\s:]*[\$€£₹¥]?\s*([\d,]+\.\d{2})", text, re.I)
        if ship_match: results["shipping_cost"] = float(ship_match.group(1).replace(',', ''))


        # Currency Detection
        if "$" in text: results["currency"] = "USD"
        elif "€" in text: results["currency"] = "EUR"
        elif "₹" in text: results["currency"] = "INR"
        elif "£" in text: results["currency"] = "GBP"

        # STEP 5: Line Item Parsing (Table Logic)
        # Look for rows like: [Description] [Quantity] [Unit Price] [Total]
        # Common pattern: Text followed by Numbers
        lines = text.split('\n')
        for line in lines:
            # Enhanced line item regex: desc, qty, price, total
            # Matches: Laptop 5 1200.00 6000.00
            item_match = re.search(r"^([A-Z][A-Za-z0-9\s\.\-]{5,50})\s+(\d+)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})", line.strip())
            if item_match:
                results["product_details"].append({
                    "description": item_match.group(1).strip(),
                    "quantity": int(item_match.group(2)),
                    "unit_price": float(item_match.group(3).replace(',', '')),
                    "total": float(item_match.group(4).replace(',', ''))
                })
        
        # If no line items found, fallback to summary
        if not results["product_details"]:
            results["product_details"] = ["Generated from deep extraction summary"]

        # STEP 6: Vendor Name (Text-based)
        if results["vendor_name"] == "Unknown Vendor":
            vendor_patterns = [
                r"(?:Vendor|Seller|Supplier|From)[\s:]+([A-Za-z0-9\s\.,\-&]{3,50})",
                r"Sold By[\s:]+([A-Za-z0-9\s\.,\-&]{3,50})"
            ]
            for pattern in vendor_patterns:
                match = re.search(pattern, text, re.I)
                if match:
                    results["vendor_name"] = match.group(1).strip()
                    results["confidence_score"] += 0.2
                    break

        # STEP 7: Date Extraction
        date_match = re.search(r"(?:Date|Issued)[\s:]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\w+ \d{1,2},? \d{4})", text, re.I)
        if date_match:
            results["purchase_date"] = date_match.group(1)
            results["confidence_score"] += 0.1

    except Exception as e:
        results["error"] = str(e)
        if debug: traceback.print_exc()
        
    return results

def extract_invoice_details(file_path: str) -> Dict[str, Any]:
    """
    Extract structured data from Invoice PDFs.
    Similar to PO extraction but focuses on payment confirmation.
    """
    # Simply reuse PO extractor as patterns are similar
    data = extract_po_details(file_path)
    # Customize if needed
    return data
