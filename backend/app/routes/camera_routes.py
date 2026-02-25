from flask import Blueprint, jsonify
import os
import requests

camera_bp = Blueprint("camera", __name__)

SIMULATOR_STREAM_PATH = "/stream"


@camera_bp.route("/stream-url", methods=["GET"])
def get_stream_url():
    """
    Return camera base URL.
    Frontend will append /stream automatically.
    """
    base_url = os.environ.get(
        "VIRTUALEYE_CAMERA_STREAM_URL",
        "http://localhost:81"
    )

    return jsonify({
        "streamUrl": base_url,
        "streamEndpoint": f"{base_url}{SIMULATOR_STREAM_PATH}",
        "mode": "simulator"
    })


@camera_bp.route("/status", methods=["GET"])
def get_camera_status():
    """
    Check camera simulator availability.
    """
    base_url = os.environ.get(
        "VIRTUALEYE_CAMERA_STREAM_URL",
        "http://localhost:81"
    )

    stream_url = f"{base_url}{SIMULATOR_STREAM_PATH}"

    try:
        # We use stream=True and close immediately to check if the MJPEG stream is reachable
        response = requests.get(stream_url, timeout=2, stream=True)

        if response.status_code == 200:
            return jsonify({
                "online": True,
                "streamUrl": base_url,
                "mode": "simulator"
            })

    except Exception:
        pass

    return jsonify({
        "online": False,
        "streamUrl": base_url,
        "mode": "simulator"
    })
