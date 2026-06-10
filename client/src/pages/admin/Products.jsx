const Products = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-4 rounded text-sm transition">
          + Add New Product
        </button>
      </div>
      
      <p className="text-gray-600">Your product inventory will be listed here.</p>
    </div>
  );
};

export default Products;