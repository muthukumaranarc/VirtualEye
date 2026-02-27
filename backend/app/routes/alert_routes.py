from flask import Blueprint, jsonify, request
from .auth_routes import jwt_required, get_jwt_identity
from ..extensions import mongo
from datetime import datetime

alert_bp = Blueprint("alert_bp", __name__)

# Default config if no configured toggles
DEFAULT_TOGGLES = {
    "motionDetects": True,
    "humanDetects": True,
    "cameraCovered": True
}

@alert_bp.route("/alerts/config", methods=["GET"])
@jwt_required()
def get_config():
    """Gets the user or global alert toggles."""
    user_id = get_jwt_identity()
    cfg = mongo.db.alert_configs.find_one({"userId": user_id}, {"_id": 0})
    if not cfg:
        # Default fallback
        cfg = {"userId": user_id, "toggles": DEFAULT_TOGGLES}
        mongo.db.alert_configs.insert_one(cfg)
        cfg.pop("_id", None)
    return jsonify(cfg), 200

@alert_bp.route("/alerts/config", methods=["PUT"])
@jwt_required()
def update_config():
    """Updates the user alert toggles."""
    user_id = get_jwt_identity()
    data = request.json
    toggles = data.get("toggles", {})
    
    mongo.db.alert_configs.update_one(
        {"userId": user_id},
        {"$set": {"toggles": toggles}},
        upsert=True
    )
    return jsonify({"message": "Alert configuration updated.", "toggles": toggles}), 200

@alert_bp.route("/alerts/history", methods=["GET"])
@jwt_required()
def get_history():
    """Retrieves recent alerts."""
    # Assuming alerts are stored in db.alerts
    alerts = list(mongo.db.alerts.find({}, {"_id": 0}).sort("timestamp", -1).limit(50))
    return jsonify({"alerts": alerts}), 200

@alert_bp.route("/alerts/trigger", methods=["POST"])
@jwt_required()
def trigger_alert():
    """Endpoint for the AI module or tests to trigger an alert if toggled ON."""
    data = request.json
    alert_type = data.get("type") # "motionDetects", "humanDetects", "cameraCovered"
    message = data.get("message", "Incoming Alert")

    # Fetch global or system-wide toggles
    # For simplicity, we just check against the triggering user's config
    user_id = get_jwt_identity()
    cfg = mongo.db.alert_configs.find_one({"userId": user_id})
    toggles = getattr(cfg, "toggles", DEFAULT_TOGGLES) if cfg and "toggles" in cfg else DEFAULT_TOGGLES

    # Check if the alert type is toggled ON
    if toggles.get(alert_type, True):
        alert_event = {
            "type": alert_type,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "viewed": False
        }
        mongo.db.alerts.insert_one(alert_event)
        alert_event.pop("_id", None)
        return jsonify({"message": "Alert registered", "alert": alert_event}), 201
    else:
        return jsonify({"message": "Alert ignored (toggled off)"}), 200

@alert_bp.route("/alerts/recent", methods=["GET"])
@jwt_required()
def get_recent_alerts():
    """Used for polling the newest unread alerts for the popup."""
    # This polls unviewed alerts
    alerts = list(mongo.db.alerts.find({"viewed": False}, {"_id": 0}).sort("timestamp", -1))
    # Mark them as viewed
    if alerts:
        mongo.db.alerts.update_many({"viewed": False}, {"$set": {"viewed": True}})
    return jsonify({"alerts": alerts}), 200
