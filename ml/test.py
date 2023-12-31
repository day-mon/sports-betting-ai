import requests
API_KEY = ""
ZONE_ID = ""
url = f"https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/dns_records"


headers = {
    'Authorization': f'Bearer {API_KEY}',
}

response = requests.get(url, headers=headers)

print(response.text)