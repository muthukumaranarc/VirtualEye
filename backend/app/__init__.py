"""
VirtualEye Backend - Flask Application Factory
"""

from flask import Flask
from .config import Config
from .extensions import mongo, cors


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
    )

    # Register blueprints
    from .routes.health_routes import health_bp
    app.register_blueprint(health_bp, url_prefix="/api")

    return app
