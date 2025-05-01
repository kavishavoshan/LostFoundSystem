import React, { useState, useEffect } from 'react';
import { searchUsers } from '../../api/messages';
// Removed useAuth import as currentUser is now passed as a prop

const UserSearch = ({ onSelectUser, onClose, currentUser }) => {
  // Removed: const { user: currentUser } = useAuth(); - Now using the prop
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fadeIn">
        <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-lg">
          <h2 className="text-xl font-semibold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            New Message
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
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
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
            {loading && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          
          <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border border-gray-200">
            {error ? (
              <div className="text-red-500 text-center py-6 px-4 bg-red-50 rounded-lg">
                <svg className="h-6 w-6 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            ) : users.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => {
                      // When selecting a user, also create an initial message if needed
                      // Handle both _id and id formats from the backend
                      const userId = user && (user._id || user.id);
                      if (userId) {
                        console.log('Selected user:', user);
                        console.log('Selected user ID:', userId);
                        console.log('Current user (from prop):', currentUser);
                        onSelectUser(userId);
                        onClose();
                      } else {
                        console.error('Invalid user or missing ID:', user);
                      }
                    }}
                    className="w-full p-4 flex items-center space-x-4 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-blue-600 font-semibold text-lg">
                        {user.firstName ? user.firstName[0] : '?'}
                        {user.lastName ? user.lastName[0] : '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <svg className="h-5 w-5 text-gray-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <p className="text-center text-gray-500 py-4">No users found</p>
            ) : (
              <p className="text-center text-gray-500 py-4">Start typing to search for users</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSearch;