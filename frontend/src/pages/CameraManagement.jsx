import { useEffect, useState, useCallback } from "react";
import apiClient from "../api/apiClient";
import "./Cameras.css"; // Reuse existing styles or create new ones

export default function CameraManagement() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    location: "",
    type: "LAPTOP_CAM",
    url: "0"
  });

  const fetchCameras = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/cameras");
      setCameras(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch cameras:", err);
      setError("Failed to load camera registry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  const addCamera = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post("/cameras", form);
      setForm({ name: "", location: "", type: "LAPTOP_CAM", url: "0" });
      fetchCameras();
    } catch (err) {
      setError("Failed to add camera.");
    }
  };

  const toggleStatus = async (cameraId, currentStatus) => {
    try {
      await apiClient.put(`/cameras/${cameraId}/status`, {
        status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
      });
      fetchCameras();
    } catch (err) {
      setError("Failed to update camera status.");
    }
  };

  const deleteCamera = async (cameraId) => {
    if (!window.confirm("Are you sure you want to delete this camera?")) return;
    try {
      await apiClient.delete(`/cameras/${cameraId}`);
      fetchCameras();
    } catch (err) {
      setError("Failed to delete camera.");
    }
  };

  return (
    <main className="camera-page">
      <header className="camera-page__header animate-fade-in-up">
        <div className="camera-page__title-wrap">
          <h1 className="camera-page__title">Camera Management</h1>
          <p className="camera-page__subtitle">Centralized Registry & Control</p>
        </div>
      </header>

      {error && (
        <div className="alert alert--error animate-fade-in-up">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <section className="camera-page__content animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="detail-card" style={{ marginBottom: '2rem' }}>
          <h3>Add New Camera</h3>
          <form className="modal__form" onSubmit={addCamera} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group">
              <label className="form-label">Camera Name</label>
              <input
                className="form-input"
                placeholder="e.g. Front Gate"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-input"
                placeholder="e.g. Main Entrance"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stream URL / ID</label>
              <input
                className="form-input"
                placeholder="0 or IP URL"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="LAPTOP_CAM">Laptop Camera</option>
                <option value="ESP32_CAM">ESP32 Cam</option>
                <option value="IP_CAM">IP Camera</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem' }}>Add Camera</button>
          </form>
        </div>

        <div className="camera-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {loading ? (
            <p>Loading registry...</p>
          ) : cameras.length === 0 ? (
            <div className="stream-offline" style={{ gridColumn: '1/-1' }}>
              <p>No cameras registered yet.</p>
            </div>
          ) : (
            cameras.map((cam) => (
              <div key={cam.cameraId} className="detail-card animate-fade-in" style={{ borderLeft: `4px solid ${cam.status === 'ACTIVE' ? '#10b981' : '#6b7280'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{cam.name}</h3>
                    <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cam.cameraId}</code>
                  </div>
                  <span className={`status-indicator status-indicator--${cam.status === 'ACTIVE' ? 'online' : 'offline'}`}>
                    {cam.status}
                  </span>
                </div>
                
                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <p><strong>Location:</strong> {cam.location}</p>
                  <p><strong>Type:</strong> {cam.type}</p>
                  <p><strong>Source:</strong> <code>{cam.url}</code></p>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    className={`btn ${cam.status === 'ACTIVE' ? 'btn-outline' : 'btn-primary'} btn-sm`}
                    style={{ flex: 1 }}
                    onClick={() => toggleStatus(cam.cameraId, cam.status)}
                  >
                    {cam.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    className="btn btn-ghost-danger btn-sm"
                    onClick={() => deleteCamera(cam.cameraId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
