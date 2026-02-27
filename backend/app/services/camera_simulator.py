"""
VirtualEye Camera Simulator (Stable Version)
Opens webcam ONLY ONCE globally to prevent conflicts.
"""

import cv2
import threading
from flask import Flask, Response

simulator_app = Flask(__name__)

# ✅ OPEN CAMERA ONLY ONCE
camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not camera.isOpened():
    print("[Simulator] ERROR: Webcam could not be opened.")
else:
    print("[Simulator] Webcam opened successfully.")


def generate_frames():
    """
    Generate MJPEG stream without reopening camera.
    """
    global camera

    while True:
        success, frame = camera.read()

        if not success:
            continue

        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        yield (
            b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n' +
            frame_bytes +
            b'\r\n'
        )


@simulator_app.route('/')
def index():
    return "VirtualEye Camera Simulator Running"


@simulator_app.route('/stream')
def stream():
    return Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


def run_simulator():
    print("[Simulator] Running on http://localhost:81")
    simulator_app.run(
        host='0.0.0.0',
        port=81,
        debug=False,
        threaded=True,
        use_reloader=False
    )


def start_simulator_thread():
    thread = threading.Thread(target=run_simulator, daemon=True)
    thread.start()
    return thread