import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/analytics';

export const getReport = async () => {
  try {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const config = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` }; // Add Authorization header if token exists
    }
    
    // Add logging to debug the API call
    console.log('Making API call to:', `${API_BASE_URL}/report`);
    console.log('Using auth token:', token ? 'Token exists' : 'No token');
    
    const response = await axios.get(`${API_BASE_URL}/report`, config); // Pass config to axios
    
    // Log the response for debugging
    console.log('API response received:', response.data);
    
    // Check if response data is valid
    if (!response.data) {
      console.error('Empty response data received');
      throw new Error('No data received from the server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching report:', error);
    // Log more details about the error
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    // Handle potential 401/403 errors specifically if needed
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication error: Please log in again.');
      // Optionally redirect to login or show a message
    }
    throw error; // Rethrow the error so the component can handle it
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