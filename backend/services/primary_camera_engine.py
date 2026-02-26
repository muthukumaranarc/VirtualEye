import cv2
import threading
import time
from datetime import datetime

from config.camera_config import PRIMARY_CAMERA
from services.detection_service import detect_humans
from services.alert_service import create_alert


class PrimaryCameraEngine:

    def __init__(self):

        self.running = False
        self.thread = None
        self.cooldown = 0
        self.COOLDOWN_SECONDS = 10


    def start(self):

        if self.running:
            return

        self.running = True

        self.thread = threading.Thread(
            target=self.run_camera,
            daemon=True
        )

        self.thread.start()

        print("Primary ESP32 Camera Engine Started")


    def run_camera(self):

        url = PRIMARY_CAMERA["url"]

        print(f"Connecting to ESP32 camera: {url}")

        cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)

        if not cap.isOpened():

            print("ERROR: Cannot connect to ESP32 camera")
            return

        print("ESP32 camera connected successfully")

        while self.running:

            ret, frame = cap.read()

            if not ret:

                print("Frame read failed, reconnecting...")

                cap.release()
                time.sleep(2)

                cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)

                continue


            detected = detect_humans(frame)

            if detected:

                now = time.time()

                if now - self.cooldown > self.COOLDOWN_SECONDS:

                    self.cooldown = now

                    create_alert(
                        cameraId=PRIMARY_CAMERA["id"],
                        message="Human detected on ESP32 Camera",
                        timestamp=datetime.utcnow()
                    )

                    print("Human detected on ESP32 camera")


            time.sleep(0.03)


engine = PrimaryCameraEngine()
