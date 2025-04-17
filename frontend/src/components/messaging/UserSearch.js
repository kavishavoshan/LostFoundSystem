import React, { useState } from 'react';

const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'user1@test.com'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'user2@test.com'
  },
  {
    id: 3,
    name: 'Alice Johnson',
    email: 'alice@test.com'
  },
  {
    id: 4,
    name: 'Bob Wilson',
    email: 'bob@test.com'
  }
];

const UserSearch = ({ onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-none p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">New Message</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <div className="divide-y">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectUser(user)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearch;