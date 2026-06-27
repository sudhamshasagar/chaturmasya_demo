import { useState } from "react";
import { Link } from "react-router-dom";

const Mantrakshata = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal States
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Mock Database
  const [requests, setRequests] = useState([
    { 
      id: "REQ-849201", 
      date: "05-Jun-2026", 
      name: "Kiran Rao", 
      mobile: "9876543210", 
      gotra: "Kashyapa", 
      nakshatra: "Ashwini", 
      purpose: "Health & Prosperity", 
      address: "123, 4th Main, Malleshwaram\nBengaluru, Karnataka - 560003", 
      status: "Pending", 
      tracking: "" 
    },
    { 
      id: "REQ-293847", 
      date: "05-Jun-2026", 
      name: "Anita Desai", 
      mobile: "9998887776", 
      gotra: "Bharadwaja", 
      nakshatra: "Pushya", 
      purpose: "Marriage", 
      address: "Flat 4B, Green View Apts, Koregaon Park\nPune, Maharashtra - 411001", 
      status: "Pending", 
      tracking: "" 
    },
    { 
      id: "REQ-572910", 
      date: "03-Jun-2026", 
      name: "Srinivas Bhat", 
      mobile: "8887776665", 
      gotra: "Vishwamitra", 
      nakshatra: "Revati", 
      purpose: "General Well-being", 
      address: "Plot 12, Seawoods, Andheri West\nMumbai, Maharashtra - 400053", 
      status: "Shipped", 
      tracking: "EK123456789IN" 
    },
  ]);

  // Derived Data
  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.id.toLowerCase().includes(search.toLowerCase()) || 
                          req.name.toLowerCase().includes(search.toLowerCase()) || 
                          req.mobile.includes(search);
    const matchesStatus = statusFilter === "All" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(r => r.status === "Pending").length;

  // Handlers
  const openUpdateModal = (req) => {
    setSelectedRequest({ ...req });
    setUpdateModalOpen(true);
  };

  const openLabelModal = (req) => {
    setSelectedRequest({ ...req });
    setLabelModalOpen(true);
  };

  const handleUpdateRequest = (e) => {
    e.preventDefault();
    setRequests(requests.map(r => r.id === selectedRequest.id ? selectedRequest : r));
    setUpdateModalOpen(false);
    setSelectedRequest(null);
    alert("Request status updated. Automated WhatsApp notification sent to devotee.");
  };

  const handleExportCSV = () => {
    const headers = ["Request ID", "Date", "Devotee Name", "Mobile", "Gotra", "Nakshatra", "Purpose", "Full Address", "Status", "Tracking No"];
    const rows = filteredRequests.map(r => [
      r.id, r.date, r.name, r.mobile, r.gotra, r.nakshatra, r.purpose, `"${r.address.replace(/\n/g, ', ')}"`, r.status, r.tracking
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Mantrakshata_Requests_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      
      {/* Breadcrumb */}
      <nav className="flex text-stone-500 text-sm font-bold uppercase tracking-wider mb-6">
        <Link to="/admin" className="hover:text-rose-700 transition">Admin</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-900">Mantrakshata Requests</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b-2 border-stone-800 pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900 uppercase tracking-tight flex items-center gap-3">
            <span className="text-rose-600">🌸</span> Fulfillment Center
          </h1>
          <p className="text-stone-500 font-serif italic mt-1 text-lg">
            Manage, print labels, and dispatch blessed mantrakshata to devotees.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-rose-50 text-rose-800 px-4 py-2 rounded-lg border border-rose-200 text-sm font-bold shadow-sm whitespace-nowrap">
            Pending Dispatches: {pendingCount}
          </div>
          <button 
            onClick={handleExportCSV}
            disabled={filteredRequests.length === 0}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition disabled:cursor-not-allowed whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Export List
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3 bg-white p-2 rounded-2xl shadow-sm border border-stone-200 flex items-center focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-200 transition-all">
          <div className="pl-4 pr-2 text-stone-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input
            type="text"
            placeholder="Search by Request ID, Devotee Name, or Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent p-3 text-stone-900 outline-none font-medium placeholder:text-stone-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="pr-4 text-stone-400 hover:text-stone-600">✕</button>
          )}
        </div>
        
        <div className="md:col-span-1">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-full bg-white border border-stone-200 text-stone-900 rounded-2xl p-4 outline-none font-bold text-sm shadow-sm appearance-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* DESKTOP VIEW: Table */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 text-xs uppercase tracking-wider font-bold">
              <th className="p-5 pl-6">Request Info</th>
              <th className="p-5">Devotee Details</th>
              <th className="p-5">Puja Purpose</th>
              <th className="p-5">Status</th>
              <th className="p-5 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-rose-50/30 transition-colors group">
                  <td className="p-5 pl-6">
                    <div className="font-bold text-stone-900">{req.id}</div>
                    <div className="text-stone-500 text-xs mt-0.5">{req.date}</div>
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-stone-900">{req.name}</div>
                    <div className="text-stone-500 text-xs mt-0.5 flex gap-2">
                      <span>📞 {req.mobile}</span>
                      <span>•</span>
                      <span>Gotra: {req.gotra || "N/A"}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="font-medium text-rose-700 whitespace-normal line-clamp-2 max-w-[200px]">{req.purpose}</div>
                  </td>
                  <td className="p-5">
                    {req.status === "Pending" && <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-amber-200">Pending</span>}
                    {req.status === "Shipped" && (
                      <div>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-blue-200">Shipped</span>
                        <div className="text-[10px] font-mono text-stone-500 mt-1.5">{req.tracking}</div>
                      </div>
                    )}
                    {req.status === "Delivered" && <span className="bg-green-100 text-green-800 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-green-200">Delivered</span>}
                  </td>
                  <td className="p-5 pr-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openLabelModal(req)} className="bg-white border-2 border-stone-200 hover:border-stone-400 text-stone-600 font-bold p-2 rounded-lg transition-colors shadow-sm" title="Print Shipping Label">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                      </button>
                      <button onClick={() => openUpdateModal(req)} className="bg-white border-2 border-stone-200 hover:border-rose-400 hover:text-rose-600 text-stone-700 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition">
                        Update Status
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-12 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-lg font-bold text-stone-900">No requests found</h3>
                  <p className="text-stone-500 text-sm mt-1">Adjust your search or filter criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW: Cards */}
      <div className="lg:hidden space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-stone-50 p-4 border-b border-stone-100 flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">{req.date}</div>
                  <div className="font-black text-stone-900 text-lg">{req.id}</div>
                </div>
                {req.status === "Pending" && <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider border border-amber-200">Pending</span>}
                {req.status === "Shipped" && <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider border border-blue-200">Shipped</span>}
                {req.status === "Delivered" && <span className="bg-green-100 text-green-800 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider border border-green-200">Delivered</span>}
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <div className="font-bold text-stone-900 text-lg">{req.name}</div>
                  <div className="text-stone-500 text-sm">📞 {req.mobile}</div>
                  <div className="text-stone-500 text-xs mt-1">Gotra: {req.gotra || "N/A"} • Nakshatra: {req.nakshatra || "N/A"}</div>
                </div>
                <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block mb-1">Puja Purpose</span>
                  <span className="font-bold text-rose-900 text-sm">{req.purpose}</span>
                </div>
                {req.status === "Shipped" && (
                  <div className="text-xs text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <span className="font-bold">Tracking:</span> <span className="font-mono">{req.tracking}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button onClick={() => openLabelModal(req)} className="flex justify-center items-center gap-2 bg-white border border-stone-200 text-stone-700 font-bold px-3 py-2 rounded-xl text-sm shadow-sm">
                    🖨️ View Label
                  </button>
                  <button onClick={() => openUpdateModal(req)} className="flex justify-center items-center gap-2 bg-stone-900 text-white font-bold px-3 py-2 rounded-xl text-sm shadow-md">
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-10 rounded-2xl border border-stone-200 text-center shadow-sm">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-stone-900">No requests found</h3>
          </div>
        )}
      </div>

      {/* --- MODAL: UPDATE STATUS --- */}
      {updateModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-stone-900">Update Dispatch Status</h2>
              <button onClick={() => setUpdateModalOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>
            <form onSubmit={handleUpdateRequest} className="p-6 space-y-5">
              
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-2 text-sm">
                <p><span className="text-stone-500 font-bold uppercase tracking-wider text-[10px]">ID:</span> <strong className="text-stone-900">{selectedRequest.id}</strong></p>
                <p className="mt-1"><span className="text-stone-500 font-bold uppercase tracking-wider text-[10px]">Devotee:</span> <strong className="text-stone-900">{selectedRequest.name}</strong></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Delivery Status</label>
                <select 
                  value={selectedRequest.status} 
                  onChange={(e) => setSelectedRequest({...selectedRequest, status: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-200 font-medium appearance-none"
                >
                  <option value="Pending">Pending Fulfillment</option>
                  <option value="Shipped">Shipped / Dispatched</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              {selectedRequest.status === "Shipped" && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Tracking Number / Courier Link</label>
                  <input 
                    type="text" 
                    placeholder="e.g. India Post EK123..." 
                    value={selectedRequest.tracking}
                    required
                    onChange={(e) => setSelectedRequest({...selectedRequest, tracking: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-200 font-mono text-sm"
                  />
                  <p className="text-[10px] text-stone-400 mt-2 font-medium">Entering this will trigger a WhatsApp notification to the devotee.</p>
                </div>
              )}

              <div className="pt-2">
                <button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 rounded-xl transition shadow-md">
                  Save & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: VIEW/PRINT LABEL --- */}
      {labelModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-stone-100 px-6 py-4 border-b border-stone-200 flex justify-between items-center">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-widest">Shipping Label Preview</h2>
              <button onClick={() => setLabelModalOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>
            
            {/* Printable Area */}
            <div className="p-8 bg-white" id="printable-label">
              <div className="border-4 border-stone-900 p-6 rounded-lg relative">
                
                {/* Return Address (Mutt) */}
                <div className="mb-6 border-b border-stone-200 pb-4">
                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">From:</p>
                  <p className="font-serif font-bold text-stone-900">Sri Karki Mutt Chaturmasya</p>
                  <p className="text-xs text-stone-600 mt-1">Sagara, Karnataka, India - 577401</p>
                </div>

                {/* To Address */}
                <div>
                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">To (Devotee):</p>
                  <p className="text-xl font-bold text-stone-900 mb-1">{selectedRequest.name}</p>
                  <p className="text-sm text-stone-800 whitespace-pre-line leading-relaxed mb-3">
                    {selectedRequest.address}
                  </p>
                  <p className="text-sm font-bold text-stone-900">
                    <span className="text-stone-500 font-normal">Phone: </span> +91 {selectedRequest.mobile}
                  </p>
                </div>

                {/* Ref ID */}
                <div className="absolute top-4 right-4 text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-1 rounded">
                  {selectedRequest.id}
                </div>

              </div>
            </div>

            <div className="bg-stone-50 p-4 border-t border-stone-200 grid grid-cols-2 gap-3">
              <button onClick={() => setLabelModalOpen(false)} className="bg-white border border-stone-200 text-stone-700 font-bold py-2.5 rounded-lg shadow-sm">
                Close
              </button>
              <button onClick={() => { alert("Printing Label..."); setLabelModalOpen(false); }} className="bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 rounded-lg shadow-md flex justify-center items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Print Label
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Mantrakshata;