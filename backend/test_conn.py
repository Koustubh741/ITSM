
from database import engine
from sqlalchemy import text

try:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
        print("DATABASE_CONNECTED_SUCCESSFULLY")
except Exception as e:
    print(f"DATABASE_CONNECTION_FAILED: {e}")
