import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import { FiSearch, FiFilter, FiPrinter, FiEye, FiX, FiFileText, FiClock, FiCheckSquare } from "react-icons/fi";

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

  // --- FILTERING LOGIC ---
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

  // --- SELECTION LOGIC ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredPayments.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // --- PRINT PDF LOGIC ---
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one transaction to print.");
      return;
    }

    const itemsToPrint = payments.filter(p => selectedIds.includes(p.id));
    
    // Calculate Totals for the print ledger
    const totalIn = itemsToPrint.filter(p => p.payment_type === 'IN').reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalOut = itemsToPrint.filter(p => p.payment_type === 'OUT').reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const printWindow = window.open('', '_blank');
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
              ${itemsToPrint.map(p => `
                <tr>
                  <td><strong>${p.payment_id}</strong></td>
                  <td>${new Date(p.payment_date).toLocaleDateString()}</td>
                  <td>${p.payment_type === 'IN' ? 'Received (Sale)' : 'Paid (Purchase)'}</td>
                  <td>${p.payment_type === 'IN' ? p.sale_invoice : p.purchase_po}</td>
                  <td>
                    ${p.payment_method}
                    ${p.transaction_id ? `<br><small style="color:#6b7280">Trx: ${p.transaction_id}</small>` : ''}
                  </td>
                  <td class="text-right ${p.payment_type === 'IN' ? 'in' : 'out'}">
                    ${p.payment_type === 'IN' ? '+' : '-'} ৳${parseFloat(p.amount).toFixed(2)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-box">
              <div class="summary-row"><span>Total Received:</span> <span class="in">+ ৳${totalIn.toFixed(2)}</span></div>
              <div class="summary-row"><span>Total Paid Out:</span> <span class="out">- ৳${totalOut.toFixed(2)}</span></div>
              <div class="summary-row total"><span>Net Movement:</span> <span>${totalIn >= totalOut ? '+' : '-'} ৳${Math.abs(totalIn - totalOut).toFixed(2)}</span></div>
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
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
            <FiFileText className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
            <p className="text-sm text-gray-500">Filter, search, and export your master transaction ledger.</p>
          </div>
        </div>
        
        <button 
          onClick={handlePrint}
          disabled={selectedIds.length === 0}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition shadow-sm ${
            selectedIds.length > 0 
            ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <FiPrinter /> Print Selected ({selectedIds.length})
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          <div className="md:col-span-4 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search ID, Order Ref, or Trx ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <FiFilter className="text-gray-400 shrink-0" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="ALL">All Types (In & Out)</option>
              <option value="IN">Money Received (Sales)</option>
              <option value="OUT">Money Paid (Purchases)</option>
            </select>
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <FiCheckSquare className="text-gray-400 shrink-0" />
            <select 
              value={filterMethod} 
              onChange={(e) => setFilterMethod(e.target.value)}
              className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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

        {/* Table */}
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading ledger...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 w-10 text-center">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll} 
                      checked={filteredPayments.length > 0 && selectedIds.length === filteredPayments.length}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="p-4">Txn ID / Date</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Method & Details</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredPayments.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-500">No transactions match your filters.</td></tr>
                ) : (
                  filteredPayments.map((pay) => (
                    <tr key={pay.id} className={`hover:bg-indigo-50/30 transition ${selectedIds.includes(pay.id) ? 'bg-indigo-50' : ''}`}>
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(pay.id)}
                          onChange={() => handleSelect(pay.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{pay.payment_id}</div>
                        <div className="text-xs text-gray-500 flex items-center mt-1"><FiClock className="mr-1" /> {new Date(pay.payment_date).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4">
                        {pay.payment_type === "IN" 
                          ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">Received</span> 
                          : <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">Paid Out</span>}
                      </td>
                      <td className="p-4 font-mono text-gray-700 font-medium">
                        {pay.payment_type === "IN" ? pay.sale_invoice : pay.purchase_po}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-800">{pay.payment_method}</div>
                        {pay.transaction_id && <div className="text-xs text-gray-500">Trx: {pay.transaction_id}</div>}
                      </td>
                      <td className={`p-4 text-right font-black ${pay.payment_type === "IN" ? "text-green-600" : "text-red-600"}`}>
                        {pay.payment_type === "IN" ? "+" : "-"} ৳{parseFloat(pay.amount).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => setSelectedPaymentDetails(pay)} 
                          className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 p-2 rounded transition border border-indigo-100" 
                          title="View Full Details"
                        >
                          <FiEye />
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

      {/* --- PAYMENT DETAILS MODAL --- */}
      {selectedPaymentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900 flex items-center">
                <FiFileText className="mr-2 text-indigo-500" /> Transaction Details
              </h3>
              <button onClick={() => setSelectedPaymentDetails(null)} className="text-gray-400 hover:text-red-500 transition">
                <FiX className="text-2xl" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 space-y-4 text-sm text-gray-700">
              
              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
                <div><p className="text-xs text-gray-500 uppercase mb-1">Payment ID</p><p className="font-bold text-gray-900">{selectedPaymentDetails.payment_id}</p></div>
                <div><p className="text-xs text-gray-500 uppercase mb-1">Date</p><p className="font-bold">{new Date(selectedPaymentDetails.payment_date).toLocaleString()}</p></div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
                <div><p className="text-xs text-gray-500 uppercase mb-1">Order Ref</p><p className="font-bold font-mono text-indigo-600">{selectedPaymentDetails.payment_type === "IN" ? selectedPaymentDetails.sale_invoice : selectedPaymentDetails.purchase_po}</p></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Amount</p>
                  <p className={`font-black text-lg ${selectedPaymentDetails.payment_type === "IN" ? "text-green-600" : "text-red-600"}`}>
                    ৳{parseFloat(selectedPaymentDetails.amount).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-100 pb-3 bg-gray-50 p-3 rounded-lg border">
                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Method Details: <span className="text-gray-900">{selectedPaymentDetails.payment_method}</span></p>
                
                {selectedPaymentDetails.payment_method === 'Bank' && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-gray-500">Bank:</span> {selectedPaymentDetails.bank_name}</p>
                    <p><span className="text-gray-500">A/C Name:</span> {selectedPaymentDetails.bank_account_name}</p>
                    <p><span className="text-gray-500">A/C No:</span> <span className="font-mono">{selectedPaymentDetails.bank_account_number}</span></p>
                    {selectedPaymentDetails.bank_branch_name && <p><span className="text-gray-500">Branch:</span> {selectedPaymentDetails.bank_branch_name}</p>}
                  </div>
                )}

                {['Bkash', 'Nagad', 'Rocket'].includes(selectedPaymentDetails.payment_method) && (
                  <p><span className="text-gray-500">Mobile No:</span> <span className="font-mono font-bold">{selectedPaymentDetails.mfs_mobile_number}</span></p>
                )}

                {selectedPaymentDetails.transaction_id && (
                  <p className="mt-2"><span className="text-gray-500">Transaction ID:</span> <span className="font-mono">{selectedPaymentDetails.transaction_id}</span></p>
                )}
                {selectedPaymentDetails.payment_method === 'Cash' && <p className="text-gray-500 italic">Standard Hand Cash</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500 uppercase mb-1">Processed By</p><p className="font-medium text-gray-800">{selectedPaymentDetails.handled_by_name || "Unknown"}</p></div>
              </div>

              {selectedPaymentDetails.remarks && (
                <div><p className="text-xs text-gray-500 uppercase mb-1">Remarks</p><div className="bg-yellow-50 p-2 rounded text-yellow-800 border border-yellow-200">{selectedPaymentDetails.remarks}</div></div>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <button onClick={() => setSelectedPaymentDetails(null)} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 rounded-lg transition">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}