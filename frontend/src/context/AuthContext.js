import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Verify token validity and refresh user data
          await checkAuth();
        } catch (error) {
          console.error('Error initializing auth:', error);
          await logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [checkAuth]);

  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:3001/auth/me');
      const userData = response.data;
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      await logout();
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3001/auth/login', {
        email,
        password,
      });
      // Handle both token and accessToken formats from backend
      const token = response.data.token || response.data.accessToken;
      if (!token) {
        console.error('No token found in login response:', response.data);
        throw new Error('Authentication failed: No token received');
      }
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(response.data.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:3001/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    checkAuth,
    register,
    token: localStorage.getItem('token')
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={value}>
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
