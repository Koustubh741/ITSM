import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://localhost:8000/api"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    if data:
        data = urllib.parse.urlencode(data).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return 0, str(e)

def test_flow():
    with open("api_test_results.txt", "w", encoding="utf-8") as f:
        # 1. Login
        f.write("Testing Login...\n")
        code, resp = make_request(
            f"{BASE_URL}/auth/login",
            method="POST",
            data={"username": "admin@itsm.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if code != 200:
            f.write(f"FAILED Login: {code} {resp}\n")
            return
        
        token = resp["access_token"]
        f.write("Login SUCCESS. Token obtained.\n")
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # 2. Get Assets
        f.write("\nTesting Get Assets...\n")
        code, assets = make_request(f"{BASE_URL}/assets/", headers=headers)
        if code == 200:
            f.write(f"Assets SUCCESS. Count: {len(assets)}\n")
            if len(assets) > 0:
                f.write(f"Sample: {assets[0].get('name')}\n")
            else:
                f.write("WARNING: Asset list is empty.\n")
        else:
            f.write(f"FAILED Get Assets: {code} {assets}\n")

if __name__ == "__main__":
    test_flow()
