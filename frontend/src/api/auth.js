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
    localStorage.setItem("token", response.data.accessToken);
    return response.data;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const getAuthToken = () => localStorage.getItem("token");

export const logout = () => {
  localStorage.removeItem("token");
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
