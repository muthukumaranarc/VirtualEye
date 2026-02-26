import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import "./Alerts.css";

export default function Alerts() {
const [alerts, setAlerts] = useState([]);
const [loading, setLoading] = useState(true);

const fetchAlerts = async () => {
    try {
        const response = await apiClient.get("/alerts");
        setAlerts(response.data.alerts);
    } catch (err) {
        console.error("Failed to fetch alerts", err);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
}, []);

const getSeverityClass = (severity) => {
    if (severity === "HIGH") return "alert-high";
    if (severity === "MEDIUM") return "alert-medium";
    return "alert-low";
};

return (
    <div className="alerts-page">
        <h1>VirtualEye Alerts</h1>
        {loading && <p>Loading alerts...</p>}
        <div className="alerts-list">
            {alerts.length === 0 && <p>No alerts yet.</p>}
            {alerts.map(alert => (
                <div
                    key={alert._id}
                    className={`alert-card ${getSeverityClass(alert.severity)}`}
                >
                    <div className="alert-header">
                        <span className="alert-type">
                            {alert.type}
                        </span>
                        <span className="alert-severity">
                            {alert.severity}
                        </span>
                    </div>
                    <div className="alert-body">
                        Confidence: {(alert.confidence * 100).toFixed(1)}%
                    </div>
                    <div className="alert-time">
                        {new Date(alert.timestamp).toLocaleString()}
                    </div>
                </div>
            ))}
        </div>
    </div>
);
}
