import cv2
from flask import Blueprint, Response
from config.camera_config import PRIMARY_CAMERA

stream_bp = Blueprint("primary_stream", __name__)


def generate():

    url = PRIMARY_CAMERA["url"]

    print(f"Streaming from ESP32: {url}")

    cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)

    if not cap.isOpened():
        print("Stream failed to open")
        return

    while True:

        success, frame = cap.read()

        if not success:

            print("Stream reconnecting...")
            cap.release()
            time.sleep(1)
            cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)
            continue


        ret, buffer = cv2.imencode('.jpg', frame)

        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()


@stream_bp.route("/api/primary-camera/stream")
def stream():

    return Response(
        generate(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )
