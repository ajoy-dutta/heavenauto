import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiX } from "react-icons/fi"; 

// A reusable mini-component to keep the detail modal clean
const DetailField = ({ label, value }) => (
  <div className="border-b border-gray-200 pb-2">
    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{label}</p>
    <p className="text-gray-800 font-medium mt-1">
      {value ? value : <span className="text-gray-400 italic">N/A</span>}
    </p>
  </div>
);

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State to track which customer is currently selected for the modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // State for the Image Zoom overlay
  const [zoomedImage, setZoomedImage] = useState(null);
  
  // Initialize the navigate hook
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get("customers/");
      setCustomers(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch customers.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this customer permanently?")) {
      try {
        await axiosInstance.delete(`customers/${id}/`);
        setCustomers(customers.filter((cust) => cust.id !== id));
        if (selectedCustomer && selectedCustomer.id === id) {
          setSelectedCustomer(null);
        }
      } catch (err) {
        alert("Error deleting customer.");
      }
    }
  };

  if (loading) return <div className="p-6 font-bold text-gray-600">Loading customer database...</div>;

  return (
    <div className="relative">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
        <button 
          onClick={() => navigate('/dashboard/customers/add')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          + Add New Customer
        </button>
      </div>

      {error && <p className="text-red-500 font-bold mb-4">{error}</p>}

      {/* Data Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal font-bold">
              <th className="py-3 px-6 text-left">Customer ID</th>
              <th className="py-3 px-6 text-left">Name / Shop</th>
              <th className="py-3 px-6 text-left">Type</th>
              <th className="py-3 px-6 text-left">Mobile</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {customers.map((cust) => (
              <tr key={cust.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-3 px-6 text-left whitespace-nowrap font-bold text-gray-700">
                  {cust.customer_id}
                </td>
                
                {/* --- CLICKABLE NAME COLUMN --- */}
                <td 
                  className="py-3 px-6 text-left font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition"
                  onClick={() => setSelectedCustomer(cust)}
                >
                  {cust.shop_name ? cust.shop_name : cust.proprietor_name}
                </td>
                
                <td className="py-3 px-6 text-left">
                  <span className={`py-1 px-3 rounded-full text-xs font-bold ${
                    cust.customer_type === 'Wholesale' ? 'bg-purple-200 text-purple-700' : 'bg-green-200 text-green-700'
                  }`}>
                    {cust.customer_type}
                  </span>
                </td>
                <td className="py-3 px-6 text-left font-medium">{cust.mobile1}</td>
                <td className="py-3 px-6 text-center">
                  <button 
                    onClick={() => navigate('/dashboard/customers/add', { state: { editData: cust } })}
                    className="text-blue-500 hover:text-blue-700 mr-4 font-bold transition"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(cust.id)} className="text-red-500 hover:text-red-700 font-bold transition">Delete</button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">No customers found in the database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- DETAILS MODAL OVERLAY --- */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          
          {/* Modal Container */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-gray-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-4">
                
                {/* --- ADDED PROFILE PICTURE LOGIC --- */}
                {selectedCustomer.picture ? (
                  <img 
                    src={selectedCustomer.picture} 
                    alt={selectedCustomer.shop_name || selectedCustomer.proprietor_name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-700 shadow-sm bg-white cursor-pointer hover:scale-105 transition"
                    onClick={() => setZoomedImage(selectedCustomer.picture)}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-2xl font-bold border-2 border-gray-700 shadow-sm text-gray-300">
                    {(selectedCustomer.shop_name || selectedCustomer.proprietor_name).charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedCustomer.shop_name || selectedCustomer.proprietor_name}
                  </h2>
                  <p className="text-red-400 text-sm font-semibold mt-1">
                    {selectedCustomer.customer_id} | {selectedCustomer.customer_type}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-white transition p-2 bg-gray-800 rounded-full"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto bg-gray-50">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Column 1: Identity & Contact */}
                <div className="space-y-4 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Contact Information</h3>
                  <DetailField label="Proprietor Name" value={selectedCustomer.proprietor_name} />
                  <DetailField label="Shop Name" value={selectedCustomer.shop_name} />
                  <DetailField label="Employee Acting (Proxy)" value={selectedCustomer.employee_name} />
                  <DetailField label="Primary Mobile" value={selectedCustomer.mobile1} />
                  <DetailField label="Secondary Mobile" value={selectedCustomer.mobile2} />
                  <DetailField label="Email Address" value={selectedCustomer.email} />
                  <DetailField label="National ID (NID)" value={selectedCustomer.nid} />
                  <DetailField label="Age" value={selectedCustomer.age} />
                </div>

                {/* Column 2: Address & Business Info */}
                <div className="space-y-4 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Location Details</h3>
                  <DetailField label="Country" value={selectedCustomer.country} />
                  <DetailField label="Division" value={selectedCustomer.division} />
                  <DetailField label="District" value={selectedCustomer.district} />
                  <DetailField label="Police Station" value={selectedCustomer.police_station} />
                  <DetailField label="Post Office" value={selectedCustomer.post_office} />
                  <DetailField label="Town / Village" value={selectedCustomer.town_village} />
                  <DetailField label="Market Name" value={selectedCustomer.market_name} />
                </div>

                {/* Full Width Row: Backend Meta & Notes */}
                <div className="md:col-span-2 space-y-4 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Business Intelligence</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DetailField label="Referred By" value={selectedCustomer.referred_by} />
                    <DetailField label="System Entry By (Employee ID)" value={selectedCustomer.entry_by} />
                    <DetailField 
                      label="Entry Date & Time" 
                      value={new Date(selectedCustomer.entry_date_time).toLocaleString()} 
                    />
                  </div>
                  <div className="mt-4 border-t border-gray-200 pt-4">
                     <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Internal Notes / Remarks</p>
                     <p className="text-gray-800 font-medium mt-2 whitespace-pre-wrap bg-gray-100 p-3 rounded">
                       {selectedCustomer.note_remarks ? selectedCustomer.note_remarks : "No notes attached to this customer."}
                     </p>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* --- ADDED ZOOMED IMAGE MODAL OVERLAY --- */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90 cursor-zoom-out p-4"
          onClick={() => setZoomedImage(null)}
        >
          <img 
            src={zoomedImage} 
            alt="Zoomed Customer Picture" 
            className="max-w-full max-h-full object-contain rounded shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()} // Keeps the image from closing if clicked directly
          />
        </div>
      )}
    </div>
  );
}