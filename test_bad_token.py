import requests

def test_api_with_bad_token():
    base_url = "http://127.0.0.1:8000"
    endpoints = [
        "/api/market/",
        "/api/quote/?symbol=RELIANCE"
    ]
    
    headers = {
        "Authorization": "Bearer some_invalid_token"
    }
    
    for endpoint in endpoints:
        print(f"Testing {endpoint} WITH BAD TOKEN...")
        try:
            response = requests.get(base_url + endpoint, headers=headers)
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                print("SUCCESS: Endpoint is accessible even with a bad token header.")
            else:
                print(f"FAILED: Status code {response.status_code}")
                # print(response.text)
        except Exception as e:
            print(f"ERROR: {e}")
        print("-" * 20)

if __name__ == "__main__":
    test_api_with_bad_token()
