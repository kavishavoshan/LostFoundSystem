import React, { useState, useEffect } from 'react';
import ConversationsList from '../components/messaging/ConversationsList';
import Conversation from '../components/messaging/Conversation';
import { initializeSocket } from '../api/messages';

const Messaging = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [socket, setSocket] = useState(null);

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
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
      </header>
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        <div className="col-span-4 border-r bg-white">
          <ConversationsList
            onSelectUser={setSelectedUserId}
            selectedUserId={selectedUserId}
          />
        </div>
        <div className="col-span-8">
          {selectedUserId ? (
            <Conversation
              userId={selectedUserId}
              socket={socket}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 bg-gray-50">
              <div className="text-center">
                <p className="text-lg mb-2">Select a conversation</p>
                <p className="text-sm">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging; 