import cv2
import time
from config import Config

class IntelligentMotionDetector:
    def __init__(self):
        self.contour_threshold = Config.MOTION_CONTOUR_THRESHOLD
        self.prev_frame = None

    def detect(self, frame):
        # Convert to grayscale and apply Gaussian Blur
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)

        # Baseline frame needed for differencing
        if self.prev_frame is None:
            self.prev_frame = gray
            return {"motionDetected": False, "motionArea": 0.0}

        # Subtractive Frame Differencing
        frame_delta = cv2.absdiff(self.prev_frame, gray)
        thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]
        
        # Dilate holes caused by jitter
        thresh = cv2.dilate(thresh, None, iterations=2)
        
        # Find continuous boundries around change
        contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        self.prev_frame = gray

        max_area = 0.0
        for c in contours:
            area = cv2.contourArea(c)
            if area > max_area:
                max_area = float(area)
        
        motion_detected = max_area > self.contour_threshold

        return {
            "motionDetected": motion_detected,
            "motionArea": float(max_area)
        }
