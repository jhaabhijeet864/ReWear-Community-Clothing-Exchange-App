import React from 'react';
import Header from '../components/Header';

const Dashboard = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
        <div>
          <div className="text-xl font-bold">User Name</div>
          <div className="text-gray-500">user@email.com</div>
        </div>
      </div>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">My Listings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* User's listings go here */}
          <div className="bg-white p-4 rounded shadow">Listing 1</div>
          <div className="bg-white p-4 rounded shadow">Listing 2</div>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">My Purchases</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* User's purchases go here */}
          <div className="bg-white p-4 rounded shadow">Purchase 1</div>
          <div className="bg-white p-4 rounded shadow">Purchase 2</div>
        </div>
      </section>
    </div>
  </div>
);

export default Dashboard; 