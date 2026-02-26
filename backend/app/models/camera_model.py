from datetime import datetime
import uuid

def generate_camera_id():
    return f"CAM-{uuid.uuid4().hex[:6].upper()}"

def create_camera(data):

    return {
        "cameraId": generate_camera_id(),
        "name": data["name"],
        "location": data["location"],
        "type": data["type"],
        "url": data["url"],
        "status": "ACTIVE",
        "createdAt": datetime.utcnow()
    }

def serialize_camera(camera):

    return {
        "cameraId": camera["cameraId"],
        "name": camera["name"],
        "location": camera["location"],
        "type": camera["type"],
        "url": camera["url"],
        "status": camera["status"],
        "createdAt": camera["createdAt"]
    }
