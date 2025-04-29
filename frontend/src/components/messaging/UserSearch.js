import React, { useState, useEffect } from 'react';
import { searchUsers } from '../../api/messages';

const UserSearch = ({ onSelectUser, onClose }) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">New Message</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {loading && (
              <div className="absolute right-3 top-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          
          <div className="mt-4 max-h-96 overflow-y-auto">
            {error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : users.length > 0 ? (
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => {
                      // When selecting a user, also create an initial message if needed
                      onSelectUser(user._id);
                      onClose();
                    }}
                    className="w-full p-3 flex items-center space-x-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {user.firstName ? user.firstName[0] : '?'}
                        {user.lastName ? user.lastName[0] : '?'}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
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