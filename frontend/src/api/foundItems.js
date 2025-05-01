import axios from "axios";

const API_BASE_URL = "http://localhost:3001/found-items";
const ML_SERVER_URL = "http://localhost:5001/upload-found-item";

// ✅ GET all found items
export const getFoundItems = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching found items:", error);
    return [];
  }
};

// ✅ CREATE new found item 
export const createFoundItem = async (itemData) => {
  try {
    // Convert the image file to binary data if it exists
    if (itemData.image instanceof File) {
      const imageBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const buffer = Buffer.from(reader.result);
          resolve(buffer);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(itemData.image);
      });

      // Create form data with binary image
      const formData = new FormData();
      Object.keys(itemData).forEach(key => {
        if (key === 'image') {
          formData.append('image', imageBuffer);
          formData.append('imageContentType', itemData.image.type);
        } else {
          formData.append(key, itemData[key]);
        }
      });

      const response = await axios.post(API_BASE_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // If no image, send regular JSON
      const response = await axios.post(API_BASE_URL, itemData);
      return response.data;
    }
  } catch (error) {
    console.error("Error adding found item:", error);
    if (error.response) {
      console.error("Server error response:", error.response.data);
      throw new Error(error.response.data.message || 'Failed to create found item');
    }
    throw error;
  }
};

// ✅ UPDATE existing found item
export const updateFoundItem = async (id, updatedData) => {
  try {
    // Handle image update similar to create
    if (updatedData.image instanceof File) {
      const imageBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const buffer = Buffer.from(reader.result);
          resolve(buffer);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(updatedData.image);
      });

      const formData = new FormData();
      Object.keys(updatedData).forEach(key => {
        if (key === 'image') {
          formData.append('image', imageBuffer);
          formData.append('imageContentType', updatedData.image.type);
        } else {
          formData.append(key, updatedData[key]);
        }
      });

      const response = await axios.patch(`${API_BASE_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      const response = await axios.patch(`${API_BASE_URL}/${id}`, updatedData);
      return response.data;
    }
  } catch (error) {
    console.error(`Error updating found item with ID ${id}:`, error);
    throw error;
  }
};

// ✅ DELETE found item
export const deleteFoundItem = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting found item with ID ${id}:`, error);
    throw error;
  }
};

// Get category prediction from ML model
export const getPredictedCategory = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await axios.post(ML_SERVER_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: false  // Add this to handle CORS
    });

    // Check if we got a valid response
    if (response.data && response.data.category) {
      return response.data.category;
    }
    console.error("Unexpected response format:", response.data);
    return "Unknown";
  } catch (error) {
    console.error("Error getting category prediction:", error);
    return "Unknown";
  }
};