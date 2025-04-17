import axios from 'axios';

const API_URL = 'http://localhost:3000/messages';

export const getConversations = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/conversations?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

export const getConversation = async (currentUserId, otherUserId) => {
  try {
    const response = await axios.get(`${API_URL}/conversations/${otherUserId}?currentUserId=${currentUserId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

export const sendMessage = async (messageData) => {
  try {
    const response = await axios.post(API_URL, messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId, userId) => {
  try {
    await axios.delete(`${API_URL}/${messageId}?userId=${userId}`);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export const editMessage = async (messageId, content, userId) => {
  try {
    const response = await axios.put(`${API_URL}/${messageId}`, { content, userId });
    return response.data;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId, userId) => {
  try {
    const response = await axios.post(`${API_URL}/${messageId}/read?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};