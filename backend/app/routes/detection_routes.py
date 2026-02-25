from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..ai.detection_service import detect_humans

detection_bp = Blueprint("detection", __name__)

@detection_bp.route("/detect", methods=["GET"])
@jwt_required()
def detect():
    result = detect_humans()
    return jsonify(result), 200
