from app import create_app
from controllers.primary_camera_controller import start_primary_camera
from routes.primary_camera_stream import stream_bp
import os

app = create_app()

# Register new stream route
app.register_blueprint(stream_bp)

# Start Primary Camera Engine
start_primary_camera()

if __name__ == "__main__":
    print("Primary ESP32 Camera Engine Started")
    # CRITICAL: disable reloader to prevent restart loop
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
        use_reloader=False,
        threaded=True
    )
