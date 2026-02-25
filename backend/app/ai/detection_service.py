import cv2
import numpy as np
from datetime import datetime
from .model_loader import get_model

CAMERA_STREAM_URL = "http://localhost:81/stream"

def get_frame_from_stream():
    cap = cv2.VideoCapture(CAMERA_STREAM_URL)
    if not cap.isOpened():
        return None
    ret, frame = cap.read()
    cap.release()
    if not ret:
        return None
    return frame

def detect_humans():
    frame = get_frame_from_stream()
    if frame is None:
        return {
            "success": False,
            "error": "Camera frame not available"
        }

    model = get_model()
    results = model(frame)

    human_detected = False
    confidence = 0

    for result in results:
        for box in result.boxes:
            cls = int(box.cls[0])
            if cls == 0:  # class 0 = person
                human_detected = True
                confidence = float(box.conf[0])
                break # Found one person, that's enough for human_detected

    return {
        "success": True,
        "humanDetected": human_detected,
        "confidence": confidence,
        "timestamp": datetime.utcnow().isoformat()
    }
