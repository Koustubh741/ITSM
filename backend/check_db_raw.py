from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT email, role FROM users"))
    for row in result:
        print(f"Email: {row[0]}, Role: {row[1]}, Type: {type(row[1])}")
