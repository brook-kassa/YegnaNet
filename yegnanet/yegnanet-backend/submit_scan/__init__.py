import logging
import azure.functions as func
import json
import uuid
import os
import requests
from datetime import datetime

REQUIRED_FIELDS = ["timestamp", "location", "ping_result", "source"]
REQUIRED_LOCATION_FIELDS = ["lat", "lon"]
OPTIONAL_FIELDS = ["device_type", "notes", "user_language", "ssid"]

def translate_text_am_to_en(text):
    endpoint = os.environ['TRANSLATOR_ENDPOINT']
    key = os.environ['TRANSLATOR_KEY']
    region = os.environ.get('TRANSLATOR_REGION', 'eastus')

    url = f"{endpoint}/translate"
    params = {
        'api-version': '3.0',
        'from': 'am',
        'to': ['en']
    }
    headers = {
        'Ocp-Apim-Subscription-Key': key,
        'Ocp-Apim-Subscription-Region': region,
        'Content-type': 'application/json'
    }
    body = [{'text': text}]
    
    response = requests.post(url, params=params, headers=headers, json=body)

    try:
        response.raise_for_status()
        translation_result = response.json()
        logging.info(f"Translation API response: {translation_result}")
        return translation_result[0]['translations'][0]['text']
    except Exception as e:
        logging.error(f"Translation API error: {e}")
        logging.error(f"Response content: {response.text}")
        return ""


def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
    try:
        data = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON format.", status_code=400)

    for field in REQUIRED_FIELDS:
        if field not in data:
            return func.HttpResponse(f"Missing required field: '{field}'", status_code=400)

    location = data["location"]
    for field in REQUIRED_LOCATION_FIELDS:
        if field not in location:
            return func.HttpResponse(f"Missing 'location.{field}'", status_code=400)

    data["id"] = str(uuid.uuid4())
    data["received_at"] = datetime.utcnow().isoformat()

    x_forwarded_for = req.headers.get("X-Forwarded-For", "")
    sender_ip = x_forwarded_for.split(",")[0].strip() if x_forwarded_for else "unknown"
    data["ip_address"] = sender_ip

    cleaned_data = {key: data[key] for key in REQUIRED_FIELDS if key in data}
    cleaned_data["location"] = data["location"]

    for key in OPTIONAL_FIELDS:
        if key in data:
            cleaned_data[key] = data[key]

    # Auto-translate notes if present
    if "notes" in data and data["notes"].strip():
        am_note = data["notes"]
        try:
            en_note = translate_text_am_to_en(am_note)
        except Exception as e:
            logging.warning(f"Translation failed: {e}")
            en_note = ""
        cleaned_data["notes_am"] = am_note
        cleaned_data["notes_en"] = en_note

    cleaned_data["id"] = data["id"]
    cleaned_data["received_at"] = data["received_at"]
    cleaned_data["ip_address"] = data["ip_address"]

    try:
        doc.set(func.Document.from_json(json.dumps(cleaned_data)))
        return func.HttpResponse("Scan data saved.", status_code=200)
    except Exception as e:
        logging.error(f"Error saving scan data: {e}")
        return func.HttpResponse("Server error", status_code=500)
