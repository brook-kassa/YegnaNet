import azure.functions as func
import subprocess
from datetime import datetime, timezone
import json
import requests

def send_to_api(data):
    API_URL = "https://ynet-backend.azurewebsites.net/api/submit-scan"
    try:
        response = requests.post(API_URL, json=data)
        response.raise_for_status()
        print("Data sent succesfully!")
        print(response.text)
    except requests.exceptions.RequestException as e:
        print(f"Failed to send data: {e}")

def run_ping():
    try:
        result = subprocess.run(
            ["ping", "8.8.8.8", "-n", "4"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=10
        )
        return result.stdout
    except Exception as e:
        return f"Ping failed: {e}"
    
def get_scan_result():
    timestamp = datetime.now(timezone.utc).isoformat()
    mock_location = {"lat": 9.03, "lon": 38.75}

    scan_data = {
        "timestamp": timestamp,
        "location": mock_location,
        "ping_result": run_ping(),
        "source": "drive-test"
    }

    return scan_data

if __name__ == "__main__":
    result = get_scan_result()
    print(json.dumps(result, indent=2))
    send_to_api(result)