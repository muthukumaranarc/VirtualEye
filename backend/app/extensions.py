"""
VirtualEye Backend - Flask Extensions
Centralised extension initialisation (imported by the app factory).
"""

from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager

# PyMongo instance — configured with MONGO_URI via init_app()
mongo = PyMongo()

# JWT Manager — handles token creation and verification
jwt = JWTManager()
