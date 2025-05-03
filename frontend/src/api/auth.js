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
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response.data;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('Auth token:', token);
  return token;
}

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

// Add axios interceptor for authentication
axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', config.url);
    } else {
      console.log('No token available for request:', config.url);
    }
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