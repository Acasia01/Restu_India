import axios from "axios";

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    let url = envUrl;
    if (!url.endsWith('/')) url += '/';
    if (!url.endsWith('/api/')) url += 'api/';
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      url = url.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname);
    }
    return url;
  }
  return '/api/';
};

const baseURL = getBaseURL();

const api = axios.create({ baseURL });

// ── Attach token on every request ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("restu_india_auth");
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

// ── Global error handler ───────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired / invalid — clear session silently
      localStorage.removeItem("restu_india_auth");
    }
    return Promise.reject(err);
  }
);

export default api;