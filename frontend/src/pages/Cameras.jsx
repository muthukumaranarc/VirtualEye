import "../styles/Cameras.css";

export default function Cameras() {
  return (
    <div className="cameras-page">
      <header className="cameras-header">
        <div className="header-icon">🛡️</div>
        <h1>Primary Surveillance Feed</h1>
        <p>Live Laptop monitoring feed.</p>
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
              src="http://localhost:81/stream"
              alt="Laptop Surveillance Camera"
              className="live-video"
              width="100%"
            />
          </div>

          <div className="camera-footer">
            <div className="stat">
              <span className="label">Stream</span>
              <span className="value">ACTIVE</span>
            </div>
            <div className="stat">
              <span className="label">Type</span>
              <span className="value">LAPTOP_VE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
