from dotenv import load_dotenv
load_dotenv()

from app import create_app
from flask_cors import CORS
from app.services.camera_simulator import start_simulator_thread

app = create_app()

# Enable CORS globally
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

if __name__ == "__main__":
    print("[VirtualEye] Starting Backend...")

    # Start simulator ONLY ONCE
    start_simulator_thread()

    # CRITICAL: disable reloader to prevent restart loop
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
        use_reloader=False,
        threaded=True
    )