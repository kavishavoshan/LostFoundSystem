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
    <div className="h-full flex flex-col bg-gradient-to-b from-white to-indigo-50">
      <div className="sticky top-0 bg-gradient-to-r from-indigo-100 to-purple-100 p-4 border-b shadow-sm z-10">
        <h2 className="text-xl font-semibold text-indigo-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Messages
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
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
              className={`p-4 hover:bg-indigo-50 cursor-pointer transition-all duration-200 ${
                selectedUserId === conversation.otherUser.id ? 'bg-indigo-100' : ''
              } ${isUnread ? 'bg-purple-50' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-md transform transition-transform duration-200 hover:scale-105">
                    <span className="text-white font-medium">
                      {conversation.otherUser.firstName?.[0] || '?'}
                      {conversation.otherUser.lastName?.[0] || ''}
                    </span>
                  </div>
                  {isUnread && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-pink-500 animate-pulse shadow-sm"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${isUnread ? 'text-indigo-800' : 'text-gray-900'} truncate`}>
                      {conversation.otherUser.firstName || 'Unknown'} {conversation.otherUser.lastName || ''}
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
                    <p className={`text-sm ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-600'} truncate max-w-[180px]`}>
                      {conversation.lastMessage?.content || 'Start a conversation'}
                      {conversation.lastMessage?.attachmentUrl && (
                        <span className="ml-1 inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {conversation.lastMessage.attachmentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? 'Image' : 'File'}
                        </span>
                      )}
                    </p>
                    {isUnread && (
                      <span className="ml-2 flex-shrink-0 inline-block h-5 w-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs flex items-center justify-center shadow-sm">
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