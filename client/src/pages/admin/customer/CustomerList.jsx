import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import {
  FiX,
  FiSearch,
  FiAlertTriangle,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiUser,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";

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
      const response = await axiosInstance.get("person/customers/");
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

    const filtered = customers.filter((c) => {
      return (
        (c.shop_name && c.shop_name.toLowerCase().includes(term)) ||
        (c.proprietor_name && c.proprietor_name.toLowerCase().includes(term)) ||
        (c.customer_id && c.customer_id.toLowerCase().includes(term)) ||
        (c.mobile1 && c.mobile1.includes(term)) ||
        (c.mobile2 && c.mobile2.includes(term))
      );
    });

    let hasDuplicateNid = false;
    let hasDuplicateMobile = false;
    const nidSet = new Set();
    const mobileSet = new Set();

    customers.forEach((c) => {
      if (c.nid && c.nid.trim() !== "") {
        if (nidSet.has(c.nid)) hasDuplicateNid = true;
        nidSet.add(c.nid);
      }
      if (c.mobile1 && c.mobile1.trim() !== "") {
        if (mobileSet.has(c.mobile1)) hasDuplicateMobile = true;
        mobileSet.add(c.mobile1);
      }
    });

    let warningMsg = "";
    if (hasDuplicateNid && hasDuplicateMobile)
      warningMsg = "Warning: Multiple customers share the same NID and Mobile Number.";
    else if (hasDuplicateNid) warningMsg = "Warning: Duplicate NIDs detected across customers.";
    else if (hasDuplicateMobile)
      warningMsg = "Warning: Duplicate Mobile Numbers detected across customers.";

    return { filteredCustomers: filtered, duplicateWarning: warningMsg };
  }, [customers, searchTerm]);

  // --- STATS ---
  const stats = useMemo(() => {
    const total = customers.length;
    const wholesale = customers.filter((c) => c.customer_type === "Wholesale").length;
    const retail = customers.filter((c) => c.customer_type === "Retail").length;
    return { total, wholesale, retail };
  }, [customers]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentData = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-3 bg-gray-50 min-h-screen">
        <div className="p-8 text-center text-gray-400 text-sm">Loading customer database...</div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FiUsers className="text-blue-600" /> Customer Management
          </h1>
        </div>
        <button
          onClick={() => navigate("/dashboard/customers/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-semibold transition flex items-center gap-1.5 border border-blue-700"
        >
          + Add New Customer
        </button>
      </div>

      {/* Duplicate Warning Banner (if any) */}
      {duplicateWarning && (
        <div className="mb-4 p-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded flex items-center gap-2">
          <FiAlertTriangle className="shrink-0" />
          <span className="font-semibold">{duplicateWarning}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
          {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border border-gray-300 mb-4 bg-white">
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiUsers className="text-blue-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Customers
            </p>
            <p className="text-lg font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiUserCheck className="text-purple-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Wholesale
            </p>
            <p className="text-lg font-bold text-purple-700">{stats.wholesale}</p>
          </div>
        </div>
        <div className="p-2 flex items-center gap-2">
          <FiUser className="text-green-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Retail
            </p>
            <p className="text-lg font-bold text-green-700">{stats.retail}</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-300 overflow-hidden">
        {/* Search Bar */}
        <div className="border-b border-gray-300 px-3 py-1.5 flex items-center gap-2 bg-gray-50">
          <FiSearch className="text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search by ID, Name, Shop, or Phone..."
            className="w-full bg-transparent text-sm text-gray-800 focus:outline-none placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                  ID
                </th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                  Name / Shop
                </th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                  Type
                </th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                  Mobile
                </th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((cust, index) => (
                  <tr
                    key={cust.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border border-gray-300 px-2 py-1.5 text-xs font-bold text-gray-700">
                      {cust.customer_id}
                    </td>
                    <td
                      className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      onClick={() => setSelectedCustomer(cust)}
                      title={cust.shop_name || cust.proprietor_name}
                    >
                      {cust.shop_name || cust.proprietor_name}
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          cust.customer_type === "Wholesale"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-green-100 text-green-700 border border-green-200"
                        }`}
                      >
                        {cust.customer_type}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-700">
                      {cust.mobile1}
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center">
                      <div className="flex justify-center items-center gap-1">
                        <button
                          onClick={() =>
                            navigate("/dashboard/customers/add", { state: { editData: cust } })
                          }
                          className="text-blue-600 hover:text-blue-800 transition p-0.5"
                          title="Edit"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(cust.id)}
                          className="text-gray-400 hover:text-red-600 transition p-0.5"
                          title="Delete"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border border-gray-300 px-3 py-6 text-center text-gray-400 text-sm">
                    {searchTerm ? "No customers match your search." : "No customers found in the database."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 bg-white p-2 border border-gray-300 rounded">
          <span className="text-xs text-gray-600 mb-2 sm:mb-0">
            Showing{" "}
            <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-bold">
              {Math.min(currentPage * itemsPerPage, filteredCustomers.length)}
            </span>{" "}
            of <span className="font-bold">{filteredCustomers.length}</span> entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-2 py-0.5 rounded border text-xs font-medium transition ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }`}
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 7) {
                if (currentPage > 4 && i < 3) pageNum = currentPage - 2 + i;
                else if (currentPage > 4 && i === 3) return null; // ellipsis handled separately
                // Simplified: show first, last, current and neighbours
                // But for simplicity, we show all if <=7, else a limited set.
                // We'll just show all for now.
              }
              // Better to show a simplified pagination: first, prev, current +/-1, next, last
              // Let's implement a cleaner version:
              // We'll just show page numbers with ellipsis if needed.
              // For brevity, we keep the full list if <=7 else show limited.
              // I'll implement a simple range.
              return null; // skip, we'll use a simpler approach below
            })}
            {/* Simplified pagination: show pages */}
            {totalPages <= 7 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2.5 py-0.5 rounded border text-xs font-medium transition ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              ))
            ) : (
              <>
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`px-2.5 py-0.5 rounded border text-xs font-medium transition ${
                    currentPage === 1
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  1
                </button>
                {currentPage > 3 && <span className="px-1 text-gray-400">…</span>}
                {currentPage > 2 && (
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-2.5 py-0.5 rounded border text-xs font-medium bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  >
                    {currentPage - 1}
                  </button>
                )}
                <button
                  onClick={() => setCurrentPage(currentPage)}
                  className="px-2.5 py-0.5 rounded border text-xs font-medium bg-blue-600 text-white border-blue-600"
                >
                  {currentPage}
                </button>
                {currentPage < totalPages - 1 && (
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-2.5 py-0.5 rounded border text-xs font-medium bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  >
                    {currentPage + 1}
                  </button>
                )}
                {currentPage < totalPages - 2 && <span className="px-1 text-gray-400">…</span>}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-2.5 py-0.5 rounded border text-xs font-medium transition ${
                    currentPage === totalPages
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-2 py-0.5 rounded border text-xs font-medium transition ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* --- DETAILS MODAL --- */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-3">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-300">
            {/* Header */}
            <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                {selectedCustomer.picture ? (
                  <img
                    src={selectedCustomer.picture}
                    alt={selectedCustomer.shop_name || selectedCustomer.proprietor_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-600 cursor-pointer hover:scale-105 transition"
                    onClick={() => setZoomedImage(selectedCustomer.picture)}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold text-xl">
                    {(selectedCustomer.shop_name || selectedCustomer.proprietor_name)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold">
                    {selectedCustomer.shop_name || selectedCustomer.proprietor_name}
                  </h2>
                  <p className="text-gray-400 text-xs">
                    {selectedCustomer.customer_id} |{" "}
                    <span className="text-blue-400">{selectedCustomer.customer_type}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-white transition p-1 bg-gray-700 rounded-full hover:bg-gray-600"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Body (scrollable) */}
            <div className="overflow-y-auto flex-1 p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: Contact */}
                <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Contact Information</h3>
                  <DetailField label="Proprietor Name" value={selectedCustomer.proprietor_name} />
                  <DetailField label="Shop Name" value={selectedCustomer.shop_name} />
                  <DetailField label="Employee (Proxy)" value={selectedCustomer.employee_name} />
                  <DetailField label="Primary Mobile" value={selectedCustomer.mobile1} />
                  <DetailField label="Secondary Mobile" value={selectedCustomer.mobile2} />
                  <DetailField label="Email Address" value={selectedCustomer.email} />
                  <DetailField label="NID Number" value={selectedCustomer.nid} />
                  <DetailField label="Age" value={selectedCustomer.age} />
                </div>

                {/* Column 2: Address */}
                <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Address Details</h3>
                  <DetailField label="Country" value={selectedCustomer.country} />
                  <DetailField label="Division" value={selectedCustomer.division} />
                  <DetailField label="District" value={selectedCustomer.district} />
                  <DetailField label="Police Station" value={selectedCustomer.police_station} />
                  <DetailField label="Post Office" value={selectedCustomer.post_office} />
                  <DetailField label="Town / Village" value={selectedCustomer.town_village} />
                  <DetailField label="Market Name" value={selectedCustomer.market_name} />
                </div>

                {/* Full width: Notes & meta */}
                <div className="md:col-span-2 space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Business Intelligence</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <DetailField label="Referred By" value={selectedCustomer.referred_by} />
                    <DetailField label="Entry By" value={selectedCustomer.entry_by} />
                    <DetailField
                      label="Entry Date & Time"
                      value={
                        selectedCustomer.entry_date_time
                          ? new Date(selectedCustomer.entry_date_time).toLocaleString()
                          : "N/A"
                      }
                    />
                  </div>
                  <div className="mt-2 border-t border-gray-200 pt-3">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Remarks</p>
                    <div className="bg-gray-100 p-2 rounded text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                      {selectedCustomer.note_remarks || "No notes attached."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-200 border border-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ZOOMED IMAGE MODAL --- */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-md p-4 cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-12 right-0 text-gray-400 hover:text-white transition"
            >
              <FiX size={36} />
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed Customer Picture"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain border-4 border-gray-700"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}