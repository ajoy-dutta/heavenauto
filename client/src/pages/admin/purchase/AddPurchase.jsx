import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import {
  FiPlus,
  FiTrash2,
  FiLayers,
  FiEdit2,
  FiX,
  FiShoppingBag,
  FiSave,
  FiArrowLeft,
  FiSearch,
} from "react-icons/fi";

export default function AddPurchase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- CORE DATA STATES ---
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [stocks, setStocks] = useState([]);

  // --- UI TOGGLE STATE ---
  const [entryMode, setEntryMode] = useState("manual");
  const [selectedBrands, setSelectedBrands] = useState([]);

  // --- ORDER HEADER ---
  const [orderData, setOrderData] = useState({
    supplier: "",
    invoice_number: "",
    remarks: "",
    entry_by: "",
  });

  // --- ITEM STATES ---
  const [manualItems, setManualItems] = useState([
    { product: "", unit_cost_bdt: "", quantity: "", search: "", showDropdown: false },
  ]);
  const [brandItems, setBrandItems] = useState([]);

  // --- NEW SUPPLIER MODAL ---
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
  });
  const [addingSupplier, setAddingSupplier] = useState(false);
  const [supplierError, setSupplierError] = useState("");

  // Refs for dropdown outside click handling
  const dropdownRefs = useRef({});

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const [prodRes, empRes, supRes, brandRes, stockRes] = await Promise.all([
        axiosInstance.get("products/"),
        axiosInstance.get("person/employees/"),
        axiosInstance.get("supplier/suppliers/"),
        axiosInstance.get("brand/brands/"),
        axiosInstance.get("stock/stocks/"),
      ]);

      setProducts(prodRes.data.results || prodRes.data);
      setEmployees(empRes.data.results || empRes.data);
      setSuppliers(supRes.data.results || supRes.data);
      setBrands(brandRes.data.results || brandRes.data);
      setStocks(stockRes.data.results || stockRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
      setError("Warning: Could not load initial data. Check server connection.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HELPERS ---
  const getProductStock = (productId) => {
    const stockItem = stocks.find((s) => String(s.product) === String(productId));
    return stockItem ? stockItem.current_quantity ?? 0 : 0;
  };

  const getBrandName = (brandId) => {
    if (!brandId) return "Generic";
    const brand = brands.find((b) => String(b.id) === String(brandId));
    return brand ? brand.name : "Unknown Brand";
  };

  // --- HEADER HANDLERS ---
  const handleOrderChange = (e) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  // --- NEW SUPPLIER HANDLERS ---
  const handleNewSupplierChange = (e) => {
    setNewSupplier({ ...newSupplier, [e.target.name]: e.target.value });
  };

  const handleAddSupplierSubmit = async (e) => {
    e.preventDefault();
    setAddingSupplier(true);
    setSupplierError("");

    // Simple validation
    if (!newSupplier.name.trim()) {
      setSupplierError("Supplier name is required.");
      setAddingSupplier(false);
      return;
    }

    try {
      const response = await axiosInstance.post("supplier/suppliers/", newSupplier);
      const createdSupplier = response.data;

      // Refresh supplier list (re-fetch)
      const supRes = await axiosInstance.get("supplier/suppliers/");
      setSuppliers(supRes.data.results || supRes.data);

      // Auto-select the new supplier
      setOrderData((prev) => ({ ...prev, supplier: createdSupplier.id }));

      // Close modal and reset form
      setShowSupplierModal(false);
      setNewSupplier({ name: "", contact_person: "", phone: "", email: "", address: "" });
    } catch (err) {
      console.error("Failed to create supplier", err);
      setSupplierError(err.response?.data?.detail || "Failed to add supplier. Please check your input.");
    } finally {
      setAddingSupplier(false);
    }
  };

  const closeSupplierModal = () => {
    setShowSupplierModal(false);
    setSupplierError("");
    setNewSupplier({ name: "", contact_person: "", phone: "", email: "", address: "" });
  };

  // --- MANUAL MODE (with duplicate prevention & z-index fix) ---
  const handleManualItemChange = (index, field, value) => {
    const newItems = [...manualItems];
    if (field === "search") {
      newItems[index].search = value;
      newItems[index].showDropdown = true;
      setManualItems(newItems);
      return;
    }

    if (field === "product") {
      // Prevent selecting the same product twice
      const isDuplicate = manualItems.some(
        (item, i) => i !== index && String(item.product) === String(value)
      );
      if (isDuplicate) {
        alert("This product is already added to the list!");
        return;
      }

      const selectedProduct = products.find((p) => String(p.id) === String(value));
      if (selectedProduct) {
        newItems[index].product = value;
        newItems[index].unit_cost_bdt = selectedProduct.purchase_cost_bdt || "";
        // Show part number + name after selection
        const partNum = selectedProduct.part_number || "";
        const name = selectedProduct.product_name || selectedProduct.name || "";
        newItems[index].search = partNum ? `${partNum} - ${name}` : name;
        newItems[index].showDropdown = false;
      }
      // Auto‑add a new empty row if this is the last row
      if (index === newItems.length - 1) {
        newItems.push({ product: "", unit_cost_bdt: "", quantity: "", search: "", showDropdown: false });
      }
    } else {
      newItems[index][field] = value;
    }
    setManualItems(newItems);
  };

  const removeManualRow = (index) => {
    if (manualItems.length > 1) {
      setManualItems(manualItems.filter((_, i) => i !== index));
    } else {
      setManualItems([{ product: "", unit_cost_bdt: "", quantity: "", search: "", showDropdown: false }]);
    }
  };

  // Filter products – include part_number in search, exclude already selected ones
  const getFilteredProducts = (searchText) => {
    const lowerSearch = searchText.toLowerCase();
    const selectedProductIds = manualItems
      .map((item) => String(item.product))
      .filter((id) => id !== "");

    return products.filter((p) => {
      if (selectedProductIds.includes(String(p.id))) return false;
      const name = (p.product_name || p.name || "").toLowerCase();
      const brand = getBrandName(p.brand).toLowerCase();
      const part = (p.part_number || "").toLowerCase();
      return name.includes(lowerSearch) || brand.includes(lowerSearch) || part.includes(lowerSearch);
    });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      let outside = true;
      Object.keys(dropdownRefs.current).forEach((key) => {
        if (dropdownRefs.current[key] && dropdownRefs.current[key].contains(event.target)) {
          outside = false;
        }
      });
      if (outside) {
        setManualItems((prev) =>
          prev.map((item) => ({ ...item, showDropdown: false }))
        );
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- BRAND MODE ---
  const handleBrandDropdownSelect = (e) => {
    const brandId = Number(e.target.value);
    if (!brandId) return;
    if (!selectedBrands.includes(brandId)) {
      toggleBrandSelection(brandId);
    }
    e.target.value = "";
  };

  const toggleBrandSelection = (brandId) => {
    setSelectedBrands((prev) => {
      if (prev.includes(brandId)) {
        const newBrands = prev.filter((id) => id !== brandId);
        setBrandItems((currentItems) => {
          const removedProductIds = products
            .filter((p) => String(p.brand) === String(brandId))
            .map((p) => String(p.id));
          return currentItems.filter(
            (item) => !removedProductIds.includes(String(item.product))
          );
        });
        return newBrands;
      } else {
        const newBrands = [...prev, brandId];
        const productsToAdd = products.filter((p) => String(p.brand) === String(brandId));
        const newBatchItems = productsToAdd.map((p) => ({
          product: p.id,
          product_name: p.product_name || p.name,
          part_number: p.part_number || "",
          brand_name: getBrandName(p.brand),
          unit_cost_bdt: p.purchase_cost_bdt || "",
          quantity: "",
          current_stock: getProductStock(p.id),
        }));
        setBrandItems((currentItems) => {
          const existingProductIds = currentItems.map((item) => String(item.product));
          const uniqueNewItems = newBatchItems.filter(
            (item) => !existingProductIds.includes(String(item.product))
          );
          return [...currentItems, ...uniqueNewItems];
        });
        return newBrands;
      }
    });
  };

  const handleBrandItemChange = (index, field, value) => {
    const newItems = [...brandItems];
    newItems[index][field] = value;
    setBrandItems(newItems);
  };

  const removeBrandRow = (index) => {
    setBrandItems(brandItems.filter((_, i) => i !== index));
  };

  const clearEntireBatch = () => {
    setBrandItems([]);
    setSelectedBrands([]);
  };

  // --- CALCULATIONS ---
  const activeItems = entryMode === "manual" ? manualItems : brandItems;
  const grandTotal = activeItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const cost = parseFloat(item.unit_cost_bdt) || 0;
    return sum + qty * cost;
  }, 0);

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!orderData.supplier) {
      setError("Please select a Supplier.");
      setLoading(false);
      return;
    }

    let itemsToSubmit = [];
    if (entryMode === "manual") {
      itemsToSubmit = manualItems.filter(
        (i) => i.product && parseFloat(i.quantity) > 0 && parseFloat(i.unit_cost_bdt) >= 0
      );
    } else {
      itemsToSubmit = brandItems.filter(
        (i) => parseFloat(i.quantity) > 0 && parseFloat(i.unit_cost_bdt) >= 0
      );
    }

    if (itemsToSubmit.length === 0) {
      setError("Please enter valid quantities and costs for at least one product.");
      setLoading(false);
      return;
    }

    const payload = {
      ...orderData,
      items: itemsToSubmit.map((item) => ({
        product: item.product,
        quantity: parseInt(item.quantity, 10),
        unit_cost_bdt: parseFloat(item.unit_cost_bdt).toFixed(2),
      })),
    };

    try {
      await axiosInstance.post("purchase/purchases/", payload);
      navigate("/dashboard/payments");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save purchase entry. Check inputs.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border border-gray-300"
          >
            <FiArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FiShoppingBag className="text-blue-600" /> New Purchase Order
          </h1>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Total Value</span>
          <div className="text-xl font-bold text-blue-600">৳ {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-300 overflow-hidden">
        {/* --- ORDER HEADER (Compact Grid) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-2 bg-gray-50 border-b border-gray-300">
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Supplier *</label>
            <div className="flex gap-1">
              <select
                name="supplier"
                required
                value={orderData.supplier}
                onChange={handleOrderChange}
                className="flex-1 bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.company_name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowSupplierModal(true)}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded border border-blue-700 transition flex items-center gap-0.5"
              >
                <FiPlus size={14} /> Add
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Invoice No.</label>
            <input
              type="text"
              name="invoice_number"
              value={orderData.invoice_number}
              onChange={handleOrderChange}
              className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Entry By</label>
            <select
              name="entry_by"
              value={orderData.entry_by}
              onChange={handleOrderChange}
              className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">-- Select Employee --</option>
              {employees.map((e) => {
                const displayName = e.first_name
                  ? `${e.first_name} ${e.last_name || ""}`.trim()
                  : e.full_name || e.name || e.employee_id;
                return (
                  <option key={e.id} value={e.id}>
                    {displayName} ({e.employee_id})
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Remarks</label>
            <input
              type="text"
              name="remarks"
              value={orderData.remarks}
              onChange={handleOrderChange}
              className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* --- ENTRY MODE TOGGLE --- */}
        <div className="bg-gray-50 border-b border-gray-300 px-3 py-1.5 flex gap-2">
          <button
            type="button"
            onClick={() => setEntryMode("manual")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded border transition ${
              entryMode === "manual"
                ? "bg-blue-100 text-blue-800 border-blue-300"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
            }`}
          >
            <FiEdit2 size={14} /> Manual
          </button>
          <button
            type="button"
            onClick={() => setEntryMode("brand")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded border transition ${
              entryMode === "brand"
                ? "bg-blue-100 text-blue-800 border-blue-300"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
            }`}
          >
            <FiLayers size={14} /> Batch by Brand
          </button>
        </div>

        {/* --- BRAND SELECTOR (only in brand mode) --- */}
        {entryMode === "brand" && (
          <div className="bg-blue-50/50 border-b border-gray-300 px-3 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex-1 max-w-sm">
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">Add Brands</label>
              <select
                onChange={handleBrandDropdownSelect}
                defaultValue=""
                className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="" disabled>-- Choose a Brand --</option>
                {brands.filter((b) => !selectedBrands.includes(b.id)).map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {selectedBrands.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedBrands.map((id) => {
                    const b = brands.find((brand) => brand.id === id);
                    return b ? (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded border border-blue-200">
                        {b.name}
                        <button type="button" onClick={() => toggleBrandSelection(id)} className="text-blue-600 hover:text-blue-900 bg-white rounded-full p-0.5">
                          <FiX size={12} />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            {brandItems.length > 0 && (
              <button type="button" onClick={clearEntireBatch} className="text-xs font-bold text-red-500 hover:text-red-700 underline whitespace-nowrap">
                Clear All
              </button>
            )}
          </div>
        )}

        {/* --- ITEMS TABLE --- */}
        <div className="overflow-x-auto overflow-y-visible pb-24">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center">#</th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">Product & Brand</th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center">Stock</th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center">Unit Cost</th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center">Qty</th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-right">Total</th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {entryMode === "brand" &&
                brandItems.map((item, index) => (
                  <tr key={item.product} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-2 py-1.5 text-center text-xs text-gray-500">{index + 1}</td>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <div className="font-medium text-gray-800 text-xs">
                        {item.part_number && <span className="text-blue-600 mr-1">{item.part_number}</span>}
                        {item.product_name}
                      </div>
                      <div className="text-[9px] text-gray-500 uppercase">{item.brand_name}</div>
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.current_stock <= 5 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                        {item.current_stock}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={item.unit_cost_bdt}
                        onChange={(e) => handleBrandItemChange(index, "unit_cost_bdt", e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded p-0.5 text-xs text-center focus:ring-1 focus:ring-blue-500 outline-none font-semibold text-blue-700"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={item.quantity}
                        onChange={(e) => handleBrandItemChange(index, "quantity", e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded p-0.5 text-xs text-center focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-right font-mono font-bold text-gray-700 text-xs">
                      {((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost_bdt) || 0)).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center">
                      <button type="button" onClick={() => removeBrandRow(index)} className="text-gray-400 hover:text-red-600 transition p-0.5">
                        <FiTrash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}

              {entryMode === "manual" &&
                manualItems.map((item, index) => {
                  const selectedProd = products.find((p) => String(p.id) === String(item.product));
                  const manualBrandName = selectedProd ? getBrandName(selectedProd.brand) : "";
                  const currentStock = selectedProd ? getProductStock(selectedProd.id) : "-";
                  const partNumber = selectedProd?.part_number || "";
                  const productName = selectedProd ? (selectedProd.product_name || selectedProd.name) : "";
                  const filteredProducts = getFilteredProducts(item.search || "");

                  return (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 px-2 py-3 text-center text-xs text-gray-500">{index + 1}</td>
                      <td className={`border border-gray-300 px-2 py-3 overflow-visible ${item.showDropdown ? 'relative z-50' : 'relative z-10'}`}>
                        <div ref={(el) => (dropdownRefs.current[index] = el)}>
                          <div className="flex items-center border border-gray-300 rounded bg-white focus-within:ring-1 focus-within:ring-blue-500">
                            <FiSearch className="ml-1.5 text-gray-400" size={12} />
                            <input
                              type="text"
                              placeholder="Search by part number or name..."
                              value={item.search || ""}
                              onChange={(e) => handleManualItemChange(index, "search", e.target.value)}
                              onFocus={() => {
                                const newItems = [...manualItems];
                                newItems[index].showDropdown = true;
                                setManualItems(newItems);
                              }}
                              className="w-full bg-transparent p-1 text-xs text-gray-800 focus:outline-none"
                              autoComplete="off"
                            />
                            {item.product && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = [...manualItems];
                                  newItems[index].product = "";
                                  newItems[index].search = "";
                                  newItems[index].unit_cost_bdt = "";
                                  newItems[index].showDropdown = false;
                                  setManualItems(newItems);
                                }}
                                className="mr-1 text-gray-400 hover:text-red-500"
                              >
                                <FiX size={12} />
                              </button>
                            )}
                          </div>
                          {item.showDropdown && (
                            <div className="absolute left-0 right-0 top-full mt-0.5 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto z-50">
                              {filteredProducts.length > 0 ? (
                                <ul>
                                  {filteredProducts.map((p) => (
                                    <li
                                      key={p.id}
                                      className="px-2 py-1 hover:bg-blue-100 cursor-pointer text-xs flex justify-between items-center"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleManualItemChange(index, "product", p.id);
                                      }}
                                    >
                                      <span>
                                        <span className="font-mono text-blue-600">{p.part_number || ""}</span>{" "}
                                        {p.product_name || p.name}{" "}
                                        <span className="text-[10px] text-gray-500">({getBrandName(p.brand)})</span>
                                      </span>
                                      <span className="text-[10px] text-gray-400">Stock: {getProductStock(p.id)}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="p-2 text-xs text-gray-400">No products found</div>
                              )}
                            </div>
                          )}
                        </div>
                        {selectedProd && (
                          <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[9px] text-gray-600">
                            {partNumber && <span className="font-mono text-blue-600">{partNumber}</span>}
                            <span className="uppercase">{manualBrandName}</span>
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currentStock !== "-" && currentStock <= 5 ? "bg-red-100 text-red-600" : "text-gray-600"}`}>
                          {currentStock}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-2 py-3">
                        <input
                          type="number"
                          step="0.01"
                          required
                          min="0"
                          placeholder="0.00"
                          value={item.unit_cost_bdt}
                          onChange={(e) => handleManualItemChange(index, "unit_cost_bdt", e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded p-1 text-xs text-center focus:ring-1 focus:ring-blue-500 outline-none font-semibold text-blue-700"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-3">
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="0"
                          value={item.quantity}
                          onChange={(e) => handleManualItemChange(index, "quantity", e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded p-1 text-xs text-center focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-right font-mono font-bold text-gray-700 text-xs">
                        {((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost_bdt) || 0)).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-center">
                        <button type="button" onClick={() => removeManualRow(index)} className="text-gray-400 hover:text-red-600 transition p-0.5" title="Remove row">
                          <FiTrash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

              {entryMode === "brand" && brandItems.length === 0 && (
                <tr>
                  <td colSpan="7" className="border border-gray-300 px-3 py-4 text-center text-gray-400 text-sm">
                    Use the brand selector above to load products.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- ADD ROW BUTTON (Manual only) --- */}
        {entryMode === "manual" && (
          <div className="p-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() =>
                setManualItems([...manualItems, { product: "", unit_cost_bdt: "", quantity: "", search: "", showDropdown: false }])
              }
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              <FiPlus size={14} /> Add Row
            </button>
          </div>
        )}

        {/* --- SUBMIT BAR --- */}
        <div className="p-3 bg-gray-50 border-t border-gray-300 flex flex-col sm:flex-row justify-end gap-2">
          <button type="button" onClick={() => navigate("/dashboard/purchase")} className="px-4 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-200 transition border border-gray-300">
            Cancel
          </button>
          <button type="submit" disabled={loading} className={`px-6 py-1.5 rounded text-sm font-bold text-white transition ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
            {loading ? "Saving..." : "Save Purchase"}
          </button>
        </div>
      </form>

      {/* --- NEW SUPPLIER MODAL --- */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button
              type="button"
              onClick={closeSupplierModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-lg font-bold mb-4">Add New Supplier</h2>
            {supplierError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                {supplierError}
              </div>
            )}
            <form onSubmit={handleAddSupplierSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={newSupplier.name}
                    onChange={handleNewSupplierChange}
                    className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Person</label>
                  <input
                    type="text"
                    name="contact_person"
                    value={newSupplier.contact_person}
                    onChange={handleNewSupplierChange}
                    className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={newSupplier.phone}
                    onChange={handleNewSupplierChange}
                    className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newSupplier.email}
                    onChange={handleNewSupplierChange}
                    className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={newSupplier.address}
                    onChange={handleNewSupplierChange}
                    className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeSupplierModal}
                  className="px-4 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingSupplier}
                  className={`px-4 py-1.5 rounded text-sm font-bold text-white transition ${addingSupplier ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {addingSupplier ? "Adding..." : "Add Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}