import axios from "axios";

const API_BASE_URL = "http://localhost:3001/lost-items";

// ✅ GET all lost items
export const getLostItems = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getAllLostItems`);
    return response.data;
  } catch (error) {
    console.error("Error fetching lost items:", error);
    return [];
  }
};

// ✅ CREATE new lost item
export const createLostItem = async (itemData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/createLostItem`, itemData);
    return response.data;
  } catch (error) {
    console.error("Error adding lost item:", error);
    throw error;
  }
};

// ✅ UPDATE existing lost item
export const updateLostItem = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/updateLostItem/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating lost item with ID ${id}:`, error);
    throw error;
  }
};

// ✅ DELETE lost item
export const deleteLostItem = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/deleteLostItem/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting lost item with ID ${id}:`, error);
    throw error;
  }
};
