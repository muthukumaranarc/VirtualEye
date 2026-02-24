"""
VirtualEye Backend - Flask Application Factory
"""

from flask import Flask, jsonify
from .config import Config
from .extensions import mongo, cors, jwt


def create_app(config_class=Config):
    """
    Application factory pattern for VirtualEye Flask backend.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    # Only connect PyMongo when a URI is configured (avoids crash in local dev with empty URI)
    if app.config.get("MONGO_URI"):
        mongo.init_app(app)
    else:
        import warnings
        warnings.warn(
            "VIRTUALEYE_MONGODB_URI is not set. MongoDB connection is DISABLED. "
            "Set it in backend/.env to enable database features.",
            RuntimeWarning,
        )

    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config.get("VIRTUALEYE_FRONTEND_URL", "*")}},
        supports_credentials=True,
    )

    jwt.init_app(app)

    # ── JWT error handlers ──────────────────────────────────────────────────
    @jwt.unauthorized_loader
    def unauthorized_response(err):
        return jsonify({"message": "Missing or invalid Authorization token."}), 401

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_payload):
        return jsonify({"message": "Token has expired. Please log in again."}), 401

    @jwt.invalid_token_loader
    def invalid_token_response(err):
        return jsonify({"message": "Invalid token."}), 422

    # Register blueprints
    from .routes.health_routes import health_bp
    from .routes.auth_routes import auth_bp
    from .routes.user_routes import user_bp

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(user_bp, url_prefix="/api")

    return app
