import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import {
  FiX,
  FiPlus,
  FiSearch,
  FiUser,
  FiUsers,
  FiUserPlus,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

// Reusable mini-component to keep the detail modal clean
const DetailField = ({ label, value }) => (
  <div className="border-b border-gray-200 pb-2">
    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{label}</p>
    <p className="text-gray-800 font-medium mt-1">
      {value ? value : <span className="text-gray-400 italic">N/A</span>}
    </p>
  </div>
);

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get("person/employees/");
      setEmployees(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch employees. Is the server running?");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee permanently?")) {
      try {
        await axiosInstance.delete(`employees/${id}/`);
        setEmployees(employees.filter((emp) => emp.id !== id));
        if (selectedEmployee && selectedEmployee.id === id) {
          setSelectedEmployee(null);
        }
      } catch (err) {
        alert("Error deleting employee.");
      }
    }
  };

  // --- STATS ---
  const stats = useMemo(() => {
    const total = employees.length;
    const male = employees.filter((e) => e.gender === "M").length;
    const female = employees.filter((e) => e.gender === "F").length;
    // If you have an 'is_active' field, you can compute active/inactive
    const active = employees.filter((e) => e.is_active !== false).length; // fallback
    const inactive = total - active;
    return { total, male, female, active, inactive };
  }, [employees]);

  // --- FILTER ---
  const filteredEmployees = employees.filter((emp) => {
    const search = searchTerm.toLowerCase();
    return (
      emp.employee_id?.toLowerCase().includes(search) ||
      emp.full_name?.toLowerCase().includes(search) ||
      emp.mobile1?.toLowerCase().includes(search) ||
      emp.nid_no?.toLowerCase().includes(search) ||
      emp.email?.toLowerCase().includes(search)
    );
  });

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-3 bg-gray-50 min-h-screen">
        <div className="p-8 text-center text-gray-400 text-sm">Loading employee database...</div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FiUsers className="text-blue-600" /> Employee Management
          </h1>
        </div>
        <button
          onClick={() => navigate("/dashboard/employees/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-semibold transition flex items-center gap-1.5 border border-blue-700"
        >
          <FiPlus /> Add New Employee
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 border border-gray-300 mb-4 bg-white">
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiUsers className="text-blue-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Employees
            </p>
            <p className="text-lg font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiUser className="text-indigo-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Male / Female
            </p>
            <p className="text-lg font-bold text-gray-800">
              {stats.male} / {stats.female}
            </p>
          </div>
        </div>
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiUserPlus className="text-green-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Active
            </p>
            <p className="text-lg font-bold text-green-700">{stats.active}</p>
          </div>
        </div>
        <div className="p-2 flex items-center gap-2">
          <FiUserPlus className="text-red-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Inactive
            </p>
            <p className="text-lg font-bold text-red-600">{stats.inactive}</p>
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
            placeholder="Search by Name, ID, Mobile, NID, or Email..."
            className="w-full bg-transparent text-sm text-gray-800 focus:outline-none placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-3 text-center text-red-500 text-sm border-b border-gray-200">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                  ID
                </th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                  Name
                </th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                  Mobile
                </th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                  NID
                </th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp, index) => (
                  <tr
                    key={emp.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border border-gray-300 px-2 py-1.5 text-xs font-bold text-gray-700">
                      {emp.employee_id}
                    </td>
                    <td
                      className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      onClick={() => setSelectedEmployee(emp)}
                    >
                      {emp.full_name}
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-700">
                      {emp.mobile1 || "—"}
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-700">
                      {emp.nid_no || "—"}
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center">
                      <div className="flex justify-center items-center gap-1">
                        <button
                          onClick={() =>
                            navigate("/dashboard/employees/add", { state: { editData: emp } })
                          }
                          className="text-blue-600 hover:text-blue-800 transition p-0.5"
                          title="Edit"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
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
                    {searchTerm ? "No employees match your search." : "No employees found in the database."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- DETAIL MODAL --- */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-3">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-300">
            {/* Header */}
            <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                {selectedEmployee.picture ? (
                  <img
                    src={selectedEmployee.picture}
                    alt={selectedEmployee.full_name}
                    onClick={() => setZoomedImage(selectedEmployee.picture)}
                    title="Click to zoom"
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-600 cursor-pointer hover:scale-105 transition duration-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold text-xl">
                    {selectedEmployee.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-3">
                    {selectedEmployee.full_name}
                    {selectedEmployee.blood_group && (
                      <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {selectedEmployee.blood_group}
                      </span>
                    )}
                  </h2>
                  <p className="text-gray-400 text-xs">
                    {selectedEmployee.employee_id} | Joined: {selectedEmployee.joining_date || "N/A"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-white transition p-1 bg-gray-700 rounded-full hover:bg-gray-600"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Body (scrollable) */}
            <div className="overflow-y-auto flex-1 p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Personal Details */}
                <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Personal Details</h3>
                  <DetailField label="Father's Name" value={selectedEmployee.father_name} />
                  <DetailField label="Mother's Name" value={selectedEmployee.mother_name} />
                  <DetailField label="Date of Birth" value={selectedEmployee.dob} />
                  <DetailField label="Age" value={selectedEmployee.age} />
                  <DetailField label="Gender" value={selectedEmployee.gender === 'M' ? 'Male' : selectedEmployee.gender === 'F' ? 'Female' : 'Other'} />
                  <DetailField label="Religion" value={selectedEmployee.religion} />
                  <DetailField label="Nationality" value={selectedEmployee.nationality} />
                </div>

                {/* Identity & Contact */}
                <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Identity & Contact</h3>
                  <DetailField label="NID Number" value={selectedEmployee.nid_no} />
                  <DetailField label="Birth Certificate ID" value={selectedEmployee.birth_id_no} />
                  <DetailField label="Passport No" value={selectedEmployee.passport_no} />
                  <DetailField label="Primary Mobile" value={selectedEmployee.mobile1} />
                  <DetailField label="Secondary Mobile" value={selectedEmployee.mobile2} />
                  <DetailField label="Father's Mobile" value={selectedEmployee.mobile_father} />
                  <DetailField label="Mother's Mobile" value={selectedEmployee.mobile_mother} />
                  <DetailField label="Email Address" value={selectedEmployee.email} />
                </div>

                {/* Financial Routing */}
                <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Financial Routing</h3>
                  <div className="bg-blue-50 p-3 rounded mb-3">
                    <p className="font-bold text-blue-800 text-xs mb-2">Standard Bank</p>
                    <DetailField label="Bank Name" value={selectedEmployee.bank_name} />
                    <DetailField label="Branch" value={selectedEmployee.branch_name} />
                    <DetailField label="Account Name" value={selectedEmployee.acc_name} />
                    <DetailField label="Account Number" value={selectedEmployee.acc_no} />
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <p className="font-bold text-purple-800 text-xs mb-2">Mobile Banking</p>
                    <DetailField label="bKash" value={selectedEmployee.bkash_no} />
                    <DetailField label="Nagad" value={selectedEmployee.nagad_no} />
                    <DetailField label="Rocket" value={selectedEmployee.rocket_no} />
                  </div>
                </div>

                {/* Education */}
                <div className="md:col-span-2 lg:col-span-3 space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Education History</h3>
                  {selectedEmployee.education && selectedEmployee.education.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead className="bg-gray-100 text-gray-600 uppercase font-bold">
                          <tr>
                            <th className="px-2 py-1.5 border border-gray-200 text-left">Exam</th>
                            <th className="px-2 py-1.5 border border-gray-200 text-left">Institute</th>
                            <th className="px-2 py-1.5 border border-gray-200 text-left">Board/Univ</th>
                            <th className="px-2 py-1.5 border border-gray-200 text-left">Group</th>
                            <th className="px-2 py-1.5 border border-gray-200 text-left">Year</th>
                            <th className="px-2 py-1.5 border border-gray-200 text-left">GPA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEmployee.education.map((edu, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                              <td className="px-2 py-1.5 border border-gray-200 font-medium">{edu.exam_name}</td>
                              <td className="px-2 py-1.5 border border-gray-200">{edu.institute_name}</td>
                              <td className="px-2 py-1.5 border border-gray-200">{edu.board_university}</td>
                              <td className="px-2 py-1.5 border border-gray-200">{edu.group}</td>
                              <td className="px-2 py-1.5 border border-gray-200">{edu.passing_year}</td>
                              <td className="px-2 py-1.5 border border-gray-200 font-bold">{edu.gpa}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No education records found.</p>
                  )}
                </div>

                {/* Work Experience */}
                <div className="md:col-span-2 lg:col-span-3 space-y-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Previous Work Experience</h3>
                  {selectedEmployee.previous_work && selectedEmployee.previous_work.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedEmployee.previous_work.map((work, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200">
                          <p className="font-bold text-gray-800">{work.work_name}</p>
                          <p className="text-gray-600 text-sm">@ {work.shop_name}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            <span className="font-bold">Address:</span> {work.address}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No previous work history found.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-200 border border-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FULLSCREEN IMAGE ZOOM MODAL --- */}
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
              alt="Zoomed Profile"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain border-4 border-gray-700"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}