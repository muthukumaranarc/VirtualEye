"""
VirtualEye Backend - Configuration
Loads all settings from environment variables prefixed with VIRTUALEYE_
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

# Load .env file from the backend directory
load_dotenv()


class Config:
    """Base configuration class."""

    # MongoDB Atlas connection URI
    MONGO_URI: str = os.getenv("VIRTUALEYE_MONGODB_URI", "")

    # Backend URL (used for self-reference / CORS headers)
    VIRTUALEYE_BACKEND_URL: str = os.getenv(
        "VIRTUALEYE_BACKEND_URL", "http://localhost:5000"
    )

    # Frontend URL (used to configure CORS allowed origins)
    VIRTUALEYE_FRONTEND_URL: str = os.getenv(
        "VIRTUALEYE_FRONTEND_URL", "http://localhost:5173"
    )

    # Flask secret key
    SECRET_KEY: str = os.getenv("VIRTUALEYE_SECRET_KEY", "change-me-in-production")

    # Disable debug mode by default; overridden by run.py for dev
    DEBUG: bool = os.getenv("FLASK_DEBUG", "false").lower() == "true"

    # ── JWT Configuration ──────────────────────────────────────
    JWT_SECRET_KEY: str = os.getenv("VIRTUALEYE_JWT_SECRET", "change-jwt-secret-in-production")
    JWT_ACCESS_TOKEN_EXPIRES: timedelta = timedelta(hours=8)
    JWT_TOKEN_LOCATION: list = ["headers"]
    JWT_HEADER_NAME: str = "Authorization"
    JWT_HEADER_TYPE: str = "Bearer"

    # ── Google OAuth2 ──────────────────────────────────────────
    VIRTUALEYE_GOOGLE_CLIENT_ID: str = os.getenv("VIRTUALEYE_GOOGLE_CLIENT_ID", "")
    VIRTUALEYE_GOOGLE_CLIENT_SECRET: str = os.getenv("VIRTUALEYE_GOOGLE_CLIENT_SECRET", "")
    VIRTUALEYE_GOOGLE_REDIRECT_URI: str = os.getenv(
        "VIRTUALEYE_GOOGLE_REDIRECT_URI",
        "http://localhost:5000/api/auth/google/callback"
    )
