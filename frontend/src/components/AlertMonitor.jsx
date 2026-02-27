import { useState, useEffect } from 'react';
import { fetchRecentAlerts } from '../api/apiClient';
import './AlertMonitor.css';

export default function AlertMonitor() {
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    // Poll for new unviewed alerts every 3 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetchRecentAlerts();
        const newAlerts = res.data?.alerts || [];
        if (newAlerts.length > 0) {
          // Add them to the active toast queue
          setActiveAlerts((prev) => [...prev, ...newAlerts]);
        }
      } catch (err) {
        // Silently fail, it will retry on next tick
      }
    }, 3000);

    // Auto-Simulator for Demonstration: Triggers an alert periodically if enabled
    const autoSimulatorInterval = setInterval(async () => {
      try {
        const { fetchAlertConfig, triggerTestAlert } = await import('../api/apiClient');
        const configRes = await fetchAlertConfig();
        const toggles = configRes.data?.toggles;
        if (toggles) {
          const activeTypes = [];
          if (toggles.motionDetects) activeTypes.push({ type: 'motionDetects', msg: 'Motion detected in perimeter.' });
          if (toggles.humanDetects) activeTypes.push({ type: 'humanDetects', msg: 'AI detected human presence.' });
          if (toggles.cameraCovered) activeTypes.push({ type: 'cameraCovered', msg: 'Camera occlusion detected.' });

          if (activeTypes.length > 0) {
            const randomAlert = activeTypes[Math.floor(Math.random() * activeTypes.length)];
            await triggerTestAlert(randomAlert.type, `Auto-Simulated: ${randomAlert.msg}`);
          }
        }
      } catch (err) {
        // Silently fail if not authenticated or error
      }
    }, 15000); // Triggers every 15 seconds

    return () => {
      clearInterval(interval);
      clearInterval(autoSimulatorInterval);
    };
  }, []);

  // Remove alert automatically after 5 seconds
  useEffect(() => {
    if (activeAlerts.length > 0) {
      const timers = activeAlerts.map((alert, idx) => 
        setTimeout(() => {
          removeAlert(idx);
        }, 5000)
      );

      return () => timers.forEach(clearTimeout);
    }
  }, [activeAlerts]);

  const removeAlert = (index) => {
    setActiveAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  if (activeAlerts.length === 0) return null;

  return (
    <div className="alert-toast-container">
      {activeAlerts.map((alert, idx) => (
        <div key={`${alert.timestamp}-${idx}`} className="alert-toast animate-slide-in">
          <div className="alert-toast__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="alert-toast__content">
            <strong>{alert.type === 'humanDetects' ? 'Human Detected' : alert.type === 'motionDetects' ? 'Motion Detected' : 'Camera Blocked'}</strong>
            <p>{alert.message}</p>
          </div>
          <button className="alert-toast__close" onClick={() => removeAlert(idx)}>
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
