import azure.functions as func
from azure.cosmos import CosmosClient
import os
import json

def main(req: func.HttpRequest) -> func.HttpResponse:
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

    if not all(k in data for k in ("id", "vote")):
        return func.HttpResponse("Missing required fields", status_code=400)

    hotspot_id = data["id"]
    vote_type = data["vote"]

    if vote_type not in ("up", "down"):
        return func.HttpResponse("Invalid vote type", status_code=400)

    endpoint = os.environ["COSMOS_ENDPOINT"]
    key = os.environ["COSMOS_KEY"]
    database_name = os.environ["COSMOS_DATABASE"]
    container_name = "hotspots"

    client = CosmosClient(endpoint, key)
    db = client.get_database_client(database_name)
    container = db.get_container_client(container_name)

    try:
        hotspot = container.read_item(item=hotspot_id, partition_key=hotspot_id)
    except Exception as e:
        return func.HttpResponse("Hotspot not found", status_code=404)

    if vote_type == "up":
        hotspot["upvotes"] = hotspot.get("upvotes", 0) + 1
    elif vote_type == "down":
        hotspot["downvotes"] = hotspot.get("downvotes", 0) + 1


    container.replace_item(item=hotspot_id, body=hotspot)

    return func.HttpResponse(
        json.dumps({"status": "success"}),
        mimetype="application/json",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        status_code=200
    )
