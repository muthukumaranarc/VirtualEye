from ..extensions import mongo

def get_rule(alert_type):
    """
    Returns the alert rule for a specific type.
    """
    return mongo.db.alert_rules.find_one({"type": alert_type})

def create_default_rules():
    """
    Initializes default alert rules if they don't exist.
    """
    default_rules = [
        {"type": "HUMAN_DETECTED", "enabled": True, "cooldown": 10},
        {"type": "CAMERA_OFFLINE", "enabled": True, "cooldown": 30},
        {"type": "INTRUSION", "enabled": False, "cooldown": 15},
        {"type": "TAMPERING", "enabled": False, "cooldown": 15}
    ]
    
    for rule in default_rules:
        # Only insert if the rule type doesn't already exist
        existing = mongo.db.alert_rules.find_one({"type": rule["type"]})
        if not existing:
            mongo.db.alert_rules.insert_one(rule)
            print(f"[AlertRule] Default rule created: {rule['type']}")
