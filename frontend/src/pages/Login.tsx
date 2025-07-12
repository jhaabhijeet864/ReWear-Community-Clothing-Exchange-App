import React from 'react';
import Header from '../components/Header';

const Login = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form className="flex flex-col gap-4">
          <input className="p-2 border rounded" type="text" placeholder="Username" />
          <input className="p-2 border rounded" type="password" placeholder="Password" />
          <button className="bg-blue-600 text-white py-2 rounded" type="submit">Login</button>
        </form>
      </div>
    </div>
  </div>
);

export default Login; 