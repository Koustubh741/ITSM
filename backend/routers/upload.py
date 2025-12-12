from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
from services import asset_service
from schemas.asset_schema import AssetCreate
from datetime import datetime

router = APIRouter(
    prefix="/upload",
    tags=["upload"]
)

@router.post("/smart")
async def smart_upload(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload CSV or Excel.")

    contents = await file.read()
    
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    # Normalize headers to lowercase
    df.columns = df.columns.str.lower().str.replace(' ', '_')
    
    results = {
        "assets_created": 0,
        "procurement_requests_created": 0,
        "errors": []
    }

    for index, row in df.iterrows():
        try:
            # Heuristic Detection
            is_procurement = False
            
            # If explicit 'type' column says 'procurement' or 'request'
            if 'record_type' in df.columns and row['record_type'].lower() in ['procurement', 'request']:
                is_procurement = True
            # Or if it lacks a serial number but has 'estimated_cost' or 'reason'
            elif pd.isna(row.get('serial_number')) and (not pd.isna(row.get('estimated_cost')) or not pd.isna(row.get('reason'))):
                is_procurement = True
            
            asset_data = {
                "name": row.get('name') or row.get('asset_name') or "Unknown Asset",
                "segment": row.get('segment', 'IT'),
                "type": row.get('type', 'Laptop'),
                "model": row.get('model', ''),
                "vendor": row.get('vendor', ''),
                "serial_number": row.get('serial_number', f"TEMP-{datetime.now().timestamp()}-{index}") if is_procurement else row.get('serial_number', ''),
                "status": "In Stock",
                "location": row.get('location', 'Headquarters')
            }

            if is_procurement:
                asset_data['procurement_status'] = 'Requested'
                asset_data['status'] = 'Pending' # Placeholder status until received
                # Additional procurement fields if available
                if 'requester' in row:
                    asset_data['assigned_to'] = row['requester']
                
                # We reuse the AssetCreate schema, assuming it handles extra fields gracefully or we just pass base ones
                # Ideally we map row data to schema fields
                
                created_asset = asset_service.create_asset(AssetCreate(**asset_data))
                if created_asset:
                    # Update specific procurement fields not in Create schema if necessary, 
                    # but our AssetCreate schema inherits AssetBase which HAS procurement_status.
                    # So passing it in constructor above is correct.
                    results["procurement_requests_created"] += 1
            
            else:
                # Regular Asset
                # Ensure date parsing
                if 'purchase_date' in row and not pd.isna(row['purchase_date']):
                    # valid date parsing required here
                    pass 
                
                # Check for mandatory fields
                if not asset_data['serial_number']:
                    results['errors'].append(f"Row {index+1}: Missing Serial Number for Asset")
                    continue

                asset_service.create_asset(AssetCreate(**asset_data))
                results["assets_created"] += 1

        except Exception as e:
            results["errors"].append(f"Row {index+1}: {str(e)}")

    return results
