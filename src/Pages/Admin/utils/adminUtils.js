const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    let url = envUrl.replace(/\/+$/, ''); // Strip trailing slashes
    if (url.endsWith('/api')) {
      url = url.slice(0, -4);
    } else if (url.endsWith('api')) {
      url = url.slice(0, -3);
    }
    url = url.replace(/\/+$/, ''); // Strip trailing slashes again

    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      url = url.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname);
    }
    return url;
  }
  return 'http://localhost:5000';
};

export const API_BASE = getApiBase();

export const fmt = (n) => `\u20b9${Number(n || 0).toLocaleString('en-IN')}`;

export const STATUS_COLORS = {
  pending: { bg: '#FFF8E7', color: '#B45309' },
  processing: { bg: '#EFF6FF', color: '#1D4ED8' },
  shipped: { bg: '#F0FDF4', color: '#15803D' },
  delivered: { bg: '#F5F3FF', color: '#6D28D9' },
  cancelled: { bg: '#FEF2F2', color: '#B91C1C' },
};

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Ensure the path starts with a single slash
  let cleanPath = path.startsWith('/') ? path : '/' + path;
  
  // Clean double-slashes in the path
  cleanPath = cleanPath.replace(/\/+/g, '/');
  
  // If the path starts with /uploads/ (missing /api/), prepend /api
  if (cleanPath.startsWith('/uploads/')) {
    cleanPath = '/api' + cleanPath;
  }
  
  return `${API_BASE}${cleanPath}`;
};

