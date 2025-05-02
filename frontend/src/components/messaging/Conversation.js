import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage, deleteMessage, markMessageAsRead } from '../../api/messages';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
// Import necessary icons
import { PaperClipIcon, TrashIcon, PencilIcon, XMarkIcon, PaperAirplaneIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline'; 

const API_URL = 'http://localhost:3001';

const Conversation = ({ userId, socket }) => {
  const { user } = useAuth(); // Get current user from AuthContext

  // State for messages and UI
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reconnecting, setReconnecting] = useState(false);
  const [messageStatus, setMessageStatus] = useState({});
  
  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Derive currentUserId from user object
  const currentUserId = user && (user._id || user.id);

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effect for fetching messages when userId or currentUser changes
  useEffect(() => {
    const fetchMessages = async () => {
      // Clear any existing retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      // Ensure both IDs are present before attempting to fetch
      if (!currentUserId || !userId) {
        console.warn('[Conversation] Skipping fetch: Missing user information.', { currentUserId, userId });
        setMessages([]); // Clear messages if IDs are missing
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('[Conversation] Fetching messages between', currentUserId, 'and', userId);
        const fetchedMessages = await getMessages(userId, currentUserId);
        
        if (Array.isArray(fetchedMessages)) {
          setMessages(fetchedMessages);
          
          // Mark unread messages as read
          const unreadMessages = fetchedMessages.filter(
            msg => msg.senderId !== currentUserId && !msg.isRead
          );
          
          if (unreadMessages.length > 0) {
            console.log(`[Conversation] Marking ${unreadMessages.length} messages as read`);
            
            for (const msg of unreadMessages) {
              const messageId = msg?.id || msg?._id;
              
              if (messageId && currentUserId) {
                try {
                  await markMessageAsRead(messageId, currentUserId);
                  
                  // Emit message read status via socket if connected
                  if (socket && socket.connected) {
                    socket.emit('messageStatus', {
                      messageId: messageId,
                      status: 'read'
                    });
                  }
                } catch (markError) {
                  console.warn(`Failed to mark message ${messageId} as read:`, markError);
                }
              }
            }
          }
        } else {
          console.error('[Conversation] Invalid messages data received:', fetchedMessages);
          setMessages([]);
          setError('Invalid data received from server');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load messages';
        console.error('[Conversation] Error fetching messages:', err);
        setError(`Error: ${errorMessage}`);
        
        // Set up retry after 10 seconds
        retryTimeoutRef.current = setTimeout(() => {
          console.log('[Conversation] Retrying message fetch...');
          fetchMessages();
        }, 10000);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Cleanup function
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [userId, currentUserId, socket]);

  // Effect for scrolling when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // State for typing indicator
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  // Effect for setting up socket listeners
  useEffect(() => {
    if (!socket || !currentUserId || !userId) {
      return;
    }

    console.log('[Conversation] Setting up socket listeners');
    setReconnecting(false);

    const handleNewMessage = (message) => {
      // Check if the message belongs to the current conversation
      const isRelevant = (message.senderId === userId && message.receiverId === currentUserId) ||
                         (message.senderId === currentUserId && message.receiverId === userId);

      if (isRelevant) {
        console.log('[Socket] Received new message:', message);
        
        // Add message to state if not already present - using a more robust check
        setMessages((prevMessages) => {
          const messageId = message.id || message._id;
          // Check if message already exists in the array
          const messageExists = prevMessages.some(msg => 
            (msg.id === messageId) || (msg._id === messageId)
          );
          
          if (messageExists) {
            console.log('[Socket] Message already exists in state, not adding duplicate');
            return prevMessages;
          }
          // Ensure the message has the correct sender/receiver structure
          const enhancedMessage = {
            ...message,
            senderId: message.senderId,
            receiverId: message.receiverId
          };
          return [...prevMessages, enhancedMessage];
        });
        
        // Reset typing indicator when message is received
        if (message.senderId === userId) {
          setOtherUserTyping(false);
          
          // Mark as read if received from the other user
          const messageId = message?.id || message?._id;
          
          if (messageId && currentUserId) {
            markMessageAsRead(messageId, currentUserId).catch(err => {
              console.warn(`Failed to mark message ${messageId} as read:`, err);
            });
            
            // Emit message read status via socket
            socket.emit('messageStatus', {
              messageId: messageId,
              status: 'read'
            });
          }
        }
      }
    };

    const handleMessageDeleted = (deletedInfo) => {
      const messageId = deletedInfo?.messageId;
      if (!messageId) {
        console.warn('[Socket] Received messageDeleted event with missing messageId');
        return;
      }
      
      console.log('[Socket] Message deleted:', messageId);
      // Ensure the message is removed from the UI for both sender and receiver
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => (msg.id !== messageId && msg._id !== messageId))
      );
    };

    const handleMessageEdited = (editedMessage) => {
      if (!editedMessage) {
        console.warn('[Socket] Received messageEdited event with invalid message');
        return;
      }
      
      const messageId = editedMessage?.id || editedMessage?._id;
      if (!messageId) {
        console.warn('[Socket] Received messageEdited event with missing ID');
        return;
      }
      
      const isRelevant = (editedMessage.senderId === userId && editedMessage.receiverId === currentUserId) ||
                         (editedMessage.senderId === currentUserId && editedMessage.receiverId === userId);

      if (isRelevant) {
        console.log('[Socket] Message edited:', editedMessage);
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
      const messageId = readData?.messageId;
      
      if (messageId) {
        console.log('[Socket] Message read status received:', readData);
        
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
        
        // Update message status in local state
        setMessageStatus(prev => ({
          ...prev,
          [messageId]: { isRead: true, readAt: readData.readAt || new Date() }
        }));
      }
    };

    // Handle socket reconnection
    const handleReconnect = () => {
      console.log('[Socket] Reconnected');
      setReconnecting(false);
    };

    const handleReconnectAttempt = () => {
      console.log('[Socket] Attempting to reconnect...');
      setReconnecting(true);
    };

    // Register listeners
    socket.on('newMessage', handleNewMessage);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('messageEdited', handleMessageEdited);
    socket.on('typing', handleTypingEvent);
    socket.on('messageRead', handleMessageRead);
    socket.on('reconnect', handleReconnect);
    socket.on('reconnect_attempt', handleReconnectAttempt);

    // Emit join event to server
    socket.emit('join', { userId: currentUserId });

    // Cleanup function
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('messageEdited', handleMessageEdited);
      socket.off('typing', handleTypingEvent);
      socket.off('messageRead', handleMessageRead);
      socket.off('reconnect', handleReconnect);
      socket.off('reconnect_attempt', handleReconnectAttempt);
    };
  }, [socket, userId, currentUserId]);

  // Handle typing indicator
  const handleTyping = (e) => {
    const content = e.target.value;
    setNewMessage(content);
    
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

      // Handle file upload if a file is selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
          setUploadProgress(0);
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
          console.log('File uploaded successfully:', attachmentUrl);
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
      
      // Create a temporary message ID for optimistic updates
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        _id: tempId,
        content: messageContent,
        senderId: currentUserId,
        receiverId: userId,
        createdAt: new Date().toISOString(),
        isRead: false,
        attachmentUrl,
        sending: true
      };
      
      // Add temporary message to UI immediately
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      setSelectedFile(null);
      setUploadProgress(0);
      scrollToBottom();
      
      let sentMessage;
      let socketSent = false;
      
      // First try to send via socket for real-time delivery
      if (socket && socket.connected) {
        console.log('[Socket] Emitting sendMessage event');
        try {
          const socketResponse = await new Promise((resolve, reject) => {
            socket.emit('sendMessage', {
              receiverId: userId,
              content: messageContent,
              attachmentUrl
            }, (response) => {
              if (response && response.success) {
                resolve(response.message);
              } else {
                reject(new Error(response?.error || 'Socket send failed'));
              }
            });
            
            // Add timeout in case socket doesn't respond
            setTimeout(() => reject(new Error('Socket send timeout')), 5000);
          });
          
          sentMessage = socketResponse;
          socketSent = true;
          console.log('Message sent successfully via socket:', sentMessage);
        } catch (socketError) {
          console.warn('Socket send failed, falling back to HTTP API:', socketError);
          socketSent = false;
        }
      }
      
      // If socket send failed or socket not connected, use HTTP API as fallback
      if (!socketSent) {
        sentMessage = await sendMessage(userId, messageContent, attachmentUrl);
        console.log('Message sent successfully via HTTP API:', sentMessage);
      }
      
      // Replace temporary message with actual message
      if (sentMessage) {
        setMessages(prev => prev.map(msg => 
          msg._id === tempId ? sentMessage : msg
        ));
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => !msg._id.startsWith('temp-')));
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
      
      // Check if the message can be deleted
      if (!canEditMessage(message)) {
        setError('Messages can only be deleted within 15 minutes of sending');
        return;
      }
      
      // Optimistically remove the message from UI
      setMessages(prev => prev.filter(msg => (msg.id !== messageId && msg._id !== messageId)));
      
      // First try to delete via socket for real-time updates
      if (socket && socket.connected) {
        console.log('[Socket] Emitting deleteMessage event for messageId:', messageId);
        socket.emit('deleteMessage', { messageId });
      }
      
      // Also delete via HTTP API as a fallback
      await deleteMessage(messageId, currentUserId);
      console.log('Message deleted successfully via API');
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(err.message || 'Failed to delete message');
      
      // Refresh messages on error
      const refreshedMessages = await getMessages(userId, currentUserId);
      setMessages(refreshedMessages);
    }
  };

  // Handle socket message deletion event
  const handleMessageDeleted = (deletedInfo) => {
    const messageId = deletedInfo?.messageId;
    if (!messageId) {
      console.warn('[Socket] Received messageDeleted event with missing messageId');
      return;
    }
    
    console.log('[Socket] Message deleted:', messageId);
    // Ensure the message is removed from the UI for both sender and receiver
    setMessages((prevMessages) =>
      prevMessages.filter((msg) => (msg.id !== messageId && msg._id !== messageId))
    );
  };

  const handleEditMessage = async (messageId, content) => {
    try {
      // Find the message to check if it's within the 15-minute window
      const message = messages.find(msg => (msg.id === messageId || msg._id === messageId));
      if (!message) {
        setError('Message not found');
        return;
      }
      
      // Check if the message can be edited
      if (!canEditMessage(message)) {
        setError('Messages can only be edited within 15 minutes of sending');
        return;
      }
      
      // Optimistically update the message in UI
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          (msg.id === messageId || msg._id === messageId) 
            ? {...msg, content, isEdited: true} 
            : msg
        )
      );
      
      // First try to edit via socket for real-time updates
      if (socket && socket.connected) {
        socket.emit('editMessage', { messageId, content });
      }
      
      // Also edit via HTTP API as a fallback
      const response = await axios.put(`${API_URL}/messages/${messageId}`, {
        content,
        userId: currentUserId,
      });
      
      // Update with server response
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          (msg.id === messageId || msg._id === messageId) ? response.data : msg
        )
      );
      
      setEditingMessageId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error editing message:', err);
      setError(err.message || 'Failed to edit message');
      
      // Refresh messages on error
      const refreshedMessages = await getMessages(userId, currentUserId);
      setMessages(refreshedMessages);
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
  };

  // Check if a message can be edited (within 15 minutes)
  const canEditMessage = (message) => {
    if (!message || message.senderId !== currentUserId) return false;
    const messageTime = new Date(message.createdAt).getTime();
    const now = Date.now();
    return (now - messageTime) < 15 * 60 * 1000; // 15 minutes
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
        <div className="text-gray-600">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-red-500 text-center p-4 max-w-md">
          <p className="font-medium mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              getMessages(userId, currentUserId)
                .then(msgs => {
                  setMessages(msgs);
                  setLoading(false);
                })
                .catch(err => {
                  setError(`Error: ${err.message || 'Failed to load messages'}`);
                  setLoading(false);
                });
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Connection status indicator */}
      {reconnecting && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-sm flex items-center justify-center">
          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
          Reconnecting to server...
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="bg-gray-100 p-3 rounded-full mb-3">
              <PaperAirplaneIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            // Determine if the current user is the sender of this message
            // Handle both object and string IDs for proper comparison
            const messageSenderId = typeof message.senderId === 'object' ? message.senderId._id || message.senderId.id : message.senderId;
            const isSender = messageSenderId === currentUserId;
            const messageId = message.id || message._id;
            const showEditDelete = isSender && canEditMessage(message);
            const isSending = message.sending === true;

            return (
              <div key={messageId} className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-2 group`}>
                <div 
                  className={`relative max-w-xs lg:max-w-md px-3 py-2 rounded-xl shadow-md 
                    ${isSender 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' 
                      : 'bg-white text-gray-800 border border-gray-100'}
                    ${isSending ? 'opacity-70' : 'opacity-100'}`
                  }
                >
                  {editingMessageId === messageId ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="flex-grow p-1 border rounded text-black text-sm"
                        autoFocus
                      />
                      <button onClick={() => handleEditMessage(messageId, editContent)} className="text-green-600 hover:text-green-800">
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => setEditingMessageId(null)} className="text-red-600 hover:text-red-800">
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {message.attachmentUrl && (
                        <div className="mb-2">
                          {message.attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i) != null ? (
                             <img 
                               src={message.attachmentUrl} 
                               alt="Attachment" 
                               className="max-w-full h-auto rounded-lg cursor-pointer" 
                               onClick={() => window.open(message.attachmentUrl, '_blank')} 
                               onError={(e) => {
                                 console.error('Image failed to load:', message.attachmentUrl);
                                 e.target.onerror = null;
                                 e.target.src = 'https://via.placeholder.com/200x150?text=Image+Not+Available';
                               }}
                             />
                          ) : (
                            <a 
                              href={message.attachmentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`flex items-center space-x-2 p-2 rounded-lg ${isSender ? 'bg-blue-400 hover:bg-blue-300' : 'bg-gray-100 hover:bg-gray-200'}`}
                            >
                              <PaperClipIcon className={`h-5 w-5 ${isSender ? 'text-blue-100' : 'text-gray-600'}`} />
                              <span className={`text-sm underline ${isSender ? 'text-white' : 'text-blue-700'}`}>
                                {message.attachmentUrl.split('-').pop().substring(0, 20)}...
                              </span>
                            </a>
                          )}
                        </div>
                      )}
                      {/* Render message content only if it exists */}
                      {message.content && message.content.trim() !== '' && (
                        <p className="text-sm break-words">{message.content}</p>
                      )}
                      <div className={`text-xs mt-1 ${isSender ? 'text-blue-100' : 'text-gray-400'} flex items-center ${isSender ? 'justify-end' : 'justify-start'} space-x-1.5`}>
                        <span>{format(new Date(message.createdAt), 'p')}</span>
                        {message.isEdited && <span className="italic text-xs">(edited)</span>}
                        {isSender && (
                          isSending ? (
                            <span className="text-xs italic">sending...</span>
                          ) : message.isRead ? (
                            <CheckIcon className="h-4 w-4 text-green-300" title={`Read at ${message.readAt ? format(new Date(message.readAt), 'p') : 'unknown time'}`} />
                          ) : (
                            <CheckIcon className="h-4 w-4 text-gray-400" title="Sent" />
                          )
                        )}
                      </div>
                      {/* Edit/Delete buttons for sender's messages */}
                      {showEditDelete && !isSending && (
                        <div className={`absolute ${isSender ? '-left-16' : '-right-16'} top-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                          <button
                            onClick={() => {
                              setEditingMessageId(messageId);
                              setEditContent(message.content || '');
                            }}
                            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 shadow-sm"
                            title="Edit"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(messageId)}
                            className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 shadow-sm"
                            title="Delete"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {/* Typing Indicator */}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="px-3 py-1.5 rounded-lg shadow bg-gray-200 text-gray-600 text-sm italic flex items-center">
              <div className="flex space-x-1 mr-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} /> {/* Element to scroll to */}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t bg-gradient-to-t from-gray-100 to-white">
        {selectedFile && (
          <div className="mb-2 flex items-center justify-between p-2 bg-gray-100 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 overflow-hidden">
              <PaperClipIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">{selectedFile.name}</span>
            </div>
            <button onClick={() => { setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = null; setUploadProgress(0); }} className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-1 mb-2 dark:bg-gray-700">
            <div className="bg-blue-500 h-1 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
            title="Attach file"
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping} 
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            disabled={(!newMessage.trim() && !selectedFile) || loading || (uploadProgress > 0 && uploadProgress < 100)}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx"
          />
        </form>
      </div>
    </div>
  );
};

export default Conversation;
