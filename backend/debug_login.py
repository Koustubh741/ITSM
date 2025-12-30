from fastapi.testclient import TestClient
from main import app
import sys

client = TestClient(app)

def test_login():
    print("Attempting login via TestClient...")
    try:
        response = client.post(
            "/api/auth/login",
            data={"username": "admin@itsm.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code != 200:
            print(f"Response Body: {response.text}")
        else:
            print("Login Successful!")
            print(response.json())
            
    except Exception as e:
        print(f"Exception during test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_login()
