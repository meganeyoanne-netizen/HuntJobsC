import urllib.request,json
for url in ["http://127.0.0.1:8000/api/health/","http://127.0.0.1:5173/api/health/","http://127.0.0.1:5173/api/offres/","http://127.0.0.1:5173/"]:
    with urllib.request.urlopen(url,timeout=15) as response:
        body=response.read()
        print(url,response.status,response.headers.get("Content-Type"),len(body))
        if "/health/" in url: print(json.loads(body))
