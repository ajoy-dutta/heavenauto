import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiArrowLeft, FiSave, FiEdit3, FiUserPlus } from "react-icons/fi";

export default function AddEmployee() {
  const navigate = useNavigate();
  const location = useLocation();

  const editData = location.state?.editData;
  const isEditMode = Boolean(editData);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const [formData, setFormData] = useState({
    joining_date: "",
    full_name: "",
    father_name: "",
    mother_name: "",
    gender: "M",
    blood_group: "",
    dob: "",
    age: "",
    religion: "",
    birth_id_no: "",
    nid_no: "",
    passport_no: "",
    nationality: "Bangladeshi",
    email: "",
    mobile1: "",
    mobile2: "",
    mobile_father: "",
    mobile_mother: "",
    mobile_others: "",
    acc_name: "",
    acc_no: "",
    bank_name: "",
    branch_name: "",
    bkash_no: "",
    nagad_no: "",
    rocket_no: "",
  });

  const [picture, setPicture] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const prepopulatedData = { ...editData };
      Object.keys(prepopulatedData).forEach((key) => {
        if (prepopulatedData[key] === null) prepopulatedData[key] = "";
      });
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
    setErrors([]);

    const submitData = new FormData();
    for (const key in formData) {
      if (
        key !== "id" &&
        key !== "employee_id" &&
        key !== "picture" &&
        key !== "education" &&
        key !== "previous_work"
      ) {
        submitData.append(key, formData[key]);
      }
    }

    if (picture) {
      submitData.append("picture", picture);
    }

    try {
      if (isEditMode) {
        await axiosInstance.patch(`person/employees/${editData.id}/`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Employee successfully updated!");
      } else {
        await axiosInstance.post("person/employees/", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Employee successfully added!");
      }
      navigate("/dashboard/employees");
    } catch (err) {
      console.log("DJANGO ERROR:", err.response?.data);

      const errorResponse = err.response?.data;

      if (errorResponse && typeof errorResponse === "object" && !Array.isArray(errorResponse)) {
        const extractedErrors = Object.entries(errorResponse).map(([field, messages]) => {
          const cleanFieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
          const cleanMessage = Array.isArray(messages) ? messages.join(" ") : messages;
          return `${cleanFieldName}: ${cleanMessage}`;
        });
        setErrors(extractedErrors);
      } else {
        setErrors([
          `Failed to ${isEditMode ? "update" : "add"} employee. Please check your connection or try again.`,
        ]);
      }

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
            {isEditMode ? "Edit Employee" : "Add New Employee"}
          </h1>
          {isEditMode && editData && (
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-semibold">
              {editData.employee_id}
            </span>
          )}
        </div>
        <Link
          to="/dashboard/employees"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm font-semibold transition flex items-center gap-1.5 border border-gray-300"
        >
          <FiArrowLeft /> Cancel
        </Link>
      </div>

      {/* Error Banner */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded flex items-start gap-2">
          <div className="shrink-0 mt-0.5">⚠️</div>
          <div>
            <p className="font-bold mb-1">Please fix the following errors:</p>
            <ul className="list-disc ml-4 space-y-0.5">
              {errors.map((errMsg, index) => (
                <li key={index}>{errMsg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Core Identity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-300 lg:col-span-1">
            <h2 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Core Identity</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Joining Date *
                </label>
                <input
                  type="date"
                  name="joining_date"
                  required
                  value={formData.joining_date}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Profile Picture
                </label>
                <input
                  type="file"
                  name="picture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full bg-white border border-gray-300 rounded p-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    name="blood_group"
                    placeholder="e.g., O+"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-300 lg:col-span-2">
            <h2 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Personal & Family Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Father's Name *
                </label>
                <input
                  type="text"
                  name="father_name"
                  required
                  value={formData.father_name}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Mother's Name *
                </label>
                <input
                  type="text"
                  name="mother_name"
                  required
                  value={formData.mother_name}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Religion *
                </label>
                <input
                  type="text"
                  name="religion"
                  required
                  value={formData.religion}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Nationality
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Identification & Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-300">
            <h2 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Identification & Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  NID No *
                </label>
                <input
                  type="text"
                  name="nid_no"
                  required
                  value={formData.nid_no}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Birth ID No
                </label>
                <input
                  type="text"
                  name="birth_id_no"
                  value={formData.birth_id_no}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
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
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Father's Mobile
                </label>
                <input
                  type="text"
                  name="mobile_father"
                  value={formData.mobile_father}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Mother's Mobile
                </label>
                <input
                  type="text"
                  name="mobile_mother"
                  value={formData.mobile_mother}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-300">
            <h2 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Financial Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Standard Bank</p>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Branch Name
                </label>
                <input
                  type="text"
                  name="branch_name"
                  value={formData.branch_name}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Account Name
                </label>
                <input
                  type="text"
                  name="acc_name"
                  value={formData.acc_name}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Account No
                </label>
                <input
                  type="text"
                  name="acc_no"
                  value={formData.acc_no}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-2 mt-1">
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">Mobile Banking</p>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  bKash Number
                </label>
                <input
                  type="text"
                  name="bkash_no"
                  value={formData.bkash_no}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Nagad Number
                </label>
                <input
                  type="text"
                  name="nagad_no"
                  value={formData.nagad_no}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
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
              ? "Update Employee"
              : "Save Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}