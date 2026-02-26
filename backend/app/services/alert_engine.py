from datetime import datetime
from ..models.alert_model import create_alert
from ..models.alert_rule_model import get_rule
from ..extensions import mongo

class AlertEngine:
    """
    Centralized Alert Engine to process detection events,
    evaluate rules, handle cooldown, and store alerts.
    """

    @staticmethod
    def process_alert(alert_type, camera_id, confidence):
        """
        Processes a potential alert based on type, camera ID and confidence.
        """
        
        # 1. Get alert rule
        rule = get_rule(alert_type)
        if not rule:
            # If no rule exists, it's not set up to alert
            return None
        
        # 2. If rule disabled → exit
        if not rule.get("enabled", False):
            return None
        
        # 3. Check cooldown using recent alerts
        # Look for the last alert of the same type for this camera
        last_alert = mongo.db.alerts.find_one(
            {"type": alert_type, "cameraId": camera_id},
            sort=[("timestamp", -1)]
        )
        
        if last_alert:
            cooldown_seconds = rule.get("cooldown", 0)
            time_since_last = (datetime.utcnow() - last_alert["timestamp"]).total_seconds()
            
            # 4. If cooldown not expired → exit
            if time_since_last < cooldown_seconds:
                return None
        
        # 5. Create alert document
        alert_doc = {
            "cameraId": camera_id,
            "type": alert_type,
            "confidence": confidence,
            "timestamp": datetime.utcnow(),
            "acknowledged": False,
            "dismissed": False
        }
        
        # 6. Save alert using alert_model.create_alert()
        # Using imported create_alert
        new_alert = create_alert(alert_doc)
        
        # 7. Log alert creation
        # [AlertEngine] Alert created: HUMAN_DETECTED confidence=0.91
        print(f"[AlertEngine] Alert created: {alert_type} confidence={confidence}")
        
        return new_alert
