import cv2
import time
from ultralytics import YOLO
from config import Config

class HumanDetector:
    def __init__(self):
        # Load the model strictly once
        self.model = YOLO(Config.MODEL_PATH)

    def detect(self, frame):
        # Infer using YOLOv8n. Restrict inference to "person" only.
        results = self.model(frame, classes=[Config.HUMAN_CLASS_ID], verbose=False)
        
        max_conf = 0.0
        detected = False
        
        # Determine highest confidence for the person class
        for result in results:
            for box in result.boxes:
                conf = float(box.conf[0])
                if conf > max_conf:
                    max_conf = conf

        # Validate against our configured threshold
        if max_conf >= Config.CONFIDENCE_THRESHOLD:
            detected = True

        return {
            "detected": detected,
            "confidence": float(max_conf),
            "timestamp": time.time(),
        }
