from database import engine, Base
from models import User, Department, Location, Asset, AssetCategory, Request, AssetLifecycleEvent, Notification, AuditLog
from sqlalchemy import text

def reset_db():
    print("⚠️  DROPPING ALL TABLES with CASCADE...")
    with engine.connect() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.commit()
    print("✅ Schema reset.")
    
    print("🔄 Re-creating tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables re-created.")

if __name__ == "__main__":
    reset_db()
