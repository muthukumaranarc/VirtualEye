from app.ai.detection_service import detect_humans as _detect_humans

def detect_humans(frame):
    """Wrapper to match the boolean return expected by PrimaryCameraEngine."""
    result = _detect_humans(frame)
    return result.get("humanDetected", False)
