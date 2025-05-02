import React, { useState, useEffect } from 'react';
import ConversationsList from '../components/messaging/ConversationsList';
import Conversation from '../components/messaging/Conversation';
import UserSearch from '../components/messaging/UserSearch';
import { initializeSocket } from '../api/messages';
import { useAuth } from '../context/AuthContext';

const Messaging = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  // Destructure loading state and token from useAuth
  const { user, token, loading: authLoading } = useAuth(); // <-- Added token
  
  // Add socket connection status state at the top level
  const [socketStatus, setSocketStatus] = useState({
    connected: false,
    error: null
  });

  useEffect(() => {
    // Only initialize socket if auth is loaded and user exists
    if (!authLoading && user) {
      // First try to get token from context, then fallback to localStorage
      const authToken = token || localStorage.getItem('token');
      
      if (typeof authToken === 'string' && authToken.length > 0) {
        // Don't add Bearer prefix for socket.io authentication
        // The backend expects the raw token without the Bearer prefix
        console.log('[Messaging Effect] Valid token found. Initializing socket with token');
        const newSocket = initializeSocket(authToken);
        setSocket(newSocket);

        // Add event listeners for connection status
        newSocket.on('connect', () => {
          console.log('[Socket] Connected successfully with token authentication');
        });

        newSocket.on('connect_error', (error) => {
          console.error('[Socket] Connection error:', error.message);
        });
      } else {
        // Log why socket initialization is skipped
        console.warn('[Messaging Effect] Skipping socket initialization: Token is missing or invalid even though user exists.');
      }
    } else {
      // Log why socket initialization is skipped
      if (authLoading) {
        console.log('[Messaging Effect] Skipping socket initialization: Auth is still loading.');
      } else if (!user) {
        console.log('[Messaging Effect] Skipping socket initialization: User is not authenticated.');
      }
    }

    // Cleanup function: disconnect socket if it exists when component unmounts or dependencies change
    return () => {
      if (socket) {
        console.log('[Messaging Effect Cleanup] Disconnecting socket.');
        socket.disconnect();
        setSocket(null); // Clear socket state on cleanup
      }
    };
    // Add authLoading, user, and token as dependencies
  }, [authLoading, user, token]); // <-- Keep token dependency

  // Update socket status when socket changes
  useEffect(() => {
    if (socket) {
      const handleConnect = () => {
        setSocketStatus(prev => ({ ...prev, connected: true, error: null }));
      };
      
      const handleDisconnect = (reason) => {
        setSocketStatus(prev => ({ ...prev, connected: false }));
        console.log('[Socket] Disconnected:', reason);
      };
      
      const handleError = (error) => {
        setSocketStatus(prev => ({ ...prev, error: error.message }));
        console.error('[Socket] Error:', error);
      };
      
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('error', handleError);
      
      // Set initial status
      setSocketStatus(prev => ({ ...prev, connected: socket.connected }));
      
      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('error', handleError);
      };
    }
  }, [socket]);
  
  // Define the handleSelectUser function at the component level
  const handleSelectUser = async (userId) => {
    console.log('Selected user ID:', userId);

    // Since the component rendering is now guarded by a non-null user check,
    // we can be more confident 'user' is available here.
    // However, add a safety check just in case.
    if (!user) {
        console.error('[handleSelectUser] CRITICAL: User became null unexpectedly. Aborting.');
        // Optionally, trigger a re-authentication or show an error message.
        return;
    }

    // Use the confirmed user object to get the ID
    const currentUserId = user._id || user.id;

    if (!currentUserId || !userId) {
       console.error('[handleSelectUser] Missing ID information.', { currentUserId, selectedUserId: userId, user });
       return;
    }

    console.log('[handleSelectUser] Proceeding with selection:', { currentUserId, selectedUserId: userId });
    
    setSelectedUserId(userId);
    setShowUserSearch(false);
  };

  // ADD CONSOLE LOGS FOR DEBUGGING
  console.log('[Messaging Render] selectedUserId:', selectedUserId);
  console.log('[Messaging Render] user from useAuth:', user);
  console.log('[Messaging Render] authLoading:', authLoading);
  console.log('[Messaging Render] token:', token);

  // Display loading indicator while auth context is loading
  if (authLoading) {
    console.log('[Messaging Render] Rendering Auth Loading state.');
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading authentication...</p>
      </div>
    );
  }

  // After auth loading, check if user exists.
  if (!user) {
      console.log('[Messaging Render] Auth loaded, but user is null. Rendering error/login prompt.');
      return (
          <div className="h-screen flex flex-col items-center justify-center">
              <p className="text-red-600 font-semibold mb-4">Authentication Error</p>
              <p className="text-gray-700">User data is not available. Please try logging in again.</p>
              {/* Optionally add a button to redirect to login */}
          </div>
      );
  }

  // If we reach here, authLoading is false AND user is not null.
  console.log('[Messaging Render] Auth loaded and user exists:', user);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Messages
          </h1>
          <div className="flex items-center space-x-3">
            {/* Socket status indicator */}
            <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <div className={`w-3 h-3 rounded-full mr-2 ${socketStatus.connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="text-xs text-white hidden md:inline">
                {socketStatus.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={() => setShowUserSearch(true)}
              className="px-4 py-2 bg-white text-indigo-600 rounded-full font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 shadow-md flex items-center transition-all duration-200 transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Message
            </button>
          </div>
        </div>
      </header>
      
      {/* Socket error message */}
      {socketStatus.error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-4 mt-2 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>Connection error: {socketStatus.error}. Messages may not be delivered in real-time.</p>
          </div>
        </div>
      )}
      
      {/* Main Content Area - Adjusted grid and flex properties */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden shadow-xl max-w-7xl mx-auto w-full bg-white rounded-b-xl my-4 border border-gray-100">
        {/* Conversation List - Ensure it can scroll if needed */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r border-gray-200 overflow-y-auto bg-white rounded-bl-xl scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <ConversationsList
            onSelectUser={handleSelectUser}
            selectedUserId={selectedUserId}
          />
        </div>
        {/* Conversation Area - Make it flex column and allow Conversation to take remaining height */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col bg-gradient-to-br from-gray-50 to-white rounded-br-xl overflow-hidden"> {/* Added overflow-hidden */}
          {/* Render Conversation only when selectedUserId exists */}
          {selectedUserId ? (
            <Conversation
              userId={selectedUserId}
              socket={socket}
            />
          ) : (
            // Placeholder View - Centered content
            <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white rounded-br-xl p-4">
              <div className="text-center p-8 max-w-md">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-3">Your Messages</h3>
                <p className="text-gray-600 mb-8">Connect with other users to discuss lost and found items</p>
                <button 
                  onClick={() => setShowUserSearch(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md flex items-center mx-auto transform hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Start a New Conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* User Search Modal - Render based on showUserSearch state */}
      {showUserSearch && (
        <UserSearch
          onSelectUser={handleSelectUser}
          onClose={() => setShowUserSearch(false)}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default Messaging;