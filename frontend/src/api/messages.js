import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3001';

// Get the current user from localStorage
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Test messages for development
const TEST_MESSAGES = {
  2: [ // Messages with Jane Smith
    {
      id: 1,
      content: "Hello, how are you?",
      senderId: 2,
      receiverId: 1,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: true
    },
    {
      id: 2,
      content: "I'm good, thanks! How about you?",
      senderId: 1,
      receiverId: 2,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      isRead: true
    },
    {
      id: 3,
      content: "Just wanted to check in about the lost item report.",
      senderId: 2,
      receiverId: 1,
      createdAt: new Date().toISOString(),
      isRead: false
    }
  ],
  3: [ // Messages with John Doe
    {
      id: 4,
      content: "When is the meeting?",
      senderId: 1,
      receiverId: 3,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: true
    }
  ]
};

export const initializeSocket = (token) => {
  const socket = io(API_URL, {
    auth: { token },
  });
  return socket;
};

export const getConversations = async () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const response = await axios.get(`${API_URL}/messages/conversations?userId=${currentUser.id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

export const getMessages = async (userId) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const response = await axios.get(`${API_URL}/messages/conversations/${userId}?currentUserId=${currentUser.id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const sendMessage = async (receiverId, content, attachmentUrl = null) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const response = await axios.post(`${API_URL}/messages`, {
      senderId: currentUser.id,
      receiverId,
      content,
      attachmentUrl,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    await axios.delete(`${API_URL}/messages/${messageId}?userId=${currentUser.id}`);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    await axios.post(`${API_URL}/messages/${messageId}/read?userId=${currentUser.id}`);
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

export const editMessage = async (messageId, content) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const response = await axios.put(`${API_URL}/messages/${messageId}`, {
      content,
      userId: currentUser.id,
    });
    return response.data;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

export const searchUsers = async (query) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const response = await axios.get(`${API_URL}/users/search?query=${query}`);
    // Filter out the current user from search results
    return response.data.filter(user => user.id !== currentUser.id);
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}; 