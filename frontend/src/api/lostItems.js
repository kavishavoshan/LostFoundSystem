import axios from "axios";

const API_BASE_URL = "http://localhost:3001/lost-items";

// ✅ GET all lost items
export const getLostItems = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching lost items:", error);
    return [];
  }
};

// ✅ CREATE new lost item
export const createLostItem = async (itemData) => {
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
      formData.append('userId', itemData.userId);
      formData.append('description', itemData.description);
      formData.append('location', itemData.location);
      formData.append('contactNumber', itemData.contactNumber);
      formData.append('category', itemData.category);
      formData.append('image', imageBuffer);
      formData.append('imageContentType', itemData.image.type);

      const response = await axios.post(API_BASE_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // If no image, send regular JSON data
      const response = await axios.post(API_BASE_URL, {
        userId: itemData.userId,
        description: itemData.description,
        location: itemData.location,
        contactNumber: itemData.contactNumber,
        category: itemData.category
      });
      return response.data;
    }
  } catch (error) {
    console.error("Error adding lost item:", error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

// ✅ UPDATE existing lost item
export const updateLostItem = async (id, updatedData) => {
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
    console.error(`Error updating lost item with ID ${id}:`, error);
    throw error;
  }
};

// ✅ DELETE lost item
export const deleteLostItem = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting lost item with ID ${id}:`, error);
    throw error;
  }
};
