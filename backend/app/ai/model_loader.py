from ultralytics import YOLO

_model = None

def get_model():
    global _model
    if _model is None:
        _model = YOLO("yolov8n.pt")
    return _model
