import React from 'react';
import Header from '../components/Header';

const ProductDetail = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-1 bg-gray-200 h-64 rounded flex items-center justify-center">Product Image</div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-2">Product Name</h2>
          <p className="mb-4">Product description goes here...</p>
          <button className="bg-green-600 text-white py-2 px-4 rounded">Available / Swap</button>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Previous Listings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded shadow">Listing 1</div>
          <div className="bg-white p-4 rounded shadow">Listing 2</div>
        </div>
      </div>
    </div>
  </div>
);

export default ProductDetail; 