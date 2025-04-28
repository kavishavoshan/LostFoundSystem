import React from 'react';
import { FaUser, FaCheck, FaCheckDouble } from 'react-icons/fa';

const MessageBubble = ({ message, isCurrentUser, showAvatar = true }) => {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2 flex-shrink-0">
          <FaUser className="text-gray-600" size={12} />
        </div>
      )}
      <div 
        className={`max-w-[70%] rounded-lg p-3 ${isCurrentUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-white border border-gray-200'}`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className={`text-xs mt-1 flex items-center justify-end ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
          <span>{formattedTime}</span>
          {isCurrentUser && (
            <span className="ml-2 flex items-center">
              {message.read ? (
                <FaCheckDouble className="ml-1" size={10} />
              ) : (
                <FaCheck className="ml-1" size={10} />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;