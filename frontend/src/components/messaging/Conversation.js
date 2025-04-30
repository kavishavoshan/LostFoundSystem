import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage, deleteMessage, markMessageAsRead } from '../../api/messages';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:3001';

const Conversation = ({ userId, socket }) => {
  const { user } = useAuth(); // Get current user from AuthContext

  // ADDED: Log the raw user object from context
  console.log('[Conversation Render] Raw user object from useAuth:', user);

  // REMOVED: currentUserId derivation moved inside useEffect

  // ADD LOGS HERE (outside useEffect)
  console.log('[Conversation Render] Props:', { userId, socket });
  console.log('[Conversation Render] Auth user state:', user);
  // console.log('[Conversation Render] Derived currentUserId:', currentUserId); // Removed as it's derived later
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

  // Derive currentUserId outside useEffect, but ensure it updates if user changes
  const currentUserId = user && (user._id || user.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effect for fetching messages when userId or currentUser changes
  useEffect(() => {
    const fetchMessages = async () => {
      console.log('[Conversation fetchEffect] Running fetch effect. Props:', { userId });
      console.log('[Conversation fetchEffect] Current auth user state:', user);
      console.log('[Conversation fetchEffect] Derived currentUserId:', currentUserId);

      // Ensure both IDs are present before attempting to fetch
      if (!currentUserId || !userId) {
        console.warn('[Conversation fetchEffect] Skipping fetch: Missing user information.', { currentUserId, userId });
        setMessages([]); // Clear messages if IDs are missing
        if (!loading) setLoading(true); // Reset loading state if needed
        setError(null); // Clear any previous error
        return;
      }

      let fetchAttempted = false;
      try {
        setLoading(true);
        fetchAttempted = true;
        console.log('[Conversation fetchEffect] Proceeding to fetch messages between', currentUserId, 'and', userId);
        const fetchedMessages = await getMessages(userId, currentUserId);
        console.log('[Conversation fetchEffect] Fetched messages:', fetchedMessages);
        setMessages(fetchedMessages);

        // Mark unread messages as read (consider moving this logic if needed)
        const unreadMessages = fetchedMessages.filter(
          msg => msg.senderId !== currentUserId && !msg.isRead
        );
        for (const msg of unreadMessages) {
          // Use await, but don't block UI updates if marking fails
          markMessageAsRead(msg.id, currentUserId).catch(err => {
            console.warn(`Failed to mark message ${msg.id} as read:`, err);
          });
        }

        setError(null);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load messages';
        setError(`Error: ${errorMessage}`);
        console.error('[Conversation fetchEffect] Error fetching messages:', err);
        setMessages([]); // Clear messages on error
      } finally {
        if (fetchAttempted) {
          setLoading(false);
        }
      }
    };

    fetchMessages();
  }, [userId, user]); // Depend only on userId and user for fetching

  // Effect for scrolling when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]); // Depend only on messages for scrolling

  // Effect for setting up socket listeners
  useEffect(() => {
    if (!socket || !currentUserId || !userId) {
      // Don't set up listeners if socket or necessary IDs aren't ready
      return;
    }

    console.log('[Conversation socketEffect] Setting up socket listeners for user:', userId);

    const handleNewMessage = (message) => {
      // Check if the message belongs to the current conversation
      const isRelevant = (message.senderId === userId && message.receiverId === currentUserId) ||
                         (message.senderId === currentUserId && message.receiverId === userId);

      if (isRelevant) {
        console.log('[Socket] Received relevant newMessage:', message);
        setMessages((prevMessages) => {
          // Avoid adding duplicate messages if already present
          if (prevMessages.some(msg => msg.id === message.id)) {
            return prevMessages;
          }
          return [...prevMessages, message];
        });
        // Mark as read if received from the other user
        if (message.senderId === userId) {
          markMessageAsRead(message.id, currentUserId).catch(err => {
            console.warn(`[Socket] Failed to mark message ${message.id} as read:`, err);
          });
        }
      }
    };

    const handleMessageDeleted = (deletedInfo) => {
      // Ensure deletedInfo contains the messageId and potentially the conversation context
      const messageId = deletedInfo.messageId;
      console.log('[Socket] Received messageDeleted:', messageId);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== messageId)
      );
    };

    const handleMessageEdited = (editedMessage) => {
      // Check if the edited message belongs to the current conversation
      const isRelevant = (editedMessage.senderId === userId && editedMessage.receiverId === currentUserId) ||
                         (editedMessage.senderId === currentUserId && editedMessage.receiverId === userId);

      if (isRelevant) {
        console.log('[Socket] Received messageEdited:', editedMessage);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === editedMessage.id ? editedMessage : msg
          )
        );
      }
    };

    const handleMessageRead = (readInfo) => {
      // Ensure readInfo contains the messageId and potentially the conversation context
      const messageId = readInfo.messageId;
      console.log('[Socket] Received messageRead:', messageId);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    };

    // Register listeners
    socket.on('newMessage', handleNewMessage);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('messageEdited', handleMessageEdited);
    socket.on('messageRead', handleMessageRead);

    // Emit join event to server
    socket.emit('join', { userId: currentUserId });

    // Cleanup function
    return () => {
      console.log('[Conversation socketEffect] Cleaning up socket listeners for user:', userId);
      socket.off('newMessage', handleNewMessage);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('messageEdited', handleMessageEdited);
      socket.off('messageRead', handleMessageRead);
    };

  }, [socket, userId, currentUserId]); // Depend on socket, userId, and currentUserId

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

      if (!userId) {
        setError('Recipient information is missing');
        return;
      }
      
      console.log('Sending message to', userId, ':', messageContent);
      
      // First try to send via socket for real-time delivery
      if (socket && socket.connected) {
        console.log('[Socket] Emitting sendMessage event');
        socket.emit('sendMessage', {
          receiverId: userId,
          content: messageContent,
          attachmentUrl
        });
      }
      
      // Also send via HTTP API as a fallback
      const sentMessage = await sendMessage(userId, messageContent, attachmentUrl);
      console.log('Message sent successfully:', sentMessage);
      
      // Only add to messages if not already added by socket event
      setMessages(prev => {
        if (prev.some(msg => 
          msg.content === messageContent && 
          msg.senderId === currentUserId && 
          msg.receiverId === userId &&
          new Date(msg.createdAt).getTime() > Date.now() - 5000)) {
          return prev; // Skip if a similar message was recently added (likely from socket)
        }
        return [...prev, sentMessage];
      });
      
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
      await deleteMessage(messageId, currentUserId);
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
        userId: currentUserId,
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
            onClick={() => {
              setError(null); // Clear the error
              setLoading(true); // Set back to loading state
              // The useEffect hook will automatically attempt to refetch
              // when the state updates or if dependencies change.
            }}
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
            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div className="group relative">
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                  message.senderId === currentUserId
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
                      message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {format(new Date(message.createdAt), 'h:mm a')}
                    </div>
                  </>
                )}
              </div>
              
              {message.senderId === currentUserId && (
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