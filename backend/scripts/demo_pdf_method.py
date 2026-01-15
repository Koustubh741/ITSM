import pypdf
import re
import os

def simple_test_extraction(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    reader = pypdf.PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    # Method: Regex for Total Amount
    # Looks for 'Total' followed by a currency amount
    total_pattern = r"(?:Total|Amount)[\s:]*[\$]?\s*([\d,]+\.\d{2})"
    match = re.search(total_pattern, text, re.I)
    
    total = match.group(1) if match else "Not found"
    
    print("--- EXTRACTION METHOD DEMO ---")
    print(f"File: {os.path.basename(file_path)}")
    print(f"Extracted Total: {total}")
    print("\nFull Method Details:")
    print("1. Read PDF pages one by one.")
    print("2. Extract raw text strings.")
    print("3. Apply Regex patterns to identify key fields (Total, Vendor, Date).")
    print("4. Use Largest Number heuristic if specific patterns fail.")

if __name__ == "__main__":
    # Example usage (would requires a real PDF)
    # simple_test_extraction("sample_po.pdf")
    print("PDF Extraction Service is configured in: backend/app/services/pdf_extraction_service.py")
    print("It uses pypdf for raw extraction and re (Regex) for data normalization.")
