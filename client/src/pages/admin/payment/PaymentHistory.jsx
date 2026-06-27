import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../../api/axios";
import {
  FiSearch,
  FiFilter,
  FiPrinter,
  FiEye,
  FiX,
  FiFileText,
  FiClock,
  FiCheckSquare,
  FiDollarSign,
  FiList,
  FiCalendar,
  FiLoader,
} from "react-icons/fi";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterMethod, setFilterMethod] = useState("ALL");

  // Selection for Printing
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal Details
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);

  // Fetch products for a given order (sale or purchase)
  const fetchOrderItems = async (payment) => {
    setOrderLoading(true);
    setOrderItems([]);

    try {
      let orderId = null;
      let endpoint = "";

      if (payment.payment_type === "IN" && payment.sale) {
        orderId = payment.sale;
        endpoint = `sale/sales/${orderId}/`;
      } else if (payment.payment_type === "OUT" && payment.purchase) {
        orderId = payment.purchase;
        endpoint = `purchase/purchases/${orderId}/`;
      } else {
        // Fallback: maybe the payment has a reference string but not the ID – we can try to fetch by invoice/PO?
        // For now, just leave empty.
        setOrderLoading(false);
        return;
      }

      const res = await axiosInstance.get(endpoint);
      const orderData = res.data;
      // Extract items – the field might be 'items' or 'order_items' depending on your API.
      // Sale: items, Purchase: items. We'll use 'items'.
      const items = orderData.items || [];
      setOrderItems(items);
    } catch (err) {
      console.error("Failed to fetch order items", err);
      setOrderItems([]);
    } finally {
      setOrderLoading(false);
    }
  };

  // When modal opens, fetch items
  const openModal = (payment) => {
    setSelectedPaymentDetails(payment);
    fetchOrderItems(payment);
  };

  const closeModal = () => {
    setSelectedPaymentDetails(null);
    setOrderItems([]);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axiosInstance.get("payment/payments/");
      setPayments(res.data.results || res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch payment ledger.");
      setLoading(false);
    }
  };

  // --- STATS ---
  const stats = useMemo(() => {
    const totalIn = payments
      .filter((p) => p.payment_type === "IN")
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const totalOut = payments
      .filter((p) => p.payment_type === "OUT")
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const net = totalIn - totalOut;
    const count = payments.length;
    const latest =
      payments.length > 0
        ? payments.reduce((latest, p) =>
            new Date(p.payment_date) > new Date(latest.payment_date) ? p : latest
          ).payment_date
        : null;
    return { totalIn, totalOut, net, count, latest };
  }, [payments]);

  // --- FILTERING ---
  const filteredPayments = payments.filter((pay) => {
    const matchesSearch =
      pay.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.sale_invoice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.purchase_po?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "ALL" || pay.payment_type === filterType;
    const matchesMethod = filterMethod === "ALL" || pay.payment_method === filterMethod;

    return matchesSearch && matchesType && matchesMethod;
  });

  // --- SELECTION ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredPayments.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // --- PRINT LEDGER ---
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one transaction to print.");
      return;
    }

    const itemsToPrint = payments.filter((p) => selectedIds.includes(p.id));

    const totalIn = itemsToPrint
      .filter((p) => p.payment_type === "IN")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalOut = itemsToPrint
      .filter((p) => p.payment_type === "OUT")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const printWindow = window.open("", "_blank");
    const htmlContent = `
      <html>
        <head>
          <title>Payment Ledger - Heaven Autos</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #ddd; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0 0 5px 0; color: #1f2937; }
            .header p { margin: 0; color: #6b7280; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
            th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
            th { background-color: #f9fafb; font-weight: bold; text-transform: uppercase; font-size: 12px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .in { color: #16a34a; font-weight: bold; }
            .out { color: #dc2626; font-weight: bold; }
            .summary { display: flex; justify-content: flex-end; margin-top: 20px; }
            .summary-box { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background: #f9fafb; min-width: 250px; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;}
            .summary-row.total { font-weight: bold; border-top: 1px solid #ddd; padding-top: 8px; margin-top: 8px; font-size: 16px;}
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Heaven Autos</h1>
            <p>Official Payment Ledger Report</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Date</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Method / Details</th>
                <th class="text-right">Amount (BDT)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsToPrint
                .map(
                  (p) => `
                <tr>
                  <td><strong>${p.payment_id}</strong></td>
                  <td>${new Date(p.payment_date).toLocaleDateString()}</td>
                  <td>${p.payment_type === "IN" ? "Received (Sale)" : "Paid (Purchase)"}</td>
                  <td>${p.payment_type === "IN" ? p.sale_invoice : p.purchase_po}</td>
                  <td>
                    ${p.payment_method}
                    ${
                      p.transaction_id
                        ? `<br><small style="color:#6b7280">Trx: ${p.transaction_id}</small>`
                        : ""
                    }
                  </td>
                  <td class="text-right ${p.payment_type === "IN" ? "in" : "out"}">
                    ${p.payment_type === "IN" ? "+" : "-"} ৳${parseFloat(p.amount).toFixed(2)}
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-box">
              <div class="summary-row"><span>Total Received:</span> <span class="in">+ ৳${totalIn.toFixed(2)}</span></div>
              <div class="summary-row"><span>Total Paid Out:</span> <span class="out">- ৳${totalOut.toFixed(2)}</span></div>
              <div class="summary-row total"><span>Net Movement:</span> <span>${totalIn >= totalOut ? "+" : "-"} ৳${Math.abs(totalIn - totalOut).toFixed(2)}</span></div>
            </div>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto p-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FiFileText className="text-indigo-600" /> Payment Ledger
          </h1>
        </div>
        <button
          onClick={handlePrint}
          disabled={selectedIds.length === 0}
          className={`px-3 py-1.5 rounded text-sm font-semibold transition flex items-center gap-1.5 border ${
            selectedIds.length > 0
              ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300"
          }`}
        >
          <FiPrinter /> Print Selected ({selectedIds.length})
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 border border-gray-300 mb-4 bg-white">
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiDollarSign className="text-green-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Received
            </p>
            <p className="text-lg font-bold text-green-700">
              ৳ {stats.totalIn.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiDollarSign className="text-red-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Paid Out
            </p>
            <p className="text-lg font-bold text-red-700">
              ৳ {stats.totalOut.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiDollarSign className="text-indigo-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Net Balance
            </p>
            <p className={`text-lg font-bold ${stats.net >= 0 ? "text-green-600" : "text-red-600"}`}>
              ৳ {stats.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="p-2 flex items-center gap-2">
          <FiList className="text-indigo-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Transactions
            </p>
            <p className="text-lg font-bold text-gray-800">{stats.count}</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-300 overflow-hidden">
        {/* Filter Bar */}
        <div className="border-b border-gray-300 px-3 py-1.5 bg-gray-50 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
          <div className="sm:col-span-4 relative">
            <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search ID, Reference, or Trx..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-2 py-1 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="sm:col-span-4 flex items-center gap-1">
            <FiFilter className="text-gray-400 shrink-0" size={14} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded py-1 px-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="IN">Received (Sales)</option>
              <option value="OUT">Paid (Purchases)</option>
            </select>
          </div>
          <div className="sm:col-span-4 flex items-center gap-1">
            <FiCheckSquare className="text-gray-400 shrink-0" size={14} />
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded py-1 px-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="ALL">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Bkash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Rocket">Rocket</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading ledger...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center w-8">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        filteredPayments.length > 0 &&
                        selectedIds.length === filteredPayments.length
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                    Txn ID / Date
                  </th>
                  <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                    Type
                  </th>
                  <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                    Reference
                  </th>
                  <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-left">
                    Method / Details
                  </th>
                  <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-right">
                    Amount
                  </th>
                  <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="border border-gray-300 px-3 py-6 text-center text-gray-400 text-sm">
                      No transactions match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay, index) => (
                    <tr
                      key={pay.id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${
                        selectedIds.includes(pay.id) ? "bg-indigo-50" : ""
                      }`}
                    >
                      <td className="border border-gray-300 px-2 py-1.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(pay.id)}
                          onChange={() => handleSelect(pay.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1.5">
                        <div className="font-medium text-gray-800 text-xs">{pay.payment_id}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                          <FiClock size={10} /> {new Date(pay.payment_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-2 py-1.5">
                        {pay.payment_type === "IN" ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200">
                            Received
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700 border border-red-200">
                            Paid
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1.5 font-mono text-xs text-gray-700">
                        {pay.payment_type === "IN" ? pay.sale_invoice : pay.purchase_po}
                      </td>
                      <td className="border border-gray-300 px-2 py-1.5">
                        <div className="text-xs font-medium text-gray-800">{pay.payment_method}</div>
                        {pay.transaction_id && (
                          <div className="text-[10px] text-gray-500">Trx: {pay.transaction_id}</div>
                        )}
                      </td>
                      <td
                        className={`border border-gray-300 px-2 py-1.5 text-right font-mono font-bold text-xs ${
                          pay.payment_type === "IN" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {pay.payment_type === "IN" ? "+" : "-"} ৳{parseFloat(pay.amount).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center">
                        <button
                          onClick={() => openModal(pay)}
                          className="text-indigo-600 hover:text-indigo-800 transition p-0.5"
                          title="View Full Details"
                        >
                          <FiEye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- DETAILS MODAL --- */}
      {selectedPaymentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-3">
          <div className="bg-white border border-gray-300 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-lg">
            {/* Header */}
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex justify-between items-center shrink-0">
              <div>
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <FiFileText className="text-indigo-600" /> {selectedPaymentDetails.payment_id}
                </h2>
                <p className="text-[10px] text-gray-500">Transaction details</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-red-500"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Body (scrollable) */}
            <div className="overflow-y-auto flex-1 p-4 space-y-4 text-sm text-gray-700">
              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-3 border-b border-gray-200 pb-3">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Date</p>
                  <p className="font-medium">
                    {new Date(selectedPaymentDetails.payment_date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Amount</p>
                  <p
                    className={`font-bold text-lg ${
                      selectedPaymentDetails.payment_type === "IN" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ৳ {parseFloat(selectedPaymentDetails.amount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Type</p>
                  <p className="font-medium">
                    {selectedPaymentDetails.payment_type === "IN" ? "Received (Sale)" : "Paid (Purchase)"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Reference</p>
                  <p className="font-mono font-medium text-indigo-600">
                    {selectedPaymentDetails.payment_type === "IN"
                      ? selectedPaymentDetails.sale_invoice
                      : selectedPaymentDetails.purchase_po}
                  </p>
                </div>
              </div>

              {/* Payment Method Details */}
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Payment Method</p>
                <p className="font-semibold">{selectedPaymentDetails.payment_method}</p>

                {selectedPaymentDetails.payment_method === "Bank" && (
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm border-t border-gray-200 pt-2">
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase">Bank</span>
                      <p className="font-medium">{selectedPaymentDetails.bank_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase">A/C Name</span>
                      <p className="font-medium">{selectedPaymentDetails.bank_account_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase">A/C No</span>
                      <p className="font-mono">{selectedPaymentDetails.bank_account_number}</p>
                    </div>
                    {selectedPaymentDetails.bank_branch_name && (
                      <div>
                        <span className="text-gray-500 text-[10px] uppercase">Branch</span>
                        <p>{selectedPaymentDetails.bank_branch_name}</p>
                      </div>
                    )}
                  </div>
                )}

                {["Bkash", "Nagad", "Rocket"].includes(selectedPaymentDetails.payment_method) && (
                  <div className="mt-2 border-t border-gray-200 pt-2">
                    <span className="text-gray-500 text-[10px] uppercase">Mobile Number</span>
                    <p className="font-mono font-bold">{selectedPaymentDetails.mfs_mobile_number}</p>
                  </div>
                )}

                {selectedPaymentDetails.transaction_id && (
                  <div className="mt-2 border-t border-gray-200 pt-2">
                    <span className="text-gray-500 text-[10px] uppercase">Transaction ID</span>
                    <p className="font-mono">{selectedPaymentDetails.transaction_id}</p>
                  </div>
                )}

                {selectedPaymentDetails.payment_method === "Cash" && (
                  <div className="mt-2 text-gray-500 italic">Hand Cash</div>
                )}
              </div>

              {selectedPaymentDetails.handled_by_name && (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Processed By</p>
                  <p className="font-medium">{selectedPaymentDetails.handled_by_name}</p>
                </div>
              )}

              {selectedPaymentDetails.remarks && (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Remarks</p>
                  <div className="bg-yellow-50 p-2 rounded border border-yellow-200 text-yellow-800">
                    {selectedPaymentDetails.remarks}
                  </div>
                </div>
              )}

              {/* --- NEW: Products Table --- */}
              <div>
                <h3 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  {selectedPaymentDetails.payment_type === "IN" ? "Products Sold" : "Products Purchased"}
                </h3>
                {orderLoading ? (
                  <div className="flex justify-center items-center p-4 text-gray-500">
                    <FiLoader className="animate-spin mr-2" /> Loading products...
                  </div>
                ) : orderItems.length > 0 ? (
                  <div className="border border-gray-300 overflow-hidden">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-800 text-white">
                          <th className="border border-gray-600 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-left">
                            Product & Brand
                          </th>
                          <th className="border border-gray-600 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-center">
                            Qty
                          </th>
                          <th className="border border-gray-600 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-right">
                            {selectedPaymentDetails.payment_type === "IN" ? "Unit Price" : "Unit Cost"}
                          </th>
                          <th className="border border-gray-600 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-right">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border border-gray-300 px-2 py-1">
                              <div className="text-xs font-medium text-gray-800">
                                {item.product_name || "Product"}
                              </div>
                              <div className="text-[9px] text-gray-500 uppercase">
                                {/* Brand might be nested; if not available, skip */}
                                {item.brand_name || "—"}
                              </div>
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-center text-xs">
                              {item.quantity}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-right font-mono text-xs">
                              ৳ {parseFloat(item.unit_price_bdt || item.unit_cost_bdt || 0).toFixed(2)}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-right font-mono font-bold text-xs">
                              ৳ {parseFloat(item.total_price_bdt || item.total_cost_bdt || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 text-sm py-2 border border-gray-200 rounded">
                    No product details available for this transaction.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 flex justify-end shrink-0">
              <button
                onClick={closeModal}
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