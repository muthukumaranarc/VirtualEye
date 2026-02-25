"""
VirtualEye Camera Health Service
Monitor camera status and update MongoDB state.
"""

import time
import requests
import threading
from datetime import datetime
from ..extensions import mongo
from flask import current_app

def check_camera_health(app):
    """
    Background loop to check camera status.
    """
    with app.app_context():
        stream_url = app.config.get("VIRTUALEYE_CAMERA_STREAM_URL", "http://localhost:81")
        is_simulator = app.config.get("VIRTUALEYE_CAMERA_SIMULATOR", "true").lower() == "true"
        
        print(f"[HealthCheck] Starting camera health monitoring for: {stream_url}")
        
        while True:
            online = False
            try:
                # Try to ping the base URL of the camera
                response = requests.get(stream_url, timeout=2)
                if response.status_code == 200:
                    online = True
            except Exception:
                online = False
                
            # Update or Insert camera status in MongoDB
            try:
                if mongo.db is not None:
                    mongo.db.cameras.update_one(
                        {"name": "VirtualEye Camera"},
                        {
                            "$set": {
                                "streamUrl": stream_url,
                                "online": online,
                                "mode": "simulator" if is_simulator else "hardware",
                                "lastChecked": datetime.utcnow()
                            }
                        },
                        upsert=True
                    )
            except Exception as e:
                print(f"[HealthCheck] DB Update Error: {e}")

            time.sleep(5)

def start_health_service(app):
    """
    Launches the health check in a background thread.
    """
    thread = threading.Thread(target=check_camera_health, args=(app,), daemon=True)
    thread.start()
    return thread
