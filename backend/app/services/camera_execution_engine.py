import cv2
import threading
import time
from datetime import datetime
from ..extensions import mongo
from ..ai.detection_service import detect_humans
from ..services.alert_engine import AlertEngine

class CameraExecutionEngine:

    def __init__(self):
        self.running = False
        self.camera_threads = {}
        self.active_camera_ids = set()

    def start(self, app):
        if self.running:
            return

        self.running = True
        self.app = app

        def delayed_start():
            time.sleep(5)
            monitor_thread = threading.Thread(
                target=self.monitor_cameras,
                daemon=True
            )
            monitor_thread.start()
            print("[Engine] Monitor thread spawned after delay", flush=True)

        threading.Thread(target=delayed_start, daemon=True).start()
        print("[Engine] Camera Execution Engine queued for start", flush=True)

    def monitor_cameras(self):
        print("[Engine] Monitor thread started")
        while self.running:
            try:
                with self.app.app_context():
                    print("[Engine] Checking registry via API...")
                    import requests
                    try:
                        response = requests.get("http://127.0.0.1:5000/api/cameras", timeout=5)
                        if response.status_code == 200:
                            cameras = response.json()
                            print(f"[Engine] Found {len(cameras)} active cameras via API", flush=True)
                            # Only handle cameras with status ACTIVE
                            cameras = [cam for cam in cameras if cam['status'] == 'ACTIVE']
                        else:
                            print(f"[Engine] API Error: {response.status_code}", flush=True)
                            cameras = []
                    except Exception as api_err:
                        print(f"[Engine] API Request failed: {api_err}", flush=True)
                        cameras = []

                    db_ids = set([cam["cameraId"] for cam in cameras])
                    
                    # Start new cameras
                    for cam in cameras:
                        cam_id = cam["cameraId"]
                        if cam_id not in self.active_camera_ids:
                            print(f"[Engine] Starting detection for camera {cam_id}")
                            self.active_camera_ids.add(cam_id)
                            thread = threading.Thread(
                                target=self.process_camera,
                                args=(cam,),
                                daemon=True
                            )
                            self.camera_threads[cam_id] = thread
                            thread.start()

                    # Stop disabled cameras
                    for cam_id in list(self.active_camera_ids):
                        if cam_id not in db_ids:
                            print(f"[Engine] Stopping detection for camera {cam_id}")
                            self.active_camera_ids.remove(cam_id)
            except Exception as e:
                import traceback
                print(f"[Engine] Monitor error: {e}")
                traceback.print_exc()

            time.sleep(5)

    def process_camera(self, camera):
        cam_id = camera["cameraId"]
        cam_type = camera["type"]
        cam_url = camera["url"]

        cap = None
        try:
            # Initialize Capture
            if cam_type == "LAPTOP_CAM" and cam_url == "0":
                # Use Simulator URL to avoid hardware conflict
                source = "http://localhost:81/stream"
                cap = cv2.VideoCapture(source)
            elif cam_type == "LAPTOP_CAM":
                source = int(cam_url) if cam_url.isdigit() else cam_url
                cap = cv2.VideoCapture(source)
            else:
                cap = cv2.VideoCapture(cam_url)

            print(f"[Engine] Camera {cam_id} initialized")

            while self.running and cam_id in self.active_camera_ids:
                ret, frame = cap.read()

                if not ret:
                    time.sleep(1)
                    continue

                with self.app.app_context():
                    # Run detection on the current frame
                    result = detect_humans(frame)

                    if result.get("success") and result.get("humanDetected"):
                        AlertEngine.process_alert(
                            alert_type="HUMAN_DETECTED",
                            camera_id=cam_id,
                            confidence=result.get("confidence", 0)
                        )
                        print(f"[Engine] Human detected on {cam_id}")

                time.sleep(0.1)

        except Exception as e:
            print(f"Camera error {cam_id}: {e}")
        finally:
            if cap:
                cap.release()
            if cam_id in list(self.active_camera_ids):
                if cam_id in self.active_camera_ids:
                    self.active_camera_ids.remove(cam_id)
            print(f"[Engine] Camera {cam_id} thread stopped")
