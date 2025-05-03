import axios from 'axios';
import { getAuthToken } from './auth';

// Make sure this matches your backend server URL
const API_URL = 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Adding token to ${config.method.toUpperCase()} request: ${config.url}`);
    } else {
      console.log(`No token available for ${config.method.toUpperCase()} request: ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API response error:', error.response?.status, error.response?.data);
    // Don't auto-logout on 401 errors for user endpoints
    // Let the component handle the error
    return Promise.reject(error);
  }
);

// Get current user's profile
export const getCurrentUser = async () => {
  try {
    // Log the token to check if it exists
    const token = getAuthToken();
    console.log('Auth token exists:', !!token);
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    // Try to get user from localStorage first
    const storedUser = getStoredUser();
    if (storedUser) {
      console.log('Using stored user data');
      
      // Fetch from server in the background to ensure data is fresh
      try {
        const response = await api.get('/auth/me',{
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Responsse from background fetch:', response.data);
        if (response.data) {
          localStorage.setItem('user', JSON.stringify(response.data));
          // Return the fresh data if available
          return {
            success: true,
            data: response.data
          };
        }
      } catch (backgroundError) {
        console.warn('Background refresh failed, using cached data', backgroundError);
        // Continue with stored data if background refresh fails
      }
      
      return {
        success: true,
        data: storedUser
      };
    }
    
    // If no stored user, fetch from server
    console.log('Fetching user data from server...');
    const response = await api.get('/auth/me');
    console.log('User data response:', response.data);
    
    // Store user data in localStorage for persistence
    if (response.data) {
      try {
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (storageError) {
        console.error('Error storing user data in localStorage:', storageError);
      }
    }
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Log more details about the error
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    // Clear invalid token if authentication failed
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    throw error;
  }
};

// Helper function to get stored user data
const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    localStorage.removeItem('user');
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  const token = getAuthToken();
  try {
    const response = await api.patch('/users/me', userData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    // Update stored user data
    if (response.data) {
      try {
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (storageError) {
        console.error('Error storing updated user data in localStorage:', storageError);
      }
    }
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get user's lost items
export const getUserLostItems = async () => {
  try {
    const response = await api.get('/users/me/lost-items');
    return response.data;
  } catch (error) {
    console.error('Error fetching user lost items:', error);
    throw error;
  }
};

// Get user's found items
export const getUserFoundItems = async () => {
  try {
    const response = await api.get('/users/me/found-items');
    return response.data;
  } catch (error) {
    console.error('Error fetching user found items:', error);
    throw error;
  }
};

// Get user's reviews
export const getUserReviews = async () => {
  try {
    const response = await api.get('/users/me/reviews');
    return response.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (file, type = 'avatar') => {
  const token = getAuthToken();
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    console.log('Uploading profile image:', file.name, 'type:', type);
    
    const response = await api.post('/users/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('Upload response:', response.data);
    
    // Update stored user data with new image URL
    if (response.data) {
      const currentUser = getStoredUser() || {};
      const updatedUser = {
        ...currentUser,
        avatar: response.data.profilePicture,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return {
      profilePicture: response.data.avatarUrl,
      success: true
    };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

//Upload Cover Image
export const uploadCoverImage = async (file, type = 'cover') => {
  const token = getAuthToken();
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    console.log('Uploading profile image:', file.name, 'type:', type);
    
    const response = await api.post('/users/upload-cover-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('Upload response:', response.data);
    
    // Update stored user data with new image URL
    if (response.data) {
      const currentUser = getStoredUser() || {};
      const updatedUser = {
        ...currentUser,
        cover: response.data.profilePicture,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return {
      coverImageUrl: response.data.coverImageUrl,
      success: true
    };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

// Delete user account
export const deleteUserAccount = async () => {
  try {
    const response = await api.delete('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};