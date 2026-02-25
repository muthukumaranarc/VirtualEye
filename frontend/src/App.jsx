/**
 * VirtualEye — Root App Component  (Module 2: Auth + User Management)
 *
 * State-based "routing":  page state drives which component is rendered.
 * Google OAuth callback is handled by checking window.location on mount.
 */

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard    from './pages/Dashboard';
import Login        from './pages/Login';
import AdminUsers   from './pages/AdminUsers';
import Cameras      from './pages/Cameras';
import './styles/global.css';
import './App.css';

/* ══════════════════════════════════════════════
   Inner shell — consumes auth context
   ══════════════════════════════════════════════ */
function AppShell() {
  const { user, isAuthenticated, isAdmin, permissions, logout, loading } = useAuth();

  // Detect the current "page" from pathname for Google OAuth callback
  const getInitialPage = () => {
    const path = window.location.pathname;
    if (path === '/auth/callback') return 'login';   // will redirect after token hydration
    if (isAuthenticated)           return 'dashboard';
    return 'login';
  };

  const [page, setPage] = useState('loading'); // resolved after auth hydration

  // Once auth state finishes loading, pick the right page
  useEffect(() => {
    if (!loading) {
      const path = window.location.pathname;
      if (path === '/auth/callback') {
        setPage('login');          // Login.jsx handles the ?token= param
      } else if (isAuthenticated) {
        setPage('dashboard');
      } else {
        setPage('login');
      }
    }
  }, [loading, isAuthenticated]);

  const navigate = (target) => {
    setPage(target);
    // Clean URL so back/forward feel natural
    const routes = {
      'dashboard':    '/',
      'login':        '/login',
      'admin-users':  '/admin/users',
      'cameras':      '/cameras',
    };
    window.history.pushState({}, '', routes[target] || '/');
  };

  /* ── Full-screen loading state ── */
  if (page === 'loading' || loading) {
    return (
      <div className="app-loading">
        <div className="app-loading__logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div className="app-loading__spinner" aria-label="Loading…" />
      </div>
    );
  }

  /* ── Login page (no shell) ── */
  if (page === 'login') {
    return <Login onNavigate={navigate} />;
  }

  /* ── User avatar initials ── */
  const avatarChar = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  /* ── Authenticated shell (navbar + page) ── */
  return (
    <div className="app">
      {/* ── Navigation Bar ── */}
      <header className="navbar" id="main-navbar">
        <div className="navbar__brand">
          <div className="navbar__logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <span className="navbar__name">
            Virtual<span className="navbar__name--accent">Eye</span>
          </span>
          <span className="navbar__version">v2.0</span>
        </div>

        <nav className="navbar__nav" role="navigation" aria-label="Main navigation">
          {/* Dashboard — always active */}
          <button
            id="nav-dashboard"
            className={`navbar__link ${page === 'dashboard' ? 'navbar__link--active' : ''}`}
            onClick={() => navigate('dashboard')}
          >
            Dashboard
          </button>

          {/* Cameras — enabled if permission granted */}
          <button
            id="nav-cameras"
            className={`navbar__link ${page === 'cameras' ? 'navbar__link--active' : ''} ${!permissions.cameraAccess ? 'navbar__link--disabled' : ''}`}
            disabled={!permissions.cameraAccess}
            onClick={() => navigate('cameras')}
            title={permissions.cameraAccess ? 'Cameras' : 'No camera access'}
          >
            Cameras
          </button>

          {/* Alerts — enabled if permission granted */}
          <button
            id="nav-alerts"
            className={`navbar__link ${!permissions.alertAccess ? 'navbar__link--disabled' : ''}`}
            disabled={!permissions.alertAccess}
            title={permissions.alertAccess ? 'Alerts' : 'No alert access'}
          >
            Alerts
          </button>

          {/* Analytics — always enabled after login */}
          <button
            id="nav-analytics"
            className="navbar__link"
          >
            Analytics
          </button>

          {/* User Management — ADMIN only */}
          {isAdmin && (
            <button
              id="nav-user-mgmt"
              className={`navbar__link navbar__link--admin ${page === 'admin-users' ? 'navbar__link--active' : ''}`}
              onClick={() => navigate('admin-users')}
              title="User Management (Admin)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Users
            </button>
          )}
        </nav>

        {/* ── Navbar Actions: User Avatar + Logout ── */}
        <div className="navbar__actions">
          <div className="navbar__user-info">
            <div className="navbar__user-role">{user?.role}</div>
            <div className="navbar__user-name">{user?.name || user?.email}</div>
          </div>
          <div className="navbar__avatar" aria-label={`Logged in as ${user?.name}`} title={user?.email}>
            {avatarChar}
          </div>
          <button
            id="logout-btn"
            className="btn btn-outline navbar__logout"
            onClick={logout}
            title="Sign out"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </header>

      {/* ── Page Content ── */}
      <div className="app__content">
        {page === 'dashboard'   && <Dashboard />}
        {page === 'admin-users' && <AdminUsers onNavigate={navigate} />}
        {page === 'cameras'     && <Cameras />}
      </div>

      {/* ── Footer ── */}
      <footer className="footer" id="main-footer">
        <p className="footer__text">
          &copy; {new Date().getFullYear()} VirtualEye &mdash; AI Surveillance Platform &mdash;
          Module 2: Authentication &amp; User Management
        </p>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Root export — wraps everything in AuthProvider
   ══════════════════════════════════════════════ */
export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
