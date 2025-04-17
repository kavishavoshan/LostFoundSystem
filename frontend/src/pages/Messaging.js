import React, { useState } from 'react';
import ConversationsList from '../components/messaging/ConversationsList';
import Conversation from '../components/messaging/Conversation';
import UserSearch from '../components/messaging/UserSearch';

const Messaging = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);

  const handleSelectConversation = (user) => {
    if (user === null) {
      setShowUserSearch(true);
    } else {
      setSelectedUser(user);
      setShowUserSearch(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowUserSearch(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 pb-16 relative z-10"> {/* Added z-index to ensure content appears above footer */}
      <div className="w-1/3 border-r bg-white">
        <ConversationsList
          onSelectConversation={handleSelectConversation}
          selectedUserId={selectedUser?.id}
        />
      </div>
      <div className="w-2/3 flex flex-col bg-white overflow-hidden">
        {showUserSearch ? (
          <UserSearch onSelectUser={handleSelectUser} />
        ) : (
          <Conversation selectedUser={selectedUser} />
        )}
      </div>
    </div>
  );
};

export default Messaging;