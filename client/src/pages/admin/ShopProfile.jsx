const ShopProfile = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Shop Profile Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Store Name</label>
          <input type="text" disabled value="Heaven Autos Main Store" className="w-full border border-gray-300 rounded p-2 bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Contact Number</label>
          <input type="text" disabled value="01905400666" className="w-full border border-gray-300 rounded p-2 bg-gray-50" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-500 mb-1">Store Address</label>
          <textarea disabled className="w-full border border-gray-300 rounded p-2 bg-gray-50 h-24" value="Jashore, Khulna Division, Bangladesh"></textarea>
        </div>
      </div>
      
      <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition">
        Edit Profile
      </button>
    </div>
  );
};

export default ShopProfile;