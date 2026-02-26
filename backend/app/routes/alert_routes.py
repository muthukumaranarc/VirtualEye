from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from ..models.alert_model import get_all_alerts

alert_bp = Blueprint("alerts", __name__)

@alert_bp.route("", methods=["GET"])
@jwt_required()
def list_alerts():
    alerts = get_all_alerts()

    return jsonify({
        "alerts": alerts
    }), 200
