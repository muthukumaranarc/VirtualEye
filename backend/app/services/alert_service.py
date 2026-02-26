from datetime import datetime, timedelta
from ..models.alert_model import create_alert

# Prevent alert spam
COOLDOWN_SECONDS = 10
last_alert_time = None

def process_detection(detection_result):
    global last_alert_time

    if not detection_result["success"]:
        return

    if not detection_result["humanDetected"]:
        return

    now = datetime.utcnow()

    if last_alert_time and (now - last_alert_time) < timedelta(seconds=COOLDOWN_SECONDS):
        return

    create_alert(detection_result["confidence"])
    last_alert_time = now
