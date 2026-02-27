from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from .extensions import mongo, jwt
import os

load_dotenv()

def create_app():
    app = Flask(__name__, static_folder="../../frontend/dist", static_url_path="/")

    # ✅ FIX: Prevent trailing slash redirect issues (CRITICAL)
    app.url_map.strict_slashes = False

    # Proper CORS configuration
    CORS(
        app,
        resources={r"/api/*": {"origins": "http://localhost:5173"}},
        supports_credentials=True
    )

    # Load configuration
    app.config["MONGO_URI"] = os.environ.get("VIRTUALEYE_MONGODB_URI")
    app.config["SECRET_KEY"] = os.environ.get("VIRTUALEYE_SECRET_KEY")
    app.config["JWT_SECRET_KEY"] = os.environ.get("VIRTUALEYE_JWT_SECRET", "change-me")

    # Google OAuth Configuration
    app.config["VIRTUALEYE_GOOGLE_CLIENT_ID"] = os.environ.get("VIRTUALEYE_GOOGLE_CLIENT_ID")
    app.config["VIRTUALEYE_GOOGLE_CLIENT_SECRET"] = os.environ.get("VIRTUALEYE_GOOGLE_CLIENT_SECRET")
    app.config["VIRTUALEYE_GOOGLE_REDIRECT_URI"] = os.environ.get("VIRTUALEYE_GOOGLE_REDIRECT_URI")

    print("Google Client ID Loaded:", bool(app.config.get("VIRTUALEYE_GOOGLE_CLIENT_ID")))

    # Initialize MongoDB
    if app.config.get("MONGO_URI"):
        mongo.init_app(app)

    # Initialize JWT
    jwt.init_app(app)

    # Initialize default alert rules
    # with app.app_context():
    #     from .models.alert_rule_model import create_default_rules
    #     create_default_rules()

    # Register blueprints
    from .routes.auth_routes import auth_bp
    # from .routes.camera_routes import camera_bp  # Removed for Single ESP32 Camera Architecture
    from .routes.health_routes import health_bp
    from .routes.user_routes import user_bp
    from .routes.alert_routes import alert_bp
    # from .routes.camera_stream_routes import stream_bp  # Removed for Single ESP32 Camera Architecture

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    # app.register_blueprint(camera_bp, url_prefix="/api") # Removed for Single ESP32 Camera Architecture
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(alert_bp, url_prefix="/api")
    # app.register_blueprint(stream_bp) # Removed for Single ESP32 Camera Architecture

    @app.errorhandler(404)
    def not_found(e):
        if request.path.startswith("/api/"):
            return jsonify({"message": "Endpoint not found"}), 404
        return app.send_static_file("index.html")

    @app.route("/")
    def index():
        return app.send_static_file("index.html")

    # Old engine startup removed for Single ESP32 Camera Architecture

    return app

    # Engine moved to run.py to avoid early startup issues
    return app