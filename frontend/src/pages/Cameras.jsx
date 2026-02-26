import "../styles/Cameras.css";

export default function Cameras() {
  return (
    <div className="cameras-page">
      <header className="cameras-header">
        <div className="header-icon">🛡️</div>
        <h1>Primary Surveillance Feed</h1>
        <p>Live ESP32-CAM monitoring with real-time human detection engine active.</p>
      </header>

      <div className="single-camera-container">
        <div className="camera-card primary">
          <div className="camera-card-header">
            <div className="status-group">
              <span className="live-indicator">● LIVE</span>
              <h3>Main Surveillance Cam</h3>
            </div>
            <span className="status-badge active">ONLINE</span>
          </div>
          
          <div className="camera-stream-container">
            <img
              src="http://localhost:5000/api/primary-camera/stream"
              alt="ESP32 Surveillance Camera"
              className="live-video"
              width="100%"
            />
            <div className="stream-overlay">
              <div className="overlay-top">
                <span className="location-tag">📍 Main Area</span>
                <span className="camera-id-tag">ID: PRIMARY_CAM</span>
              </div>
            </div>
          </div>

          <div className="camera-footer">
            <div className="stat">
              <span className="label">Engine</span>
              <span className="value">AI ACTIVE</span>
            </div>
            <div className="stat">
              <span className="label">Type</span>
              <span className="value">ESP32_CAM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
