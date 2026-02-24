"""
VirtualEye Backend - Flask Extensions
Centralised extension initialisation (imported by the app factory).
"""

from flask_pymongo import PyMongo
from flask_cors import CORS

# PyMongo instance — configured with MONGO_URI via init_app()
mongo = PyMongo()

# CORS instance — configured with allowed origins via init_app()
cors = CORS()
