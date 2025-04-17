import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { deleteMessage, editMessage } from '../../services/messageService';

const mockMessages = {
  1: [
    {
      id: 1,
      content: 'Hi, I found your wallet!',
      createdAt: new Date(Date.now() - 3600000),
      sender: { id: 2, name: 'Jane Smith' },
      receiver: { id: 1, name: 'John Doe' },
      isRead: true
    },
    {
      id: 2,
      content: 'Thank you so much! Where can I pick it up?',
      createdAt: new Date(Date.now() - 1800000),
      sender: { id: 1, name: 'John Doe' },
      receiver: { id: 2, name: 'Jane Smith' },
      isRead: true
    },
    {
      id: 3,
      content: 'I can meet you at the library tomorrow at 2pm',
      createdAt: new Date(),
      sender: { id: 2, name: 'Jane Smith' },
      receiver: { id: 1, name: 'John Doe' },
      isRead: false
    }
  ],
  2: [
    {
      id: 4,
      content: 'Hello, I lost my phone at the park',
      createdAt: new Date(Date.now() - 7200000),
      sender: { id: 1, name: 'John Doe' },
      receiver: { id: 2, name: 'Jane Smith' },
      isRead: true
    },
    {
      id: 5,
      content: 'I think I found it! Is it a black iPhone?',
      createdAt: new Date(Date.now() - 3600000),
      sender: { id: 2, name: 'Jane Smith' },
      receiver: { id: 1, name: 'John Doe' },
      isRead: true
    }
  ]
};

const Conversation = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedUser) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setMessages(mockMessages[selectedUser.id] || []);
        setLoading(false);
      }, 1000);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      content: newMessage,
      createdAt: new Date(),
      sender: { id: 1, name: 'John Doe' },
      receiver: selectedUser,
      isRead: false
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const handleEditMessage = async () => {
    if (!editingMessage || !editContent.trim()) return;
    
    try {
      const updatedMessage = await editMessage(editingMessage.id, editContent);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === editingMessage.id ? { ...msg, content: editContent } : msg
        )
      );
      setEditingMessage(null);
      setEditContent('');
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Failed to edit message');
    }
  };

  if (!selectedUser) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a conversation or start a new one</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white relative">
      <div className="flex-none p-4 border-b">
        <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 pb-20">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender.id === 1 ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`relative max-w-xl px-4 py-2 rounded-lg shadow ${
                message.sender.id === 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              {editingMessage?.id === message.id ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 px-2 py-1 text-gray-800 bg-white rounded border"
                  />
                  <button
                    onClick={handleEditMessage}
                    className="text-green-500 hover:text-green-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setEditingMessage(null);
                      setEditContent('');
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <p>{message.content}</p>
                  <div className={`text-xs mt-1 ${message.sender.id === 1 ? 'text-blue-100' : 'text-gray-500'}`}>
                    {format(new Date(message.createdAt), 'h:mm a')}
                  </div>
                </>
              )}
              {message.sender.id === 1 && (
                <div className="absolute -right-16 top-0 flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingMessage(message);
                      setEditContent(message.content);
                    }}
                    className="text-gray-500 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex-none p-4 bg-white border-t">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Conversation;