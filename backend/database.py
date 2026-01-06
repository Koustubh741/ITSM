"""
Database configuration and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from typing import Generator
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database connection parameters from environment variables
DATABASE_HOST = os.getenv("DATABASE_HOST", "localhost")
DATABASE_PORT = os.getenv("DATABASE_PORT", "5432")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ITSM")
DATABASE_USER = os.getenv("DATABASE_USER", "postgres")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD", "")

# Build DATABASE_URL from components if not directly provided
# Use psycopg2 (synchronous) driver for compatibility with current code
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql+psycopg2://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"
)

# If DATABASE_URL is provided and uses asyncpg, convert to psycopg2 for synchronous operations
if DATABASE_URL and "asyncpg" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://")

# Create engine
# For SQLite, we need check_same_thread=False
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False  # Set to True for SQL query logging
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verify connections before using
        echo=False
    )

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db() -> Generator:
    """
    Dependency function to get database session.
    Use this in FastAPI route dependencies.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_connection() -> bool:
    """
    Test database connection.
    Returns True if connection is successful, False otherwise.
    """
    try:
        conn = engine.connect()
        from sqlalchemy import text
        result = conn.execute(text("SELECT 1"))
        conn.close()
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False


def get_connection_info() -> dict:
    """
    Get current database connection information.
    Returns a dictionary with connection details.
    """
    return {
        "host": DATABASE_HOST,
        "port": DATABASE_PORT,
        "database": DATABASE_NAME,
        "user": DATABASE_USER,
        "url": DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else DATABASE_URL  # Hide credentials
    }
