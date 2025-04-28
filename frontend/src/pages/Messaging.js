import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  initializeSocket, 
  disconnectSocket, 
  sendMessage, 
  getConversation, 
  markMessageAsRead, 
  getUnreadMessages 
} from '../api/messages';
import ConversationList from '../components/messaging/ConversationList';
import ChatArea from '../components/messaging/ChatArea';
import TestEnvironmentLoader from '../components/messaging/TestEnvironmentLoader';

const Messaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [testUserId, setTestUserId] = useState(null);
  
  // Check for test environment
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      console.log('[Messaging] Test environment detected: userId found in localStorage:', userId);
      setTestUserId(userId);
    }
  }, []);

  // Initialize socket connection when component mounts
  useEffect(() => {
    // Use either the authenticated user ID or the test user ID from localStorage
    const currentUserId = testUserId || (user && user.id);
    
    if (currentUserId) {
      console.log(`[Messaging] Initializing socket with userId: ${currentUserId}`);
      const socket = initializeSocket(currentUserId);
      
      // Listen for new messages
      socket.on('newMessage', (message) => {
        if (selectedUser && (message.sender.id === selectedUser.id || message.receiver.id === selectedUser.id)) {
          setMessages(prevMessages => [...prevMessages, message]);
          markMessageAsRead(message.id);
        } else {
          // Update unread counts
          setUnreadCounts(prev => ({
            ...prev,
            [message.sender.id]: (prev[message.sender.id] || 0) + 1
          }));
        }
      });

      // Listen for message sent confirmation
      socket.on('messageSent', (message) => {
        if (selectedUser && (message.receiver.id === selectedUser.id)) {
          setMessages(prevMessages => [...prevMessages, message]);
        }
      });

      // Fetch users with conversations
      fetchConversations();
      
      // Fetch unread message counts
      fetchUnreadCounts();

      return () => {
        disconnectSocket();
      };
    }
  }, [user, testUserId, selectedUser]);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      // Reset unread count for selected user
      setUnreadCounts(prev => ({
        ...prev,
        [selectedUser.id]: 0
      }));
    }
  }, [selectedUser]);

  const fetchConversations = async () => {
    try {
      // This is a placeholder - in a real app, you would fetch the list of users
      // the current user has conversations with from the backend
      // For now, we'll use a mock list
      setConversations([
        { id: 1, name: 'John Doe', lastMessage: 'Hey there!', lastMessageTime: '10:30 AM' },
        { id: 2, name: 'Jane Smith', lastMessage: 'Can you help me?', lastMessageTime: 'Yesterday' },
        { id: 3, name: 'Bob Johnson', lastMessage: 'I found your item!', lastMessageTime: 'Monday' },
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const unreadMessages = await getUnreadMessages();
      const counts = {};
      
      unreadMessages.forEach(msg => {
        counts[msg.sender.id] = (counts[msg.sender.id] || 0) + 1;
      });
      
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const messages = await getConversation(userId);
      setMessages(messages);
      
      // Mark messages as read
      messages.forEach(msg => {
        if (!msg.read && msg.sender.id === userId) {
          markMessageAsRead(msg.id);
        }
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUser) return;
    
    try {
      await sendMessage(selectedUser.id, messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Use either the authenticated user or create a mock user for test environment
  const currentUser = user || (testUserId ? { id: parseInt(testUserId), name: `Test User ${testUserId}` } : null);

  return (
    <>
      {/* Add the TestEnvironmentLoader component to automatically set up the test environment */}
      <TestEnvironmentLoader userId="1" />
      
      <div className="flex h-screen bg-gray-100">
        <div className="w-1/3 border-r border-gray-300 bg-white">
          <ConversationList 
            conversations={conversations} 
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            unreadCounts={unreadCounts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            loading={loading}
          />
        </div>
        <div className="w-2/3 flex flex-col">
          <ChatArea 
            selectedUser={selectedUser}
            messages={messages}
            currentUser={currentUser}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            handleSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </>
  );
};

export default Messaging;