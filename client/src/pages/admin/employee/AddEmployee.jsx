import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiArrowLeft, FiSave, FiEdit3 } from "react-icons/fi";

export default function AddEmployee() {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const editData = location.state?.editData;
  const isEditMode = Boolean(editData);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const [formData, setFormData] = useState({
    joining_date: "", full_name: "", father_name: "", mother_name: "",
    gender: "M", blood_group: "", dob: "", age: "", religion: "",
    birth_id_no: "", nid_no: "", passport_no: "", nationality: "Bangladeshi",
    email: "", mobile1: "", mobile2: "", mobile_father: "", mobile_mother: "", mobile_others: "",
    acc_name: "", acc_no: "", bank_name: "", branch_name: "",
    bkash_no: "", nagad_no: "", rocket_no: ""
  });

  const [picture, setPicture] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const prepopulatedData = { ...editData };
      
      Object.keys(prepopulatedData).forEach(key => {
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
    setErrors([]); // Clear previous errors

    const submitData = new FormData();
    for (const key in formData) {
      if (key !== "id" && key !== "employee_id" && key !== "picture" && key !== "education" && key !== "previous_work") {
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
      
      // Check if Django returned a JSON object with field-specific errors
      if (errorResponse && typeof errorResponse === 'object' && !Array.isArray(errorResponse)) {
        const extractedErrors = Object.entries(errorResponse).map(([field, messages]) => {
          // Format field name (e.g. "nid_no" -> "Nid No")
          const cleanFieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
          const cleanMessage = Array.isArray(messages) ? messages.join(" ") : messages;
          return `${cleanFieldName}: ${cleanMessage}`;
        });
        setErrors(extractedErrors);
      } else {
        // Fallback for general 500 errors or network issues
        setErrors([`Failed to ${isEditMode ? 'update' : 'add'} employee. Please check your connection or try again.`]);
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            {isEditMode ? <><FiEdit3 className="text-blue-500"/> Edit Employee</> : "Add New Employee"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode ? `Updating records for ${editData.full_name} (${editData.employee_id})` : "Create a new staff record in the ERP system"}
          </p>
        </div>
        <Link 
          to="/dashboard/employees" 
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          <FiArrowLeft /> Cancel
        </Link>
      </div>

      {/* Dynamic Error Banner */}
      {errors.length > 0 && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 shadow-sm rounded-r-lg" role="alert">
          <p className="font-bold mb-2">Please fix the following errors:</p>
          <ul className="list-disc ml-5 space-y-1">
            {errors.map((errMsg, index) => (
              <li key={index} className="text-sm font-medium">{errMsg}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Core Identity</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Joining Date *</label>
                <input type="date" name="joining_date" required value={formData.joining_date} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Profile Picture</label>
                <input type="file" name="picture" accept="image/*" onChange={handleFileChange} className="w-full p-2 border rounded bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Blood Group</label>
                  <input type="text" name="blood_group" placeholder="e.g., O+" value={formData.blood_group} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Personal & Family Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Father's Name *</label>
                <input type="text" name="father_name" required value={formData.father_name} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mother's Name *</label>
                <input type="text" name="mother_name" required value={formData.mother_name} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Date of Birth *</label>
                <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Age *</label>
                <input type="number" name="age" required value={formData.age} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Religion *</label>
                <input type="text" name="religion" required value={formData.religion} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nationality</label>
                <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Identification & Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">NID No *</label>
                <input type="text" name="nid_no" required value={formData.nid_no} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Birth ID No</label>
                <input type="text" name="birth_id_no" value={formData.birth_id_no} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Primary Mobile *</label>
                <input type="text" name="mobile1" required value={formData.mobile1} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Father's Mobile</label>
                <input type="text" name="mobile_father" value={formData.mobile_father} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mother's Mobile</label>
                <input type="text" name="mobile_mother" value={formData.mobile_mother} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Financial Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <p className="text-xs font-bold text-blue-600 uppercase mb-2">Standard Bank</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Bank Name</label>
                <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Branch Name</label>
                <input type="text" name="branch_name" value={formData.branch_name} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Account Name</label>
                <input type="text" name="acc_name" value={formData.acc_name} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Account No</label>
                <input type="text" name="acc_no" value={formData.acc_no} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="md:col-span-2 mt-2">
                <p className="text-xs font-bold text-purple-600 uppercase mb-2">Mobile Banking</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">bKash Number</label>
                <input type="text" name="bkash_no" value={formData.bkash_no} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nagad Number</label>
                <input type="text" name="nagad_no" value={formData.nagad_no} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className={`flex items-center gap-2 font-bold py-3 px-8 rounded transition duration-300 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white shadow-lg"
            }`}
          >
            <FiSave /> 
            {loading 
              ? (isEditMode ? "Updating..." : "Saving...") 
              : (isEditMode ? "Update Employee Record" : "Save New Employee")
            }
          </button>
        </div>

      </form>
    </div>
  );
}