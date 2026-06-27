import { useState } from "react";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Accounts = () => {
  const [activeTab, setActiveTab] = useState("passbook"); // 'passbook', 'donations', 'expenses', 'daywise'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    type: "Donation",
    purpose: "General Fund",
    mode: "Cash",
    amount: "",
    refId: "",
    date: new Date(),
    name: "Admin Entry", 
  });

  // Mock Transactions Database
  const [transactions, setTransactions] = useState([
    {
      id: "TXN-1004",
      type: "Donation",
      name: "Admin Entry",
      purpose: "Hundi Collection",
      mode: "Cash",
      refId: "-",
      amount: 12400,
      date: new Date("2026-06-04T18:00:00"),
      status: "Confirmed",
      source: "Admin",
    },
    {
      id: "TXN-1003",
      type: "Expense",
      name: "Admin Entry",
      purpose: "Groceries & Vegetables",
      mode: "Cash",
      refId: "-",
      amount: 4500,
      date: new Date("2026-06-05T08:00:00"),
      status: "Confirmed",
      source: "Admin",
    },
    {
      id: "TXN-1001",
      type: "Donation",
      name: "Ramesh Sharma",
      purpose: "Anna Dana",
      mode: "UPI",
      refId: "UPI123456789",
      amount: 5000,
      date: new Date("2026-06-05T10:00:00"),
      status: "Confirmed", 
      source: "Devotee Portal",
    },
    {
      id: "TXN-1002",
      type: "Donation",
      name: "Suresh Kumar",
      purpose: "General Fund",
      mode: "NEFT",
      refId: "SBIN0001234",
      amount: 15000,
      date: new Date("2026-06-05T11:30:00"),
      status: "Pending", 
      source: "Devotee Portal",
    },
  ]);

  // --- Calculations ---
  const totalDonations = transactions
    .filter((t) => t.type === "Donation" && t.status === "Confirmed")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalDonations - totalExpenses;

  const pendingCount = transactions.filter(
    (t) => t.type === "Donation" && t.status === "Pending"
  ).length;

  // --- Passbook Calculation (Running Balance) ---
  const passbookTransactions = [...transactions]
    .filter((t) => t.status === "Confirmed")
    .sort((a, b) => a.date - b.date); // Sort oldest first to calculate running balance

  let currentRunningBalance = 0;
  const passbookWithBalance = passbookTransactions.map((t) => {
    if (t.type === "Donation") currentRunningBalance += Number(t.amount);
    if (t.type === "Expense") currentRunningBalance -= Number(t.amount);
    return { ...t, runningBalance: currentRunningBalance };
  }).reverse(); // Reverse so newest appears on top

  // --- Handlers ---
  const handleVerify = (id) => {
    if (window.confirm("Verify and confirm this UTR/Payment? This will add it to the total balance.")) {
      setTransactions(
        transactions.map((t) => (t.id === id ? { ...t, status: "Confirmed" } : t))
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.date) return;
    if (formData.mode !== "Cash" && !formData.refId) {
      alert("Please provide the UTR or Reference ID for online payments.");
      return;
    }

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      ...formData,
      status: "Confirmed", 
      source: "Admin",
    };

    setTransactions([newTxn, ...transactions]);
    setIsFormOpen(false);
    setFormData({ ...formData, amount: "", refId: "", date: new Date() });
  };

  const handleExportCSV = () => {
    const headers = ["Transaction ID", "Type", "Date", "Name/Source", "Purpose", "Mode", "Ref ID", "Amount", "Status"];
    const rows = transactions.map((t) => [
      t.id, t.type, t.date.toLocaleDateString(), t.name, t.purpose, t.mode, t.refId, t.amount, t.status,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Accounts_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Filtered Data Views ---
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.id.toLowerCase().includes(search.toLowerCase()) || 
                          t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.refId.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "donations" ? t.type === "Donation" : t.type === "Expense";
    return matchesSearch && (activeTab === "daywise" || activeTab === "passbook" ? true : matchesTab);
  });

  // Day-wise Grouping
  const dayWiseData = transactions.reduce((acc, curr) => {
    if (curr.status !== "Confirmed" && curr.type === "Donation") return acc; 
    
    const dateStr = curr.date.toLocaleDateString("en-GB");
    if (!acc[dateStr]) acc[dateStr] = { date: dateStr, donations: 0, expenses: 0 };
    
    if (curr.type === "Donation") acc[dateStr].donations += Number(curr.amount);
    if (curr.type === "Expense") acc[dateStr].expenses += Number(curr.amount);
    
    return acc;
  }, {});

  const sortedDayWise = Object.values(dayWiseData).sort((a, b) => {
    const [d1, m1, y1] = a.date.split("/");
    const [d2, m2, y2] = b.date.split("/");
    return new Date(`${y2}-${m2}-${d2}`) - new Date(`${y1}-${m1}-${d1}`);
  });

  const purposeOptions = formData.type === "Donation" 
    ? ["General Fund", "Anna Dana", "Pada Puja", "Special Seva", "Infrastructure", "Others"]
    : ["Groceries & Vegetables", "Event Setup", "Dakshine", "Maintenance", "Travel", "Others"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      
      {/* Breadcrumb */}
      <nav className="flex text-stone-500 text-sm font-bold uppercase tracking-wider mb-6">
        <Link to="/admin" className="hover:text-orange-700 transition">Admin</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-900">Accounts & Ledger</span>
      </nav>

      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b-2 border-stone-800 pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900 uppercase tracking-tight">
            Accounts & Ledger
          </h1>
          <p className="text-stone-500 font-serif italic mt-1 text-lg">
            Manage funds, verify online donations, and track daily expenses.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Export Ledger
          </button>
          
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all ${
              isFormOpen ? "bg-stone-200 text-stone-700" : "bg-orange-600 text-white hover:bg-orange-700"
            }`}
          >
            {isFormOpen ? <><span>✕</span> Close Entry</> : <><span>➕</span> Add Manual Entry</>}
          </button>
        </div>
      </div>

      {/* Slide-down Manual Entry Form */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden mb-10 animate-fade-in">
          <div className="bg-stone-900 px-6 py-4 border-b border-stone-800">
            <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
              Log Transaction
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 flex">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "Donation", purpose: "General Fund" })}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${formData.type === "Donation" ? "bg-white shadow-sm text-green-700" : "text-stone-500 hover:text-stone-700"}`}
                >
                  Receive Donation
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "Expense", purpose: "Groceries & Vegetables" })}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${formData.type === "Expense" ? "bg-white shadow-sm text-red-600" : "text-stone-500 hover:text-stone-700"}`}
                >
                  Record Expense
                </button>
              </div>

              <div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-500 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Enter Amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl py-3.5 pl-10 pr-4 focus:ring-2 focus:ring-orange-500 outline-none font-black text-lg"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Purpose / Category</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 outline-none appearance-none font-medium"
                >
                  {purposeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Transaction Date</label>
                <DatePicker
                  selected={formData.date}
                  onChange={(date) => setFormData({ ...formData, date })}
                  dateFormat="dd MMM yyyy"
                  maxDate={new Date()}
                  className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Payment Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value, refId: e.target.value === "Cash" ? "-" : "" })}
                  className="w-full bg-white border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 outline-none appearance-none font-medium"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / GPay</option>
                  <option value="NEFT">NEFT / RTGS</option>
                </select>
              </div>

              {formData.mode !== "Cash" && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Reference ID / UTR No.</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Bank Ref ID"
                    value={formData.refId}
                    onChange={(e) => setFormData({ ...formData, refId: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 outline-none font-bold uppercase"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button type="submit" className="bg-stone-900 hover:bg-stone-800 text-white px-10 py-3 rounded-xl font-bold shadow-md transition-colors text-lg">
                Log {formData.type}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-stone-900 rounded-2xl shadow-sm border border-stone-800 p-6 text-white">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Balance</h3>
          <p className="text-4xl font-black mt-2">₹{balance.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Confirmed Donations</h3>
          <p className="text-3xl font-black text-green-700 mt-2">₹{totalDonations.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Total Expenses</h3>
          <p className="text-3xl font-black text-red-600 mt-2">₹{totalExpenses.toLocaleString()}</p>
        </div>
        <div className={`rounded-2xl shadow-sm border p-6 transition-colors ${pendingCount > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-stone-200'}`}>
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Pending Verification</h3>
          <div className="flex items-end gap-2 mt-2">
            <span className={`text-3xl font-black ${pendingCount > 0 ? 'text-orange-700' : 'text-stone-400'}`}>{pendingCount}</span>
            <span className="text-sm font-bold text-stone-500 mb-1">Transactions</span>
          </div>
        </div>
      </div>

      {/* Data Viewer & Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        
        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50/50 flex-wrap">
          <button onClick={() => setActiveTab("passbook")} className={`flex-1 py-4 px-2 text-xs md:text-sm font-bold uppercase tracking-wider transition ${activeTab === 'passbook' ? 'bg-white border-b-2 border-stone-900 text-stone-900' : 'text-stone-500 hover:bg-stone-100'}`}>
            Passbook
          </button>
          <button onClick={() => setActiveTab("donations")} className={`flex-1 py-4 px-2 text-xs md:text-sm font-bold uppercase tracking-wider transition ${activeTab === 'donations' ? 'bg-white border-b-2 border-orange-600 text-orange-700' : 'text-stone-500 hover:bg-stone-100'}`}>
            Donations
          </button>
          <button onClick={() => setActiveTab("expenses")} className={`flex-1 py-4 px-2 text-xs md:text-sm font-bold uppercase tracking-wider transition ${activeTab === 'expenses' ? 'bg-white border-b-2 border-red-600 text-red-600' : 'text-stone-500 hover:bg-stone-100'}`}>
            Expenses
          </button>
          <button onClick={() => setActiveTab("daywise")} className={`flex-1 py-4 px-2 text-xs md:text-sm font-bold uppercase tracking-wider transition ${activeTab === 'daywise' ? 'bg-white border-b-2 border-blue-600 text-blue-700' : 'text-stone-500 hover:bg-stone-100'}`}>
            Day-wise Summary
          </button>
        </div>

        <div className="p-6">
          {/* Search (Hidden in Day-wise view) */}
          {activeTab !== "daywise" && (
            <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 mb-6 flex items-center focus-within:ring-2 focus-within:ring-orange-200">
              <span className="pl-4 pr-2 text-stone-400">🔍</span>
              <input
                type="text"
                placeholder="Search by ID, Name, or UTR..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent p-2 text-stone-900 outline-none font-medium"
              />
            </div>
          )}

          {/* Tab Content: Passbook View */}
          {activeTab === "passbook" && (
            <div className="overflow-x-auto animate-fade-in">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="text-stone-400 text-xs uppercase tracking-wider border-b border-stone-100">
                    <th className="pb-3 font-bold">Date & Txn ID</th>
                    <th className="pb-3 font-bold">Particulars</th>
                    <th className="pb-3 font-bold">Mode / Ref</th>
                    <th className="pb-3 font-bold text-right">Debit (Out)</th>
                    <th className="pb-3 font-bold text-right">Credit (In)</th>
                    <th className="pb-3 font-bold text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {passbookWithBalance.length > 0 ? passbookWithBalance.map(t => (
                    <tr key={t.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-stone-900">{t.date.toLocaleDateString('en-GB')}</div>
                        <div className="text-stone-500 text-xs mt-0.5">{t.id}</div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800">{t.purpose}</span>
                          {t.source === "Admin" && (
                            <span className="bg-orange-100 text-orange-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-orange-200">
                              Added by Admin
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">{t.name}</div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${t.mode === 'Cash' ? 'bg-stone-100 text-stone-600 border-stone-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {t.mode}
                        </span>
                        {t.mode !== 'Cash' && <div className="text-xs font-mono text-stone-500 mt-1">{t.refId}</div>}
                      </td>
                      <td className="py-4 font-bold text-red-600 text-right">
                        {t.type === 'Expense' ? `₹${Number(t.amount).toLocaleString()}` : '-'}
                      </td>
                      <td className="py-4 font-bold text-green-700 text-right">
                        {t.type === 'Donation' ? `₹${Number(t.amount).toLocaleString()}` : '-'}
                      </td>
                      <td className="py-4 font-black text-stone-900 text-right">
                        ₹{t.runningBalance.toLocaleString()}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="py-10 text-center text-stone-500">No confirmed transactions available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab Content: Donations & Expenses Tables */}
          {(activeTab === "donations" || activeTab === "expenses") && (
            <div className="overflow-x-auto animate-fade-in">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="text-stone-400 text-xs uppercase tracking-wider border-b border-stone-100">
                    <th className="pb-3 font-bold">Date & ID</th>
                    <th className="pb-3 font-bold">{activeTab === 'donations' ? 'Devotee / Source' : 'Entered By'}</th>
                    <th className="pb-3 font-bold">Purpose</th>
                    <th className="pb-3 font-bold">Payment Details</th>
                    <th className="pb-3 font-bold text-right">Amount</th>
                    {activeTab === 'donations' && <th className="pb-3 font-bold text-center">Status / Verify</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-stone-900">{t.date.toLocaleDateString('en-GB')}</div>
                        <div className="text-stone-500 text-xs mt-0.5">{t.id}</div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800">{t.name}</span>
                          {t.source === "Admin" && (
                            <span className="bg-orange-100 text-orange-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-orange-200">
                              Added by Admin
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-400 mt-0.5">{t.source}</div>
                      </td>
                      <td className="py-4 font-medium text-stone-600">{t.purpose}</td>
                      <td className="py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${t.mode === 'Cash' ? 'bg-stone-100 text-stone-600 border-stone-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {t.mode}
                        </span>
                        {t.mode !== 'Cash' && <div className="text-xs font-mono text-stone-500 mt-1">{t.refId}</div>}
                      </td>
                      <td className={`py-4 font-black text-lg text-right ${t.type === 'Expense' ? 'text-red-600' : 'text-green-700'}`}>
                        ₹{Number(t.amount).toLocaleString()}
                      </td>
                      {activeTab === 'donations' && (
                        <td className="py-4 text-center">
                          {t.status === "Pending" ? (
                            <button 
                              onClick={() => handleVerify(t.id)}
                              className="bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-300 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm"
                            >
                              Verify UTR
                            </button>
                          ) : (
                            <span className="text-green-600 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                              Verified
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="py-10 text-center text-stone-500">No records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab Content: Day-wise Ledger */}
          {activeTab === "daywise" && (
            <div className="space-y-4 animate-fade-in">
              {sortedDayWise.length > 0 ? sortedDayWise.map(day => (
                <div key={day.date} className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📅</span>
                    <h3 className="text-lg font-serif font-black text-stone-900">{day.date}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:flex gap-4 md:gap-8 w-full md:w-auto">
                    <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 min-w-[140px]">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Inflow (Verified)</p>
                      <p className="text-lg font-black text-green-700">₹{day.donations.toLocaleString()}</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 min-w-[140px]">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Outflow</p>
                      <p className="text-lg font-black text-red-600">₹{day.expenses.toLocaleString()}</p>
                    </div>
                    <div className="bg-stone-900 px-4 py-2 rounded-lg border border-stone-800 min-w-[140px] col-span-2 md:col-span-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Net Day Balance</p>
                      <p className="text-lg font-black text-white">₹{(day.donations - day.expenses).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-stone-500">No confirmed data available for summary.</div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default Accounts;