import axios from "axios";

const API_BASE_URL = "http://localhost:3001"; // Base URL

export const getFoundItems = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/found-items`);
    return response.data;
  } catch (error) {
    console.error("Error fetching found items:", error);
    return [];
  }
};

export const createFoundItem = async (itemData) => {
  try {
    // Log the form data being sent
    console.log('Creating found item with data:', itemData);
    
    // Update the endpoint to match backend route
    const response = await axios.post(`${API_BASE_URL}/found-items`, itemData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Server response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding found item:", error);
    if (error.response) {
      console.error("Server error response:", error.response.data);
      throw new Error(error.response.data.message || 'Failed to create found item');
    }
    throw error;
  }
};
