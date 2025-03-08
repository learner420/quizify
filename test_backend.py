import requests
import time
import sys

def test_backend():
    print("Testing backend connection...")
    max_attempts = 5
    attempts = 0
    
    while attempts < max_attempts:
        try:
            response = requests.get('http://localhost:5000/api')
            if response.status_code == 200:
                print("✅ Backend is running!")
                print(f"Response: {response.json()}")
                return True
            else:
                print(f"❌ Backend returned status code: {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"❌ Attempt {attempts + 1}/{max_attempts}: Backend not responding...")
        
        attempts += 1
        if attempts < max_attempts:
            print("Waiting 2 seconds before retrying...")
            time.sleep(2)
    
    print("❌ Could not connect to backend after multiple attempts.")
    return False

if __name__ == "__main__":
    success = test_backend()
    if not success:
        print("\nTroubleshooting tips:")
        print("1. Make sure the backend server is running (python backend/run.py)")
        print("2. Check if there are any error messages in the backend console")
        print("3. Verify that port 5000 is not being used by another application")
        sys.exit(1)
    sys.exit(0) 