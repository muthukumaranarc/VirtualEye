/**
 * VirtualEye — Axios API Client
 *
 * Base URL is read from the Vite environment variable
 * VITE_VIRTUALEYE_BACKEND_URL defined in the frontend .env file.
 *
 * - Automatically attaches JWT Bearer token from localStorage
 * - Redirects to /login on 401 Unauthorized responses
 */

import axios from 'axios';

const TOKEN_KEY = 'virtualeye_token';

const getBaseUrl = () => {
  if (import.meta.env.VITE_VIRTUALEYE_BACKEND_URL) return import.meta.env.VITE_VIRTUALEYE_BACKEND_URL;
  return window.location.port === '5173' ? 'http://localhost:5000' : window.location.origin;
};

const apiClient = axios.create({
  baseURL: `${getBaseUrl()}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/* ── Request Interceptor: Attach JWT ── */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response Interceptor: Handle 401 ── */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred.';
    console.error('[VirtualEye API Error]', message);

    // On 401, clear stored token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

/* ── Token Helpers ── */
export const TOKEN_STORAGE_KEY = TOKEN_KEY;

/* ── Health Check Helper ── */
export const fetchHealthStatus = () => apiClient.get('/health');

/* ── Auth Helpers ── */
export const loginUser     = (email, password) => apiClient.post('/auth/login', { email, password });
export const registerUser  = (data)            => apiClient.post('/auth/register', data);
export const fetchMe       = ()                => apiClient.get('/auth/me');

/* ── User Management Helpers ── */
export const fetchAllUsers = ()     => apiClient.get('/users');
export const deleteUser    = (id)   => apiClient.delete(`/users/${id}`);

/* ── Camera Helpers ── */
export const fetchCameraStatus    = () => apiClient.get('/camera/status');
export const fetchCameraStreamUrl = () => apiClient.get('/camera/stream-url');

/* ── Alert Helpers ── */
export const fetchAlertConfig     = () => apiClient.get('/alerts/config');
export const updateAlertConfig    = (toggles) => apiClient.put('/alerts/config', { toggles });
export const fetchAlertHistory    = () => apiClient.get('/alerts/history');
export const fetchRecentAlerts    = () => apiClient.get('/alerts/recent');
export const triggerTestAlert     = (type, message) => apiClient.post('/alerts/trigger', { type, message });
