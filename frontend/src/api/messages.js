import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:3001/messages';
let socket = null;

// Initialize socket connection
export const initializeSocket = (userId) => {
  if (socket) {
    socket.disconnect();
  }
  
  // For testing purposes, we're bypassing token authentication
  // In a production environment, proper authentication should be implemented
  
  socket = io('http://localhost:3001', {
    query: { userId }
    // Removed token authentication for testing
  });
  
  return socket;
};

// Get socket instance
export const getSocket = () => socket;

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Send a message
export const sendMessage = async (receiverId, content) => {
  try {
    // For testing purposes, we need to include the senderId in the request
    // since we're bypassing the JWT authentication that would normally provide this
    const senderId = localStorage.getItem('userId') || 1; // Default to user 1 if not set
    
    const response = await axios.post(API_BASE_URL, {
      senderId: Number(senderId),
      receiverId: Number(receiverId),
      content,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Send a message via socket
export const sendSocketMessage = (senderId, receiverId, content) => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  
  socket.emit('sendMessage', { senderId, receiverId, content });
};

// Get conversation between current user and another user
export const getConversation = async (userId) => {
  try {
    const currentUserId = localStorage.getItem('userId');
    const response = await axios.get(`${API_BASE_URL}/conversation/${userId}?currentUserId=${currentUserId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

// Mark a message as read
export const markMessageAsRead = async (messageId) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/read/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Edit a message
export const editMessage = async (messageId, content) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/${messageId}/edit`, { content });
    return response.data;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Upload an image
export const uploadImage = async (receiverId, file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('senderId', localStorage.getItem('userId'));
    formData.append('receiverId', receiverId);
    
    const response = await axios.post(`${API_BASE_URL}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Get unread messages
export const getUnreadMessages = async () => {
  try {
    const userId = localStorage.getItem('userId');
    const response = await axios.get(`${API_BASE_URL}/unread?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting unread messages:', error);
    throw error;
  }
};