from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
from services import asset_service
from services import asset_request_service
from schemas.asset_schema import AssetCreate
from schemas.asset_request_schema import AssetRequestCreate
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
        "asset_requests_created": 0,
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
            
            # Get requester_id - required for asset requests
            requester_id = row.get('requester_id') or row.get('requester')
            if not requester_id:
                results['errors'].append(f"Row {index+1}: Missing requester_id/requester")
                continue
            
            # Prepare asset request data
            request_data = {
                "requester_id": str(requester_id),
                "asset_name": row.get('name') or row.get('asset_name') or "Unknown Asset",
                "asset_type": row.get('type', 'Laptop'),
                "asset_ownership_type": row.get('asset_ownership_type', 'COMPANY_OWNED'),  # Default to COMPANY_OWNED
                "asset_model": row.get('model', ''),
                "asset_vendor": row.get('vendor', ''),
                "cost_estimate": float(row.get('cost_estimate', 0)) if not pd.isna(row.get('cost_estimate')) else None,
                "justification": row.get('justification', ''),
                "business_justification": row.get('business_justification') or row.get('reason') or row.get('justification') or "Uploaded via bulk import"
            }
            
            # Validate required fields
            if not request_data['business_justification']:
                results['errors'].append(f"Row {index+1}: Missing business_justification")
                continue
            
            if is_procurement:
                # Create procurement request with PROCUREMENT_REQUESTED status
                created_request = asset_request_service.create_asset_request(
                    AssetRequestCreate(**request_data),
                    initial_status="PROCUREMENT_REQUESTED"
                )
                if created_request:
                    results["procurement_requests_created"] += 1
            else:
                # Create regular asset request with SUBMITTED status
                created_request = asset_request_service.create_asset_request(
                    AssetRequestCreate(**request_data),
                    initial_status="SUBMITTED"
                )
                if created_request:
                    results["asset_requests_created"] += 1

        except Exception as e:
            results["errors"].append(f"Row {index+1}: {str(e)}")

    return results
