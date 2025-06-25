import os
import json
import requests

if os.path.exists("local.settings.json"):
    with open("local.settings.json") as f:
        settings = json.load(f)
        for key, value in settings["Values"].items():
            os.environ[key] = value

key = os.environ.get("TRANSLATOR_KEY")
endpoint = os.environ.get("TRANSLATOR_ENDPOINT")
region = os.environ.get("TRANSLATOR_REGION", "eastus")  

text_to_translate = "ሰላም ነው?"
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
body = [{
    'text': text_to_translate
}]
url = f"{endpoint}/translate"

response = requests.post(url, params=params, headers=headers, json=body)
result = response.json()

print("Translation:", result[0]['translations'][0]['text'])
