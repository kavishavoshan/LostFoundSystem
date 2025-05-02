import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3001';
// const TEST_USER_ID = 1; // Removed hardcoded user ID

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
  if (!token) {
    console.error('[initializeSocket] ERROR: Token is undefined or empty');
    return null;
  }
  
  console.log('[initializeSocket] Initializing with token:', token.substring(0, 10) + '...');
  
  try {
    // Parse the token to get the user ID if possible
    let userId = null;
    try {
      // JWT tokens are in format: header.payload.signature
      // We need the payload part which is the second part
      const payload = token.split('.')[1];
      if (payload) {
        // Decode the base64 payload
        const decodedPayload = JSON.parse(atob(payload));
        // The JWT strategy in backend uses 'sub' for the user ID
        userId = decodedPayload.sub;
        console.log('[initializeSocket] Extracted user ID from token:', userId);
      }
    } catch (parseError) {
      console.error('[initializeSocket] Could not parse token for user ID:', parseError);
    }
    
    // Get user from localStorage as fallback
    if (!userId) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        userId = storedUser?._id || storedUser?.id;
        console.log('[initializeSocket] Using user ID from localStorage:', userId);
      } catch (storageError) {
        console.error('[initializeSocket] Could not get user ID from localStorage:', storageError);
      }
    }
    
    // Make sure we have a token in the correct format for the WebSocket connection
    // The backend expects the raw token without the Bearer prefix
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    
    const socket = io(API_URL, {
      auth: { 
        token: cleanToken, // Make sure we're sending the clean token
        userId // Explicitly include userId in the auth object
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true
    });
    
    // Add connection event listeners for debugging
    socket.on('connect', () => {
      console.log('[Socket] Connected successfully with ID:', socket.id);
      // Emit an authentication event after connection with the correct userId
      if (userId) {
        socket.emit('authenticate', { userId, token: cleanToken });
        console.log('[Socket] Sent authentication event with userId:', userId);
      }
    });
    
    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      if (reason === 'io server disconnect') {
        // The disconnection was initiated by the server, need to reconnect manually
        setTimeout(() => {
          console.log('[Socket] Attempting to reconnect after server disconnect...');
          socket.connect();
        }, 1000);
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`[Socket] Reconnected after ${attemptNumber} attempts`);
      // Re-authenticate after reconnection
      if (userId) {
        socket.emit('authenticate', { userId, token: cleanToken });
        console.log('[Socket] Re-sent authentication event after reconnection');
      }
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[Socket] Reconnection attempt ${attemptNumber}`);
    });

    socket.on('reconnect_error', (error) => {
      console.error('[Socket] Reconnection error:', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('[Socket] Failed to reconnect after all attempts');
    });
    
    return socket;
  } catch (error) {
    console.error('[initializeSocket] Error creating socket:', error);
    return null;
  }
};

export const getConversations = async (userId) => {
  try {
    if (!userId) {
      console.error('[API getConversations] Error: userId is required');
      return []; // Or throw an error
    }
    
    // Check if Authorization header is set
    const authHeader = axios.defaults.headers.common['Authorization'];
    console.log('[API getConversations] Axios Authorization Header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'NOT SET');
    
    // If header is not set, try to set it from localStorage
    if (!authHeader) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        console.log('[API getConversations] Setting Authorization header from localStorage');
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } else {
        console.error('[API getConversations] No token in localStorage');
      }
    }
    
    console.log(`[API getConversations] Fetching conversations for user: ${userId}`);
    const response = await axios.get(`${API_URL}/messages/conversations?userId=${userId}`);
    console.log(`[API getConversations] Received ${response.data.length} conversations`);
    return response.data;
  } catch (error) {
    console.error('[API getConversations] Error:', error.response?.status, error.response?.data || error.message);
    return [];
  }
};

export const getMessages = async (otherUserId, currentUserId) => {
  if (!currentUserId || !otherUserId) {
    const errorMsg = '[API getMessages] Error: currentUserId and otherUserId are required';
    console.error(errorMsg, { currentUserId, otherUserId });
    throw new Error(errorMsg); // Throw error if IDs are missing
  }
  
  try {
    // Check if Authorization header is set
    const authHeader = axios.defaults.headers.common['Authorization'];
    console.log('[API getMessages] Axios Authorization Header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'NOT SET');
    
    // If header is not set, try to set it from localStorage
    if (!authHeader) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        console.log('[API getMessages] Setting Authorization header from localStorage');
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } else {
        console.error('[API getMessages] No token in localStorage');
      }
    }
    
    console.log(`[API getMessages] Fetching messages between ${currentUserId} and ${otherUserId}`);
    const response = await axios.get(`${API_URL}/messages/conversations/${otherUserId}?currentUserId=${currentUserId}`);
    console.log(`[API getMessages] Received ${response.data.length} messages`);
    return response.data;
  } catch (error) {
    console.error('[API getMessages] Error:', error.response?.status, error.response?.data || error.message);
    // Rethrow the error so the component can handle it
    throw error;
  }
};

export const sendMessage = async (receiverId, content, attachmentUrl = null) => {
  try {
    // Ensure Authorization header is set
    const authHeader = axios.defaults.headers.common['Authorization'];
    if (!authHeader) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    }

    const response = await axios.post(`${API_URL}/messages`, {
      receiverId,
      content,
      attachmentUrl,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error; // Rethrow to let the component handle it
  }
};

export const deleteMessage = async (messageId, userId) => {
  try {
    if (!userId) {
      console.error('Error: userId is required for deleteMessage');
      throw new Error('Missing userId for delete operation');
    }
    
    if (!messageId) {
      console.error('Error: messageId is required for deleteMessage');
      throw new Error('Missing messageId for delete operation');
    }
    
    // Ensure Authorization header is set
    const authHeader = axios.defaults.headers.common['Authorization'];
    if (!authHeader) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } else {
        throw new Error('No authentication token available');
      }
    }
    
    console.log(`[API deleteMessage] Deleting message ${messageId} for user ${userId}`);
    const response = await axios.delete(`${API_URL}/messages/${messageId}?userId=${userId}`);
    console.log('[API deleteMessage] Message deleted successfully');
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error; // Rethrow to let the component handle it
  }
};

export const markMessageAsRead = async (messageId, userId) => {
  try {
    // Add validation to prevent API calls with undefined parameters
    if (!messageId) {
      console.error('Error: messageId is required for markMessageAsRead');
      return Promise.reject(new Error('Missing messageId'));
    }
    
    if (!userId) {
      console.error('Error: userId is required for markMessageAsRead');
      return Promise.reject(new Error('Missing userId'));
    }
    
    console.log(`Marking message ${messageId} as read for user ${userId}`);
    await axios.post(`${API_URL}/messages/${messageId}/read?userId=${userId}`);
    return true;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error; // Rethrow to let the component handle it
  }
};

export const editMessage = async (messageId, content, userId) => {
  try {
    if (!messageId || !content || !userId) {
      console.error('Error: messageId, content, and userId are required for editMessage');
      throw new Error('Missing required parameters for edit operation');
    }
    
    // Ensure Authorization header is set
    const authHeader = axios.defaults.headers.common['Authorization'];
    if (!authHeader) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } else {
        throw new Error('No authentication token available');
      }
    }

    console.log(`[API editMessage] Editing message ${messageId} for user ${userId}`);
    const response = await axios.put(`${API_URL}/messages/${messageId}`, {
      content,
      userId,
    });
    console.log('[API editMessage] Message edited successfully');
    return response.data;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error; // Rethrow to let the component handle it
  }
};

export const searchUsers = async (query) => {
  try {
    // Ensure Authorization header is set
    const authHeader = axios.defaults.headers.common['Authorization'];
    if (!authHeader) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    }

    const response = await axios.get(`${API_URL}/users/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error; // Rethrow to let the component handle it
  }
};

// Initialize a conversation with a user
export const initializeConversation = async (currentUserId, otherUserId) => {
  try {
    if (!currentUserId || !otherUserId) {
      console.error('Error: currentUserId and otherUserId are required for initializeConversation');
      throw new Error('Missing user IDs for conversation initialization');
    }
    
    console.log(`Initializing conversation between ${currentUserId} and ${otherUserId}`);
    
    // Send an initial message to create the conversation
    const initialMessage = {
      receiverId: otherUserId,
      content: '👋 Hello!',
    };
    
    const response = await axios.post(`${API_URL}/messages`, initialMessage);
    console.log('Conversation initialized successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error initializing conversation:', error);
    throw error; // Rethrow to let the component handle it
  }
};