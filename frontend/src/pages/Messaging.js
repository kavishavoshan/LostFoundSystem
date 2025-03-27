import React, { useState, useEffect } from 'react';
import ConversationsList from '../components/messaging/ConversationsList';
import Conversation from '../components/messaging/Conversation';
import UserSearch from '../components/messaging/UserSearch';
import { initializeSocket } from '../api/messages';

const Messaging = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = initializeSocket();
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-blue-500 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <button
            onClick={() => setShowUserSearch(true)}
            className="px-4 py-2 bg-white text-blue-500 rounded-lg font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500"
          >
            New Message
          </button>
        </div>
      </header>
      <div className="flex-1 grid grid-cols-12">
        <div className="col-span-4 border-r border-gray-200 overflow-hidden">
          <ConversationsList
            onSelectUser={setSelectedUserId}
            selectedUserId={selectedUserId}
          />
        </div>
        <div className="col-span-8 overflow-hidden">
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
      {showUserSearch && (
        <UserSearch
          onSelectUser={(userId) => {
            setSelectedUserId(userId);
            setShowUserSearch(false);
          }}
          onClose={() => setShowUserSearch(false)}
        />
      )}
    </div>
  );
};

export default Messaging; 