import React, { useRef, useEffect } from 'react';
import { FaUser, FaCircle, FaPaperPlane } from 'react-icons/fa';
import { Textarea } from '../UI/textArea';
import { Button } from '../UI/button';
import MessageBubble from './MessageBubble';

const ChatArea = ({ 
  selectedUser, 
  messages, 
  messageInput, 
  setMessageInput, 
  handleSendMessage, 
  currentUser 
}) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {selectedUser ? (
        <>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <FaUser className="text-gray-600" size={16} />
            </div>
            <div className="ml-3">
              <h3 className="font-semibold">{selectedUser.name}</h3>
              <div className="flex items-center text-xs text-green-500">
                <FaCircle size={8} className="mr-1" />
                <span>Online</span>
              </div>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.length > 0 ? (
              messages.map((message, index) => {
                const isCurrentUser = message.sender.id === currentUser?.id;
                const showAvatar = index === 0 || 
                  (messages[index-1] && messages[index-1].sender.id !== message.sender.id);
                
                return (
                  <MessageBubble 
                    key={message.id || index}
                    message={message}
                    isCurrentUser={isCurrentUser}
                    showAvatar={showAvatar}
                  />
                );
              })
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500">
                <p>No messages yet. Start a conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex">
              <Textarea
                placeholder="Type a message..."
                className="flex-1 resize-none"
                rows={2}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button 
                className="ml-2 self-end flex items-center justify-center"
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
              >
                <FaPaperPlane className="mr-1" />
                Send
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
          <FaUser size={48} className="mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default ChatArea;