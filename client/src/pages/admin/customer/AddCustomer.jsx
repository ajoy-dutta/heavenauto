import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axiosInstance from "../../../api/axios";

export default function AddCustomer() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;
  const isEditMode = Boolean(editData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // State to hold the list of employees for the "Entry By" dropdown
  const [employeeList, setEmployeeList] = useState([]);

  const [formData, setFormData] = useState({
    customer_type: "Retail",
    shop_name: "",
    proprietor_name: "",
    employee_name: "",
    age: "",
    email: "",
    mobile1: "",
    mobile2: "",
    nid: "",
    country: "Bangladesh",
    division: "",
    district: "",
    police_station: "",
    post_office: "",
    town_village: "",
    market_name: "",
    referred_by: "",
    note_remarks: "",
    entry_by: "" 
  });

  const [picture, setPicture] = useState(null);

  useEffect(() => {
    // 1. Fetch Employees for the dropdown
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get("employees/");
        setEmployeeList(response.data);
      } catch (err) {
        console.error("Failed to fetch employees for dropdown.");
      }
    };
    fetchEmployees();

    // 2. Pre-populate data if in Edit Mode
    if (isEditMode) {
      const prepopulatedData = { ...editData };
      // Convert nulls to empty strings for React inputs
      Object.keys(prepopulatedData).forEach(key => {
        if (prepopulatedData[key] === null) prepopulatedData[key] = "";
      });
      // If entry_by is an object, extract the ID
      if (typeof prepopulatedData.entry_by === 'object' && prepopulatedData.entry_by !== null) {
          prepopulatedData.entry_by = prepopulatedData.entry_by.id || prepopulatedData.entry_by.employee_id;
      }
      setFormData(prepopulatedData);
    }
  }, [isEditMode, editData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const submitData = new FormData();
    
    for (const key in formData) {
      // Don't send read-only/auto fields or the picture string
      if (key !== "id" && key !== "customer_id" && key !== "picture" && key !== "entry_date_time") {
        // Only append if it's not an empty string, OR if it's required. 
        // Django handles empty strings better when they are actually sent as empty.
        submitData.append(key, formData[key]);
      }
    }
    
    // Attach the actual file if a new one was selected
    if (picture) {
      submitData.append("picture", picture);
    }

    try {
      if (isEditMode) {
        await axiosInstance.patch(`customers/${editData.id}/`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Customer successfully updated!");
      } else {
        await axiosInstance.post("customers/", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Customer successfully added!");
      }
      navigate("/dashboard/customers");
    } catch (err) {
      console.log("DJANGO ERROR:", err.response?.data);
      setError(`Failed to ${isEditMode ? 'update' : 'add'} customer. Please check required fields.`);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? "Edit Customer" : "Add New Customer"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode ? `Updating records for ${editData.proprietor_name}` : "Create a new B2B or Retail client"}
          </p>
        </div>
        <Link 
          to="/dashboard/customers"
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* --- CARD 1: Business Profile --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Business Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Customer Type</label>
                <select 
                  name="customer_type" 
                  value={formData.customer_type} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                >
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Shop Name (If Wholesale)</label>
                <input 
                  type="text" name="shop_name" value={formData.shop_name} onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., Heaven Autos Setup"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Proprietor Name *</label>
                <input 
                  type="text" name="proprietor_name" value={formData.proprietor_name} onChange={handleChange} required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Employee / Buyer Name</label>
                <input 
                  type="text" name="employee_name" value={formData.employee_name} onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                  placeholder="Person picking up the goods"
                />
              </div>
            </div>
          </div>

          {/* --- CARD 2: Contact & Identity --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Contact & Identity</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Primary Mobile *</label>
                  <input 
                    type="text" name="mobile1" value={formData.mobile1} onChange={handleChange} required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Secondary Mobile</label>
                  <input 
                    type="text" name="mobile2" value={formData.mobile2} onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Age</label>
                  <input 
                    type="number" name="age" value={formData.age} onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">NID Number</label>
                  <input 
                    type="text" name="nid" value={formData.nid} onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Customer Photo</label>
                <input 
                  type="file" accept="image/*" onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* --- CARD 3: Location Details --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Address Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Division *</label>
                  <input 
                    type="text" name="division" value={formData.division} onChange={handleChange} required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">District *</label>
                  <input 
                    type="text" name="district" value={formData.district} onChange={handleChange} required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Police Station</label>
                  <input 
                    type="text" name="police_station" value={formData.police_station} onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Post Office</label>
                  <input 
                    type="text" name="post_office" value={formData.post_office} onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Town / Village *</label>
                <input 
                  type="text" name="town_village" value={formData.town_village} onChange={handleChange} required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Market Name</label>
                <input 
                  type="text" name="market_name" value={formData.market_name} onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* --- CARD 4: Additional Info (Spans full width) --- */}
          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">System & Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Referred By</label>
                <input 
                  type="text" name="referred_by" value={formData.referred_by} onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Entry By (Staff Member)</label>
                <select 
                  name="entry_by" 
                  value={formData.entry_by} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">-- Select Employee --</option>
                  {employeeList.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.employee_id})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select the staff member registering this customer.</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Notes / Remarks</label>
                <textarea 
                  name="note_remarks" value={formData.note_remarks} onChange={handleChange} rows="3"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                ></textarea>
              </div>

            </div>
          </div>

        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <button 
            type="submit" 
            disabled={loading}
            className={`flex items-center gap-2 text-white font-bold py-3 px-8 rounded shadow-lg transition duration-300 ${
              loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Saving to Database..." : isEditMode ? "Update Customer Data" : "Save New Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}