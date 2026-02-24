"""
VirtualEye Backend - Health Check Routes
"""

from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """
    GET /api/health
    Returns backend service status.
    """
    return jsonify({"status": "ok", "service": "VirtualEye backend"}), 200
