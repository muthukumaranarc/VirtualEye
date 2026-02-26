import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import AlertModal from "./AlertModal";

export default function AlertMonitor() {
    const [showAlert, setShowAlert] = useState(false);
    const [alertsEnabled, setAlertsEnabled] = useState(true);
    const [lastAlertId, setLastAlertId] = useState(null);

    const checkNewAlerts = async () => {
        if (!alertsEnabled) return;

        try {
            const response = await apiClient.get("/alerts");
            const alerts = response.data.alerts;

            if (alerts.length === 0) return;

            const newestAlert = alerts[0];

            if (newestAlert._id !== lastAlertId) {
                setLastAlertId(newestAlert._id);
                setShowAlert(true);

                const audio = new Audio("/alert.mp3");
                audio.play();
            }
        } catch (err) {
            console.error("Alert polling failed", err);
        }
    };

    useEffect(() => {
        const interval = setInterval(checkNewAlerts, 5000);

        return () => clearInterval(interval);
    }, [lastAlertId, alertsEnabled]);

    return (
        <>
            <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
                <button
                    onClick={() => setAlertsEnabled(!alertsEnabled)}
                    style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "none",
                        background: alertsEnabled ? "#16a34a" : "#6b7280",
                        color: "white",
                        cursor: "pointer"
                    }}
                >
                    Alerts {alertsEnabled ? "ON" : "OFF"}
                </button>
            </div>

            {showAlert && alertsEnabled && (
                <AlertModal onClose={() => setShowAlert(false)} />
            )}
        </>
    );
}
