from flask import Blueprint, request, jsonify
import os
import requests
from ..extensions import mongo
from ..models.camera_model import create_camera, serialize_camera

camera_bp = Blueprint("camera_bp", __name__)

# --- LEGACY ROUTES (Maintains compatibility with current Cameras.jsx via /api/camera/...) ---
SIMULATOR_STREAM_PATH = "/stream"

@camera_bp.route("/camera/stream-url", methods=["GET"])
def get_stream_url():
    """Returns camera base URL."""
    base_url = os.environ.get("VIRTUALEYE_CAMERA_STREAM_URL", "http://localhost:81")
    return jsonify({
        "streamUrl": base_url,
        "streamEndpoint": f"{base_url}{SIMULATOR_STREAM_PATH}",
        "mode": "simulator"
    })

@camera_bp.route("/camera/status", methods=["GET"])
def get_camera_status():
    """Checks camera simulator availability."""
    base_url = os.environ.get("VIRTUALEYE_CAMERA_STREAM_URL", "http://localhost:81")
    stream_url = f"{base_url}{SIMULATOR_STREAM_PATH}"
    try:
        response = requests.get(stream_url, timeout=2, stream=True)
        if response.status_code == 200:
            return jsonify({
                "online": True,
                "streamUrl": base_url,
                "mode": "simulator"
            })
    except Exception:
        pass
    return jsonify({"online": False, "streamUrl": base_url, "mode": "simulator"})


# --- NEW REGISTRY ROUTES (Module 9: accessible via /api/cameras) ---

# ADD CAMERA
@camera_bp.route("/cameras", methods=["POST"])
def add_camera():
    data = request.json
    required = ["name", "location", "type", "url"]

    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    camera = create_camera(data)
    mongo.db.cameras.insert_one(camera)
    return jsonify({"message": "Camera added successfully"}), 201

# GET ALL CAMERAS
@camera_bp.route("/cameras", methods=["GET"])
def get_cameras():
    result = []
    for cam in mongo.db.cameras.find():
        result.append(serialize_camera(cam))
    return jsonify(result), 200

# UPDATE CAMERA STATUS
@camera_bp.route("/cameras/<cameraId>/status", methods=["PUT"])
def update_status(cameraId):
    data = request.json
    if "status" not in data:
        return jsonify({"error": "status is required"}), 400

    if data["status"] not in ["ACTIVE", "INACTIVE"]:
        return jsonify({"error": "Invalid status"}), 400

    mongo.db.cameras.update_one(
        {"cameraId": cameraId},
        {"$set": {"status": data["status"]}}
    )
    return jsonify({"message": "Camera status updated"}), 200

# DELETE CAMERA
@camera_bp.route("/cameras/<cameraId>", methods=["DELETE"])
def delete_camera(cameraId):
    mongo.db.cameras.delete_one({"cameraId": cameraId})
    return jsonify({"message": "Camera deleted"}), 200
