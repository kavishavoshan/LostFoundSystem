import React, { useState, useEffect } from 'react';
import { searchUsers } from '../../api/messages';

const UserSearch = ({ onSelectUser, onClose, currentUser }) => {
  // Using currentUser prop passed from parent component
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      const searchTimer = setTimeout(async () => {
        setLoading(true);
        try {
          const results = await searchUsers(searchQuery);
          setUsers(results);
          setError(null);
        } catch (err) {
          setError('Failed to search users');
          console.error('Error searching users:', err);
        } finally {
          setLoading(false);
        }
      }, 300);

      return () => clearTimeout(searchTimer);
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  // Helper function to get display name from user data
  const getDisplayName = (user) => {
    // If firstName exists, use it
    if (user.firstName) {
      return `${user.firstName} ${user.lastName || ''}`;
    }
    // Otherwise extract name from email (part before @)
    if (user.email) {
      return user.email.split('@')[0];
    }
    // Fallback
    return 'User';
  };

  // Helper function to get avatar text
  const getAvatarText = (user) => {
    if (user.firstName) {
      return `${user.firstName[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    }
    if (user.email) {
      return user.email.split('@')[0][0].toUpperCase();
    }
    return '?';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modal-pop-in">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Start a Conversation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm transition-colors duration-200 text-sm"
              autoFocus
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}
          </div>
          
          {/* Results Area */}
          <div className="mt-3 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {error ? (
              <div className="text-red-500 text-center py-6 px-4 bg-red-50 rounded-lg m-2">
                <svg className="h-6 w-6 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            ) : users.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {users
                  // Filter out the current user from the search results
                  .filter(user => (user._id || user.id) !== (currentUser?._id || currentUser?.id))
                  .map((user) => {
                    const userId = user._id || user.id;
                    const avatarText = getAvatarText(user);
                    const displayName = getDisplayName(user);
                    return (
                      <button
                        key={userId}
                        onClick={() => {
                          if (userId) {
                            onSelectUser(userId);
                            onClose(); // Close modal after selection
                          } else {
                            console.error('Invalid user or missing ID:', user);
                          }
                        }}
                        className="w-full p-3 flex items-center space-x-3 hover:bg-indigo-50 transition-colors duration-150 text-left"
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow">
                          <span className="text-white font-medium text-sm">{avatarText}</span>
                        </div>
                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-gray-800 truncate">
                            {displayName}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        {/* Chevron Icon */}
                        <svg className="h-4 w-4 text-gray-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    );
                  })
                }
                {/* Show message if only the current user matches */}
                {users.length === 1 && (users[0]._id || users[0].id) === (currentUser?._id || currentUser?.id) && searchQuery.trim() && (
                  <p className="text-center text-gray-500 py-4 px-2 text-sm">No other users found matching your search.</p>
                )}
              </div>
            ) : searchQuery.trim() && !loading ? (
              <p className="text-center text-gray-500 py-4 px-2 text-sm">No users found matching "{searchQuery}"</p>
            ) : !searchQuery.trim() && !loading ? (
              <p className="text-center text-gray-500 py-4 px-2 text-sm">Start typing to search for users to message.</p>
            ) : null /* Loading state is handled by spinner */}
          </div>
        </div>
      </div>
      {/* Add CSS for animation */}
      <style jsx global>{`
        @keyframes modal-pop-in {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-modal-pop-in {
          animation: modal-pop-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default UserSearch;