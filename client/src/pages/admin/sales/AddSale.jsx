import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import {
  FiPlus,
  FiTrash2,
  FiLayers,
  FiEdit2,
  FiX,
  FiShoppingCart,
  FiUserPlus,
  FiSave,
  FiArrowLeft,
  FiSearch,
} from "react-icons/fi";

export default function AddSale() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- CORE DATA STATES ---
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [stocks, setStocks] = useState([]);

  // --- UI TOGGLE STATE ---
  const [entryMode, setEntryMode] = useState("manual");
  const [selectedBrands, setSelectedBrands] = useState([]);

  // --- ORDER HEADER ---
  const [orderData, setOrderData] = useState({
    customer: "",
    sold_by: "",
    invoice_number: "",
    payment_status: "Paid",
    remarks: "",
  });

  // --- ITEM STATES ---
  const [manualItems, setManualItems] = useState([
    { product: "", unit_price_bdt: "", quantity: "", search: "", showDropdown: false },
  ]);
  const [brandItems, setBrandItems] = useState([]);

  // --- CUSTOMER MODAL ---
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    shop_name: "",
    proprietor_name: "",
    mobile1: "",
    division: "",
    district: "",
    town_village: "",
  });

  // Refs for dropdown outside click handling
  const dropdownRefs = useRef({});

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, empRes, custRes, brandRes, stockRes] = await Promise.all([
          axiosInstance.get("products/"),
          axiosInstance.get("person/employees/"),
          axiosInstance.get("person/customers/"),
          axiosInstance.get("brand/brands/"),
          axiosInstance.get("stock/stocks/"),
        ]);

        setProducts(prodRes.data.results || prodRes.data);
        setEmployees(empRes.data.results || empRes.data);
        setCustomers(custRes.data.results || custRes.data);
        setBrands(brandRes.data.results || brandRes.data);
        setStocks(stockRes.data.results || stockRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("Warning: Could not load initial data. Check server connection.");
      }
    };
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
    if (e.target.name === "customer" && e.target.value === "ADD_NEW") {
      setIsCustomerModalOpen(true);
      return;
    }
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  // --- MANUAL MODE ---
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
        newItems[index].unit_price_bdt = selectedProduct.retail_price_bdt || 0;
        newItems[index].search = selectedProduct.product_name || selectedProduct.name || "";
        newItems[index].showDropdown = false;
      }
      // Auto‑add a new empty row if this is the last row
      if (index === newItems.length - 1) {
        newItems.push({ product: "", unit_price_bdt: "", quantity: "", search: "", showDropdown: false });
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
      setManualItems([{ product: "", unit_price_bdt: "", quantity: "", search: "", showDropdown: false }]);
    }
  };

  // Filter products by search text and exclude already selected items
  const getFilteredProducts = (searchText) => {
    const lowerSearch = searchText.toLowerCase();
    
    // Get all product IDs that are already selected in manual rows
    const selectedProductIds = manualItems
      .map((item) => String(item.product))
      .filter((id) => id !== "");

    return products.filter((p) => {
      if (selectedProductIds.includes(String(p.id))) return false; // Exclude already selected
      
      const name = (p.product_name || p.name || "").toLowerCase();
      const brand = getBrandName(p.brand).toLowerCase();
      return name.includes(lowerSearch) || brand.includes(lowerSearch);
    });
  };

  // Close dropdown when clicking outside
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
          brand_name: getBrandName(p.brand),
          purchase_cost_bdt: p.purchase_cost_bdt || 0,
          unit_price_bdt: p.retail_price_bdt || "",
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

  // --- CREATE CUSTOMER ---
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setCustomerLoading(true);

    const customerPayload = { ...newCustomerData, customer_type: "Retail" };

    try {
      const response = await axiosInstance.post("person/customers/", customerPayload);
      const newlyCreatedCustomer = response.data;

      setCustomers([...customers, newlyCreatedCustomer]);
      setOrderData({ ...orderData, customer: newlyCreatedCustomer.id });
      setIsCustomerModalOpen(false);
      setNewCustomerData({
        shop_name: "",
        proprietor_name: "",
        mobile1: "",
        division: "",
        district: "",
        town_village: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to add customer. Check unique fields (mobile).");
    } finally {
      setCustomerLoading(false);
    }
  };

  // --- CALCULATIONS ---
  const activeItems = entryMode === "manual" ? manualItems : brandItems;

  const grandTotal = activeItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price_bdt) || 0;
    return sum + qty * price;
  }, 0);

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!orderData.sold_by) {
      setError("Please select the Employee making this sale.");
      setLoading(false);
      return;
    }

    let itemsToSubmit = [];
    if (entryMode === "manual") {
      itemsToSubmit = manualItems.filter(
        (i) => i.product && parseFloat(i.quantity) > 0 && parseFloat(i.unit_price_bdt) >= 0
      );
    } else {
      itemsToSubmit = brandItems.filter(
        (i) => parseFloat(i.quantity) > 0 && parseFloat(i.unit_price_bdt) >= 0
      );
    }

    if (itemsToSubmit.length === 0) {
      setError("Please enter valid quantities and prices for at least one product.");
      setLoading(false);
      return;
    }

    const payload = {
      ...orderData,
      customer: orderData.customer ? parseInt(orderData.customer) : null,
      sold_by: parseInt(orderData.sold_by),
      items: itemsToSubmit.map((item) => ({
        product: item.product,
        quantity: parseInt(item.quantity, 10),
        unit_price_bdt: parseFloat(item.unit_price_bdt).toFixed(2),
      })),
    };

    try {
      await axiosInstance.post("sale/sales/", payload);
      navigate("/dashboard/payments");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to process sale. Check stock levels and inputs.");
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
            <FiShoppingCart className="text-green-600" /> New Sale Order
          </h1>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Total Value</span>
          <div className="text-xl font-bold text-green-600">৳ {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
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
            <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
              Customer
            </label>
            <select
              name="customer"
              value={orderData.customer}
              onChange={handleOrderChange}
              className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value=""> Select Customer </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shop_name ? `${c.shop_name} (${c.proprietor_name})` : c.proprietor_name}
                </option>
              ))}
              <option value="ADD_NEW" className="bg-blue-50 text-blue-700 font-bold">
                + Add New Customer
              </option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
              Sold By (Employee) *
            </label>
            <select
              name="sold_by"
              required
              value={orderData.sold_by}
              onChange={handleOrderChange}
              className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
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
            <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
              Payment Status
            </label>
            <select
              name="payment_status"
              value={orderData.payment_status}
              onChange={handleOrderChange}
              className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
              Remarks
            </label>
            <input
              type="text"
              name="remarks"
              value={orderData.remarks}
              onChange={handleOrderChange}
              className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
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
                ? "bg-green-100 text-green-800 border-green-300"
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
                ? "bg-green-100 text-green-800 border-green-300"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
            }`}
          >
            <FiLayers size={14} /> Batch by Brand
          </button>
        </div>

        {/* --- BRAND SELECTOR (only in brand mode) --- */}
        {entryMode === "brand" && (
          <div className="bg-green-50/50 border-b border-gray-300 px-3 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex-1 max-w-sm">
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                Add Brands
              </label>
              <select
                onChange={handleBrandDropdownSelect}
                defaultValue=""
                className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 outline-none"
              >
                <option value="" disabled>-- Choose a Brand --</option>
                {brands
                  .filter((b) => !selectedBrands.includes(b.id))
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </select>
              {selectedBrands.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedBrands.map((id) => {
                    const b = brands.find((brand) => brand.id === id);
                    return b ? (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded border border-green-200"
                      >
                        {b.name}
                        <button
                          type="button"
                          onClick={() => toggleBrandSelection(id)}
                          className="text-green-600 hover:text-green-900 bg-white rounded-full p-0.5"
                        >
                          <FiX size={12} />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            {brandItems.length > 0 && (
              <button
                type="button"
                onClick={clearEntireBatch}
                className="text-xs font-bold text-red-500 hover:text-red-700 underline whitespace-nowrap"
              >
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
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                  Product & Brand
                </th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center">
                  Stock
                </th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center">
                  Purch. Cost
                </th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center">
                  Sell Price
                </th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center">
                  Qty
                </th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-right">
                  Total
                </th>
                <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {entryMode === "brand" &&
                brandItems.map((item, index) => (
                  <tr key={item.product} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <div className="font-medium text-gray-800 text-xs">{item.product_name}</div>
                      <div className="text-[9px] text-gray-500 uppercase">{item.brand_name}</div>
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.current_stock <= 5
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.current_stock}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center font-mono text-gray-500 text-xs">
                      {parseFloat(item.purchase_cost_bdt).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={item.unit_price_bdt}
                        onChange={(e) =>
                          handleBrandItemChange(index, "unit_price_bdt", e.target.value)
                        }
                        className="w-full bg-white border border-gray-300 rounded p-0.5 text-xs text-center focus:ring-1 focus:ring-green-500 outline-none font-semibold text-green-700"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={item.quantity}
                        onChange={(e) =>
                          handleBrandItemChange(index, "quantity", e.target.value)
                        }
                        className="w-full bg-white border border-gray-300 rounded p-0.5 text-xs text-center focus:ring-1 focus:ring-green-500 outline-none"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-right font-mono font-bold text-gray-700 text-xs">
                      {(
                        (parseFloat(item.quantity) || 0) *
                        (parseFloat(item.unit_price_bdt) || 0)
                      ).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeBrandRow(index)}
                        className="text-gray-400 hover:text-red-600 transition p-0.5"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}

              {entryMode === "manual" &&
                manualItems.map((item, index) => {
                  const selectedProd = products.find(
                    (p) => String(p.id) === String(item.product)
                  );
                  const manualBrandName = selectedProd ? getBrandName(selectedProd.brand) : "";
                  const currentStock = selectedProd ? getProductStock(selectedProd.id) : "-";
                  const purchaseCost = selectedProd
                    ? parseFloat(selectedProd.purchase_cost_bdt).toFixed(2)
                    : "-";

                  const filteredProducts = getFilteredProducts(item.search || "");

                  return (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      {/* FIX IMPLEMENTED HERE: Added conditional z-index so open dropdowns jump to the front layer over the below rows */}
                      <td className={`border border-gray-300 px-2 py-3 overflow-visible ${item.showDropdown ? 'relative z-50' : 'relative z-10'}`}>
                        <div ref={(el) => (dropdownRefs.current[index] = el)}>
                          <div className="flex items-center border border-gray-300 rounded bg-white focus-within:ring-1 focus-within:ring-green-500">
                            <FiSearch className="ml-1.5 text-gray-400" size={12} />
                            <input
                              type="text"
                              placeholder="Search product..."
                              value={item.search || ""}
                              onChange={(e) =>
                                handleManualItemChange(index, "search", e.target.value)
                              }
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
                                  newItems[index].unit_price_bdt = "";
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
                                      className="px-2 py-1 hover:bg-green-100 cursor-pointer text-xs flex justify-between items-center"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleManualItemChange(index, "product", p.id);
                                      }}
                                    >
                                      <span>
                                        {p.product_name || p.name}{" "}
                                        <span className="text-[10px] text-gray-500">
                                          ({getBrandName(p.brand)})
                                        </span>
                                      </span>
                                      <span className="text-[10px] text-gray-400">
                                        Stock: {getProductStock(p.id)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="p-2 text-xs text-gray-400">
                                  No additional products found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {manualBrandName && (
                          <div className="text-[9px] text-gray-500 uppercase mt-0.5">
                            {manualBrandName}
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            currentStock !== "-" && currentStock <= 5
                              ? "bg-red-100 text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {currentStock}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-center font-mono text-gray-500 text-xs">
                        {purchaseCost}
                      </td>
                      <td className="border border-gray-300 px-2 py-3">
                        <input
                          type="number"
                          step="0.01"
                          required
                          min="0"
                          placeholder="0.00"
                          value={item.unit_price_bdt}
                          onChange={(e) =>
                            handleManualItemChange(index, "unit_price_bdt", e.target.value)
                          }
                          className="w-full bg-white border border-gray-300 rounded p-1 text-xs text-center focus:ring-1 focus:ring-green-500 outline-none font-semibold text-green-700"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-3">
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="0"
                          value={item.quantity}
                          onChange={(e) =>
                            handleManualItemChange(index, "quantity", e.target.value)
                          }
                          className="w-full bg-white border border-gray-300 rounded p-1 text-xs text-center focus:ring-1 focus:ring-green-500 outline-none"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-right font-mono font-bold text-gray-700 text-xs">
                        {(
                          (parseFloat(item.quantity) || 0) *
                          (parseFloat(item.unit_price_bdt) || 0)
                        ).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeManualRow(index)}
                          className="text-gray-400 hover:text-red-600 transition p-0.5"
                          title="Remove row"
                        >
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
                setManualItems([...manualItems, { product: "", unit_price_bdt: "", quantity: "", search: "", showDropdown: false }])
              }
              className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-semibold"
            >
              <FiPlus size={14} /> Add Row
            </button>
          </div>
        )}

        {/* --- SUBMIT BAR --- */}
        <div className="p-3 bg-gray-50 border-t border-gray-300 flex flex-col sm:flex-row justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard/sales")}
            className="px-4 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-200 transition border border-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-1.5 rounded text-sm font-bold text-white transition ${
              loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Processing..." : "Complete Sale"}
          </button>
        </div>
      </form>

      {/* --- CUSTOMER MODAL (unchanged) --- */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-3">
          <div className="bg-white border border-gray-300 w-full max-w-md rounded-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex justify-between items-center">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <FiUserPlus className="text-green-600" /> Quick Add Customer
              </h2>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="overflow-y-auto flex-1 p-4 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    value={newCustomerData.shop_name}
                    onChange={(e) =>
                      setNewCustomerData({ ...newCustomerData, shop_name: e.target.value })
                    }
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                    placeholder="e.g. Dhaka Motors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    Proprietor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerData.proprietor_name}
                    onChange={(e) =>
                      setNewCustomerData({ ...newCustomerData, proprietor_name: e.target.value })
                    }
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                    placeholder="Owner's Name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerData.mobile1}
                    onChange={(e) =>
                      setNewCustomerData({ ...newCustomerData, mobile1: e.target.value })
                    }
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 bg-gray-50 p-3 rounded border border-gray-200">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    Division *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerData.division}
                    onChange={(e) =>
                      setNewCustomerData({ ...newCustomerData, division: e.target.value })
                    }
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                    placeholder="e.g. Khulna"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerData.district}
                    onChange={(e) =>
                      setNewCustomerData({ ...newCustomerData, district: e.target.value })
                    }
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                    placeholder="e.g. Jashore"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    Town / Village *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerData.town_village}
                    onChange={(e) =>
                      setNewCustomerData({ ...newCustomerData, town_village: e.target.value })
                    }
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                    placeholder="e.g. Chougacha"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={customerLoading}
                  className={`px-4 py-1.5 rounded text-sm font-bold text-white transition flex items-center gap-2 ${
                    customerLoading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  <FiSave /> {customerLoading ? "Saving..." : "Save & Select"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}