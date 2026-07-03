import { useState,useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Dashboard = () => {
  // --- State & Hooks ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTableTab, setActiveTableTab] = useState("mantrakshata"); // 'sevas' or 'mantrakshata'
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const navLinks = [
    { name: "Dashboard", path: "/admin" },
    { name: "Bookings", path: "/admin/bookings" },
    { name: "Virtual Puja", path: "/admin/v-bookings" },
    { name: "Mantrakshata", path: "/admin/mantrakshata" },
    { name: "Blogs", path: "/admin/blogs" },
    { name: "Schedule", path: "/admin/schedule" },
    { name: "Walk-in", path: "/admin/book-seva" },
    { name: "Ledger", path: "/admin/accounts" }
  ];

  const [bookings, setBookings] = useState([]);

useEffect(() => {
  const q = query(
    collection(db, "bookings"),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setBookings(data);
  });

  return unsubscribe;
}, []);

  // --- Dashboard Data ---
  const stats = {
    // physicalToday: 18,
    virtualToday: 12,
    mantraPending: 8,
    visitorsToday: 1432,
  };

  const today = new Date().toDateString();

const physicalToday = bookings.filter(
  b => b.date?.toDate().toDateString() === today
).length;

  const recentBookings = bookings.slice(0, 5);

  const [mantraRequests, setMantraRequests] = useState([
    { id: "REQ-849201", name: "Kiran Rao", purpose: "Health & Prosperity", city: "Bengaluru", status: "Pending", tracking: "", date: "05-Jun-2026" },
    { id: "REQ-293847", name: "Anita Desai", purpose: "Marriage", city: "Pune", status: "Pending", tracking: "", date: "05-Jun-2026" },
    { id: "REQ-572910", name: "Srinivas Bhat", purpose: "General Well-being", city: "Mumbai", status: "Shipped", tracking: "EK123456789IN", date: "03-Jun-2026" },
  ]);

  const todaysSchedule = [
    { time: "06:00 AM", title: "Suprabhata & Nirmalya", status: "past" },
    { time: "08:00 AM", title: "Sri Rama Devara Pooja", status: "past" },
    { time: "10:00 AM", title: "Pravachana", status: "past" },
    { time: "07:00 PM", title: "Bhajane & Sandhya Vandana", status: "upcoming" },
  ];

  let date =   new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
  // --- Handlers ---
  const openUpdateModal = (req) => {
    setSelectedRequest({ ...req });
    setUpdateModalOpen(true);
  };

  const handleUpdateRequest = (e) => {
    e.preventDefault();
    setMantraRequests(mantraRequests.map(r => r.id === selectedRequest.id ? selectedRequest : r));
    setUpdateModalOpen(false);
    setSelectedRequest(null);
    alert("Mantrakshata request updated. WhatsApp notification triggered.");
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans flex flex-col">
      
      {/* --- EDITORIAL NAVBAR --- */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b-4 border-stone-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-20 border-b border-stone-200">
            
            <div className="hidden md:block flex-1">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                {date}
              </p>
              <p className="text-xs text-stone-400 font-serif italic mt-0.5">
                Sagara, Karnataka
              </p>
            </div>

            <div className="flex-1 flex justify-start md:justify-center items-center gap-2">
              <span className="text-2xl">🪔</span>
              <h1 className="text-xl md:text-2xl font-serif font-black text-stone-900 uppercase tracking-tight">
                Admin Desk
              </h1>
            </div>

            <div className="flex-1 flex justify-end items-center gap-4 md:gap-6">
              <button 
                onClick={handleLogout}
                className="hidden lg:flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wider border border-red-200 bg-red-50 px-3 py-1.5 rounded transition"
              >
                Logout
              </button>

              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-stone-600 hover:text-stone-900 focus:outline-none bg-stone-100 rounded-md"
              >
                {isMobileMenuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:block bg-stone-50 border-t border-white">
          <nav className="max-w-7xl mx-auto px-6 flex justify-center space-x-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`py-3 text-xs font-bold uppercase tracking-widest transition-colors duration-200 border-b-2 ${
                    isActive ? "text-orange-700 border-orange-700" : "text-stone-600 border-transparent hover:text-stone-900 hover:border-stone-300"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-stone-900 text-stone-100 border-t border-stone-800 shadow-xl absolute w-full animate-fade-in">
            <nav className="flex flex-col px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-stone-800">
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      
      {/* --- DASHBOARD CONTENT --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans w-full flex-1">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b-2 border-stone-800 pb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900 uppercase tracking-tight">Overview</h1>
            <p className="text-stone-500 font-serif italic mt-1 text-lg">Command Center & Request Tracking</p>
          </div>
        </div>

        {/* Key Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-6xl">🪔</span></div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Physical Sevas</h3>
            <div className="flex items-end gap-3 mt-2"><span className="text-4xl font-black text-stone-900">{physicalToday}</span><span className="text-sm font-bold text-orange-600 mb-1">Today</span></div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-6xl">💻</span></div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Virtual Sevas</h3>
            <div className="flex items-end gap-3 mt-2"><span className="text-4xl font-black text-stone-900">{stats.virtualToday}</span><span className="text-sm font-bold text-blue-600 mb-1">Today</span></div>
          </div>

          <div className="bg-stone-900 rounded-2xl shadow-sm border border-stone-800 p-6 relative overflow-hidden group text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-6xl">🌸</span></div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Mantrakshata</h3>
            <div className="flex items-end gap-3 mt-2"><span className="text-4xl font-black text-white">{stats.mantraPending}</span><span className="text-sm font-bold text-rose-400 mb-1">Pending</span></div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-6xl">👥</span></div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Website Traffic</h3>
            <div className="flex items-end gap-3 mt-2"><span className="text-4xl font-black text-stone-900">{stats.visitorsToday.toLocaleString()}</span><span className="text-sm font-bold text-green-600 mb-1">Today</span></div>
          </div>
        </div>

        {/* Main Content Grid: Tracking & Schedule */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Tabbed Data Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
            
            {/* Tabs */}
            <div className="flex border-b border-stone-200 bg-stone-50/50">
              <button onClick={() => setActiveTableTab("mantrakshata")} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition ${activeTableTab === 'mantrakshata' ? 'bg-white border-b-2 border-rose-600 text-rose-700' : 'text-stone-500 hover:bg-stone-100'}`}>
                Mantrakshata Tracker
              </button>
              <button onClick={() => setActiveTableTab("sevas")} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition ${activeTableTab === 'sevas' ? 'bg-white border-b-2 border-orange-600 text-orange-700' : 'text-stone-500 hover:bg-stone-100'}`}>
                Recent Sevas
              </button>
            </div>

            {/* Content: Mantrakshata */}
            {activeTableTab === "mantrakshata" && (
              <div className="overflow-x-auto animate-fade-in">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-stone-100 text-stone-400 text-xs uppercase tracking-wider">
                      <th className="p-4 pl-6 font-bold">Request Info</th>
                      <th className="p-4 font-bold">Devotee / Purpose</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 pr-6 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50 text-sm">
                    {mantraRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="font-bold text-stone-900">{req.id}</div>
                          <div className="text-xs text-stone-500 mt-0.5">{req.date}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-stone-800">{req.name} <span className="text-xs font-normal text-stone-500">({req.city})</span></div>
                          <div className="text-xs text-rose-600 font-medium mt-0.5">{req.purpose}</div>
                        </td>
                        <td className="p-4">
                          {req.status === "Pending" ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">Pending</span>
                          ) : (
                            <div>
                              <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">Shipped</span>
                              <div className="text-[10px] font-mono text-stone-500 mt-1">{req.tracking}</div>
                            </div>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button onClick={() => openUpdateModal(req)} className="bg-white border-2 border-stone-200 hover:border-rose-400 hover:text-rose-600 text-stone-700 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition">
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Content: Sevas */}
            {activeTableTab === "sevas" && (
              <div className="overflow-x-auto animate-fade-in">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-stone-100 text-stone-400 text-xs uppercase tracking-wider">
                      <th className="p-4 pl-6 font-bold">Booking ID</th>
                      <th className="p-4 font-bold">Devotee</th>
                      <th className="p-4 font-bold">Type</th>
                      <th className="p-4 font-bold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50 text-sm">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-4 pl-6 font-bold text-stone-900">{booking.bookingId}</td>
                        <td className="p-4 font-medium text-stone-700">{booking.name}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${booking.type === 'Physical' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                            {booking.seva}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-stone-500">{booking.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column: Today's Schedule */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
            <div className="bg-stone-900 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-serif font-bold text-white">Daily Itinerary</h2>
              <Link to="/admin/schedule" className="text-xs font-bold text-stone-400 hover:text-white uppercase tracking-wider">Edit</Link>
            </div>
            <div className="p-6 flex-1 bg-stone-50/50">
              <div className="space-y-4">
                {todaysSchedule.map((item, idx) => (
                  <div key={idx} className={`flex items-start gap-4 p-3 rounded-xl border transition-colors ${item.status === 'upcoming' ? 'bg-white border-orange-200 shadow-sm' : 'bg-transparent border-transparent opacity-60'}`}>
                    <div className={`font-bold whitespace-nowrap text-sm mt-0.5 ${item.status === 'upcoming' ? 'text-orange-700' : 'text-stone-500'}`}>{item.time}</div>
                    <div>
                      <div className={`font-bold ${item.status === 'upcoming' ? 'text-stone-900' : 'text-stone-600'}`}>{item.title}</div>
                      {item.status === 'upcoming' && (
                        <span className="inline-flex mt-1 items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span> Next Event
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- MANTRAKSHATA UPDATE MODAL --- */}
      {updateModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-stone-900">Update Request</h2>
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
                  <option value="Pending">Pending</option>
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
                  <p className="text-[10px] text-stone-400 mt-2 font-medium">Entering this will automatically trigger a WhatsApp notification to the devotee.</p>
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

    </div>
  );
};

export default Dashboard;