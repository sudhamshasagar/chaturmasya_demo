import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Dashboard = () => {
  // --- Navbar State & Hooks ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add any token clearing logic here
    navigate("/");
  };

  const navLinks = [
    { name: "Dashboard", path: "/admin" },
    { name: "Bookings", path: "/admin/bookings" },
    { name: "Virtual Puja", path: "/admin/v-bookings" },
    { name: "Blogs", path: "/admin/blogs" },
    { name: "Schedule", path: "/admin/schedule" },
    { name: "Walk-in Seva", path: "/admin/book-seva" }
  ];

  // --- Dashboard Data ---
  const stats = {
    physicalToday: 18,
    physicalTotal: 128,
    virtualToday: 12,
    virtualTotal: 42,
    visitorsToday: 1432,
    eventsToday: 4,
  };

  const recentBookings = [
    { id: "KM26-0081", name: "Ramesh Sharma", type: "Physical", time: "09:00 AM", status: "Confirmed" },
    { id: "VP26-0042", name: "Suresh Kumar", type: "Virtual", time: "10:30 AM", status: "Confirmed" },
    { id: "KM26-0082", name: "Mahesh Bhat", type: "Physical", time: "11:00 AM", status: "Confirmed" },
    { id: "VP26-0043", name: "Anita Rao", type: "Virtual", time: "02:30 PM", status: "Confirmed" },
  ];

  const todaysSchedule = [
    { time: "06:00 AM", title: "Suprabhata & Nirmalya", status: "past" },
    { time: "08:00 AM", title: "Sri Rama Devara Pooja", status: "past" },
    { time: "10:00 AM", title: "Pravachana", status: "past" },
    { time: "07:00 PM", title: "Bhajane & Sandhya Vandana", status: "upcoming" },
  ];

  return (
    <div className="min-h-screen bg-stone-100 font-sans flex flex-col">
      
      {/* --- EDITORIAL NAVBAR --- */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b-4 border-stone-900">
        
        {/* Top Tier: Branding & Utilities */}
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-20 border-b border-stone-200">
            
            {/* Left: Date / Location (Hidden on mobile for space) */}
            <div className="hidden md:block flex-1">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-xs text-stone-400 font-serif italic mt-0.5">
                Sagara, Karnataka
              </p>
            </div>

            {/* Center: Brand */}
            <div className="flex-1 flex justify-start md:justify-center items-center gap-2">
              <span className="text-2xl">🪔</span>
              <h1 className="text-xl md:text-xl font-serif font-black text-stone-900 uppercase tracking-tight">
                Admin Desk
              </h1>
            </div>

            {/* Right: Actions & Hamburger */}
            <div className="flex-1 flex justify-end items-center gap-4 md:gap-6">
              <button 
                onClick={handleLogout}
                className="hidden lg:flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wider border border-red-200 bg-red-50 px-3 py-1.5 rounded transition"
              >
                Logout
              </button>

              {/* Hamburger Toggle (Visible on sm & md) */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-stone-600 hover:text-stone-900 focus:outline-none bg-stone-100 rounded-md"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Tier: Desktop Navigation */}
        <div className="hidden lg:block bg-stone-50 border-t border-white">
          <nav className="max-w-7xl mx-auto px-6 flex justify-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`py-3 text-sm font-bold uppercase tracking-widest transition-colors duration-200 border-b-2 ${
                    isActive 
                      ? "text-orange-700 border-orange-700" 
                      : "text-stone-600 border-transparent hover:text-stone-900 hover:border-stone-300"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile / Tablet Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-stone-900 text-stone-100 border-t border-stone-800 shadow-xl absolute w-full animate-fade-in">
            <nav className="flex flex-col px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition ${
                      isActive 
                        ? "bg-orange-800 text-white" 
                        : "hover:bg-stone-800 text-stone-300"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="pt-4 mt-2 border-t border-stone-700">
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider text-red-400 hover:bg-red-950 transition"
                >
                  Secure Logout
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>
      
      {/* --- DASHBOARD CONTENT --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans w-full flex-1">
        
        {/* Breadcrumb */}
        <nav className="flex text-stone-500 text-sm font-bold uppercase tracking-wider mb-6">
          <span className="text-stone-900">Admin Dashboard</span>
        </nav>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b-2 border-stone-800 pb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900 uppercase tracking-tight">
              Overview
            </h1>
            <p className="text-stone-500 font-serif italic mt-1 text-lg">
              Karki Mutt Chaturmasya 2026 Command Center
            </p>
          </div>
          
        </div>

        {/* Key Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          {/* Insight 1: Physical Sevas */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
              <span className="text-6xl">🪔</span>
            </div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Physical Pada Puja</h3>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-4xl font-black text-stone-900">{stats.physicalToday}</span>
              <span className="text-sm font-bold text-orange-600 mb-1">Today</span>
            </div>
            <p className="text-sm text-stone-500 font-medium mt-3 border-t border-stone-100 pt-3">
              Total this season: <strong className="text-stone-800">{stats.physicalTotal}</strong>
            </p>
          </div>

          {/* Insight 2: Virtual Sevas */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
              <span className="text-6xl">💻</span>
            </div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Virtual Pada Puja</h3>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-4xl font-black text-stone-900">{stats.virtualToday}</span>
              <span className="text-sm font-bold text-blue-600 mb-1">Today</span>
            </div>
            <p className="text-sm text-stone-500 font-medium mt-3 border-t border-stone-100 pt-3">
              Total this season: <strong className="text-stone-800">{stats.virtualTotal}</strong>
            </p>
          </div>

          {/* Insight 3: Website Visitors */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
              <span className="text-6xl">👥</span>
            </div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Website Traffic</h3>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-4xl font-black text-stone-900">{stats.visitorsToday.toLocaleString()}</span>
              <span className="text-sm font-bold text-green-600 mb-1">Today</span>
            </div>
            <p className="text-sm text-stone-500 font-medium mt-3 border-t border-stone-100 pt-3">
              Live portal engagements
            </p>
          </div>

          {/* Insight 4: Today's Events */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
              <span className="text-6xl">📅</span>
            </div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Daily Events</h3>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-4xl font-black text-stone-900">{stats.eventsToday}</span>
              <span className="text-sm font-bold text-stone-600 mb-1">Scheduled</span>
            </div>
            <p className="text-sm text-stone-500 font-medium mt-3 border-t border-stone-100 pt-3">
              Next: Bhajane & Sandhya
            </p>
          </div>

        </div>

        {/* Quick Actions Panel */}
        <div className="mb-10">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/book-seva" className="bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 p-5 rounded-2xl text-center transition-colors flex flex-col items-center justify-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🪔</span>
              <span className="font-bold text-sm uppercase tracking-wide">Walk-in Seva</span>
            </Link>
            <Link to="/admin/book-virtual" className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 p-5 rounded-2xl text-center transition-colors flex flex-col items-center justify-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">💻</span>
              <span className="font-bold text-sm uppercase tracking-wide">Walk-in Virtual</span>
            </Link>
            <Link to="/admin/blogs" className="bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 p-5 rounded-2xl text-center transition-colors flex flex-col items-center justify-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">📰</span>
              <span className="font-bold text-sm uppercase tracking-wide">Post Update</span>
            </Link>
            <Link to="/admin/schedule" className="bg-stone-900 hover:bg-stone-800 border border-stone-900 text-stone-100 p-5 rounded-2xl text-center transition-colors flex flex-col items-center justify-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">📅</span>
              <span className="font-bold text-sm uppercase tracking-wide">Manage Schedule</span>
            </Link>
          </div>
        </div>

        {/* Main Content Grid: Recent Bookings & Schedule */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
            <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-serif font-bold text-stone-900">Today's Recent Bookings</h2>
              <Link to="/admin/bookings" className="text-xs font-bold text-orange-600 hover:text-orange-800 uppercase tracking-wider">View All →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-500 text-xs uppercase tracking-wider">
                    <th className="p-4 pl-6 font-bold">Booking ID</th>
                    <th className="p-4 font-bold">Devotee</th>
                    <th className="p-4 font-bold">Type</th>
                    <th className="p-4 font-bold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50 text-sm">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-4 pl-6 font-bold text-stone-900">{booking.id}</td>
                      <td className="p-4 font-medium text-stone-700">{booking.name}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                          booking.type === 'Physical' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {booking.type}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-stone-500">{booking.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Today's Schedule Mini-view */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
            <div className="bg-stone-900 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-serif font-bold text-white">Daily Itinerary</h2>
              <Link to="/admin/schedule" className="text-xs font-bold text-stone-400 hover:text-white uppercase tracking-wider">Edit</Link>
            </div>
            
            <div className="p-6 flex-1 bg-stone-50/50">
              <div className="space-y-4">
                {todaysSchedule.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-4 p-3 rounded-xl border transition-colors ${
                      item.status === 'upcoming' 
                        ? 'bg-white border-orange-200 shadow-sm' 
                        : 'bg-transparent border-transparent opacity-60'
                    }`}
                  >
                    <div className={`font-bold whitespace-nowrap text-sm mt-0.5 ${
                      item.status === 'upcoming' ? 'text-orange-700' : 'text-stone-500'
                    }`}>
                      {item.time}
                    </div>
                    <div>
                      <div className={`font-bold ${
                        item.status === 'upcoming' ? 'text-stone-900' : 'text-stone-600'
                      }`}>
                        {item.title}
                      </div>
                      {item.status === 'upcoming' && (
                        <span className="inline-flex mt-1 items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                          Next Event
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
    </div>
  );
};

export default Dashboard;