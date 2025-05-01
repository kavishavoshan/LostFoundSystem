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
        
        // Process unread messages in a more robust way
        if (unreadMessages.length > 0) {
          console.log(`[Conversation] Marking ${unreadMessages.length} messages as read`);
          
          for (const msg of unreadMessages) {
            // Enhanced validation for message ID
            const messageId = msg?.id || msg?._id;
            
            if (messageId && currentUserId) {
              try {
                // Use await, but don't block UI updates if marking fails
                markMessageAsRead(messageId, currentUserId).catch(err => {
                  console.warn(`Failed to mark message ${messageId} as read:`, err);
                });
              } catch (markError) {
                console.error(`Error marking message ${messageId} as read:`, markError);
              }
            } else {
              console.warn('Cannot mark message as read - missing data:', { 
                messageId: messageId || 'missing', 
                userId: currentUserId || 'missing',
                message: msg
              });
            }
          }
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

  // State for typing indicator
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  
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
          if (prevMessages.some(msg => (msg.id === message.id) || (msg._id === message._id))) {
            return prevMessages;
          }
          return [...prevMessages, message];
        });
        
        // If the other user was typing, reset typing indicator when message is received
        if (message.senderId === userId) {
          setOtherUserTyping(false);
          
          // Mark as read if received from the other user
          const messageId = message?.id || message?._id;
          
          if (messageId && currentUserId) {
            console.log(`[Socket] Marking message ${messageId} as read`);
            markMessageAsRead(messageId, currentUserId).catch(err => {
              console.warn(`[Socket] Failed to mark message ${messageId} as read:`, err);
            });
            
            // Emit message read status via socket
            socket.emit('messageStatus', {
              messageId: messageId,
              status: 'read'
            });
          } else {
            console.warn('[Socket] Cannot mark message as read - missing data:', { 
              messageId: messageId || 'missing', 
              userId: currentUserId || 'missing'
            });
          }
        }
      }
    };

    const handleMessageDeleted = (deletedInfo) => {
      // Ensure deletedInfo contains the messageId and potentially the conversation context
      const messageId = deletedInfo?.messageId;
      if (!messageId) {
        console.warn('[Socket] Received messageDeleted event with missing messageId:', deletedInfo);
        return;
      }
      console.log('[Socket] Received messageDeleted:', messageId);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => (msg.id !== messageId && msg._id !== messageId))
      );
    };

    const handleMessageEdited = (editedMessage) => {
      // Check if the edited message belongs to the current conversation
      if (!editedMessage) {
        console.warn('[Socket] Received messageEdited event with invalid message:', editedMessage);
        return;
      }
      
      // Enhanced validation for message ID
      const messageId = editedMessage?.id || editedMessage?._id;
      if (!messageId) {
        console.warn('[Socket] Received messageEdited event with missing ID:', editedMessage);
        return;
      }
      
      const isRelevant = (editedMessage.senderId === userId && editedMessage.receiverId === currentUserId) ||
                         (editedMessage.senderId === currentUserId && editedMessage.receiverId === userId);

      if (isRelevant) {
        console.log('[Socket] Received messageEdited:', editedMessage);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            (msg.id === messageId || msg._id === messageId) ? editedMessage : msg
          )
        );
      }
    };
    
    // Handle typing indicator from other user
    const handleTypingEvent = (typingData) => {
      if (typingData.senderId === userId) {
        console.log('[Socket] Typing indicator received:', typingData);
        setOtherUserTyping(typingData.isTyping);
      }
    };
    
    // Handle message read status updates
    const handleMessageRead = (readData) => {
      // Check if this is the simplified format or the detailed format
      const messageId = readData?.messageId;
      const userId = readData?.userId;
      
      if (messageId) {
        console.log('[Socket] Message read status received:', readData);
        
        // Handle both formats of read status updates
        setMessages(prevMessages => 
          prevMessages.map(msg => {
            const msgId = msg.id || msg._id;
            if (msgId === messageId) {
              return { 
                ...msg, 
                isRead: true, 
                readAt: readData.readAt || new Date() 
              };
            }
            return msg;
          })
        );
      } else {
        console.warn('[Socket] Received messageRead event with missing messageId:', readData);
      }
    };

    // Register listeners
    socket.on('newMessage', handleNewMessage);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('messageEdited', handleMessageEdited);
    socket.on('typing', handleTypingEvent);
    socket.on('messageRead', handleMessageRead);

    // Emit join event to server
    socket.emit('join', { userId: currentUserId });

    // Cleanup function
    return () => {
      console.log('[Conversation socketEffect] Cleaning up socket listeners for user:', userId);
      socket.off('newMessage', handleNewMessage);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('messageEdited', handleMessageEdited);
      socket.off('typing', handleTypingEvent);
      socket.off('messageRead', handleMessageRead);
    };

  }, [socket, userId, currentUserId]); // Depend on socket, userId, and currentUserId

  // Handle typing indicator
  const handleTyping = (e) => {
    const content = e.target.value;
    setNewMessage(content);
    
    // Only emit typing events if we have a socket and the necessary IDs
    if (socket && socket.connected && userId && currentUserId) {
      // Set local typing state
      if (!isTyping && content.length > 0) {
        setIsTyping(true);
        // Emit typing started event
        socket.emit('typing', {
          recipientId: userId,
          isTyping: true
        });
      } else if (isTyping && content.length === 0) {
        setIsTyping(false);
        // Emit typing stopped event
        socket.emit('typing', {
          recipientId: userId,
          isTyping: false
        });
      }
      
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set a new timeout to stop the typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          socket.emit('typing', {
            recipientId: userId,
            isTyping: false
          });
        }
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || loading) return;

    try {
      let messageContent = newMessage.trim();
      let attachmentUrl = null;

      // Reset typing indicator when sending a message
      if (isTyping) {
        setIsTyping(false);
        if (socket && socket.connected) {
          socket.emit('typing', {
            recipientId: userId,
            isTyping: false
          });
        }
      }

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
          const uploadResponse = await axios.post(`${API_URL}/messages/upload`, formData, {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            },
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          attachmentUrl = uploadResponse.data.url;
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          setError('Failed to upload file. Please try again.');
          setUploadProgress(0);
          return;
        }
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
      // Find the message to check if it's within the 15-minute window
      const message = messages.find(msg => (msg.id === messageId || msg._id === messageId));
      if (!message) {
        setError('Message not found');
        return;
      }
      
      // Check if the message can be deleted (same logic as canEditMessage)
      if (!canEditMessage(message)) {
        setError('Messages can only be deleted within 15 minutes of sending');
        return;
      }
      
      // First try to delete via socket for real-time updates
      if (socket && socket.connected) {
        console.log('[Socket] Emitting deleteMessage event');
        socket.emit('deleteMessage', { messageId });
      }
      
      // Also delete via HTTP API as a fallback
      await deleteMessage(messageId, currentUserId);
      
      // Update local state
      setMessages(prev => prev.filter(msg => (msg.id !== messageId && msg._id !== messageId)));
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(err.message || 'Failed to delete message');
    }
  };

  const handleEditMessage = async (messageId, content) => {
    try {
      // Find the message to check if it's within the 15-minute window
      const message = messages.find(msg => (msg.id === messageId || msg._id === messageId));
      if (!message) {
        setError('Message not found');
        return;
      }
      
      // Check if the message can be edited (using the canEditMessage function)
      if (!canEditMessage(message)) {
        setError('Messages can only be edited within 15 minutes of sending');
        return;
      }
      
      // First try to edit via socket for real-time updates
      if (socket && socket.connected) {
        console.log('[Socket] Emitting editMessage event');
        socket.emit('editMessage', { messageId, content });
      }
      
      // Also edit via HTTP API as a fallback
      const response = await axios.put(`${API_URL}/messages/${messageId}`, {
        content,
        userId: currentUserId,
      });
      
      // Update local state
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          (msg.id === messageId || msg._id === messageId) ? response.data : msg
        )
      );
      
      setEditingMessageId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error editing message:', err);
      setError(err.message || 'Failed to edit message');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    // Check file type for images and documents
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('File type not supported. Please upload an image, PDF, or document.');
      return;
    }
    
    setSelectedFile(file);
    setError(null); // Clear any previous errors
    
    // Show a preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // You could set an image preview here if you want to add that feature
        console.log('Image file loaded successfully');
      };
      reader.readAsDataURL(file);
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

  // Function to get user name from message
  const getUserName = (message, isCurrentUser) => {
    if (isCurrentUser) {
      return user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'You';
    }
    
    // Try to extract name from populated sender/receiver
    const otherUser = message.senderId === currentUserId ? message.receiverId : message.senderId;
    if (typeof otherUser === 'object' && otherUser) {
      return otherUser.firstName ? `${otherUser.firstName} ${otherUser.lastName || ''}` : 'User';
    }
    
    return 'User';
  };
  
  // Check if a message can be edited (within 15 minutes)
  const canEditMessage = (message) => {
    if (message.senderId !== currentUserId) return false;
    
    const createdAt = new Date(message.createdAt);
    const now = new Date();
    const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    return diffInMinutes <= 15;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 shadow-sm">
            <span className="text-blue-600 font-semibold">
              {messages.length > 0 && messages[0].receiverId !== currentUserId ? 
                getUserName(messages[0], false).charAt(0).toUpperCase() : 
                userId && userId.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {messages.length > 0 && messages[0].receiverId !== currentUserId ? 
                getUserName(messages[0], false) : 'Chat'}
            </h2>
            {otherUserTyping && (
              <div className="text-xs text-gray-500 animate-pulse flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                typing...
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center text-gray-500">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId;
          const messageId = message.id || message._id;
          const canEdit = canEditMessage(message);
          
          return (
            <div
              key={messageId || `msg-${Date.now()}-${Math.random()}`}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`group relative max-w-[80%] ${isCurrentUser ? 'order-1' : 'order-2'}`}>
                {!isCurrentUser && (
                  <div className="absolute -left-10 top-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-700 text-xs font-semibold">
                      {getUserName(message, false).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div className="flex flex-col">
                  <span className={`text-xs text-gray-500 mb-1 ${isCurrentUser ? 'text-right mr-1' : 'text-left ml-1'}`}>
                    {isCurrentUser ? getUserName(message, true) : getUserName(message, false)}
                  </span>
                  
                  <div
                    className={`relative px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    {/* Message bubble tail */}
                    <span className={`absolute bottom-0 ${isCurrentUser ? 'right-0 -mb-2 -mr-1' : 'left-0 -mb-2 -ml-1'}`}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0H20L0 20V0Z" fill={isCurrentUser ? '#3B82F6' : '#F3F4F6'} />
                      </svg>
                    </span>
                  
                    {editingMessageId === messageId ? (
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
                            onClick={() => handleEditMessage(messageId, editContent)}
                            className="text-xs hover:underline"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm">{message.content}</p>
                        {message.isEdited && (
                          <span className={`text-xs ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
                            (edited)
                          </span>
                        )}
                        {message.attachmentUrl && (
                          <div className="mt-2">
                            {message.attachmentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                              <img
                                src={message.attachmentUrl}
                                alt="attachment"
                                className="max-w-full rounded"
                                onClick={() => window.open(message.attachmentUrl, '_blank')}
                                style={{ cursor: 'pointer' }}
                              />
                            ) : (
                              <a
                                href={message.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm underline flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                </svg>
                                View attachment
                              </a>
                            )}
                          </div>
                        )}
                        <div className={`flex items-center ${isCurrentUser ? 'justify-end' : 'justify-start'} mt-1 text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                          {format(new Date(message.createdAt), 'h:mm a')}
                          {isCurrentUser && (
                            <span className="ml-1" title={message.isRead ? "Read" : "Delivered"}>
                              {message.isRead ? (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {isCurrentUser && canEdit && (
                  <div className="absolute top-0 right-0 hidden group-hover:flex items-center space-x-1 -mr-20 bg-white rounded-lg shadow-md px-2 py-1">
                    <button
                      onClick={() => {
                        setEditingMessageId(messageId);
                        setEditContent(message.content);
                      }}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(messageId)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {otherUserTyping && (
        <div className="px-4 py-2 bg-gray-50 border-t">
          <div className="flex items-center text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '600ms' }}></div>
            </div>
            <span className="ml-2 text-sm">User is typing...</span>
          </div>
        </div>
      )}

      <div className="sticky bottom-0 bg-white border-t z-10">
        {selectedFile && (
          <div className="px-4 pt-2 flex items-center">
            <span className="text-xs text-gray-500 flex items-center flex-1 truncate">
              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="truncate">{selectedFile.name}</span> ({Math.round(selectedFile.size / 1024)} KB)
            </span>
            <button 
              type="button" 
              className="ml-2 text-xs text-red-500 hover:text-red-700 flex-shrink-0"
              onClick={() => setSelectedFile(null)}
            >
              Remove
            </button>
          </div>
        )}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="px-4 pt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="p-4">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 relative flex-shrink-0"
              title="Attach a file"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {selectedFile && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
              )}
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
              onChange={handleTyping}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={(!newMessage.trim() && !selectedFile) || loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Conversation;