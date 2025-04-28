import React from 'react';
import { FaUser, FaSearch } from 'react-icons/fa';
import { Input } from '../UI/input';

const ConversationList = ({ 
  conversations, 
  selectedUser, 
  setSelectedUser, 
  searchTerm, 
  setSearchTerm, 
  unreadCounts, 
  loading 
}) => {
  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading conversations...</p>
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map(conv => (
            <div 
              key={conv.id}
              className={`flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${selectedUser?.id === conv.id ? 'bg-blue-50' : ''}`}
              onClick={() => setSelectedUser(conv)}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <FaUser className="text-gray-600" size={20} />
                </div>
                {unreadCounts[conv.id] > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {unreadCounts[conv.id]}
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{conv.name}</h3>
                  <span className="text-xs text-gray-500">{conv.lastMessageTime}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-full">
            <p>No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;