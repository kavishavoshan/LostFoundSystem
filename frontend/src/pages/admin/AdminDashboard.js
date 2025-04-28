import React from 'react';
import UserTable from './UserTable'; // Import the UserTable component

function AdminDashboard() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* Render the UserTable component */}
        <UserTable />
      </div>
    </div>
  );
}

export default AdminDashboard;