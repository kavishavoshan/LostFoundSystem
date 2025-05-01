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


  // Import useAuth at the top level of the component
  // const { user } = useAuth(); // Moved up and added loading
  
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
  // console.log('[Messaging Render] Condition check:', selectedUserId && user && (user._id || user.id)); // Removed this line
  console.log('[Messaging Render] authLoading:', authLoading); // Added this line
  console.log('[Messaging Render] token:', token); // Add token logging

  // Display loading indicator while auth context is loading
  if (authLoading) {
    console.log('[Messaging Render] Rendering Auth Loading state.'); // Added this line
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading authentication...</p> // Added this line
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
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Messages
          </h1>
          <button
            onClick={() => setShowUserSearch(true)}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 shadow-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Message
          </button>
        </div>
      </header>
      <div className="flex-1 grid grid-cols-12 overflow-hidden shadow-inner max-w-7xl mx-auto w-full bg-white rounded-lg my-4">
        <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r border-gray-200 overflow-y-auto">
          <ConversationsList
            onSelectUser={handleSelectUser}
            selectedUserId={selectedUserId}
          />
        </div>
        <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col">
          {/* Render Conversation only when selectedUserId exists */}
          {selectedUserId ? (
            <Conversation
              userId={selectedUserId}
              socket={socket}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Select a Conversation</h3>
                <p className="text-sm text-gray-500">Choose a conversation from the list or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* User Search Modal - Render based on showUserSearch state */}
      {/* Since we ensured 'user' is non-null before this point, we don't need the '&& user' check here */}
      {showUserSearch && ( // Removed '&& user'
        <UserSearch
          onSelectUser={handleSelectUser}
          onClose={() => setShowUserSearch(false)}
          currentUser={user} // Pass the confirmed non-null user
        />
      )}
    </div>
  );
};

export default Messaging;