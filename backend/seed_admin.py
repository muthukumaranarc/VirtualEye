"""
VirtualEye — One-time Admin Seed Script
Run once to create the first ADMIN account.
Usage:
    .\\venv\\Scripts\\python seed_admin.py
"""

import os
from dotenv import load_dotenv
load_dotenv()

from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from datetime import datetime, timezone

MONGO_URI = os.getenv("VIRTUALEYE_MONGODB_URI", "").strip()
if not MONGO_URI:
    print("❌  VIRTUALEYE_MONGODB_URI is not set in .env — aborting.")
    exit(1)

# ── Prompt for admin details ───────────────────────────────────────────────
print("\n═══════════════════════════════════════")
print("  VirtualEye — Admin Account Setup")
print("═══════════════════════════════════════\n")

name     = input("Admin name     : ").strip() or "Admin"
email    = input("Admin email    : ").strip().lower()
password = input("Admin password : ").strip()

if not email or not password:
    print("❌  Email and password are required.")
    exit(1)

# ── Connect to MongoDB ─────────────────────────────────────────────────────
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    # Use the DB name from the URI if present, otherwise default to 'virtualeye'
    db = client.get_database()          # reads the dbname embedded in the URI
except Exception:
    # Fallback: connect and use explicit DB name
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    db = client["virtualeye"]

# ── Check for existing user ────────────────────────────────────────────────
existing = db.users.find_one({"email": email})
if existing:
    print(f"\n⚠️   A user with email '{email}' already exists (role: {existing.get('role')}).")
    print("    If you need to change their role to ADMIN, update the document in MongoDB Atlas.")
    exit(0)

# ── Insert ADMIN user ──────────────────────────────────────────────────────
doc = {
    "email":        email,
    "passwordHash": generate_password_hash(password),
    "name":         name,
    "role":         "ADMIN",
    "permissions": {
        "cameraAccess":   True,
        "alertAccess":    True,
        "userViewAccess": True,
    },
    "authProvider": "LOCAL",
    "createdAt":    datetime.now(timezone.utc),
}

result = db.users.insert_one(doc)
print(f"\n✅  ADMIN user created successfully!")
print(f"    Name  : {name}")
print(f"    Email : {email}")
print(f"    ID    : {result.inserted_id}")
print("\nYou can now log in at http://localhost:5173\n")
