import requests

def test_full_auth_flow():
    base_url = "http://127.0.0.1:8000/api"
    username = "testuser_debug"
    password = "password123"
    
    # 1. Register
    print("1. Registering user...")
    res = requests.post(f"{base_url}/auth/register/", json={"username": username, "password": password})
    print(f"Status: {res.status_code}, Body: {res.json()}")
    
    # 2. Login
    print("\n2. Logging in...")
    res = requests.post(f"{base_url}/auth/login/", json={"username": username, "password": password})
    print(f"Status: {res.status_code}")
    if res.status_code != 200:
        print("Login failed")
        return
    
    data = res.json()
    token = data["access"]
    print(f"Login successful. Got token: {token[:20]}...")
    
    # 3. Set MPIN
    print("\n3. Setting MPIN...")
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.post(f"{base_url}/auth/set-mpin/", json={"mpin": "1234"}, headers=headers)
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        print("SUCCESS: MPIN set correctly.")
    else:
        print(f"FAILED: {res.json()}")
        
    # 4. Access protected endpoint (Dashboard data)
    print("\n4. Accessing protected dashboard resource (/stocks/)...")
    res = requests.get(f"{base_url}/stocks/", headers=headers)
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        print("SUCCESS: Dashboard resource accessible.")
    else:
        print(f"FAILED: {res.status_code}")

if __name__ == "__main__":
    test_full_auth_flow()
