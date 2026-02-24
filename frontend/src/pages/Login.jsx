/**
 * VirtualEye — Login Page
 *
 * Supports:
 *  - Email + password login
 *  - Google OAuth2 login (redirects to backend /api/auth/google/login)
 *  - Handles /auth/callback route that receives JWT from Google redirect
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/apiClient';
import './Login.css';

const BACKEND_URL = import.meta.env.VITE_VIRTUALEYE_BACKEND_URL || 'http://localhost:5000';

export default function Login({ onNavigate }) {
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) onNavigate('dashboard');
  }, [isAuthenticated, onNavigate]);

  // Handle Google OAuth callback token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const err    = params.get('error');

    if (token) {
      // Decode user info from JWT payload (no library needed for display)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userObj = {
          _id:         payload.sub,
          email:       payload.email,
          role:        payload.role,
          permissions: payload.permissions,
          name:        payload.email, // will be refreshed by /me
        };
        login(token, userObj);
        onNavigate('dashboard');
        // Clean the URL
        window.history.replaceState({}, '', '/');
      } catch {
        setError('Google login failed. Please try again.');
      }
    }
    if (err) {
      setError('Google login was cancelled or failed. Please try again.');
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      login(res.data.token, res.data.user);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google/login`;
  };

  return (
    <div className="login-page">
      {/* Background decorative blobs */}
      <div className="login-page__blob login-page__blob--1" aria-hidden="true" />
      <div className="login-page__blob login-page__blob--2" aria-hidden="true" />

      <div className="login-card animate-fade-in-up">
        {/* Brand */}
        <div className="login-card__brand">
          <div className="login-card__logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <h1 className="login-card__title">
            Virtual<span className="login-card__title--accent">Eye</span>
          </h1>
          <p className="login-card__subtitle">Sign in to your surveillance dashboard</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="login-card__error" role="alert" id="login-error-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Email / Password form */}
        <form className="login-form" onSubmit={handleEmailLogin} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div className="form-input-wrap">
              <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="form-input-wrap">
              <svg className="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className="form-input form-input--password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="form-input-toggle"
                onClick={() => setShowPass((p) => !p)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary login-form__submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <span className="login-divider__text">or continue with</span>
        </div>

        {/* Google OAuth Button */}
        <button
          id="login-google-btn"
          type="button"
          className="btn login-card__google-btn"
          onClick={handleGoogleLogin}
        >
          <svg className="google-icon" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285f4" d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"/>
            <path fill="#34a853" d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"/>
            <path fill="#fbbc04" d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"/>
            <path fill="#ea4335" d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"/>
          </svg>
          Sign in with Google
        </button>

        {/* Footer note */}
        <p className="login-card__footer">
          VirtualEye AI Surveillance — Secure Access Portal
        </p>
      </div>
    </div>
  );
}
