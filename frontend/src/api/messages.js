import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3001';
const TEST_USER_ID = 1; // Using the first test user's ID

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
    // Return test messages if API call fails
    return TEST_MESSAGES[userId] || [];
  }
};

export const sendMessage = async (receiverId, content, attachmentUrl = null) => {
  try {
    const response = await axios.post(`${API_URL}/messages`, {
      senderId: TEST_USER_ID,
      receiverId,
      content,
      attachmentUrl,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    // Create a test message if API call fails
    const newMessage = {
      id: Date.now(),
      content,
      senderId: TEST_USER_ID,
      receiverId,
      createdAt: new Date().toISOString(),
      isRead: false,
      attachmentUrl
    };
    
    if (!TEST_MESSAGES[receiverId]) {
      TEST_MESSAGES[receiverId] = [];
    }
    TEST_MESSAGES[receiverId].push(newMessage);
    return newMessage;
  }
};

export const deleteMessage = async (messageId) => {
  try {
    await axios.delete(`${API_URL}/messages/${messageId}?userId=${TEST_USER_ID}`);
  } catch (error) {
    console.error('Error deleting message:', error);
    // Remove from test messages if API call fails
    Object.keys(TEST_MESSAGES).forEach(userId => {
      TEST_MESSAGES[userId] = TEST_MESSAGES[userId].filter(msg => msg.id !== messageId);
    });
  }
};

export const markMessageAsRead = async (messageId) => {
  try {
    await axios.post(`${API_URL}/messages/${messageId}/read?userId=${TEST_USER_ID}`);
  } catch (error) {
    console.error('Error marking message as read:', error);
    // Mark as read in test messages if API call fails
    Object.keys(TEST_MESSAGES).forEach(userId => {
      TEST_MESSAGES[userId] = TEST_MESSAGES[userId].map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      );
    });
  }
};

export const editMessage = async (messageId, content) => {
  try {
    const response = await axios.put(`${API_URL}/messages/${messageId}`, {
      content,
      userId: TEST_USER_ID,
    });
    return response.data;
  } catch (error) {
    console.error('Error editing message:', error);
    // Edit in test messages if API call fails
    let editedMessage = null;
    Object.keys(TEST_MESSAGES).forEach(userId => {
      TEST_MESSAGES[userId] = TEST_MESSAGES[userId].map(msg => {
        if (msg.id === messageId) {
          editedMessage = { ...msg, content };
          return editedMessage;
        }
        return msg;
      });
    });
    return editedMessage;
  }
};

export const searchUsers = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/users/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    // Return test users if API call fails
    const TEST_USERS = [
      {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com"
      },
      {
        id: 3,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com"
      },
      {
        id: 4,
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@example.com"
      }
    ];
    
    if (!query.trim()) return [];
    
    return TEST_USERS.filter(user => 
      user.firstName.toLowerCase().includes(query.toLowerCase()) ||
      user.lastName.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
  }
}; 