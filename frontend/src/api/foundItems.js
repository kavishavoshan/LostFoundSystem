import axios from "axios";

const API_BASE_URL = "http://localhost:3001/found-items"; // Adjust if needed

export const getFoundItems = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getAllFoundItems`);
    return response.data;
  } catch (error) {
    console.error("Error fetching found items:", error);
    return [];
  }
};

export const createFoundItem = async (itemData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/createFoundItem`, itemData);
    return response.data;
  } catch (error) {
    console.error("Error adding found item:", error);
    throw error;
  }
};
