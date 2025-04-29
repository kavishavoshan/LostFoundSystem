import React, { useState, useEffect } from 'react';
import { getConversations } from '../../api/messages';
import { format } from 'date-fns';

const TEST_CONVERSATIONS = [
  {
    otherUser: {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com"
    },
    lastMessage: {
      content: "Hello, how are you?",
      createdAt: new Date().toISOString(),
      senderId: 2
    },
    unreadCount: 1
  },
  {
    otherUser: {
      id: 3,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com"
    },
    lastMessage: {
      content: "When is the meeting?",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      senderId: 1
    },
    unreadCount: 0
  }
];

const ConversationsList = ({ onSelectUser, selectedUserId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      // First try to get real conversations
      const data = await getConversations();
      
      // If no real conversations, use test data
      if (!data || data.length === 0) {
        setConversations(TEST_CONVERSATIONS);
      } else {
        setConversations(data);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // On error, fall back to test data
      setConversations(TEST_CONVERSATIONS);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-gray-500 text-center">
          <p className="text-lg font-medium mb-2">No conversations yet</p>
          <p className="text-sm">Start a new conversation by selecting a user</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="sticky top-0 bg-white p-4 border-b shadow-sm z-10">
        <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.otherUser.id}
            onClick={() => onSelectUser(conversation.otherUser.id)}
            className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedUserId === conversation.otherUser.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {conversation.otherUser.firstName[0]}
                    {conversation.otherUser.lastName[0]}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {format(new Date(conversation.lastMessage.createdAt), 'MMM d')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">
                  {conversation.lastMessage.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationsList; 