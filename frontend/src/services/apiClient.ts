import axios from 'axios';

/**
 * Axios instance pre-configured for the backend API.
 * The base URL is injected at build time via the VITE_API_URL env variable,
 * with a fallback to the Vite dev-server proxy (/api).
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ─── Request interceptor ────────────────────────────────────────────────────
// Attach auth token when available (JWT will be stored in memory or httpOnly cookie)
apiClient.interceptors.request.use((config) => {
  return config;
});

// ─── Response interceptor ───────────────────────────────────────────────────
// Unwrap the data envelope or surface errors uniformly
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Global error handling (e.g. 401 redirect) will be added here
    return Promise.reject(error);
  },
);
