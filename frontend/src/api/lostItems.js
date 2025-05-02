import axios from "axios";

const API_BASE_URL = "http://localhost:3001/lost-items";

// ✅ GET all lost items
export const getLostItems = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching lost items:", error);
    return [];
  }
};

export const getLostItemById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching lost item:", error);
    return [];
  }
};

// ✅ CREATE new lost item
export const createLostItem = async (itemData) => {
  try {
    if (itemData.image instanceof File) {
      const formData = new FormData();
      formData.append('userId', itemData.userId);
      formData.append('description', itemData.description);
      formData.append('location', itemData.location);
      formData.append('contactNumber', itemData.contactNumber);
      formData.append('category', itemData.category);
      formData.append('image', itemData.image);
      formData.append('imageContentType', itemData.image.type);

      const response = await axios.post(API_BASE_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
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
export const updateLostItem = async (id, item) => {
  const formData = new FormData();

  formData.append('description', item.description);
  formData.append('location', item.location);
  formData.append('contactNumber', item.contactNumber);
  formData.append('category', item.category);
  formData.append('userId', item.userId);
  formData.append('status', item.status || 'lost');

  if (item.clip_vector) {
    formData.append('clip_vector', JSON.stringify(item.clip_vector));
  }

  if (item.image && item.image instanceof File) {
    formData.append('image', item.image);
  }

  return await axios.patch(`http://localhost:3001/lost-items/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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
