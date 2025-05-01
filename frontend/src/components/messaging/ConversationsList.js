import React, { useState, useEffect } from 'react';
import { getConversations } from '../../api/messages';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const ConversationsList = ({ onSelectUser, selectedUserId }) => {
  const { user } = useAuth(); // Get user from AuthContext
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Handle both _id and id formats from the backend
    const userId = user && (user._id || user.id);
    if (userId) { // Ensure user and userId exist
      fetchConversations(userId);
    }
  }, [user]); // Re-fetch if user changes

  const fetchConversations = async (userId) => {
    try {
      setLoading(true);
      const data = await getConversations(userId); // Pass userId to API call
      // Filter out any invalid conversations before setting state
      const validConversations = data.filter(conversation => 
        conversation && conversation.otherUser && conversation.otherUser.id
      );
      setConversations(validConversations);
      setError(null);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations.');
      setConversations([]); // Clear conversations on error
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
        {conversations.map((conversation) => {
          const isUnread = conversation.lastMessage && !conversation.lastMessage.isRead && 
                          conversation.lastMessage.senderId !== (user?._id || user?.id);
          const lastMessageTime = conversation.lastMessage?.createdAt ? 
                                 new Date(conversation.lastMessage.createdAt) : null;
          const today = new Date();
          const isToday = lastMessageTime && 
                         lastMessageTime.getDate() === today.getDate() &&
                         lastMessageTime.getMonth() === today.getMonth() &&
                         lastMessageTime.getFullYear() === today.getFullYear();
          
          return (
            <div
              key={conversation.otherUser.id}
              onClick={() => onSelectUser(conversation.otherUser.id)}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedUserId === conversation.otherUser.id ? 'bg-blue-50' : ''
              } ${isUnread ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 relative">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {conversation.otherUser.firstName?.[0]}
                      {conversation.otherUser.lastName?.[0]}
                    </span>
                  </div>
                  {isUnread && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${isUnread ? 'text-blue-800' : 'text-gray-900'} truncate`}>
                      {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {lastMessageTime && (
                        isToday ? 
                          format(lastMessageTime, 'h:mm a') : 
                          format(lastMessageTime, 'MMM d')
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-sm ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-600'} truncate`}>
                      {conversation.lastMessage?.content || 'Start a conversation'}
                    </p>
                    {isUnread && (
                      <span className="ml-2 flex-shrink-0 inline-block h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                        1
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationsList;