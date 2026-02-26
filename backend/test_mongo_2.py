from app import create_app
from app.extensions import mongo
import os

print("Creating app...")
app = create_app()
print("App created.")

with app.app_context():
    print(f"Context active. Mongo: {mongo}")
    try:
        db = mongo.db
        print(f"Mongo DB proxy: {db}")
        if db is not None:
            # Try a simple operation
            print(f"Collections: {db.list_collection_names()}")
        else:
            print("ERROR: mongo.db is None")
    except Exception as e:
        import traceback
        traceback.print_exc()
