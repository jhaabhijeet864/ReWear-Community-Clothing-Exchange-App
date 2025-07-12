import Header from '../components/Header.tsx';



const Landing = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <main className="max-w-6xl mx-auto p-4">
      {/* Carousel Section */}
      <section className="mb-8">
        <div className="bg-gray-200 h-56 flex items-center justify-center rounded-lg text-xl font-semibold">
          Carousel of Featured Clothing Items
        </div>
      </section>
      {/* Categories Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded shadow text-center">Men</div>
          <div className="bg-white p-6 rounded shadow text-center">Women</div>
          <div className="bg-white p-6 rounded shadow text-center">Kids</div>
          <div className="bg-white p-6 rounded shadow text-center">Accessories</div>
        </div>
      </section>
      {/* Product Listings Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Product Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded shadow">Product 1</div>
          <div className="bg-white p-4 rounded shadow">Product 2</div>
          <div className="bg-white p-4 rounded shadow">Product 3</div>
        </div>
      </section>
      {/* Testimonials Section (Optional) */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-2">Testimonials</h2>
        <div className="bg-gray-100 p-4 rounded">"This platform made swapping clothes so easy!"</div>
      </section>
    </main>
  </div>
);

export default Landing; 