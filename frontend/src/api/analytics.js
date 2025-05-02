import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/analytics';

export const getReport = async () => {
  try {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const config = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` }; // Add Authorization header if token exists
    }
    const response = await axios.get(`${API_BASE_URL}/report`, config); // Pass config to axios
    return response.data;
  } catch (error) {
    console.error('Error fetching report:', error);
    // Handle potential 401/403 errors specifically if needed
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication error: Please log in again.');
      // Optionally redirect to login or show a message
    }
    return null;
  }
};

export const getTotalItems = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/total-items`);
    return response.data;
  } catch (error) {
    console.error('Error fetching total items:', error);
    return null;
  }
};

export const getCommonItems = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/common-items`);
    return response.data;
  } catch (error) {
    console.error('Error fetching common items:', error);
    return [];
  }
};

export const getFrequentLocations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/frequent-locations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching frequent locations:', error);
    return [];
  }
};

export const getReturnRate = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/return-rate`);
    return response.data;
  } catch (error) {
    console.error('Error fetching return rate:', error);
    return null;
  }
};