"""
Main FastAPI Application for Asset Management System
"""
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from config import settings
from database import get_db, test_connection, engine, Base
from routers import assets, users, requests, dashboard, auth, departments, locations

# Import all models to ensure they're registered with Base
import models


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events - startup and shutdown"""
    # Startup
    print("🚀 Starting Asset Management API...")
    
    # Test database connection
    success, message = test_connection()
    if success:
        print(f"✅ {message}")
    else:
        print(f"❌ {message}")
        raise Exception("Database connection failed!")
    
    # Create tables if they don't exist (for development)
    # In production, use Alembic migrations
    if settings.DEBUG:
        print("📊 Checking database tables...")
        # Base.metadata.create_all(bind=engine)  # Uncomment to auto-create tables
    
    yield
    
    # Shutdown
    print("👋 Shutting down Asset Management API...")


# Create FastAPI app
app = FastAPI(
    title="Asset Management API",
    description="API for IT Asset Management & Service Management System",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "Asset Management API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    db_success, db_message = test_connection()
    
    return {
        "status": "healthy" if db_success else "unhealthy",
        "database": db_message,
        "version": "1.0.0"
    }


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(departments.router, prefix="/api/departments", tags=["Departments"])
app.include_router(locations.router, prefix="/api/locations", tags=["Locations"])
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"])
app.include_router(requests.router, prefix="/api/requests", tags=["Requests"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )