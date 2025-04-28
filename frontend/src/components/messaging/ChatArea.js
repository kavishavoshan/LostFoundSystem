import React, { useRef, useEffect, useState } from 'react';
import { FaUser, FaCircle, FaPaperPlane, FaImage, FaSmile, FaMicrophone, FaPaperclip } from 'react-icons/fa';
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
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center">
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
            <div className="flex items-center">
              <button className="p-2 text-gray-600 hover:text-blue-500">
                <FaImage size={18} />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-500 ml-2">
                <FaUser size={18} />
              </button>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-100 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png')] bg-repeat">
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
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-end">
              <div className="flex items-center mr-2">
                <label htmlFor="image-upload" className="cursor-pointer text-gray-600 hover:text-blue-500">
                  <FaImage size={20} />
                  <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        try {
                          const file = e.target.files[0];
                          // Import the uploadImage function
                          const { uploadImage } = await import('../../api/messages');
                          await uploadImage(selectedUser.id, file);
                          // Clear the input
                          e.target.value = '';
                        } catch (error) {
                          console.error('Failed to upload image:', error);
                          alert('Failed to upload image. ' + error.message);
                        }
                      }
                    }}
                  />
                </label>
              </div>
              <div className="flex-1 bg-white rounded-full border border-gray-300 flex items-end">
                <button className="p-2 text-gray-600 hover:text-blue-500">
                  <FaSmile size={20} />
                </button>
                <Textarea
                  placeholder="Type a message..."
                  className="flex-1 resize-none border-0 focus:ring-0 rounded-full py-2 px-3 max-h-20"
                  rows={1}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button className="p-2 text-gray-600 hover:text-blue-500">
                  <FaPaperclip size={20} />
                </button>
              </div>
              {messageInput.trim() ? (
                <Button 
                  className="ml-2 rounded-full w-12 h-12 p-0 flex items-center justify-center"
                  onClick={handleSendMessage}
                >
                  <FaPaperPlane />
                </Button>
              ) : (
                <Button 
                  className="ml-2 rounded-full w-12 h-12 p-0 flex items-center justify-center bg-green-500 hover:bg-green-600"
                >
                  <FaMicrophone />
                </Button>
              )}
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