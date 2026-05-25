import requests

base_url = "http://localhost:8080/api/v1"

# 1. Login
resp = requests.post(f"{base_url}/auth/login", json={"email": "admin@easyroute.com", "password": "admin123"})
print(f"Login: {resp.status_code}")
token = resp.json()['data']['token']

headers = {"Authorization": f"Bearer {token}"}

endpoints = [
    '/admin/dashboard',
    '/admin/users',
    '/admin/trucks/pending',
    '/admin/trucks/all',
    '/shipments?status=PENDING',
    '/admin/audit-logs',
    '/shipments'
]

for ep in endpoints:
    url = f"{base_url}{ep}"
    res = requests.get(url, headers=headers)
    print(f"GET {ep} - {res.status_code}")
    if res.status_code != 200:
        print(f"Error: {res.text}")
