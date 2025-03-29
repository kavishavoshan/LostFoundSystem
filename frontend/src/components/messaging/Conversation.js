import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage, deleteMessage, markMessageAsRead } from '../../api/messages';
import { format } from 'date-fns';
import axios from 'axios';

const TEST_USER_ID = 1; // Using the first test user's ID
const API_URL = 'http://localhost:3001';

const Conversation = ({ userId, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const fetchedMessages = await getMessages(userId);
        setMessages(fetchedMessages);
        
        // Mark unread messages as read
        const unreadMessages = fetchedMessages.filter(
          msg => msg.senderId !== TEST_USER_ID && !msg.isRead
        );
        
        for (const msg of unreadMessages) {
          await markMessageAsRead(msg.id);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load messages');
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    scrollToBottom();

    if (socket) {
      socket.on('newMessage', (message) => {
        if (message.senderId === userId || message.receiverId === userId) {
          setMessages((prevMessages) => [...prevMessages, message]);
          if (message.senderId !== TEST_USER_ID) {
            markMessageAsRead(message.id);
          }
          scrollToBottom();
        }
      });

      socket.on('messageDeleted', (messageId) => {
        setMessages((prevMessages) => 
          prevMessages.filter((msg) => msg.id !== messageId)
        );
      });

      socket.on('messageEdited', (editedMessage) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === editedMessage.id ? editedMessage : msg
          )
        );
      });

      socket.on('messageRead', (messageId) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('newMessage');
        socket.off('messageDeleted');
        socket.off('messageEdited');
        socket.off('messageRead');
      }
    };
  }, [userId, socket]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || loading) return;

    try {
      let messageContent = newMessage.trim();
      let attachmentUrl = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadResponse = await axios.post(`${API_URL}/messages/upload`, formData, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          },
        });

        attachmentUrl = uploadResponse.data.url;
      }

      const sentMessage = await sendMessage(userId, messageContent, attachmentUrl);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      setSelectedFile(null);
      setUploadProgress(0);
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  };

  const handleEditMessage = async (messageId, content) => {
    try {
      const response = await axios.put(`${API_URL}/messages/${messageId}`, {
        content,
        userId: TEST_USER_ID,
      });
      
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? response.data : msg
        )
      );
      
      setEditingMessageId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error editing message:', err);
      setError('Failed to edit message');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      setSelectedFile(file);
    } else {
      setError('File size must be less than 5MB');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-red-500 text-center">
          <p className="font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-white border-b">
        <h2 className="text-xl font-semibold">Chat</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === TEST_USER_ID ? 'justify-end' : 'justify-start'}`}
          >
            <div className="group relative">
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                  message.senderId === TEST_USER_ID
                    ? 'bg-blue-500 text-white ml-12'
                    : 'bg-gray-100 text-gray-900 mr-12'
                }`}
              >
                {editingMessageId === message.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-2 py-1 rounded border text-gray-900"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingMessageId(null)}
                        className="text-xs hover:underline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditMessage(message.id, editContent)}
                        className="text-xs hover:underline"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm">{message.content}</p>
                    {message.attachmentUrl && (
                      <div className="mt-2">
                        {message.attachmentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img
                            src={message.attachmentUrl}
                            alt="attachment"
                            className="max-w-full rounded"
                          />
                        ) : (
                          <a
                            href={message.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline"
                          >
                            View attachment
                          </a>
                        )}
                      </div>
                    )}
                    <div className={`flex items-center justify-end mt-1 text-xs ${
                      message.senderId === TEST_USER_ID ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {format(new Date(message.createdAt), 'h:mm a')}
                    </div>
                  </>
                )}
              </div>
              
              {message.senderId === TEST_USER_ID && (
                <div className="absolute top-0 right-0 hidden group-hover:flex items-center space-x-1 -mr-20 bg-white rounded-lg shadow-md px-2 py-1">
                  <button
                    onClick={() => {
                      setEditingMessageId(message.id);
                      setEditContent(message.content);
                    }}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={selectedFile ? `File selected: ${selectedFile.name}` : "Type a message..."}
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={(!newMessage.trim() && !selectedFile) || loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Conversation; 