import React from 'react';
import Header from '../components/Header';

const Register = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        <form className="flex flex-col gap-4 mb-4">
          <input className="p-2 border rounded" type="text" placeholder="Full Name" />
          <input className="p-2 border rounded" type="email" placeholder="Email" />
          <input className="p-2 border rounded" type="password" placeholder="Password" />
          <input className="p-2 border rounded" type="password" placeholder="Confirm Password" />
          <button className="bg-green-600 text-white py-2 rounded" type="submit">Register</button>
        </form>
        <div className="text-xs text-gray-500 text-center">You can also sign up with social login (coming soon).</div>
      </div>
    </div>
  </div>
);

export default Register; 