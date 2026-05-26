import urllib.request, urllib.error
req = urllib.request.Request('http://127.0.0.1:8000/api/stripe/create-subscription-session?usuario_id=1', method='POST')
try:
    res = urllib.request.urlopen(req)
    print("SUCCESS", res.read().decode())
except urllib.error.HTTPError as e:
    print("ERROR", e.code, e.read().decode())
except Exception as e:
    print("EXCEPTION", str(e))
