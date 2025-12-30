from database import engine
from sqlalchemy import text
import sys

with open("db_raw_dump.txt", "w") as f:
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT email, role FROM users"))
            f.write("Connected.\n")
            count = 0
            for row in result:
                f.write(f"Email: {row[0]}, Role: {row[1]}, Type: {type(row[1])}\n")
                count += 1
            f.write(f"Total: {count}\n")
    except Exception as e:
        f.write(f"Error: {e}\n")
