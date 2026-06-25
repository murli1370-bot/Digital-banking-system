import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('db_token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await authService.getMe();
      setUser(res.data.data);
    } catch {
      localStorage.removeItem('db_token');
      localStorage.removeItem('db_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    localStorage.setItem('db_token', res.data.token);
    localStorage.setItem('db_user', JSON.stringify(res.data.data));
    setUser(res.data.data);
    return res.data.data;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    localStorage.setItem('db_token', res.data.token);
    localStorage.setItem('db_user', JSON.stringify(res.data.data));
    setUser(res.data.data);
    return res.data.data;
  };

  const logout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    localStorage.removeItem('db_token');
    localStorage.removeItem('db_user');
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
