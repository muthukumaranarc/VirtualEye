from flask import Blueprint, Response
from ..services.camera_stream_service import generate_frames

stream_bp = Blueprint("stream_bp", __name__)

@stream_bp.route("/api/cameras/<cameraId>/stream")
def stream_camera(cameraId):
    """
    Endpoint dedicated to live MJPEG streaming for a specific camera ID.
    Works independently of the detection engine threads.
    """
    print(f"[Streaming] Client connected to camera {cameraId}", flush=True)
    return Response(
        generate_frames(cameraId),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )
