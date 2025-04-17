import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const mockConversations = [
  {
    otherUser: {
      id: 1,
      name: 'John Doe',
      email: 'user1@test.com'
    },
    lastMessage: {
      id: 1,
      content: 'Hi, I found your wallet!',
      createdAt: new Date(),
      isRead: false,
      sender: { id: 1, name: 'John Doe' }
    }
  },
  {
    otherUser: {
      id: 2,
      name: 'Jane Smith',
      email: 'user2@test.com'
    },
    lastMessage: {
      id: 2,
      content: 'Thank you! Where can I pick it up?',
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      isRead: true,
      sender: { id: 2, name: 'Jane Smith' }
    }
  }
];

const ConversationsList = ({ onSelectConversation, selectedUserId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setConversations(mockConversations);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
        <p className="text-center mb-4">No conversations yet</p>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => onSelectConversation(null)}
        >
          Start New Conversation
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b flex-none">
        <button 
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => onSelectConversation(null)}
        >
          New Message
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.otherUser.id}
            className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
              selectedUserId === conversation.otherUser.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => onSelectConversation(conversation.otherUser)}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                {conversation.otherUser.name.charAt(0)}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{conversation.otherUser.name}</h3>
                  <span className="text-sm text-gray-500">
                    {format(new Date(conversation.lastMessage.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className={`text-sm ${conversation.lastMessage.isRead ? 'text-gray-500' : 'text-black font-semibold'}`}>
                  {conversation.lastMessage.sender.id === conversation.otherUser.id ? '' : 'You: '}
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