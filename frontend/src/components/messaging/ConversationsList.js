import React, { useState, useEffect } from 'react';
import { getConversations } from '../../api/messages';
import { format } from 'date-fns';

const ConversationsList = ({ onSelectUser, selectedUserId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-gray-500 text-center">
          <p className="text-lg mb-2">No conversations yet</p>
          <p className="text-sm">Start a new conversation by selecting a user</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 bg-white p-4 border-b z-10">
        <h2 className="text-lg font-semibold">Messages</h2>
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
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">
                  {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage.content}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <span className="text-xs text-gray-500">
                  {format(new Date(conversation.lastMessage.createdAt), 'MMM d')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationsList; 