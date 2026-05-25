import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on application load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const authData = response.data.data; // AuthResponse
      
      const userProfile = {
        id: authData.id,
        name: authData.name,
        email: authData.email,
        role: authData.role,
      };

      setToken(authData.token);
      setUser(userProfile);
      
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(userProfile));
      
      return userProfile;
    } catch (error) {
      throw error.message || (error.errors && error.errors[0]?.message) || 'Login failed';
    }
  };

  const register = async (name, email, phone, password, role, extraFields = {}) => {
    try {
      await api.post('/auth/register', { name, email, phone, password, role, ...extraFields });
    } catch (error) {
      throw error.message || (error.errors && error.errors[0]?.message) || 'Registration failed';
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = (profileData) => {
    const updated = { ...user, ...profileData };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
