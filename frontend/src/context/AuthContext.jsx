import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get API URL from environment or default to localhost
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Configure axios defaults
  axios.defaults.baseURL = API_URL;

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          const response = await axios.get('/auth/me');
          setUser(response.data.user);
        } catch (err) {
          console.error('Failed to load user:', err);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register
  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Update user
  const updateUser = async (updates) => {
    try {
      setError(null);
      const response = await axios.put('/auth/update', updates);
      setUser(response.data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Update failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isRole: (role) => user?.role === role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
