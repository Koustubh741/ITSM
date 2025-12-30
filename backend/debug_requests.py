import logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
from database import SessionLocal
from models import Request, RequestStatus

def list_requests():
    db = SessionLocal()
    try:
        requests = db.query(Request).order_by(Request.id.desc()).all()
        with open("requests_dump.txt", "w") as f:
            f.write(f"Total Requests: {len(requests)}\n")
            f.write("-" * 80 + "\n")
            f.write(f"{'ID':<5} | {'Request Number':<15} | {'Status':<15} | {'Reason':<20} | {'Rejection Reason'}\n")
            f.write("-" * 80 + "\n")
            for req in requests:
                f.write(f"{req.id:<5} | {req.request_number:<15} | {req.status.value:<15} | {str(req.reason)[:20]:<20} | {req.rejection_reason}\n")
    finally:
        db.close()

if __name__ == "__main__":
    list_requests()
