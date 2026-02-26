from datetime import datetime
from bson import ObjectId
from flask import current_app
from ..extensions import mongo

def create_alert(confidence):
    alert = {
        "type": "HUMAN_DETECTED",
        "severity": get_severity(confidence),
        "confidence": confidence,
        "timestamp": datetime.utcnow()
    }

    result = mongo.db.alerts.insert_one(alert)
    return str(result.inserted_id)

def get_all_alerts(limit=20):
    alerts = list(
        mongo.db.alerts
        .find()
        .sort("timestamp", -1)
        .limit(limit)
    )

    for alert in alerts:
        alert["_id"] = str(alert["_id"])

    return alerts

def get_severity(confidence):
    if confidence > 0.85:
        return "HIGH"
    elif confidence > 0.60:
        return "MEDIUM"
    else:
        return "LOW"
