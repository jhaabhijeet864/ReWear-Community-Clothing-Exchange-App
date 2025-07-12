import React from 'react';
import Header from '../components/Header';

const AdminPanel = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex gap-4 mb-8">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Manage Users</button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Manage Orders</button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Manage Listings</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div>
              <div className="font-semibold">User Name</div>
              <div className="text-gray-500 text-sm">user@email.com</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-green-500 text-white px-3 py-1 rounded">Action 1</button>
            <button className="bg-red-500 text-white px-3 py-1 rounded">Action 2</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AdminPanel; 