import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import { FiPlus, FiEdit2, FiX } from "react-icons/fi";

export default function Brand() {
  const [brands, setBrands] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axiosInstance.get("brand/brands/");
      const data = response.data.results || response.data;
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load brands", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.id) {
        await axiosInstance.put(`brand/brands/${formData.id}/`, formData);
      } else {
        await axiosInstance.post("brand/brands/", formData);
      }
      fetchBrands();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Error saving brand.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (brand = { id: null, name: "", description: "" }) => {
    setFormData(brand);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: null, name: "", description: "" });
  };

  const inputClass = "w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:border-gray-800 transition-colors";
  const labelClass = "block text-[10px] font-bold text-gray-500 uppercase tracking-tight mb-0.5";

  return (
    <div className="bg-white p-3 rounded shadow-sm border border-gray-200 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-800">Brands Master</h2>
        <button onClick={() => openModal()} className="flex items-center gap-1 bg-gray-800 hover:bg-black text-white text-[10px] font-bold px-2 py-1 rounded transition">
          <FiPlus size={12} /> Add Brand
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-[10px]">
              <th className="py-1 px-2 border-b">ID</th>
              <th className="py-1 px-2 border-b">Name</th>
              <th className="py-1 px-2 border-b">Description</th>
              <th className="py-1 px-2 border-b text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-none">
                <td className="py-1 px-2 text-gray-500">{b.id}</td>
                <td className="py-1 px-2 font-medium text-gray-800">{b.name}</td>
                <td className="py-1 px-2 text-gray-500 truncate max-w-[200px]">{b.description || "-"}</td>
                <td className="py-1 px-2 text-right">
                  <button onClick={() => openModal(b)} className="text-gray-400 hover:text-gray-800">
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
          <div className="bg-white rounded p-3 w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold uppercase">{formData.id ? "Edit Brand" : "New Brand"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-800"><FiX size={14} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div>
                <label className={labelClass}>Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea rows="2" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClass}></textarea>
              </div>
              <button type="submit" disabled={loading} className="w-full mt-2 bg-gray-800 text-white text-xs font-bold py-1.5 rounded hover:bg-black transition">
                {loading ? "Saving..." : "Save Brand"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}