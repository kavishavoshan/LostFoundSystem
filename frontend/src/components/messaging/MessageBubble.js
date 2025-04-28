import React, { useState } from 'react';
import { FaUser, FaCheck, FaCheckDouble, FaEllipsisV, FaTrash, FaPencilAlt, FaClock } from 'react-icons/fa';
import { editMessage, deleteMessage } from '../../api/messages';

const MessageBubble = ({ message, isCurrentUser, showAvatar = true }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  
  // Check if message is recent (less than 15 minutes old)
  const isRecent = () => {
    const messageTime = new Date(message.createdAt).getTime();
    const currentTime = new Date().getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    return (currentTime - messageTime) < fifteenMinutes;
  };
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
        className={`max-w-[70%] rounded-lg p-3 relative ${isCurrentUser 
          ? 'bg-green-500 text-white rounded-tr-none' 
          : 'bg-white border border-gray-200 rounded-tl-none'}`}
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
      >
        {isEditing ? (
          <div className="mb-2">
            <textarea 
              className="w-full p-2 border rounded text-gray-800 text-sm"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="flex justify-end mt-1">
              <button 
                className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded mr-1"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button 
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                onClick={async () => {
                  try {
                    // Call the API to update the message
                    await editMessage(message.id, editContent);
                    // Update the message content locally
                    message.content = editContent;
                    message.isEdited = true;
                    setIsEditing(false);
                  } catch (error) {
                    console.error('Failed to update message:', error);
                    alert('Failed to update message. ' + error.message);
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">
            {message.isDeleted ? (
              <span className="italic text-gray-400">{message.content}</span>
            ) : message.imageUrl ? (
              <div>
                <img 
                  src={message.imageUrl} 
                  alt="Shared image" 
                  className="rounded-md max-w-full max-h-60 mb-2" 
                />
                {message.content !== 'Image' && message.content}
              </div>
            ) : (
              message.content
            )}
            {message.isEdited && !message.isDeleted && (
              <span className="text-xs italic ml-2">(edited)</span>
            )}
          </p>
        )}
        
        {/* Message options */}
        {showOptions && isCurrentUser && isRecent() && !isEditing && (
          <div className="absolute top-0 right-0 -mt-8 bg-white shadow-md rounded-md py-1 px-2 flex">
            <button 
              className="text-gray-600 hover:text-blue-500 p-1"
              onClick={() => setIsEditing(true)}
              title="Edit message"
            >
              <FaPencilAlt size={12} />
            </button>
            <button 
              className="text-gray-600 hover:text-red-500 p-1"
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this message?')) {
                  try {
                    // Call the API to delete the message
                    await deleteMessage(message.id);
                    // Update the message content locally
                    message.content = 'This message was deleted';
                    message.isDeleted = true;
                    // Force re-render
                    setShowOptions(false);
                  } catch (error) {
                    console.error('Failed to delete message:', error);
                    alert('Failed to delete message. ' + error.message);
                  }
                }
              }}
              title="Delete message"
            >
              <FaTrash size={12} />
            </button>
          </div>
        )}
        
        <div className={`text-xs mt-1 flex items-center justify-end ${isCurrentUser ? 'text-green-100' : 'text-gray-500'}`}>
          {isRecent() && isCurrentUser && (
            <span className="mr-1 flex items-center" title="Can edit or delete for 15 minutes">
              <FaClock size={10} className="mr-1" />
            </span>
          )}
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