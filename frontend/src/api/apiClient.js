/**
 * VirtualEye — Axios API Client
 *
 * Base URL is read from the Vite environment variable
 * VITE_VIRTUALEYE_BACKEND_URL defined in the frontend .env file.
 *
 * Usage:
 *   import apiClient from '../api/apiClient';
 *   const res = await apiClient.get('/health');
 */

import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_VIRTUALEYE_BACKEND_URL || 'http://localhost:5000'}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/* ── Request Interceptor ── */
apiClient.interceptors.request.use(
  (config) => {
    // Future: attach auth token here
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response Interceptor ── */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralised error handling — extend in future modules
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred.';
    console.error('[VirtualEye API Error]', message);
    return Promise.reject(error);
  }
);

export default apiClient;

/* ── Health Check Helper ── */
export const fetchHealthStatus = () => apiClient.get('/health');
