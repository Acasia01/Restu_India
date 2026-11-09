import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'restu_india_auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = "still loading", null = "not logged in"
  const [loading, setLoading] = useState(true);

  // On first load, restore the session from localStorage (if any)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      api.defaults.headers.common.Authorization = `Bearer ${parsed.token}`;
      setUser(parsed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('auth/login', { email, password });
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('auth/register', { name, email, password });
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
