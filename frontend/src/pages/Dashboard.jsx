/**
 * VirtualEye — Dashboard Page
 *
 * Shows system overview and a real-time backend health status indicator.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchHealthStatus } from '../api/apiClient';
import './Dashboard.css';

const POLL_INTERVAL_MS = 30_000; // re-check every 30 seconds

export default function Dashboard() {
    const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
    const [lastChecked, setLastChecked] = useState(null);
    const [serviceLabel, setServiceLabel] = useState('—');

    const checkHealth = useCallback(async () => {
        setBackendStatus('checking');
        try {
            const res = await fetchHealthStatus();
            if (res.data?.status === 'ok') {
                setBackendStatus('online');
                setServiceLabel(res.data?.service || 'VirtualEye backend');
            } else {
                setBackendStatus('offline');
                setServiceLabel('Unknown');
            }
        } catch {
            setBackendStatus('offline');
            setServiceLabel('Unreachable');
        } finally {
            setLastChecked(new Date());
        }
    }, []);

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [checkHealth]);

    const statusLabel = {
        checking: 'Checking…',
        online: 'Online',
        offline: 'Offline',
    }[backendStatus];

    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <main className="dashboard">
            {/* ── Hero Banner ── */}
            <section className="dashboard__hero animate-fade-in-up">
                <div className="dashboard__hero-badge">
                    <span className="status-dot online" />
                    AI Surveillance Platform
                </div>
                <h1 className="dashboard__title">
                    <span className="text-gradient">VirtualEye</span> Dashboard
                </h1>
                <p className="dashboard__subtitle">
                    Real-time AI-powered video analytics &amp; surveillance monitoring system.
                    <br />
                    <span className="dashboard__date">{dateString}</span>
                </p>
            </section>

            {/* ── Stats Grid ── */}
            <section className="dashboard__stats animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {/* Backend Status Card */}
                <article className="stat-card stat-card--health" id="backend-status-card">
                    <div className="stat-card__header">
                        <div className="stat-card__icon-wrap stat-card__icon-wrap--primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </div>
                        <span className="stat-card__label">Backend Status</span>
                    </div>
                    <div className="stat-card__value">
                        <span className={`status-dot ${backendStatus}`} />
                        <span
                            className={`stat-card__status-text stat-card__status-text--${backendStatus}`}
                            id="backend-status-text"
                        >
                            {statusLabel}
                        </span>
                    </div>
                    <p className="stat-card__detail">{serviceLabel}</p>
                    {lastChecked && (
                        <p className="stat-card__timestamp">
                            Last checked: {lastChecked.toLocaleTimeString()}
                        </p>
                    )}
                    <button
                        id="refresh-health-btn"
                        className="btn btn-outline stat-card__refresh"
                        onClick={checkHealth}
                        disabled={backendStatus === 'checking'}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-icon">
                            <polyline points="23 4 23 10 17 10" />
                            <polyline points="1 20 1 14 7 14" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        Refresh
                    </button>
                </article>

                {/* Total Cameras (placeholder) */}
                <article className="stat-card" id="cameras-card">
                    <div className="stat-card__header">
                        <div className="stat-card__icon-wrap stat-card__icon-wrap--accent">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M23 7l-7 5 7 5V7z" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                        </div>
                        <span className="stat-card__label">Total Cameras</span>
                    </div>
                    <div className="stat-card__value stat-card__value--large">—</div>
                    <p className="stat-card__detail">Camera feeds not yet configured</p>
                </article>

                {/* Alerts (placeholder) */}
                <article className="stat-card" id="alerts-card">
                    <div className="stat-card__header">
                        <div className="stat-card__icon-wrap stat-card__icon-wrap--warning">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <span className="stat-card__label">Active Alerts</span>
                    </div>
                    <div className="stat-card__value stat-card__value--large">—</div>
                    <p className="stat-card__detail">Alert system coming soon</p>
                </article>

                {/* Users (placeholder) */}
                <article className="stat-card" id="users-card">
                    <div className="stat-card__header">
                        <div className="stat-card__icon-wrap stat-card__icon-wrap--success">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <span className="stat-card__label">System Users</span>
                    </div>
                    <div className="stat-card__value stat-card__value--large">—</div>
                    <p className="stat-card__detail">Authentication coming in Module 2</p>
                </article>
            </section>

            {/* ── Info Banner ── */}
            <section
                className="dashboard__info animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
                id="getting-started-section"
            >
                <div className="info-banner">
                    <div className="info-banner__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="info-banner__title">Module 1 — Foundation Complete</h3>
                        <p className="info-banner__text">
                            The VirtualEye base architecture is live. Flask backend, MongoDB Atlas connection,
                            and React frontend are wired up and operational. Authentication &#40;Module 2&#41;
                            will add secure login, Google OAuth 2.0, and role-based access control.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
