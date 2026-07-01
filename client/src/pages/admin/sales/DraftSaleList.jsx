import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import {
  FiPlus,
  FiShoppingCart,
  FiSearch,
  FiX,
  FiTrash2,
  FiEye,
  FiEdit2,
  FiCalendar,
  FiList,
} from "react-icons/fi";

export default function DraftSaleList() {
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // View Modal State – only for displaying products
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [draftRes, prodRes, custRes, brandRes] = await Promise.all([
        axiosInstance.get("draft-sale/draft-sales/"),
        axiosInstance.get("products/"),
        axiosInstance.get("person/customers/"),
        axiosInstance.get("brand/brands/"),
      ]);

      setDrafts(draftRes.data.results || draftRes.data);
      setProducts(prodRes.data.results || prodRes.data);
      setCustomers(custRes.data.results || custRes.data);
      setBrands(brandRes.data.results || brandRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch draft sales data.");
      setLoading(false);
    }
  };

  // --- HELPERS ---
  const getCustomerName = (id) => {
    if (!id) return "Walk-in Customer";
    const cust = customers.find((c) => String(c.id) === String(id));
    return cust ? cust.shop_name || cust.proprietor_name || cust.name : "Walk-in Customer";
  };

  const getProductPartNumber = (item) => {
    if (!item) return "N/A";
    let product = products.find((p) => String(p.id) === String(item.product));
    if (!product) {
      product = products.find((p) => p.product_name === item.product_name);
    }
    return product?.part_number || "N/A";
  };

  // --- STATS (only count & latest) ---
  const stats = useMemo(() => {
    const count = drafts.length;
    const latest =
      drafts.length > 0
        ? drafts.reduce((latest, s) =>
            new Date(s.sale_date) > new Date(latest.sale_date) ? s : latest
          ).sale_date
        : null;
    return { count, latest };
  }, [drafts]);

  // --- DELETE ---
  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this Draft Sale? This action cannot be undone."
      )
    ) {
      try {
        await axiosInstance.delete(`draft-sale/draft-sales/${id}/`);
        fetchData();
      } catch (err) {
        alert("Failed to delete draft. Check server logs.");
      }
    }
  };

  // --- FILTER ---
  const filteredDrafts = drafts.filter((s) => {
    const custName = getCustomerName(s.customer).toLowerCase();
    const productNames = s.items ? s.items.map((i) => i.product_name).join(" ").toLowerCase() : "";
    const search = searchTerm.toLowerCase();

    return (
      (s.invoice_number && s.invoice_number.toLowerCase().includes(search)) ||
      custName.includes(search) ||
      productNames.includes(search)
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FiShoppingCart className="text-blue-600" /> Draft Sales Ledger
          </h1>
        </div>
        <Link
          to="/dashboard/sales/draft"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-semibold transition flex items-center gap-1.5 border border-blue-700"
        >
          <FiPlus /> New Draft
        </Link>
      </div>

      {/* Stats Row – only Drafts count & Latest Draft */}
      <div className="grid grid-cols-1 sm:grid-cols-2 border border-gray-300 mb-4 bg-white">
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiList className="text-indigo-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Drafts
            </p>
            <p className="text-lg font-bold text-gray-800">{stats.count}</p>
          </div>
        </div>
        <div className="p-2 flex items-center gap-2">
          <FiCalendar className="text-purple-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Latest Draft
            </p>
            <p className="text-sm font-semibold text-gray-700">
              {stats.latest
                ? new Date(stats.latest).toLocaleDateString("en-BD", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </p>
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
            placeholder="Search by Invoice, Product, or Customer..."
            className="w-full bg-transparent text-sm text-gray-800 focus:outline-none placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading records...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                    Invoice / Date
                  </th>
                  <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                    Customer
                  </th>
                  <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                    Items
                  </th>
                  <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-right">
                    Total
                  </th>
                  <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDrafts.length > 0 ? (
                  filteredDrafts.map((draft, index) => {
                    const displayTotal =
                      parseFloat(draft.total_amount) > 0
                        ? parseFloat(draft.total_amount)
                        : draft.items?.reduce((sum, i) => sum + parseFloat(i.total_price_bdt || 0), 0);

                    return (
                      <tr
                        key={draft.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border border-gray-300 px-2 py-1.5 align-top">
                          <div className="font-medium text-gray-800 text-xs">
                            {draft.invoice_number}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {new Date(draft.sale_date).toLocaleDateString("en-BD", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-1.5">
                          <div className="text-xs font-medium text-gray-800">
                            {getCustomerName(draft.customer)}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-1.5 max-w-[200px]">
                          <div className="text-xs font-medium text-gray-700">
                            {draft.items?.length || 0} products
                          </div>
                          <div
                            className="text-[10px] text-gray-500 truncate"
                            title={draft.items?.map((i) => i.product_name).join(", ")}
                          >
                            {draft.items?.map((i) => i.product_name).join(", ")}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-1.5 text-right font-mono font-bold text-gray-800">
                          ৳ {displayTotal.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-2 py-1.5 text-center">
                          <div className="flex justify-center items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedDraft(draft);
                                setIsViewModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 transition p-0.5"
                              title="View Products"
                            >
                              <FiEye size={15} />
                            </button>
                            <button
                              onClick={() => {
                                navigate(`/dashboard/sales/draft/${draft.id}`, {
                                  state: { draftData: draft },
                                });
                              }}
                              className="text-amber-600 hover:text-amber-800 transition p-0.5"
                              title="Edit Draft"
                            >
                              <FiEdit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(draft.id)}
                              className="text-gray-400 hover:text-red-600 transition p-0.5"
                              title="Delete"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="border border-gray-300 px-3 py-6 text-center text-gray-400 text-sm">
                      No draft sales found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- VIEW MODAL (only product list, no edit) --- */}
      {isViewModalOpen && selectedDraft && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-3">
          <div className="bg-white border border-gray-300 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-lg">
            {/* Header */}
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex justify-between items-center shrink-0">
              <div>
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <FiShoppingCart className="text-blue-600" /> {selectedDraft.invoice_number}
                </h2>
                <p className="text-[10px] text-gray-500">
                  Customer: {getCustomerName(selectedDraft.customer)}
                </p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Body – Product Table (no Profit) */}
            <div className="overflow-y-auto flex-1 p-4">
              <h3 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                Products in Draft
              </h3>
              <div className="border border-gray-300 overflow-hidden">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="border border-gray-600 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-center">
                        SL
                      </th>
                      <th className="border border-gray-600 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-left">
                        Part No / Product
                      </th>
                      <th className="border border-gray-600 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-center">
                        Qty
                      </th>
                      <th className="border border-gray-600 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-right">
                        Unit Price
                      </th>
                      <th className="border border-gray-600 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDraft.items?.map((item, idx) => {
                      const partNumber = getProductPartNumber(item);
                      return (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border border-gray-300 px-2 py-1 text-center text-xs">
                            {idx + 1}
                          </td>
                          <td className="border border-gray-300 px-2 py-1">
                            <div className="text-xs font-bold text-gray-800">
                              {partNumber}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {item.product_name}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-center text-xs">
                            {item.quantity}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-right font-mono text-xs">
                            ৳ {parseFloat(item.unit_price_bdt).toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-right font-mono font-bold text-xs">
                            ৳ {parseFloat(item.total_price_bdt).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                    {(!selectedDraft.items || selectedDraft.items.length === 0) && (
                      <tr>
                        <td colSpan="5" className="border border-gray-300 px-3 py-4 text-center text-gray-400 text-sm">
                          No products in this draft.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer – only Close button */}
            <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-200 border border-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}