import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/auth';

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error("Registration failed", error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
    
    // Store the token
    localStorage.setItem("token", response.data.accessToken);
    
    // Get user info using the token
    const userResponse = await axios.get(`${API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${response.data.accessToken}`
      }
    });
    
    // Store user info
    localStorage.setItem("user", JSON.stringify(userResponse.data));
    
    return {
      ...response.data,
      user: userResponse.data
    };
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const getAuthToken = () => localStorage.getItem("token");

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

axios.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
