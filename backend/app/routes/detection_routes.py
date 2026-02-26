from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..ai.detection_service import detect_humans
from ..services.alert_engine import AlertEngine

detection_bp = Blueprint("detection", __name__)

@detection_bp.route("/detect", methods=["GET"])
@jwt_required()
def detect():
    result = detect_humans()
    
    # Step 4: Call AlertEngine when human is detected
    if result.get("success") and result.get("humanDetected"):
        AlertEngine.process_alert(
            alert_type="HUMAN_DETECTED",
            camera_id="SIM_CAM_001",
            confidence=result.get("confidence", 0)
        )
        
    return jsonify(result), 200
