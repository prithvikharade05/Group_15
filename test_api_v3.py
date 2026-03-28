import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_endpoint(name, url, method="GET", data=None, token=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    print(f"Testing {name} [{method}] {url}...")
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        
        print(f"  Status: {response.status_code}")
        try:
            res_data = response.json()
            # print(f"  Response: {json.dumps(res_data, indent=2)}")
            
            # Check for standardized format
            if all(k in res_data for k in ["success", "data", "error"]):
                print("  [SUCCESS] Returns standardized format {success, data, error}")
            else:
                print("  [FAILURE] MISSING standardized format keys")
                
            return res_data
        except:
            print(f"  [FAILURE] Not a JSON response: {response.text[:100]}")
            return None
    except Exception as e:
        print(f"  [ERROR] {str(e)}")
        return None

def run_audit():
    # 1. Login
    login_payload = {"username": "test@example.com", "password": "password123"}
    # Note: Need a real user or mock this. For audit, we just check format.
    # Since we can't easily create a user without DB access here, we'll try login and check format even if 401.
    res = test_endpoint("Login", f"{BASE_URL}/auth/login/", "POST", login_payload)
    
    # 2. Market
    test_endpoint("Market Ticker", f"{BASE_URL}/market/")
    test_endpoint("Market Quote", f"{BASE_URL}/market/quote/?symbol=RELIANCE")
    
    # 3. Stocks & Predictions
    test_endpoint("List Stocks", f"{BASE_URL}/stocks/")
    test_endpoint("Stock Detail", f"{BASE_URL}/stocks/RELIANCE/")
    test_endpoint("Stock Predictions", f"{BASE_URL}/predictions/RELIANCE/")
    
    # 4. Sentiment
    test_endpoint("Sentiment Analysis", f"{BASE_URL}/sentiment/sector/Banks/")
    
    # 5. Portfolio (Mixed)
    test_endpoint("Portfolios", f"{BASE_URL}/portfolio/")
    test_endpoint("Portfolio Sectors", f"{BASE_URL}/portfolio/sectors/?portfolio=NIFTY200")
    test_endpoint("Portfolio Stocks", f"{BASE_URL}/portfolio/stocks/?portfolio=NIFTY200&sector=Energy")
    
    print("\nAudit Complete.")

if __name__ == "__main__":
    run_audit()
