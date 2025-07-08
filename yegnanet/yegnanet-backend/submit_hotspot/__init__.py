import azure.functions as func
from azure.cosmos import CosmosClient
from datetime import datetime
import os
import json
import uuid

def main(req: func.HttpRequest) -> func.HttpResponse:
    # 🟢 Handle preflight CORS request FIRST
    if req.method == "OPTIONS":
        return func.HttpResponse(
            "",
            status_code=204,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )

    try:
        data = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON", status_code=400)
    
    if not all(k in data for k in ("location", "name", "notes")):
        return func.HttpResponse("Missing required fields", status_code=400)

    data["id"] = str(uuid.uuid4())
    data["createdAt"] = datetime.utcnow().isoformat()

    endpoint = os.environ["COSMOS_ENDPOINT"]
    key = os.environ["COSMOS_KEY"]
    database_name = os.environ["COSMOS_DATABASE"]
    container_name = "hotspots"

    client = CosmosClient(endpoint, key)
    db = client.get_database_client(database_name)
    container = db.get_container_client(container_name)

    container.create_item(body=data)

    return func.HttpResponse(
        json.dumps({"status": "success", "id": data["id"]}),
        mimetype="application/json",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        status_code=200
    )
