/**
 * VirtualEye — Root App Component
 *
 * Sets up global styles, navigation shell, and routing.
 * Authentication / routing guards will be added in Module 2.
 */

import './styles/global.css';
import './App.css';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="app">
      {/* ── Navigation Bar ── */}
      <header className="navbar" id="main-navbar">
        <div className="navbar__brand">
          {/* Eye Icon */}
          <div className="navbar__logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <span className="navbar__name">
            Virtual<span className="navbar__name--accent">Eye</span>
          </span>
          <span className="navbar__version">v1.0</span>
        </div>

        <nav className="navbar__nav" role="navigation" aria-label="Main navigation">
          <a href="#" className="navbar__link navbar__link--active" id="nav-dashboard">
            Dashboard
          </a>
          <a href="#" className="navbar__link navbar__link--disabled" title="Coming in Module 2">
            Cameras
          </a>
          <a href="#" className="navbar__link navbar__link--disabled" title="Coming in Module 2">
            Alerts
          </a>
          <a href="#" className="navbar__link navbar__link--disabled" title="Coming in Module 2">
            Analytics
          </a>
        </nav>

        <div className="navbar__actions">
          <button
            id="sign-in-btn"
            className="btn btn-primary"
            disabled
            title="Authentication coming in Module 2"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* ── Page Content ── */}
      <Dashboard />

      {/* ── Footer ── */}
      <footer className="footer" id="main-footer">
        <p className="footer__text">
          &copy; {new Date().getFullYear()} VirtualEye &mdash; AI Surveillance Platform &mdash;
          Module 1: Foundation
        </p>
      </footer>
    </div>
  );
}
