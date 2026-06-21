import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import { FiPlus, FiEdit2, FiX } from "react-icons/fi";

export default function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: null, name: "", contact_person: "", phone: "", email: "", address: "", is_active: true
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axiosInstance.get("supplier/suppliers/");
      const data = response.data.results || response.data;
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load suppliers", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.id) {
        await axiosInstance.put(`supplier/suppliers/${formData.id}/`, formData);
      } else {
        await axiosInstance.post("supplier/suppliers/", formData);
      }
      fetchSuppliers();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Error saving supplier.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (supplier = { id: null, name: "", contact_person: "", phone: "", email: "", address: "", is_active: true }) => {
    setFormData(supplier);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: null, name: "", contact_person: "", phone: "", email: "", address: "", is_active: true });
  };

  const inputClass = "w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:border-gray-800 transition-colors";
  const labelClass = "block text-[10px] font-bold text-gray-500 uppercase tracking-tight mb-0.5";

  return (
    <div className="bg-white p-3 rounded shadow-sm border border-gray-200 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-800">Supplier Directory</h2>
        <button onClick={() => openModal()} className="flex items-center gap-1 bg-gray-800 hover:bg-black text-white text-[10px] font-bold px-2 py-1 rounded transition">
          <FiPlus size={12} /> Add Supplier
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-[10px]">
              <th className="py-1 px-2 border-b">Supplier Name</th>
              <th className="py-1 px-2 border-b">Contact Person</th>
              <th className="py-1 px-2 border-b">Phone</th>
              <th className="py-1 px-2 border-b text-center">Status</th>
              <th className="py-1 px-2 border-b text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-none">
                <td className="py-1 px-2 font-medium text-gray-800">{s.name}</td>
                <td className="py-1 px-2 text-gray-600">{s.contact_person || "-"}</td>
                <td className="py-1 px-2 text-gray-600">{s.phone}</td>
                <td className="py-1 px-2 text-center">
                  <span className={`px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.is_active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td className="py-1 px-2 text-right">
                  <button onClick={() => openModal(s)} className="text-gray-400 hover:text-gray-800">
                    <FiEdit2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-3 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold uppercase">{formData.id ? "Edit Supplier" : "New Supplier"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-800"><FiX size={14} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className={labelClass}>Company/Supplier Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
              </div>
              <div className="col-span-1">
                <label className={labelClass}>Contact Person</label>
                <input type="text" value={formData.contact_person || ""} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} className={inputClass} />
              </div>
              <div className="col-span-1">
                <label className={labelClass}>Phone *</label>
                <input type="text" required value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Email</label>
                <input type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Address</label>
                <input type="text" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass} />
              </div>
              <div className="col-span-2 flex items-center gap-2 mt-1">
                <input type="checkbox" id="isActive" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-3 h-3 text-gray-800 cursor-pointer" />
                <label htmlFor="isActive" className="text-xs font-medium text-gray-700 cursor-pointer">Supplier is Active</label>
              </div>

              <div className="col-span-2 mt-2">
                <button type="submit" disabled={loading} className="w-full bg-gray-800 text-white text-xs font-bold py-1.5 rounded hover:bg-black transition">
                  {loading ? "Saving..." : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}