from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
from models import AuditLog, Asset
import traceback
from datetime import datetime
from routers import upload, workflows

# Create FastAPI app instance
app = FastAPI(
    title="ITSM Asset Management API",
    description="Asset Management API for ITSM Platform",
    version="1.0.0"
)

# Suppress favicon 404s
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return JSONResponse(content={})

import os

# Configure CORS
# Allow all origins in development - restrict in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:5173", # Vite default
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Debug Exception Handler
@app.exception_handler(Exception)
async def debug_exception_handler(request: Request, exc: Exception):
    # Log the full error internally
    print(f"ERROR: {exc}")
    traceback.print_exc()
    with open("exception.log", "a") as f:
        f.write(f"\n--- {datetime.now()} ---\n")
        f.write(traceback.format_exc())
    
    # Check if we are in debug mode
    is_debug = os.getenv("DEBUG", "false").lower() == "true"
    
    content = {"detail": "Internal Server Error"}
    if is_debug:
        content["detail"] = str(exc)
        content["traceback"] = traceback.format_exc()
        
    return JSONResponse(
        status_code=500,
        content=content,
        headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
    )

# Register routers
app.include_router(upload.router)
app.include_router(workflows.router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "ITSM Asset Management API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.api_route("/api/v1/collect", methods=["GET", "POST"])
async def collect_data(request: Request, db: Session = Depends(get_db)):
    """
    Collect data from external sources and route to appropriate tables.
    Asset data (with serial_number) goes to asset.assets table.
    All data is logged in system.audit_logs for audit trail.
    """
    if request.method == "POST":
        try:
            data = await request.json()
        except:
            data = {"error": "Invalid JSON"}
    else:
        data = dict(request.query_params)
    
    print(f"COLLECTED DATA ({request.method}): {data}")
    
    # Always log to audit trail
    try:
        audit_log = AuditLog(
            entity_type="API",
            entity_id="collect_endpoint",
            action="DATA_COLLECT",
            performed_by=f"API_REQUEST ({request.method})",
            details=data
        )
        db.add(audit_log)
        db.commit()
    except Exception as e:
        print(f"Error saving audit log: {e}")
        db.rollback()
    
    # Check if this is asset data (must have serial_number)
    if "serial_number" in data and isinstance(data, dict):
        try:
            # Extract and map fields from external data to Asset model
            serial_number = data.get("serial_number")
            hostname = data.get("hostname", "Unknown")
            asset_metadata = data.get("asset_metadata", {})
            hardware = data.get("hardware", {})
            
            # Build specifications JSON from hardware, os, network data
            specifications = {
                "hardware": hardware,
                "os": data.get("os", {}),
                "network": data.get("network", {})
            }
            
            # Check for existing asset by serial_number
            existing_asset = db.query(Asset).filter(
                Asset.serial_number == serial_number
            ).first()
            
            if existing_asset:
                # Update existing asset
                existing_asset.name = hostname
                existing_asset.type = asset_metadata.get("type", existing_asset.type)
                existing_asset.segment = asset_metadata.get("segment", existing_asset.segment)
                existing_asset.location = asset_metadata.get("location", existing_asset.location)
                existing_asset.specifications = specifications
                existing_asset.vendor = hardware.get("manufacturer", existing_asset.vendor)
                existing_asset.model = hardware.get("model", existing_asset.model)
                
                db.commit()
                
                return {
                    "status": "success",
                    "action": "updated",
                    "asset_id": existing_asset.id,
                    "serial_number": serial_number,
                    "message": f"Asset '{hostname}' updated successfully"
                }
            else:
                # Create new asset
                new_asset = Asset(
                    name=hostname,
                    type=asset_metadata.get("type", "Unknown"),
                    model=hardware.get("model", "Unknown"),
                    vendor=hardware.get("manufacturer", "Unknown"),
                    serial_number=serial_number,
                    segment=asset_metadata.get("segment", "IT"),
                    status="Active",
                    location=asset_metadata.get("location"),
                    specifications=specifications,
                    cost=0.0
                )
                
                db.add(new_asset)
                db.commit()
                
                return {
                    "status": "success",
                    "action": "created",
                    "asset_id": new_asset.id,
                    "serial_number": serial_number,
                    "message": f"Asset '{hostname}' created successfully"
                }
                
        except Exception as e:
            print(f"Error processing asset data: {e}")
            import traceback
            traceback.print_exc()
            db.rollback()
            
            return {
                "status": "error",
                "message": f"Failed to process asset data: {str(e)}",
                "logged": True
            }
    
    # Non-asset data: just return success (already logged)
    return {
        "status": "success", 
        "method": request.method,
        "received": data,
        "logged": True
    }

# Database health check endpoint
@app.get("/health/db")
async def db_health_check():
    """
    Check database connectivity
    """
    from database import test_connection, get_connection_info
    from sqlalchemy import text
    
    try:
        if test_connection():
            from database import engine
            conn = engine.connect()
            result = conn.execute(text("SELECT current_database(), version()"))
            db_name, version = result.fetchone()
            conn.close()
            
            info = get_connection_info()
            return {
                "status": "connected",
                "database": db_name,
                "postgresql_version": version.split(",")[0],
                "connection_info": {
                    "host": info["host"],
                    "port": info["port"],
                    "database": info["database"]
                }
            }
        else:
            return {
                "status": "disconnected",
                "error": "Database connection test failed"
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

# Register assets router
from routers import assets
app.include_router(assets.router)

from routers import auth
app.include_router(auth.router)

from routers import tickets
app.include_router(tickets.router)

from routers import asset_requests
app.include_router(asset_requests.router)

