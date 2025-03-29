import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/analytics';

export const getReport = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/report`);
    return response.data;
  } catch (error) {
    console.error('Error fetching report:', error);
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