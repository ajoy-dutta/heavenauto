import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiX } from "react-icons/fi"; 

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
  
  // Modal states
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null); // NEW: Tracks the zoomed image
  
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

  if (loading) return <div className="p-6 font-bold text-gray-600">Loading employee database...</div>;

  return (
    <div className="relative">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
        <button 
          onClick={() => navigate('/dashboard/employees/add')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          + Add New Employee
        </button>
      </div>

      {error && <p className="text-red-500 font-bold mb-4">{error}</p>}

      {/* Data Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal font-bold">
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Mobile</th>
              <th className="py-3 px-6 text-left">NID</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-3 px-6 text-left whitespace-nowrap font-bold text-gray-700">
                  {emp.employee_id}
                </td>
                
                {/* --- CLICKABLE NAME COLUMN --- */}
                <td 
                  className="py-3 px-6 text-left font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition"
                  onClick={() => setSelectedEmployee(emp)}
                >
                  {emp.full_name}
                </td>
                
                <td className="py-3 px-6 text-left font-medium">{emp.mobile1}</td>
                <td className="py-3 px-6 text-left">{emp.nid_no}</td>
                <td className="py-3 px-6 text-center">
                  <button 
                    onClick={() => navigate('/dashboard/employees/add', { state: { editData: emp } })}
                    className="text-blue-500 hover:text-blue-700 mr-4 font-bold transition"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:text-red-700 font-bold transition">Delete</button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">No employees found in the database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- HR DETAILS MODAL OVERLAY --- */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="bg-gray-900 text-white p-5 flex justify-between items-center">
              
              {/* --- PROFILE PICTURE & HEADER TEXT GROUP --- */}
              <div className="flex items-center gap-4">
                
                {/* Profile Picture Logic with Zoom Trigger */}
                {selectedEmployee.picture ? (
                  <img 
                    src={selectedEmployee.picture} 
                    alt={selectedEmployee.full_name} 
                    onClick={() => setZoomedImage(selectedEmployee.picture)}
                    title="Click to zoom"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-700 shadow-sm bg-white cursor-pointer hover:scale-105 hover:border-gray-500 transition-all duration-300"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 border-2 border-gray-700 font-bold text-2xl shadow-sm">
                    {selectedEmployee.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-4">
                    {selectedEmployee.full_name}
                    {selectedEmployee.blood_group && (
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {selectedEmployee.blood_group}
                      </span>
                    )}
                  </h2>
                  <p className="text-red-400 text-sm font-semibold mt-1">
                    {selectedEmployee.employee_id} | Joined: {selectedEmployee.joining_date}
                  </p>
                </div>

              </div>

              <button 
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-white transition p-2 bg-gray-800 rounded-full"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-50">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div className="space-y-4 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Personal Details</h3>
                  <DetailField label="Father's Name" value={selectedEmployee.father_name} />
                  <DetailField label="Mother's Name" value={selectedEmployee.mother_name} />
                  <DetailField label="Date of Birth" value={selectedEmployee.dob} />
                  <DetailField label="Age" value={selectedEmployee.age} />
                  <DetailField label="Gender" value={selectedEmployee.gender === 'M' ? 'Male' : selectedEmployee.gender === 'F' ? 'Female' : 'Other'} />
                  <DetailField label="Religion" value={selectedEmployee.religion} />
                  <DetailField label="Nationality" value={selectedEmployee.nationality} />
                </div>

                <div className="space-y-4 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Identity & Contact</h3>
                  <DetailField label="NID Number" value={selectedEmployee.nid_no} />
                  <DetailField label="Birth Certificate ID" value={selectedEmployee.birth_id_no} />
                  <DetailField label="Passport No" value={selectedEmployee.passport_no} />
                  <DetailField label="Primary Mobile" value={selectedEmployee.mobile1} />
                  <DetailField label="Secondary Mobile" value={selectedEmployee.mobile2} />
                  <DetailField label="Father's Mobile" value={selectedEmployee.mobile_father} />
                  <DetailField label="Mother's Mobile" value={selectedEmployee.mobile_mother} />
                  <DetailField label="Email Address" value={selectedEmployee.email} />
                </div>

                <div className="space-y-4 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Financial Routing</h3>
                  
                  <div className="bg-blue-50 p-3 rounded mb-4">
                    <p className="font-bold text-blue-800 text-sm mb-2">Standard Bank</p>
                    <DetailField label="Bank Name" value={selectedEmployee.bank_name} />
                    <DetailField label="Branch" value={selectedEmployee.branch_name} />
                    <DetailField label="Account Name" value={selectedEmployee.acc_name} />
                    <DetailField label="Account Number" value={selectedEmployee.acc_no} />
                  </div>

                  <div className="bg-purple-50 p-3 rounded">
                    <p className="font-bold text-purple-800 text-sm mb-2">Mobile Banking</p>
                    <DetailField label="bKash" value={selectedEmployee.bkash_no} />
                    <DetailField label="Nagad" value={selectedEmployee.nagad_no} />
                    <DetailField label="Rocket" value={selectedEmployee.rocket_no} />
                  </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3 space-y-4 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Education History</h3>
                  {selectedEmployee.education && selectedEmployee.education.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-xs">
                          <tr>
                            <th className="px-4 py-2">Exam</th>
                            <th className="px-4 py-2">Institute</th>
                            <th className="px-4 py-2">Board/Univ</th>
                            <th className="px-4 py-2">Group</th>
                            <th className="px-4 py-2">Year</th>
                            <th className="px-4 py-2">GPA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEmployee.education.map((edu, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="px-4 py-2 font-medium">{edu.exam_name}</td>
                              <td className="px-4 py-2">{edu.institute_name}</td>
                              <td className="px-4 py-2">{edu.board_university}</td>
                              <td className="px-4 py-2">{edu.group}</td>
                              <td className="px-4 py-2">{edu.passing_year}</td>
                              <td className="px-4 py-2 font-bold">{edu.gpa}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No education records found.</p>
                  )}
                </div>

                <div className="md:col-span-2 lg:col-span-3 space-y-4 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Previous Work Experience</h3>
                  {selectedEmployee.previous_work && selectedEmployee.previous_work.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedEmployee.previous_work.map((work, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded border border-gray-200">
                          <p className="font-bold text-gray-800 text-lg">{work.work_name}</p>
                          <p className="text-gray-600 font-medium">@ {work.shop_name}</p>
                          <p className="text-gray-500 text-sm mt-2"><span className="font-bold">Address:</span> {work.address}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No previous work history found.</p>
                  )}
                </div>

              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* --- FULLSCREEN IMAGE ZOOM MODAL --- */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-md p-4 cursor-zoom-out transition-opacity"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative">
            {/* Close Button on top right of the image */}
            <button 
              onClick={() => setZoomedImage(null)}
              className="absolute -top-12 right-0 text-gray-400 hover:text-white transition"
            >
              <FiX size={36} />
            </button>
            <img 
              src={zoomedImage} 
              alt="Zoomed Profile" 
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain cursor-default border-4 border-gray-800"
              onClick={(e) => e.stopPropagation()} // Prevents clicking the image itself from closing the modal
            />
          </div>
        </div>
      )}

    </div>
  );
}