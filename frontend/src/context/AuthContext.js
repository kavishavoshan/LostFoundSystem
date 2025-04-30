import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      // Try to get user from localStorage first
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
          localStorage.removeItem('user');
        }
      }
      
      // Then verify with server
      const response = await axios.get('http://localhost:3001/auth/me');
      setUser(response.data);
      setIsAuthenticated(true);
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3001/auth/login', {
        email,
        password,
      });
      // Handle both token and accessToken formats from the backend
      const token = response.data.token || response.data.accessToken;
      const userData = response.data.user;
      
      if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        setIsAuthenticated(true);
        // Also store user in localStorage for persistence
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        return true;
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw error;
    }
  };

  const register = async (userRegistrationData) => {
    try {
      const response = await axios.post('http://localhost:3001/auth/register', userRegistrationData);
      // Handle both token and accessToken formats from the backend
      const token = response.data.token || response.data.accessToken;
      const userData = response.data.user;
      
      if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        setIsAuthenticated(true);
        // Also store user in localStorage for persistence
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        return true;
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Registration error in AuthContext:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
