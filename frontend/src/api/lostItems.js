import axios from "axios";

const API_BASE_URL = "http://localhost:3001/lost-items"; // Adjust if needed

export const getLostItems = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching lost items:", error);
    return [];
  }
};

export const createLostItem = async (itemData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, itemData);
    return response.data;
  } catch (error) {
    console.error("Error adding lost item:", error);
    throw error;
  }
};
