import cv2
import time
from ..extensions import mongo

def get_camera_capture(camera):
    camera_type = camera.get("type")
    camera_url = camera.get("url")
    camera_id = camera.get("cameraId")

    # If it's the laptop camera and we are in simulation mode
    from config.camera_config import PRIMARY_CAMERA
    source = PRIMARY_CAMERA["url"]
    print(f"[Stream] Initializing {camera_id} via ESP32: {source}", flush=True)
    return cv2.VideoCapture(source, cv2.CAP_FFMPEG)


def generate_frames(camera_id):
    # Find camera in DB
    camera = mongo.db.cameras.find_one({"cameraId": camera_id})

    if not camera:
        print(f"[Stream] Camera {camera_id} not found in DB", flush=True)
        return

    # Retry loop to open camera
    cap = None
    for attempt in range(5):
        cap = get_camera_capture(camera)
        if cap.isOpened():
            break
        print(f"[Stream] Attempt {attempt+1} to open {camera_id} failed", flush=True)
        cap.release()
        time.sleep(2)
    
    if not cap or not cap.isOpened():
        print(f"[Stream] Could not open stream for {camera_id} after retries", flush=True)
        return

    print(f"[Stream] Sending frames for {camera_id}...", flush=True)

    try:
        while True:
            success, frame = cap.read()
            if not success:
                # If frame fails, wait a bit and retry
                print(f"[Stream] Frame read fail for {camera_id}, retrying read...", flush=True)
                time.sleep(0.5)
                # Check if camera still opened
                if not cap.isOpened():
                    break
                continue

            # Encode frame as JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue

            frame_bytes = buffer.tobytes()

            # Yield in MJPEG format
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    except Exception as e:
        print(f"[Stream] Error in stream generation for {camera_id}: {e}", flush=True)
    finally:
        if cap:
            cap.release()
        print(f"[Stream] Stream connection closed for {camera_id}", flush=True)
