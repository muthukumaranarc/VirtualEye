/**
 * VirtualEye — Auth Context
 *
 * Provides global authentication state: current user, token, login/logout.
 * Wrap the app with <AuthProvider> and consume with useAuth() hook.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient, { fetchMe, TOKEN_STORAGE_KEY } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // current user object
  const [token, setToken]     = useState(null);   // JWT string
  const [loading, setLoading] = useState(true);   // initial hydration

  // ── Hydrate from localStorage on first mount ──────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      setToken(stored);
      // Validate token by fetching user profile
      fetchMe()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          // Token invalid/expired — clear it
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────
  const login = useCallback((jwtToken, userObj) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, jwtToken);
    setToken(jwtToken);
    setUser(userObj);
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // ── Refresh current user from server ─────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetchMe();
      setUser(res.data.user);
    } catch {
      logout();
    }
  }, [logout]);

  const isAdmin        = user?.role === 'ADMIN';
  const isAuthenticated = Boolean(token && user);

  // Permissions derived from the user object
  const permissions = user?.permissions || {
    cameraAccess: false,
    alertAccess: false,
    userViewAccess: false,
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        permissions,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to consume the auth context. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
