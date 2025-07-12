import React from 'react';
import Header from '../components/Header';

const ItemEdit = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow mt-8">
      <h1 className="text-2xl font-bold mb-6">Add / Edit Product</h1>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-gray-200 h-40 rounded flex items-center justify-center mb-4">Product Image</div>
          <input className="mb-4" type="file" multiple />
          <div className="flex gap-2">
            <div className="bg-gray-100 h-20 w-20 rounded flex items-center justify-center">Img 1</div>
            <div className="bg-gray-100 h-20 w-20 rounded flex items-center justify-center">Img 2</div>
            <div className="bg-gray-100 h-20 w-20 rounded flex items-center justify-center">Img 3</div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <input className="p-2 border rounded" type="text" placeholder="Product Name" />
          <textarea className="p-2 border rounded min-h-[120px]" placeholder="Product Description" />
          <button className="bg-blue-600 text-white py-2 rounded mt-4" type="submit">Save</button>
        </div>
      </form>
    </div>
  </div>
);

export default ItemEdit; 