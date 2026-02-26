from datetime import datetime
from app.models.alert_model import create_alert as _create_alert

def create_alert(cameraId, message, timestamp=None):
    """Wrapper to match the keyword arguments expected by PrimaryCameraEngine."""
    if timestamp is None:
        timestamp = datetime.utcnow()
    
    alert_data = {
        "cameraId": cameraId,
        "type": "HUMAN_DETECTED",
        "message": message,
        "timestamp": timestamp,
        "confidence": 0.95, # Default confidence
        "acknowledged": False,
        "dismissed": False
    }
    return _create_alert(alert_data)
