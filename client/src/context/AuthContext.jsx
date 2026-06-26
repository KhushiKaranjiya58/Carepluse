/**
 * Authentication Context
 * Manages user login state and JWT token across the app
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);
const VALID_ROLES = ['patient', 'doctor', 'admin'];

// Safely read and validate stored user data from localStorage
const getStoredSession = () => {
  try {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      return { user: null, token: null };
    }

    const parsedUser = JSON.parse(storedUser);

    if (!parsedUser?.role || !VALID_ROLES.includes(parsedUser.role)) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return { user: null, token: null };
    }

    return { user: parsedUser, token };
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return { user: null, token: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // Load user from localStorage on app start
  useEffect(() => {
    const { user: storedUser } = getStoredSession();
    setUser(storedUser);
    setLoading(false);
  }, []);

  // Keep React state in sync when axios clears an expired session
  useEffect(() => {
    const handleSessionExpired = () => clearSession();

    window.addEventListener('carepluse:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('carepluse:session-expired', handleSessionExpired);
    };
  }, [clearSession]);

  // Role-based registration (patient, doctor, admin)
  const register = async (userData) => {
    const response = await API.post('/auth/register', userData);
    const { data } = response.data;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  // Login for all roles
  const login = async (email, password, role) => {
    const response = await API.post('/auth/login', { email, password, role });
    const { data } = response.data;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  // Logout and clear storage
  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
