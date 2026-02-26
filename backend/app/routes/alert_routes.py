from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models.alert_model import (
    get_recent_alerts, 
    get_unacknowledged_alerts, 
    acknowledge_alert, 
    dismiss_alert
)

alert_bp = Blueprint("alerts", __name__)

@alert_bp.route("/recent", methods=["GET"])
@jwt_required()
def recent_alerts():
    """Returns the last 50 alerts."""
    alerts = get_recent_alerts(limit=50)
    return jsonify({
        "success": True,
        "alerts": alerts
    }), 200

@alert_bp.route("/unacknowledged", methods=["GET"])
@jwt_required()
def unacknowledged_alerts():
    """Returns alerts that haven't been acknowledged."""
    alerts = get_unacknowledged_alerts()
    return jsonify({
        "success": True,
        "alerts": alerts
    }), 200

@alert_bp.route("/<alert_id>/acknowledge", methods=["POST"])
@jwt_required()
def acknowledge(alert_id):
    """Marks an alert as acknowledged."""
    success = acknowledge_alert(alert_id)
    return jsonify({
        "success": success,
        "message": "Alert acknowledged" if success else "Failed to acknowledge or alert not found"
    }), 200 if success else 404

@alert_bp.route("/<alert_id>/dismiss", methods=["POST"])
@jwt_required()
def dismiss(alert_id):
    """Marks an alert as dismissed."""
    success = dismiss_alert(alert_id)
    return jsonify({
        "success": success,
        "message": "Alert dismissed" if success else "Failed to dismiss or alert not found"
    }), 200 if success else 404
