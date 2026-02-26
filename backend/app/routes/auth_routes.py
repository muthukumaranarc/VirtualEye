"""
VirtualEye Backend - Authentication Routes

POST /api/auth/register       — ADMIN only: create a new user
POST /api/auth/login          — email + password login, returns JWT
GET  /api/auth/me             — return current user info (JWT required)
GET  /api/auth/google/login   — redirect to Google OAuth consent screen
GET  /api/auth/google/callback — handle Google OAuth callback
"""

from flask import Blueprint, request, jsonify, redirect, current_app, url_for
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
import requests as http_requests

from ..models.user_model import (
    create_user,
    find_user_by_email,
    find_user_by_id,
    verify_password,
    serialize_user,
)

auth_bp = Blueprint("auth", __name__)


# ── Helper: build JWT identity payload ─────────────────────────────────────
def _build_token_identity(user: dict) -> dict:
    return {
        "userId": str(user["_id"]),
        "email": user["email"],
        "role": user["role"],
        "permissions": user["permissions"],
    }


# ── POST /api/auth/register ─────────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
@jwt_required()
def register():
    """
    Create a new user. Only ADMIN role can call this endpoint.
    Body: { email, password, name, role (optional), permissions (optional) }
    """
    claims = get_jwt()
    identity = get_jwt_identity()

    # Support both identity stored as dict or sub-claim
    caller_role = claims.get("role") or (identity.get("role") if isinstance(identity, dict) else None)

    if caller_role != "ADMIN":
        return jsonify({"message": "Forbidden: ADMIN role required."}), 403

    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    name = data.get("name", "").strip()
    role = data.get("role", "USER").upper()
    permissions = data.get("permissions")  # optional override

    # Validation
    if not email or not password or not name:
        return jsonify({"message": "email, password, and name are required."}), 400
    if role not in ("ADMIN", "USER"):
        return jsonify({"message": "role must be ADMIN or USER."}), 400
    if find_user_by_email(email):
        return jsonify({"message": "A user with this email already exists."}), 409

    user_id = create_user(
        email=email,
        name=name,
        role=role,
        password=password,
        auth_provider="LOCAL",
        permissions=permissions,
    )
    return jsonify({"message": "User created successfully.", "userId": user_id}), 201


# ── POST /api/auth/login ────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate via email + password. Returns a JWT access token.
    Body: { email, password }
    """
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"message": "email and password are required."}), 400

    user = find_user_by_email(email)
    if not user or not verify_password(user, password):
        return jsonify({"message": "Invalid email or password."}), 401

    identity = _build_token_identity(user)
    token = create_access_token(
        identity=identity["userId"],
        additional_claims={
            "email": identity["email"],
            "role": identity["role"],
            "permissions": identity["permissions"],
        },
    )
    return jsonify({
        "token": token,
        "user": serialize_user(user),
    }), 200


# ── GET /api/auth/me ─────────────────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """Return the currently authenticated user's profile."""
    user_id = get_jwt_identity()
    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404
    return jsonify({"user": serialize_user(user)}), 200


# ── GET /api/auth/google/login ───────────────────────────────────────────────
@auth_bp.route("/google/login", methods=["GET"])
def google_login():
    """Redirect the browser to Google's OAuth 2.0 consent screen."""
    client_id = current_app.config["VIRTUALEYE_GOOGLE_CLIENT_ID"]
    redirect_uri = current_app.config["VIRTUALEYE_GOOGLE_REDIRECT_URI"]

    if not client_id:
        return jsonify({"message": "Google OAuth is not configured on this server."}), 503

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    }
    from urllib.parse import urlencode
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)
    return redirect(auth_url)


# ── GET /api/auth/google/callback ────────────────────────────────────────────
@auth_bp.route("/google/callback", methods=["GET"])
def google_callback():
    """
    Handle Google OAuth callback.
    Exchange code for tokens, fetch user info, provision account if needed,
    then redirect to frontend with JWT in URL fragment.
    """
    code = request.args.get("code")
    error = request.args.get("error")
    frontend_url = current_app.config.get("VIRTUALEYE_FRONTEND_URL", "http://localhost:5173")

    if error or not code:
        return redirect(f"{frontend_url}/login?error=google_oauth_cancelled")

    client_id = current_app.config["VIRTUALEYE_GOOGLE_CLIENT_ID"]
    client_secret = current_app.config["VIRTUALEYE_GOOGLE_CLIENT_SECRET"]
    redirect_uri = current_app.config["VIRTUALEYE_GOOGLE_REDIRECT_URI"]

    # Exchange authorization code for access token
    token_resp = http_requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        },
        timeout=10,
    )
    if not token_resp.ok:
        return redirect(f"{frontend_url}/login?error=google_token_exchange_failed")

    access_token = token_resp.json().get("access_token")

    # Fetch user profile from Google
    userinfo_resp = http_requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )
    if not userinfo_resp.ok:
        return redirect(f"{frontend_url}/login?error=google_userinfo_failed")

    google_user = userinfo_resp.json()
    email = google_user.get("email", "").lower().strip()
    name = google_user.get("name", email)

    if not email:
        return redirect(f"{frontend_url}/login?error=google_no_email")

    # Find the user; reject if not registered
    user = find_user_by_email(email)
    if not user:
        return redirect(f"{frontend_url}/login?error=google_unauthorized")

    identity = _build_token_identity(user)
    jwt_token = create_access_token(
        identity=identity["userId"],
        additional_claims={
            "email": identity["email"],
            "role": identity["role"],
            "permissions": identity["permissions"],
        },
    )

    # Redirect to frontend with token in query param (frontend stores it)
    return redirect(f"{frontend_url}/auth/callback?token={jwt_token}")
