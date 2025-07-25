import logging
import azure.functions as func
import json
import uuid
import os
import requests
from datetime import datetime

REQUIRED_FIELDS = ["location", "name"] 
REQUIRED_LOCATION_FIELDS = ["lat", "lon"]
OPTIONAL_FIELDS = ["notes", "tags", "ssid", "user_language", "device_type", "trusted"]

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
    if req.method == "OPTIONS":
        return func.HttpResponse(
            "",
            status_code=204,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        )

    try:
        req_body = req.get_json()
    except ValueError:
        return func.HttpResponse(
            "Invalid JSON format.",
            status_code=400,
            headers={"Access-Control-Allow-Origin": "*"}
        )

    # Validate required fields
    for field in REQUIRED_FIELDS:
        if field not in req_body:
            return func.HttpResponse(
                f"Missing required field: '{field}'",
                status_code=400,
                headers={"Access-Control-Allow-Origin": "*"}
            )

    location = req_body["location"]
    if isinstance(location, str):
        try:
            lat, lon = map(float, location.split(","))
            location = {"lat": lat, "lon": lon}
        except:
            return func.HttpResponse(
                "Invalid location format. Expected 'lat,lon' string.",
                status_code=400,
                headers={"Access-Control-Allow-Origin": "*"}
            )

    for field in REQUIRED_LOCATION_FIELDS:
        if field not in location:
            return func.HttpResponse(
                f"Missing location.{field}",
                status_code=400,
                headers={"Access-Control-Allow-Origin": "*"}
            )

    # Assemble document
    new_id = str(uuid.uuid4())
    received_at = datetime.utcnow().isoformat()
    ip = req.headers.get("X-Forwarded-For", "unknown").split(",")[0].strip()

    cleaned_data = {
        "id": new_id,
        "name": req_body.get("name"),
        "location": location,
        "received_at": received_at,
        "ip_address": ip
    }

    for key in OPTIONAL_FIELDS:
        if key in req_body:
            cleaned_data[key] = req_body[key]

    if "notes" in cleaned_data and cleaned_data["notes"].strip():
        am_note = cleaned_data["notes"]
        try:
            en_note = translate_text_am_to_en(am_note)
        except Exception as e:
            logging.warning(f"Translation failed: {e}")
            en_note = ""
        cleaned_data["notes_am"] = am_note
        cleaned_data["notes_en"] = en_note

    try:
        doc.set(func.Document.from_json(json.dumps(cleaned_data)))
        return func.HttpResponse(
            json.dumps({"id": new_id}),
            status_code=200,
            headers={"Access-Control-Allow-Origin": "*"}
        )
    except Exception as e:
        logging.error(f"Error saving scan data: {e}")
        return func.HttpResponse(
            "Server error",
            status_code=500,
            headers={"Access-Control-Allow-Origin": "*"}
        )
