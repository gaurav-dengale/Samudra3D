"""
Standalone background keep-alive pinger for Render Free Tier.
Can be executed as a background process or on a VPS/scheduler to prevent cold starts.
"""
import time
import urllib.request
import os
import sys

BACKEND_URL = os.getenv("RENDER_BACKEND_URL", "https://samudra3d.onrender.com").rstrip("/")
HEALTH_ENDPOINT = f"{BACKEND_URL}/health"
INTERVAL_SECONDS = 12 * 60  # 12 minutes (Render sleeps after 15 minutes)

def ping():
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Pinging {HEALTH_ENDPOINT}...")
    try:
        req = urllib.request.Request(
            HEALTH_ENDPOINT,
            headers={"User-Agent": "Samudra3D-KeepAlive/1.0"}
        )
        with urllib.request.urlopen(req, timeout=60) as response:
            status = response.getcode()
            body = response.read().decode("utf-8")
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] OK ({status}): {body}")
    except Exception as e:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Error/Timeout: {e}", file=sys.stderr)

def main():
    print(f"Starting keep-alive daemon for {BACKEND_URL} every {INTERVAL_SECONDS // 60} minutes.")
    while True:
        ping()
        time.sleep(INTERVAL_SECONDS)

if __name__ == "__main__":
    main()
