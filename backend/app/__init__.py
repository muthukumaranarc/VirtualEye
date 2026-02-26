from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from .extensions import mongo, jwt
import os

# Load .env variables before app creation
load_dotenv()

def create_app():
    app = Flask(__name__)

    # Enable CORS globally
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Load configuration
    app.config["MONGO_URI"] = os.environ.get("VIRTUALEYE_MONGODB_URI")
    app.config["SECRET_KEY"] = os.environ.get("VIRTUALEYE_SECRET_KEY")
    app.config["JWT_SECRET_KEY"] = os.environ.get("VIRTUALEYE_JWT_SECRET", "change-me")



    # Google OAuth Configuration
    app.config["VIRTUALEYE_GOOGLE_CLIENT_ID"] = os.environ.get("VIRTUALEYE_GOOGLE_CLIENT_ID")
    app.config["VIRTUALEYE_GOOGLE_CLIENT_SECRET"] = os.environ.get("VIRTUALEYE_GOOGLE_CLIENT_SECRET")
    app.config["VIRTUALEYE_GOOGLE_REDIRECT_URI"] = os.environ.get("VIRTUALEYE_GOOGLE_REDIRECT_URI")

    # Safety Print
    print("Google Client ID Loaded:", bool(app.config.get("VIRTUALEYE_GOOGLE_CLIENT_ID")))

    # Initialize extensions
    if app.config.get("MONGO_URI"):
        mongo.init_app(app)

    jwt.init_app(app)

    # Register blueprints
    from .routes.auth_routes import auth_bp
    from .routes.camera_routes import camera_bp
    from .routes.health_routes import health_bp
    from .routes.user_routes import user_bp
    from .routes.detection_routes import detection_bp
    from .routes.alert_routes import alert_bp


    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(camera_bp, url_prefix="/api/camera")
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(detection_bp, url_prefix="/api/detection")
    app.register_blueprint(alert_bp, url_prefix="/api/alerts")


    @app.route("/")
    def index():
        return jsonify({"message": "VirtualEye Backend Running"}), 200

    return app