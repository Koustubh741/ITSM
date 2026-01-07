"""
FastAPI application entry point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback
from datetime import datetime
from routers import upload, workflows

# Create FastAPI app instance
app = FastAPI(
    title="ITSM Asset Management API",
    description="Asset Management API for ITSM Platform",
    version="1.0.0"
)

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

