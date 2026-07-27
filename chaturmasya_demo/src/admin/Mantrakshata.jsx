import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const Mantrakshata = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  // Modal States
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [letterModalOpen, setLetterModalOpen] = useState(false);
  // Mock Database
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "mantrakshata"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();

        return {
          id: doc.id,
          ...d,

          address: [
            d.addressLine1,
            d.landmark,
            d.city,
            d.district,
            d.state,
            d.pincode,
          ]
            .filter(Boolean)
            .join(", "),
        };
      });
      setRequests(data);
    });

    return () => unsubscribe();
  }, []);

  // Derived Data
  const filteredRequests = requests.filter((req) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      req.id?.toLowerCase().includes(searchLower) ||
      req.name?.toLowerCase().includes(searchLower) ||
      req.mobile?.includes(searchLower) ||
      req.requestId?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === "All" || req.status === statusFilter;
    
    // Simple inclusion check for date to accommodate various date string formats
    const matchesDate = dateFilter === "" || (req.date && req.date.includes(dateFilter));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  // Handlers
  const openUpdateModal = (req) => {
    setSelectedRequest({ ...req });
    setUpdateModalOpen(true);
  };

  const openLabelModal = (req) => {
    setSelectedRequest({ ...req });
    setLabelModalOpen(true);
  };

  const openLetterModal = (req) => {
    setSelectedRequest({ ...req });
    setLetterModalOpen(true);
  };

  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "mantrakshata", selectedRequest.id), {
        status: selectedRequest.status,
        tracking: selectedRequest.tracking || "",
      });
      setUpdateModalOpen(false);
      setSelectedRequest(null);
      alert("Request updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Unable to update request.");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Request ID", "Date", "Devotee Name", "Mobile", "Gotra", "Nakshatra",
      "Purpose", "Full Address", "Status", "Tracking No"
    ];
    const rows = filteredRequests.map((r) => [
      r.id, r.date, r.name, r.mobile, r.gotra, r.nakshatra, r.purpose,
      `"${(r.address || "").replace(/\n/g, ", ")}"`, r.status, r.tracking
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Mantrakshata_Requests_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      {/* Hide surrounding UI during print */}
      <div className="print:hidden">
        {/* Breadcrumb */}
        <nav className="flex text-stone-500 text-xs font-bold uppercase tracking-wider mb-4">
          <Link to="/admin" className="hover:text-rose-700 transition">Admin</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-900">Mantrakshata Requests</span>
        </nav>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-stone-200 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-stone-900 uppercase tracking-tight flex items-center gap-2">
              <span className="text-rose-600">🌸</span> Fulfillment Center
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Manage, print labels, and dispatch blessed mantrakshata.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-rose-50 text-rose-800 px-3 py-1.5 rounded border border-rose-200 text-xs font-bold shadow-sm">
              Pending: {pendingCount}
            </div>
            <button
              onClick={handleExportCSV}
              disabled={filteredRequests.length === 0}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm transition disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="sm:col-span-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-stone-200 flex items-center focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-200 transition-all">
            <svg className="w-4 h-4 text-stone-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              type="text"
              placeholder="Search ID, Name, or Mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
            />
            {search && <button onClick={() => setSearch("")} className="text-stone-400 hover:text-stone-600 text-xs font-bold">✕</button>}
          </div>

          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full h-full bg-white border border-stone-200 text-stone-900 rounded-lg px-3 py-2 outline-none text-sm shadow-sm focus:ring-1 focus:ring-rose-200 focus:border-rose-500 transition-all"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-full bg-white border border-stone-200 text-stone-900 rounded-lg px-3 py-2 outline-none font-bold text-sm shadow-sm focus:ring-1 focus:ring-rose-200 focus:border-rose-500 transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>

        {/* DESKTOP VIEW: Compact Table (Hidden on small/medium) */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
          <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 text-xs uppercase tracking-wider font-bold">
                <th className="px-4 py-3">ID & Date</th>
                <th className="px-4 py-3">Devotee Details</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.requestId} className="hover:bg-rose-50/40 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="font-bold text-stone-900">{req.requestId}</div>
                      <div className="text-stone-500 text-xs mt-0.5">{req.date}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-stone-900">{req.name}</div>
                      <div className="text-stone-500 text-xs mt-0.5">
                        {req.mobile} • {req.gotra || "No Gotra"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-rose-700 whitespace-normal line-clamp-1 max-w-[200px] text-xs" title={req.purpose}>
                        {req.purpose}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {req.status === "Pending" && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">Pending</span>}
                      {req.status === "Shipped" && (
                        <div>
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">Shipped</span>
                          <div className="text-[10px] font-mono text-stone-500 mt-1">{req.tracking}</div>
                        </div>
                      )}
                      {req.status === "Delivered" && <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">Delivered</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openLabelModal(req)} className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded transition" title="Print Label">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        </button>
                        <button
                          onClick={() => openLetterModal(req)}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1 rounded text-xs transition"
                        >
                          Letter
                        </button>
                        <button onClick={() => openUpdateModal(req)} className="bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-semibold px-3 py-1 rounded text-xs transition">
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-stone-500 text-sm">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE & MEDIUM VIEW: Cards (Shown below lg) */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div key={req.requestId} className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden flex flex-col">
                <div className="bg-stone-50 p-3 border-b border-stone-100 flex justify-between items-center">
                  <div>
                    <span className="font-black text-stone-900 text-sm mr-2">{req.requestId}</span>
                    <span className="text-[10px] font-bold text-stone-500">{req.date}</span>
                  </div>
                  <div>
                    {req.status === "Pending" && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Pending</span>}
                    {req.status === "Shipped" && <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Shipped</span>}
                    {req.status === "Delivered" && <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Delivered</span>}
                  </div>
                </div>
                
                <div className="p-3 flex-grow space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-stone-900">{req.name}</div>
                      <div className="text-stone-500 text-xs mt-0.5">{req.mobile}</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-stone-600 bg-stone-50 p-2 rounded border border-stone-100">
                    <span className="font-semibold">Gotra:</span> {req.gotra || "N/A"} &nbsp;|&nbsp; 
                    <span className="font-semibold">Nakshatra:</span> {req.nakshatra || "N/A"}
                  </div>

                  <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-100 line-clamp-2">
                    {req.purpose}
                  </p>

                  {req.status === "Shipped" && (
                    <div className="text-[10px] text-stone-500">
                      Tracking: <span className="font-mono font-bold text-stone-700">{req.tracking}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-stone-100 p-2 grid grid-cols-3 gap-2 bg-gray-50/50">
                  <button onClick={() => openLabelModal(req)} className="bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold py-1.5 rounded text-xs transition shadow-sm">
                    View Label
                  </button>
                  <button
                    onClick={() => openLetterModal(req)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 rounded text-xs transition shadow-sm"
                  >
                    Letter
                  </button>
                  <button onClick={() => openUpdateModal(req)} className="bg-stone-900 hover:bg-stone-800 text-white font-bold py-1.5 rounded text-xs transition shadow-sm">
                    Update Status
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-8 rounded-lg border border-stone-200 text-center shadow-sm">
              <h3 className="text-sm font-bold text-stone-900">No requests found</h3>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL: UPDATE STATUS --- */}
      {updateModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-stone-50 px-4 py-3 border-b border-stone-200 flex justify-between items-center">
              <h2 className="text-sm font-bold text-stone-900">Update Status</h2>
              <button onClick={() => setUpdateModalOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>
            <form onSubmit={handleUpdateRequest} className="p-4 space-y-4">
              <div className="bg-white border border-stone-200 rounded p-3 text-xs shadow-sm">
                <p><span className="text-stone-400 font-bold uppercase">ID:</span> <strong className="text-stone-900 ml-1">{selectedRequest.requestId}</strong></p>
                <p className="mt-1"><span className="text-stone-400 font-bold uppercase">To:</span> <strong className="text-stone-900 ml-1">{selectedRequest.name}</strong></p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Status</label>
                <select 
                  value={selectedRequest.status} 
                  onChange={(e) => setSelectedRequest({...selectedRequest, status: e.target.value})}
                  className="w-full bg-white border border-stone-300 rounded p-2 outline-none focus:ring-1 focus:ring-rose-500 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              {selectedRequest.status === "Shipped" && (
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Tracking Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. EK123456789IN" 
                    value={selectedRequest.tracking}
                    required
                    onChange={(e) => setSelectedRequest({...selectedRequest, tracking: e.target.value})}
                    className="w-full bg-white border border-stone-300 rounded p-2 outline-none focus:ring-1 focus:ring-rose-500 font-mono text-sm"
                  />
                </div>
              )}

              <button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 rounded transition shadow-sm text-sm">
                Save Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: VIEW/PRINT LABEL --- */}
      {labelModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4 print:static print:bg-white print:p-0 print:block">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl overflow-hidden flex flex-col print:shadow-none print:w-full print:max-w-none">
            
            <div className="bg-stone-100 px-4 py-3 border-b border-stone-200 flex justify-between items-center print:hidden">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-widest">Shipping Label</h2>
              <button onClick={() => setLabelModalOpen(false)} className="text-stone-400 hover:text-stone-800 text-lg">✕</button>
            </div>
            
            {/* Printable Area */}
            <div className="p-6 bg-white print:p-0" id="printable-label">
              <div className="border-2 border-black p-5 rounded relative">
                
                {/* Return Address */}
                <div className="mb-4 border-b-2 border-black pb-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Sender</p>
                  <p className="font-serif font-bold text-black text-sm">Sri Karki Mutt Chaturmasya</p>
                  <p className="text-xs text-black">Sagara, Karnataka, India - 577401</p>
                </div>

                {/* To Address */}
                <div className="mt-4">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Ship To</p>
                  <p className="text-lg font-black text-black uppercase mb-2">{selectedRequest.name}</p>
                  
                  {/* Explicitly visible Address block */}
                  <div className="text-sm text-black font-semibold whitespace-pre-line leading-relaxed mb-4">
                    {[
                      selectedRequest.addressLine1,
                      selectedRequest.landmark,
                      selectedRequest.city,
                      selectedRequest.district,
                      selectedRequest.state,
                      selectedRequest.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                  
                  <p className="text-sm text-black font-bold border-t border-gray-200 pt-2 mt-2">
                    <span className="text-gray-500 text-xs uppercase mr-2">Phone:</span>
                    {selectedRequest.mobile}
                  </p>
                </div>

                {/* Ref ID Badge */}
                <div className="absolute top-4 right-4 border border-black px-2 py-1 bg-gray-50 text-xs font-mono font-bold text-black">
                  REF: {selectedRequest.requestId}
                </div>
              </div>
            </div>

            {/* Actions (Hidden during print) */}
            <div className="bg-stone-50 p-3 border-t border-stone-200 grid grid-cols-2 gap-2 print:hidden">
              <button onClick={() => setLabelModalOpen(false)} className="bg-white border border-stone-300 text-stone-700 font-bold py-2 rounded text-sm shadow-sm hover:bg-stone-100">
                Cancel
              </button>
              <button onClick={handlePrint} className="bg-stone-900 hover:bg-stone-800 text-white font-bold py-2 rounded text-sm shadow-sm flex justify-center items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Print Label
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: BLESSING LETTER --- */}
      {letterModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/80 backdrop-blur-sm sm:p-4 print:static print:bg-white print:p-0 print:block">
          
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
            
            {/* Modal Actions Header (Hidden in Print) */}
            <div className="bg-stone-100 px-4 py-3 border-b border-stone-200 flex justify-between items-center rounded-t-2xl sm:rounded-t-xl print:hidden shrink-0">
              <h2 className="text-sm font-bold text-stone-800 uppercase tracking-widest">
                Print Blessing Letter
              </h2>
              <button
                onClick={() => setLetterModalOpen(false)}
                className="text-stone-500 hover:text-stone-800 transition p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            {/* 
              Scrollable Body (Invisible scrollbar via custom tailwind classes).
              Includes styles specifically designed to force A4 single-page printing. 
            */}
            <div
              className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full bg-white text-stone-900 font-serif print:overflow-hidden p-6 sm:p-10 print:p-0 flex-grow"
            >
              {/* Force A4 rules specifically for this block during print */}
              <style type="text/css" media="print">
                {`
                  @page { size: A4; margin: 15mm; }
                  body { margin: 0; }
                  #printable-letter {
                      width: 100%;
                      box-sizing: border-box;
                  }
                `}
              </style>

              <div
                  id="printable-letter"
                  className="max-w-[800px] mx-auto text-sm sm:text-[15px] print:text-[14px] leading-relaxed"
              >

                {/* Header Content */}
                <div className="shrink-0">
                  {/* Letterhead Banner */}
                  <img
                    src="/i48.jpeg"
                    alt="Daivajna Brahman Mutt"
                    className="w-full h-20 sm:h-24 print:h-20 object-contain mb-4 print:mb-2"
                  />

                  {/* Date */}
                  <div className="flex justify-end mb-6 print:mb-4">
                    <p className="text-sm print:text-xs">
                      <strong>Date :</strong>{" "}
                      {selectedRequest.createdAt?.toDate
                        ? selectedRequest.createdAt
                            .toDate()
                            .toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                        : ""}
                    </p>
                  </div>

                  {/* Greeting */}
                  <p className="text-base sm:text-lg print:text-base font-semibold">
                    Namaskara {selectedRequest.name},
                  </p>
                  <p className="mt-2 text-justify">
                    As requested by you, Pujya Swamiji has offered a special
                    <strong> Sankalpa </strong>
                    before
                    <strong> Shri Jnaneshwari Devi </strong>
                    for the following purpose:
                  </p>

                  {/* Purpose Block */}
                  <div className="my-4 print:my-3 bg-amber-50 border-l-4 border-amber-600 rounded px-4 py-3 print:bg-transparent print:border-amber-700" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                    <p className="font-semibold text-base print:text-[15px] text-center italic text-amber-900">
                      "{selectedRequest.reason}"
                    </p>
                  </div>

                  <p className="font-semibold mt-2">
                    Your Sankalpa was performed with the following details:
                  </p>

                  {/* Devotee Details List */}
                  <div className="mt-3 ml-4 space-y-1.5 print:space-y-1">
                    <p><strong>Name :</strong> {selectedRequest.name}</p>
                    {selectedRequest.gotra && <p><strong>Gotra :</strong> {selectedRequest.gotra}</p>}
                    {selectedRequest.nakshatra && <p><strong>Nakshatra :</strong> {selectedRequest.nakshatra}</p>}
                    {selectedRequest.rashi && <p><strong>Rashi :</strong> {selectedRequest.rashi}</p>}
                  </div>
                </div>

                {/* Blessings Text */}
                <div className="mt-5 print:mt-4 text-justify space-y-4 print:space-y-3 shrink-0">
                  <p>
                    Pujya Swamiji has prayed to
                    <strong> Shri Jnaneshwari Devi </strong>
                    and blessed this sacred Mantrakshata for your
                    welfare, peace, prosperity, good health and
                    spiritual progress.
                  </p>
                  <p>
                    May the divine grace of
                    <strong> Shri Jnaneshwari Devi </strong>
                    and the blessings of
                    <strong> Pujya Swamiji </strong>
                    always remain with you and your family.
                  </p>
                </div>

                {/* Push Footer elements to the bottom using flex-grow on a spacer or auto-margins */}
                <div className="pt-6 print:pt-8">
                  <p className="font-semibold text-stone-800">
                    With Blessings,
                  </p>
                  <div className="mt-2 print:mt-2">
                    <p className="font-bold text-base print:text-[15px]">
                      41st Chaturmasya Committee
                    </p>
                    <p className="text-stone-700">Daivajna Brahman Mutt</p>
                    <p className="text-stone-700">Shri Kshetra Karki</p>
                  </div>

                  <div className="border-t border-stone-200 mt-6 pt-3 print:mt-4 print:pt-2 text-center text-xs text-stone-500">
                    <p className="font-semibold uppercase tracking-wider text-stone-700">
                      Daivajna Brahmana Samaja®, Sagara
                    </p>
                    <p className="mt-1 italic">
                      Letters provided by elv8.works
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Actions Footer (Hidden in Print) */}
            <div className="bg-stone-50 p-4 border-t border-stone-200 flex justify-end gap-3 print:hidden shrink-0">
              <button
                onClick={() => setLetterModalOpen(false)}
                className="bg-white border border-stone-300 text-stone-700 font-bold px-5 py-2.5 rounded text-sm shadow-sm hover:bg-stone-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePrint}
                className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-2.5 rounded text-sm shadow-md transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Print Letter
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Mantrakshata;