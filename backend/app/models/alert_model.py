from datetime import datetime
from bson import ObjectId
from flask import current_app
from ..extensions import mongo

def create_alert(alert_data):
    """
    Creates a new alert in MongoDB.
    Structure:
    {
      cameraId: string
      type: string
      confidence: number
      timestamp: datetime
      acknowledged: boolean
      dismissed: boolean
    }
    """
    if "timestamp" not in alert_data:
        alert_data["timestamp"] = datetime.utcnow()
    
    alert_data.setdefault("acknowledged", False)
    alert_data.setdefault("dismissed", False)
    
    result = mongo.db.alerts.insert_one(alert_data)
    alert_data["_id"] = str(result.inserted_id)
    return alert_data

def get_recent_alerts(limit=50):
    """Returns the last N alerts."""
    alerts = list(
        mongo.db.alerts
        .find()
        .sort("timestamp", -1)
        .limit(limit)
    )
    for alert in alerts:
        alert["_id"] = str(alert["_id"])
    
    return alerts

def get_unacknowledged_alerts():
    """Returns all alerts that haven't been acknowledged."""
    alerts = list(
        mongo.db.alerts
        .find({"acknowledged": False})
        .sort("timestamp", -1)
    )
    for alert in alerts:
        alert["_id"] = str(alert["_id"])
    
    return alerts

def acknowledge_alert(alert_id):
    """Marks an alert as acknowledged."""
    try:
        result = mongo.db.alerts.update_one(
            {"_id": ObjectId(alert_id)},
            {"$set": {"acknowledged": True}}
        )
        return result.modified_count > 0
    except Exception:
        return False

def dismiss_alert(alert_id):
    """Marks an alert as dismissed."""
    try:
        result = mongo.db.alerts.update_one(
            {"_id": ObjectId(alert_id)},
            {"$set": {"dismissed": True}}
        )
        return result.modified_count > 0
    except Exception:
        return False
