"""
VirtualEye Backend - User Management Routes

GET    /api/users             — ADMIN: list all users; USER: list all (read-only)
DELETE /api/users/<userId>    — ADMIN only: delete a user
"""

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from ..models.user_model import get_all_users, delete_user_by_id, find_user_by_id, serialize_user

user_bp = Blueprint("users", __name__)


# ── GET /api/users ───────────────────────────────────────────────────────────
@user_bp.route("", methods=["GET"])
@jwt_required()
def get_users():
    """
    Return list of all users.
    Both ADMIN and USER can call this endpoint; USER is read-only (enforced on FE).
    """
    from ..models.user_model import get_all_users, serialize_user

    users = get_all_users()
    return jsonify({
        "users": [serialize_user(user) for user in users]
    }), 200


# ── DELETE /api/users/<userId> ───────────────────────────────────────────────
@user_bp.route("/<user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id: str):
    """
    Delete a user by ID. Only ADMIN role is permitted.
    An ADMIN cannot delete themselves.
    """
    claims = get_jwt()
    caller_id = get_jwt_identity()
    caller_role = claims.get("role")

    if caller_role != "ADMIN":
        return jsonify({"message": "Forbidden: ADMIN role required."}), 403

    if str(caller_id) == str(user_id):
        return jsonify({"message": "You cannot delete your own account."}), 400

    target = find_user_by_id(user_id)
    if not target:
        return jsonify({"message": "User not found."}), 404

    success = delete_user_by_id(user_id)
    if not success:
        return jsonify({"message": "Failed to delete user."}), 500

    return jsonify({"message": "User deleted successfully."}), 200
