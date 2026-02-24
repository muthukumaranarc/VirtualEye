"""
VirtualEye Backend - Configuration
Loads all settings from environment variables prefixed with VIRTUALEYE_
"""

import os
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

    # Flask secret key (not used for auth yet, included for future modules)
    SECRET_KEY: str = os.getenv("VIRTUALEYE_SECRET_KEY", "change-me-in-production")

    # Disable debug mode by default; overridden by run.py for dev
    DEBUG: bool = os.getenv("FLASK_DEBUG", "false").lower() == "true"
