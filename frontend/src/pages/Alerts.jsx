import { useState, useEffect } from 'react';
import { fetchAlertConfig, updateAlertConfig, fetchAlertHistory, triggerTestAlert } from '../api/apiClient';
import './Alerts.css';

export default function Alerts() {
  const [toggles, setToggles] = useState({
    motionDetects: true,
    humanDetects: true,
    cameraCovered: true
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial config and history
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [configRes, historyRes] = await Promise.all([
        fetchAlertConfig(),
        fetchAlertHistory()
      ]);
      if (configRes.data && configRes.data.toggles) {
        setToggles(configRes.data.toggles);
      }
      if (historyRes.data && historyRes.data.alerts) {
        setHistory(historyRes.data.alerts);
      }
    } catch (err) {
      console.error("Failed to fetch alerts data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    const newToggles = { ...toggles, [key]: !toggles[key] };
    setToggles(newToggles);
    try {
      await updateAlertConfig(newToggles);
    } catch (err) {
      console.error("Failed to update toggles", err);
      // Revert on error
      setToggles(toggles);
    }
  };

  const testTrigger = async (type, label) => {
    try {
      await triggerTestAlert(type, `Simulated: ${label}`);
      loadData(); // refresh history
    } catch (err) {
      console.error("Failed to trigger alert", err);
    }
  };

  if (loading) {
    return <div className="alerts-loading">Loading alerts data...</div>;
  }

  return (
    <main className="alerts-page">
      <header className="alerts-header">
        <h1>Alert Management</h1>
        <p>Configure what events trigger real-time notifications and review past incidents.</p>
      </header>

      <div className="alerts-layout">
        <section className="alerts-config">
          <h2>Alert Preferences</h2>
          <div className="toggle-list">
            <div className="toggle-item">
              <div className="toggle-info">
                <strong>Motion Detection</strong>
                <span>Notify when significant movement is detected.</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={toggles.motionDetects} 
                  onChange={() => handleToggle('motionDetects')} 
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <strong>Human Detection</strong>
                <span>AI notification when a person enters the frame.</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={toggles.humanDetects} 
                  onChange={() => handleToggle('humanDetects')} 
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <strong>Camera Occlusion</strong>
                <span>Notify if the camera lens is covered or blocked.</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={toggles.cameraCovered} 
                  onChange={() => handleToggle('cameraCovered')} 
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <div className="alert-test-actions">
            <h3>Test Alerts (Simulators)</h3>
            <div className="test-buttons">
              <button onClick={() => testTrigger('motionDetects', 'Motion detected in Sector 1!')} className="btn btn-outline" disabled={!toggles.motionDetects}>Test Motion</button>
              <button onClick={() => testTrigger('humanDetects', 'Intruder Alert: Person Detected')} className="btn btn-outline" disabled={!toggles.humanDetects}>Test Human</button>
              <button onClick={() => testTrigger('cameraCovered', 'Alert: Camera was blinded')} className="btn btn-outline" disabled={!toggles.cameraCovered}>Test Occlusion</button>
            </div>
            <p className="test-hint">Testing is disabled if the alert is toggled off.</p>
          </div>
        </section>

        <section className="alerts-history">
          <h2>Incident History</h2>
          {history.length === 0 ? (
            <div className="empty-history">No alerts recorded yet.</div>
          ) : (
            <ul className="history-list">
              {history.map((alert, idx) => (
                <li key={idx} className="history-item">
                  <div className="history-icon" data-type={alert.type}>
                    {alert.type === 'humanDetects' ? '👤' : alert.type === 'motionDetects' ? '🏃' : '📷'}
                  </div>
                  <div className="history-details">
                    <p className="history-msg">{alert.message}</p>
                    <span className="history-time">{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
