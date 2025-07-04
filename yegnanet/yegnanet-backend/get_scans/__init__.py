import azure.functions as func
from azure.cosmos import CosmosClient
import json
import os

def main(req: func.HttpRequest) -> func.HttpResponse:
    endpoint = os.environ["COSMOS_ENDPOINT"]
    key = os.environ["COSMOS_KEY"]
    database_name = os.environ["COSMOS_DATABASE"]
    container_name = os.environ["COSMOS_CONTAINER"]

    client = CosmosClient(endpoint, key)
    database = client.get_database_client(database_name)
    container = database.get_container_client(container_name)

    items = list(container.read_all_items())
    for item in items:
        item.pop('_rid', None)
        item.pop('_self', None)
        item.pop('_etag', None)
        item.pop('_attachments', None)
        item.pop('_ts', None)

    items_json = json.dumps(items)

    return func.HttpResponse(
        items_json,
        mimetype="application/json",
        headers={
            "Access-Control-Allow-Origin": "https://yegna.net"
        },
        status_code=200
    )
