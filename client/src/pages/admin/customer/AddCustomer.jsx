import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiArrowLeft, FiUserPlus, FiSave, FiEdit3 } from "react-icons/fi";

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
    entry_by: "",
  });

  const [picture, setPicture] = useState(null);

  useEffect(() => {
    // 1. Fetch Employees for the dropdown
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get("person/employees/");
        setEmployeeList(response.data.results || response.data);
      } catch (err) {
        console.error("Failed to fetch employees for dropdown.");
      }
    };
    fetchEmployees();

    // 2. Pre-populate data if in Edit Mode
    if (isEditMode) {
      const prepopulatedData = { ...editData };
      // Convert nulls to empty strings for React inputs
      Object.keys(prepopulatedData).forEach((key) => {
        if (prepopulatedData[key] === null) prepopulatedData[key] = "";
      });
      // If entry_by is an object, extract the ID
      if (typeof prepopulatedData.entry_by === "object" && prepopulatedData.entry_by !== null) {
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
      if (key !== "id" && key !== "customer_id" && key !== "picture" && key !== "entry_date_time") {
        submitData.append(key, formData[key]);
      }
    }

    if (picture) {
      submitData.append("picture", picture);
    }

    try {
      if (isEditMode) {
        await axiosInstance.patch(`person/customers/${editData.id}/`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Customer successfully updated!");
      } else {
        await axiosInstance.post("person/customers/", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Customer successfully added!");
      }
      navigate("/dashboard/customers");
    } catch (err) {
      console.log("DJANGO ERROR:", err.response?.data);
      setError(`Failed to ${isEditMode ? "update" : "add"} customer. Please check required fields.`);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold flex items-center gap-2">
            {isEditMode ? (
              <FiEdit3 className="text-blue-600" />
            ) : (
              <FiUserPlus className="text-blue-600" />
            )}
            {isEditMode ? "Edit Customer" : "Add New Customer"}
          </h1>
          {isEditMode && editData && (
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-semibold">
              {editData.customer_id}
            </span>
          )}
        </div>
        <Link
          to="/dashboard/customers"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm font-semibold transition flex items-center gap-1.5 border border-gray-300"
        >
          <FiArrowLeft /> Cancel
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded flex items-start gap-2">
          <div className="shrink-0 mt-0.5">⚠️</div>
          <div>
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* --- CARD 1: Business Profile --- */}
          <div className="bg-white p-4 rounded-lg border border-gray-300">
            <h2 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Business Profile</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Customer Type
                </label>
                <select
                  name="customer_type"
                  value={formData.customer_type}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Shop Name
                </label>
                <input
                  type="text"
                  name="shop_name"
                  value={formData.shop_name}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Heaven Autos Setup"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Proprietor Name *
                </label>
                <input
                  type="text"
                  name="proprietor_name"
                  required
                  value={formData.proprietor_name}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Employee / Buyer Name
                </label>
                <input
                  type="text"
                  name="employee_name"
                  value={formData.employee_name}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Person picking up the goods"
                />
              </div>
            </div>
          </div>

          {/* --- CARD 2: Contact & Identity --- */}
          <div className="bg-white p-4 rounded-lg border border-gray-300">
            <h2 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Contact & Identity</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    Primary Mobile *
                  </label>
                  <input
                    type="text"
                    name="mobile1"
                    required
                    value={formData.mobile1}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    Secondary Mobile
                  </label>
                  <input
                    type="text"
                    name="mobile2"
                    value={formData.mobile2}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    NID Number
                  </label>
                  <input
                    type="text"
                    name="nid"
                    value={formData.nid}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Customer Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full bg-white border border-gray-300 rounded p-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* --- CARD 3: Location Details --- */}
          <div className="bg-white p-4 rounded-lg border border-gray-300">
            <h2 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Address Details</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    Division *
                  </label>
                  <input
                    type="text"
                    name="division"
                    required
                    value={formData.division}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    District *
                  </label>
                  <input
                    type="text"
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    Police Station
                  </label>
                  <input
                    type="text"
                    name="police_station"
                    value={formData.police_station}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    Post Office
                  </label>
                  <input
                    type="text"
                    name="post_office"
                    value={formData.post_office}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Town / Village *
                </label>
                <input
                  type="text"
                  name="town_village"
                  required
                  value={formData.town_village}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Market Name
                </label>
                <input
                  type="text"
                  name="market_name"
                  value={formData.market_name}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- CARD 4: Additional Info (Spans full width) --- */}
        <div className="bg-white p-4 rounded-lg border border-gray-300">
          <h2 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">System & Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                Referred By
              </label>
              <input
                type="text"
                name="referred_by"
                value={formData.referred_by}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                Entry By (Staff Member)
              </label>
              <select
                name="entry_by"
                value={formData.entry_by}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Select Employee --</option>
                {employeeList.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name || emp.name} ({emp.employee_id})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-500 mt-0.5">Select the staff member registering this customer.</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                Notes / Remarks
              </label>
              <textarea
                name="note_remarks"
                value={formData.note_remarks}
                onChange={handleChange}
                rows="3"
                className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-1.5 rounded text-sm font-bold text-white transition flex items-center gap-1.5 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 border border-blue-700"
            }`}
          >
            <FiSave />
            {loading
              ? isEditMode
                ? "Updating..."
                : "Saving..."
              : isEditMode
              ? "Update Customer"
              : "Save Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}