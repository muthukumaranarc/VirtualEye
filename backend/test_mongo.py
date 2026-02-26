from app import create_app
from app.extensions import mongo

app = create_app()
with app.app_context():
    print(f"Mongo: {mongo}")
    print(f"Mongo DB: {mongo.db}")
    if mongo.db is not None:
        print(f"Collections: {mongo.db.list_collection_names()}")
