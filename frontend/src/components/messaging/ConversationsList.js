import React, { useState, useEffect } from 'react';
import { getConversations } from '../../api/messages';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { PaperClipIcon, ChatBubbleLeftRightIcon, InboxIcon } from '@heroicons/react/24/outline'; // Import icons

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
        {/* Improved Loading Spinner */}
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-600">Loading conversations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <InboxIcon className="h-12 w-12 text-red-400 mb-3" />
        <p className="text-red-600 font-semibold mb-1">Error Loading</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button 
          onClick={() => fetchConversations(user?._id || user?.id)}
          className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-600 font-medium mb-1">No conversations yet</p>
        <p className="text-sm text-gray-500">Start a new chat to see it here.</p>
      </div>
    );
  }

  // Helper to format time
  const formatLastMessageTime = (time) => {
    if (!time) return '';
    const date = new Date(time);
    const now = new Date();
    const diffInDays = (now.setHours(0,0,0,0) - date.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24);

    if (diffInDays < 1) {
      return format(new Date(time), 'p'); // e.g., 4:30 PM
    } else if (diffInDays < 7) {
      return format(new Date(time), 'eee'); // e.g., 'Mon'
    } else {
      return format(new Date(time), 'MMM d'); // e.g., 'Mar 10'
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-200 shadow-sm z-10">
        <h2 className="text-lg font-semibold text-indigo-800 flex items-center">
          <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Conversations
        </h2>
      </div>
      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {conversations.map((conversation) => {
          const otherUser = conversation.otherUser;
          const lastMessage = conversation.lastMessage;
          const currentAuthUserId = user?._id || user?.id;
          const isUnread = lastMessage && !lastMessage.isRead && lastMessage.senderId !== currentAuthUserId;
          const lastMessageTime = lastMessage?.createdAt;
          const isSelected = selectedUserId === otherUser.id;

          // Generate a placeholder avatar if needed
          const avatarText = `${otherUser.firstName?.[0] || ''}${otherUser.lastName?.[0] || ''}`.toUpperCase() || '?';

          return (
            <div
              key={otherUser.id}
              onClick={() => onSelectUser(otherUser.id)}
              className={`p-3 hover:bg-indigo-50 cursor-pointer transition-colors duration-150 flex items-center space-x-3 ${isSelected ? 'bg-indigo-100' : ''}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 relative">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow ${isSelected ? 'ring-2 ring-offset-1 ring-indigo-400' : ''}`}>
                  <span className="text-white font-medium text-sm">{avatarText}</span>
                </div>
                {isUnread && (
                  <span className="absolute -top-0.5 -right-0.5 block h-3 w-3 rounded-full bg-pink-500 border-2 border-white"></span>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <h3 className={`text-sm font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-800'} truncate`}>
                    {otherUser.firstName || 'Unknown'} {otherUser.lastName || ''}
                  </h3>
                  <span className={`text-xs ${isUnread ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                    {formatLastMessageTime(lastMessageTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className={`text-xs ${isUnread ? 'text-gray-800 font-medium' : 'text-gray-500'} truncate max-w-[180px] flex items-center`}>
                    {lastMessage?.senderId === currentAuthUserId && <span className="mr-1">You:</span>}
                    {lastMessage?.attachmentUrl && (
                      <PaperClipIcon className={`h-3 w-3 mr-1 ${isUnread ? 'text-gray-600' : 'text-gray-400'}`} />
                    )}
                    {lastMessage?.content || (lastMessage?.attachmentUrl ? (lastMessage.attachmentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? 'Image' : 'File') : 'No messages yet')}
                  </p>
                  {isUnread && (
                    <span className="ml-2 flex-shrink-0 inline-block h-4 w-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-semibold shadow-sm">
                      1 {/* Replace with actual unread count if available */}
                    </span>
                  )}
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