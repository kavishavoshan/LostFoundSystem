import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3001';
const TEST_USER_ID = 1; // Using the first test user's ID

export const initializeSocket = (token) => {
  const socket = io(API_URL, {
    auth: { token },
  });
  return socket;
};

export const getConversations = async () => {
  try {
    const response = await axios.get(`${API_URL}/messages/conversations?userId=${TEST_USER_ID}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

export const getMessages = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/messages/conversations/${userId}?currentUserId=${TEST_USER_ID}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const sendMessage = async (receiverId, content) => {
  try {
    const response = await axios.post(`${API_URL}/messages`, {
      senderId: TEST_USER_ID,
      receiverId,
      content,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId) => {
  try {
    await axios.delete(`${API_URL}/messages/${messageId}?userId=${TEST_USER_ID}`);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId) => {
  try {
    await axios.post(`${API_URL}/messages/${messageId}/read?userId=${TEST_USER_ID}`);
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}; 