/**
 * VirtualEye — Camera Streaming Page
 *
 * Displays live video stream from ESP32-CAM or Development Simulator.
 * Integrated with permission control and status monitoring.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchCameraStatus, fetchCameraStreamUrl } from '../api/apiClient';
import './Cameras.css';

export default function Cameras() {
    const { permissions } = useAuth();
    const [cameraData, setCameraData] = useState(null);
    const [streamUrl, setStreamUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadCameraData = useCallback(async () => {
        try {
            setLoading(true);
            // 1. Fetch live status from registry
            const statusRes = await fetchCameraStatus();
            setCameraData(statusRes.data);

            // 2. Fetch authenticated stream URL
            const streamRes = await fetchCameraStreamUrl();
            setStreamUrl(streamRes.data.streamUrl);
            setError('');
        } catch (err) {
            console.error('[Cameras] Error loading camera data:', err);
            setError(err.response?.data?.message || 'Failed to connect to camera service.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (permissions?.cameraAccess) {
            loadCameraData();
            // Poll for status updates every 10 seconds
            const interval = setInterval(loadCameraData, 10000);
            return () => clearInterval(interval);
        }
    }, [permissions?.cameraAccess, loadCameraData]);

    // Role-based Access Control
    if (!permissions?.cameraAccess) {
        return (
            <main className="camera-page camera-page--denied">
                <div className="access-denied-card animate-fade-in">
                    <div className="access-denied-card__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h1>Access Denied</h1>
                    <p>You do not have the required permissions to view live camera feeds.</p>
                    <p className="hint">Please contact your administrator to request <strong>cameraAccess</strong>.</p>
                </div>
            </main>
        );
    }

    if (loading && !cameraData) {
        return (
            <div className="camera-page__loading">
                <div className="spinner" />
                <p>Initializing secure stream...</p>
            </div>
        );
    }

    const isOnline = cameraData?.online;
    const modeLabel = cameraData?.mode === 'simulator' ? 'Simulator Mode' : 'Hardware Mode';

    return (
        <main className="camera-page">
            <header className="camera-page__header animate-fade-in-up">
                <div className="camera-page__title-wrap">
                    <h1 className="camera-page__title">VirtualEye Camera</h1>
                    <div className="camera-page__indicators">
                        <span className={`status-indicator status-indicator--${isOnline ? 'online' : 'offline'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                        <span className="mode-indicator">
                            {modeLabel}
                        </span>
                    </div>
                </div>
                <button 
                    className="btn btn-primary btn-sm"
                    onClick={loadCameraData}
                    disabled={loading}
                >
                    Refresh Status
                </button>
            </header>

            <section className="camera-page__content animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="stream-container">
                    {isOnline ? (
                        <div className="stream-wrapper">
                            {/* MJPEG Stream Implementation */}
                            <img 
                                src={`${streamUrl}/stream`} 
                                alt="Live Camera Stream"
                                className="stream-video"
                                onError={() => setError('Stream connection lost.')}
                            />
                            <div className="stream-overlay">
                                <div className="stream-overlay__live">● LIVE</div>
                                <div className="stream-overlay__timestamp">{new Date().toLocaleString()}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="stream-offline">
                            <div className="stream-offline__icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 1l22 22M15 10.2a4 4 0 1 1-4.8 4.8M17 3.12a9 9 0 0 1 3.66 1.83M6.66 6.13a9 9 0 0 1 10.72 10.72M2 13a9 9 0 0 1 1.83-3.66" />
                                </svg>
                            </div>
                            <h3>Camera Offline</h3>
                            <p>{error || 'The camera is currently unreachable. Check hardware connection.'}</p>
                            <button className="btn btn-outline" onClick={loadCameraData}>Retry Connection</button>
                        </div>
                    )}
                </div>

                <div className="camera-details-sidebar">
                    <div className="detail-card">
                        <h3>Connection Info</h3>
                        <div className="detail-row">
                            <span>Format</span>
                            <span>MJPEG / JPEG</span>
                        </div>
                        <div className="detail-row">
                            <span>Source</span>
                            <code className="stream-code">{streamUrl}</code>
                        </div>
                        <div className="detail-row">
                            <span>Last Check</span>
                            <span>{cameraData?.lastChecked ? new Date(cameraData.lastChecked).toLocaleTimeString() : 'Never'}</span>
                        </div>
                    </div>

                    <div className="info-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="info-box__icon">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <p>
                            In <strong>Simulator Mode</strong>, VirtualEye uses your laptop webcam to simulate an ESP32-CAM hardware device.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
