import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/auth';

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response.data;
  } catch (error) {
    console.error("Registration failed", error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
    // Handle both token and accessToken formats from backend
    const token = response.data.token || response.data.accessToken;
    if (token) {
      localStorage.setItem('token', token);
      console.log('[auth.js] Token stored in localStorage:', token.substring(0, 10) + '...');
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } else {
      console.error('[auth.js] No token found in login response:', response.data);
    }
    return response.data;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const getAuthToken = () => localStorage.getItem('token');

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    localStorage.removeItem('user');
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Axios request interceptor (Removed Authorization header logic)
// We now rely on AuthContext setting axios.defaults.headers.common['Authorization']
axios.interceptors.request.use(
  (config) => {
    // You could add other request logic here if needed
    // console.log('Axios Request Interceptor - Config:', config.url);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add axios interceptor for handling 401 responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    // Only auto-logout on 401 errors for auth endpoints
    if (error.response && error.response.status === 401 && error.config.url.includes('/auth/')) {
      console.log('Auth error, logging out');
      logout(); // Clear invalid tokens
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);
