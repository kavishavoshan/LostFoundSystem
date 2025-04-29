import React, { useEffect, useState } from 'react';
import { getUsers } from '../../api/user';

const UserList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="user-list">
      {users.map(user => (
        <div key={user._id} className="user-item" onClick={() => onSelectUser(user)}>
          <div className="user-avatar">{user.name[0]}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-status">{user.status}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;