import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage, deleteMessage, markMessageAsRead } from '../../api/messages';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
// Import necessary icons, including PaperClipIcon
import { PaperClipIcon, TrashIcon, PencilIcon, XMarkIcon, PaperAirplaneIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline'; 

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
    if (!message || message.senderId !== currentUserId) return false;
    const messageTime = new Date(message.createdAt).getTime();
    const now = Date.now();
    return (now - messageTime) < 15 * 60 * 1000; // 15 minutes
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header (Optional - Can display other user's name) */}
      {/* <div className="p-4 border-b bg-white shadow-sm">
        <h2 className="font-semibold text-lg">Chat with {userId}</h2>
      </div> */}

      {/* Messages Area - Added custom scrollbar styles */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
        {loading && (
          <div className="flex justify-center items-center h-full">
            <ArrowPathIcon className="h-6 w-6 text-gray-500 animate-spin" />
            <span className="ml-2 text-gray-500">Loading messages...</span>
          </div>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && messages.map((message) => {
          const isSender = message.senderId === currentUserId;
          const messageId = message.id || message._id; // Use consistent ID
          const showEditDelete = isSender && canEditMessage(message);

          return (
            // Add group class for hover effects on children
            <div key={messageId} className={`flex group ${isSender ? 'justify-end' : 'justify-start'}`}>
              <div className={`relative max-w-xs lg:max-w-md px-3 py-2 rounded-xl shadow-md ${isSender ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-white text-gray-800 border border-gray-100'}`}>
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
                  </div>                ) : (
                  <div className="flex flex-col">
                    {message.attachmentUrl && (
                      <div className="mb-2">
                        {message.attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i) != null ? (
                           <img src={message.attachmentUrl} alt="Attachment" className="max-w-full h-auto rounded-lg cursor-pointer" onClick={() => window.open(message.attachmentUrl, '_blank')} />
                        ) : (
                          <a href={message.attachmentUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center space-x-2 p-2 rounded-lg ${isSender ? 'bg-blue-400 hover:bg-blue-300' : 'bg-gray-100 hover:bg-gray-200'}`}>
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
                      {isSender && message.isRead && (
                        <CheckIcon className="h-4 w-4 text-green-300" title={`Read at ${format(new Date(message.readAt), 'p')}`} />
                      )}
                      {isSender && !message.isRead && (
                        <CheckIcon className="h-4 w-4 text-gray-400" title={`Sent`} />
                      )}
                    </div>
                    {/* Edit/Delete buttons shown on hover for sender */}
                    {showEditDelete && (
                      <div className={`absolute -top-2 ${isSender ? '-left-8' : '-right-8'} flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                        <button
                          onClick={() => {
                            setEditingMessageId(messageId);
                            setEditContent(message.content);
                          }}
                          className={`p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 shadow-sm`}
                          title="Edit"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(messageId)}
                          className={`p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 shadow-sm`}
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
        })}
        {/* Typing Indicator */}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="px-3 py-1.5 rounded-lg shadow bg-gray-200 text-gray-600 text-sm italic">
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
            onChange={handleTyping} // Use handleTyping for input changes
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
