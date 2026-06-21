import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiX, FiSearch, FiAlertTriangle } from "react-icons/fi"; 

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
  
  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // Modal states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Reset to page 1 whenever the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      // ✅ Added "person/" to the path
      const response = await axiosInstance.get("person/customers/"); 
      
      // ✅ Added fallback for DRF pagination (.results)
      setCustomers(response.data.results || response.data); 
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

  // --- MEMOIZED FILTERING & DUPLICATE DETECTION ---
  const { filteredCustomers, duplicateWarning } = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    // 1. Filter Data
    const filtered = customers.filter(c => {
      return (
        (c.shop_name && c.shop_name.toLowerCase().includes(term)) ||
        (c.proprietor_name && c.proprietor_name.toLowerCase().includes(term)) ||
        (c.customer_id && c.customer_id.toLowerCase().includes(term)) ||
        (c.mobile1 && c.mobile1.includes(term)) ||
        (c.mobile2 && c.mobile2.includes(term))
      );
    });

    // 2. Check for Duplicates in the whole dataset (or filtered, but checking whole dataset is better for data integrity)
    let hasDuplicateNid = false;
    let hasDuplicateMobile = false;
    const nidSet = new Set();
    const mobileSet = new Set();

    customers.forEach(c => {
      // Check NID
      if (c.nid && c.nid.trim() !== "") {
        if (nidSet.has(c.nid)) hasDuplicateNid = true;
        nidSet.add(c.nid);
      }
      // Check Mobile 1
      if (c.mobile1 && c.mobile1.trim() !== "") {
        if (mobileSet.has(c.mobile1)) hasDuplicateMobile = true;
        mobileSet.add(c.mobile1);
      }
    });

    let warningMsg = "";
    if (hasDuplicateNid && hasDuplicateMobile) warningMsg = "Warning: Multiple customers share the same NID and Mobile Number.";
    else if (hasDuplicateNid) warningMsg = "Warning: Duplicate NIDs detected across customers.";
    else if (hasDuplicateMobile) warningMsg = "Warning: Duplicate Mobile Numbers detected across customers.";

    return { filteredCustomers: filtered, duplicateWarning: warningMsg };
  }, [customers, searchTerm]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentData = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  if (loading) return <div className="p-6 font-bold text-gray-600">Loading customer database...</div>;

  return (
    <div className="relative p-2 md:p-4">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
        <button 
          onClick={() => navigate('/dashboard/customers/add')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded transition shadow-md w-full md:w-auto whitespace-nowrap"
        >
          + Add New Customer
        </button>
      </div>

      {/* Duplicate Warning Banner */}
      {duplicateWarning && (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-3 mb-4 rounded shadow-sm flex items-center gap-3">
          <FiAlertTriangle className="text-xl" />
          <span className="font-semibold text-sm">{duplicateWarning}</span>
        </div>
      )}

      {error && <p className="text-red-500 font-bold mb-4">{error}</p>}

      {/* Search Bar */}
      <div className="mb-4 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input 
          type="text"
          placeholder="Search by ID, Name, Shop, or Phone..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Data Table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto border border-gray-200">
        <table className="min-w-full leading-normal text-sm">
          <thead>
            {/* Using Blue Heading with White Text as requested */}
            <tr className="bg-blue-600 text-white uppercase text-xs tracking-wider font-bold">
              <th className="py-2.5 px-4 text-left rounded-tl-lg">ID</th>
              <th className="py-2.5 px-4 text-left">Name / Shop</th>
              <th className="py-2.5 px-4 text-left">Type</th>
              <th className="py-2.5 px-4 text-left">Mobile</th>
              <th className="py-2.5 px-4 text-center rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {currentData.map((cust) => (
              <tr key={cust.id} className="border-b border-gray-200 hover:bg-blue-50 transition bg-white">
                <td className="py-2 px-4 text-left whitespace-nowrap font-bold text-gray-800">
                  {cust.customer_id}
                </td>
                
                {/* Clickable Name */}
                <td 
                  className="py-2 px-4 text-left font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition truncate max-w-[200px]"
                  onClick={() => setSelectedCustomer(cust)}
                  title={cust.shop_name ? cust.shop_name : cust.proprietor_name}
                >
                  {cust.shop_name ? cust.shop_name : cust.proprietor_name}
                </td>
                
                <td className="py-2 px-4 text-left">
                  <span className={`py-0.5 px-2.5 rounded-full text-[10px] font-bold ${
                    cust.customer_type === 'Wholesale' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {cust.customer_type}
                  </span>
                </td>
                <td className="py-2 px-4 text-left font-medium tracking-wide whitespace-nowrap">
                  {cust.mobile1}
                </td>
                <td className="py-2 px-4 text-center whitespace-nowrap">
                  <button 
                    onClick={() => navigate('/dashboard/customers/add', { state: { editData: cust } })}
                    className="text-blue-500 hover:text-blue-700 mr-3 font-semibold transition"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(cust.id)} className="text-red-500 hover:text-red-700 font-semibold transition">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {currentData.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500 font-medium bg-white">
                  {searchTerm ? "No customers match your search." : "No customers found in the database."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <span className="text-sm text-gray-600 mb-2 sm:mb-0">
            Showing <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, filteredCustomers.length)}</span> of <span className="font-bold">{filteredCustomers.length}</span> entries
          </span>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border text-sm font-medium transition ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600'}`}
            >
              Prev
            </button>
            
            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded border text-sm font-medium transition ${
                    currentPage === pageNum 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 hover:bg-blue-50 border-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded border text-sm font-medium transition ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* --- DETAILS MODAL OVERLAY --- */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="bg-gray-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-4">
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
                  <p className="text-blue-400 text-sm font-semibold mt-1">
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
                    <DetailField label="System Entry By" value={selectedCustomer.entry_by} />
                    <DetailField 
                      label="Entry Date & Time" 
                      value={selectedCustomer.entry_date_time ? new Date(selectedCustomer.entry_date_time).toLocaleString() : "N/A"} 
                    />
                  </div>
                  <div className="mt-4 border-t border-gray-200 pt-4">
                     <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Internal Notes / Remarks</p>
                     <p className="text-gray-800 font-medium mt-2 whitespace-pre-wrap bg-gray-100 p-3 rounded text-sm">
                       {selectedCustomer.note_remarks ? selectedCustomer.note_remarks : "No notes attached to this customer."}
                     </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ZOOMED IMAGE MODAL --- */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90 cursor-zoom-out p-4"
          onClick={() => setZoomedImage(null)}
        >
          <img 
            src={zoomedImage} 
            alt="Zoomed Customer Picture" 
            className="max-w-full max-h-full object-contain rounded shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}