from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT email, password_hash FROM users WHERE email='admin@itsm.com'"))
    for row in result:
        print(f"Email: {row[0]}")
        print(f"Hash: {row[1]}")
        print(f"Length: {len(row[1])}")
