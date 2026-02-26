"""
VirtualEye Backend - User Model
Provides helper functions to create, fetch, and validate user documents
stored in the MongoDB 'users' collection.
"""

from __future__ import annotations
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from flask import abort
from ..extensions import mongo


def _db():
    """Return the MongoDB database, or abort with 503 if not configured."""
    db = mongo.db
    if db is None:
        abort(503, description="Database is not configured. Set VIRTUALEYE_MONGODB_URI in backend/.env")
    return db


# ── Default permissions by role ────────────────────────────────────────────
DEFAULT_PERMISSIONS = {
    "ADMIN": {
        "cameraAccess": True,
        "userViewAccess": True,
    },
    "USER": {
        "cameraAccess": True,
        "userViewAccess": False,
    },
}


def create_user(
    email: str,
    name: str,
    role: str = "USER",
    password: str = None,
    auth_provider: str = "LOCAL",
    permissions: dict = None,
) -> dict:
    """
    Insert a new user document into the 'users' collection.
    Returns the inserted document id as a string.
    """
    password_hash = generate_password_hash(password) if password else None
    doc = {
        "email": email.lower().strip(),
        "passwordHash": password_hash,
        "name": name,
        "role": role.upper(),
        "permissions": permissions or DEFAULT_PERMISSIONS.get(role.upper(), DEFAULT_PERMISSIONS["USER"]),
        "authProvider": auth_provider.upper(),
        "createdAt": datetime.now(timezone.utc),
    }
    result = _db().users.insert_one(doc)
    return str(result.inserted_id)


def find_user_by_email(email: str) -> Optional[dict]:
    """Return a user document by email (case-insensitive), or None."""
    return _db().users.find_one({"email": email.lower().strip()})


def find_user_by_id(user_id: str) -> Optional[dict]:
    """Return a user document by its MongoDB _id string, or None."""
    try:
        return _db().users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


def delete_user_by_id(user_id: str) -> bool:
    """Delete a user by ID. Returns True if a document was deleted."""
    try:
        result = _db().users.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count == 1
    except Exception:
        return False


def get_all_users() -> List[dict]:
    """Return all user documents (without passwordHash)."""
    users = _db().users.find({}, {"passwordHash": 0})
    return [_serialize(u) for u in users]


def verify_password(user: dict, password: str) -> bool:
    """Check a plaintext password against the stored hash."""
    pw_hash = user.get("passwordHash")
    if not pw_hash:
        return False
    return check_password_hash(pw_hash, password)


def serialize_user(user: dict) -> dict:
    """Convert a raw MongoDB user doc to a JSON-safe dict (no passwordHash)."""
    return _serialize(user)


# ── Internal helper ────────────────────────────────────────────────────────
def _serialize(user: dict) -> dict:
    """Convert ObjectId/_id to string and remove passwordHash."""
    doc = {k: v for k, v in user.items() if k != "passwordHash"}
    doc["_id"] = str(doc["_id"])
    if isinstance(doc.get("createdAt"), datetime):
        doc["createdAt"] = doc["createdAt"].isoformat()
    return doc
