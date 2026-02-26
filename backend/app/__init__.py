from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from .extensions import mongo, jwt
import os

load_dotenv()

def create_app():
    app = Flask(__name__)

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
    with app.app_context():
        from .models.alert_rule_model import create_default_rules
        create_default_rules()

    # Register blueprints
    from .routes.auth_routes import auth_bp
    from .routes.camera_routes import camera_bp
    from .routes.health_routes import health_bp
    from .routes.user_routes import user_bp
    from .routes.detection_routes import detection_bp
    from .routes.alert_routes import alert_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(camera_bp, url_prefix="/api")
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(detection_bp, url_prefix="/api/detection")
    app.register_blueprint(alert_bp, url_prefix="/api/alerts")

    @app.route("/")
    def index():
        from .services.camera_engine_controller import start_camera_engine
        start_camera_engine(app)
        return jsonify({"message": "VirtualEye Backend Running with Engine Triggered"}), 200

    # Engine moved to run.py to avoid early startup issues
    return app