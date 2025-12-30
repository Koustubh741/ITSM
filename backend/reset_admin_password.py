from database import SessionLocal
from models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def reset_pass():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@itsm.com").first()
        if not user:
            print("User not found!")
            return
        
        # Generate new hash
        new_hash = pwd_context.hash("admin123")
        print(f"New hash: {new_hash}")
        
        user.password_hash = new_hash
        db.commit()
        print("Password reset successfully.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_pass()
