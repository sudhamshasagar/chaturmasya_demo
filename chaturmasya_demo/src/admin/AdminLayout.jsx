import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Clock,
  LogOut,
  Menu,
  X,
  Flame,
  Globe,
  Package,
  Users,
  MapPin,
  Truck,
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronRight
} from "lucide-react";

/* =========================================================
   UTILS
========================================================= */
const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

const timeToMinutes = (t) => {
  if (!t) return 0;
  try {
    const [clock, modifier] = t.split(" ");
    let [hour, minute] = clock.split(":").map(Number);
    if (hour === 12) hour = 0;
    if (modifier?.toLowerCase() === "pm") hour += 12;
    return hour * 60 + minute;
  } catch (e) {
    return 0;
  }
};

export default function Dashboard() {
  // --- State & Hooks ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTableTab, setActiveTableTab] = useState("mantrakshata"); // 'sevas' or 'mantrakshata'
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const [bookings, setBookings] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const navLinks = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Bookings", path: "/admin/bookings", icon: CalendarDays },
    { name: "Cultural Programs", path: "/admin/c-programs", icon: Flame },
    { name: "Blogs", path: "/admin/blogs", icon: FileText },
    { name: "Schedule", path: "/admin/schedule", icon: Clock },
  ];

  // --- Data Fetching: Bookings ---
  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
    });
    return () => unsubscribe();
  }, []);

  // --- Data Fetching: Schedules ---
  useEffect(() => {
    const q = query(collection(db, "schedules"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSchedules(data);
    });
    return () => unsubscribe();
  }, []);

  // --- Derived Data & Stats ---
  const now = new Date();
  const todayString = now.toDateString();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const physicalToday = bookings.filter(b => {
    if (!b.date) return false;
    const bDate = b.date?.toDate ? b.date.toDate() : new Date(b.date);
    return bDate.toDateString() === todayString && b.seva !== "Virtual Pada Pooja";
  }).length;

  const virtualToday = bookings.filter(b => {
    if (!b.date) return false;
    const bDate = b.date?.toDate ? b.date.toDate() : new Date(b.date);
    return bDate.toDateString() === todayString && b.seva === "Virtual Pada Pooja";
  }).length;

  const stats = {
    physicalToday,
    virtualToday,
    mantraPending: 8, // Mocked pending count
    visitorsToday: 1432, // Mocked traffic
  };

  const recentBookings = bookings.slice(0, 6);

  // --- Process Today's Schedule ---
  const todaysSchedule = useMemo(() => {
    const todays = schedules.filter(s => {
      if (!s.date) return false;
      const sDate = new Date(s.date);
      return (
        sDate.getFullYear() === now.getFullYear() &&
        sDate.getMonth() === now.getMonth() &&
        sDate.getDate() === now.getDate()
      );
    });

    return todays.map(s => {
      const itemMinutes = timeToMinutes(s.startTime || s.time);
      const status = itemMinutes > currentMinutes ? 'upcoming' : 'past';
      return { ...s, status, minutes: itemMinutes };
    }).sort((a, b) => a.minutes - b.minutes);
  }, [schedules, now, currentMinutes]);

  // Mocked Mantrakshata Data
  const [mantraRequests, setMantraRequests] = useState([
    { id: "REQ-849201", name: "Kiran Rao", purpose: "Health & Prosperity", city: "Bengaluru", status: "Pending", tracking: "", date: "05-Jun-2026" },
    { id: "REQ-293847", name: "Anita Desai", purpose: "Marriage", city: "Pune", status: "Pending", tracking: "", date: "05-Jun-2026" },
    { id: "REQ-572910", name: "Srinivas Bhat", purpose: "General Well-being", city: "Mumbai", status: "Shipped", tracking: "EK123456789IN", date: "03-Jun-2026" },
  ]);

  const currentDateDisplay = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
    <div className="min-h-[100dvh] bg-[#FDFBF7] font-sans flex flex-col selection:bg-amber-200 selection:text-stone-900">
      
      {/* ===========================
          EDITORIAL NAVBAR
      ============================ */}
      <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-[#E8DCC4]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-20">
            
            {/* Left: Date & Location */}
            <div className="hidden md:flex flex-col flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <CalendarIcon size={12} /> {currentDateDisplay}
              </p>
              <p className="text-xs text-[#722013] font-bold tracking-wide mt-1 flex items-center gap-1">
                <MapPin size={12} /> Sagara, Karnataka
              </p>
            </div>

            {/* Center: Brand */}
            <div className="flex-1 flex justify-start md:justify-center items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-serif font-black text-[#2a0b06] uppercase tracking-tight">
                Admin Desk
              </h1>
            </div>

            {/* Right: Actions */}
            <div className="flex-1 flex justify-end items-center gap-4">
              <button 
                onClick={handleLogout}
                className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-rose-600 hover:text-rose-700 uppercase tracking-widest border border-rose-200 bg-rose-50 px-4 py-2 rounded-full transition-colors shadow-sm"
              >
                <LogOut size={14} /> Logout
              </button>

              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-stone-600 hover:text-[#2a0b06] hover:bg-[#FAF6F0] rounded-full transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:block bg-[#FDFBF7] border-t border-[#E8DCC4]">
          <nav className="max-w-7xl mx-auto px-6 flex justify-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 py-3.5 text-[11px] font-bold uppercase tracking-widest transition-colors duration-200 border-b-2 ${
                    isActive ? "text-[#722013] border-[#722013]" : "text-gray-500 border-transparent hover:text-[#2a0b06] hover:border-[#E8DCC4]"
                  }`}
                >
                  <link.icon size={14} /> {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-[#E8DCC4] shadow-xl absolute w-full overflow-hidden"
            >
              <nav className="flex flex-col px-4 py-3 divide-y divide-[#FAF6F0]">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link 
                      key={link.path} 
                      to={link.path} 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className={`flex items-center gap-3 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                        isActive ? "bg-[#FAF6F0] text-[#722013]" : "text-gray-600 hover:bg-gray-50 hover:text-[#2a0b06]"
                      }`}
                    >
                      <link.icon size={16} /> {link.name}
                    </Link>
                  )
                })}
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-colors w-full text-left"
                >
                  <LogOut size={16} /> Logout
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      {/* ===========================
          DASHBOARD CONTENT
      ============================ */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 w-full flex-1">
        
        {/* Header Title */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2a0b06] tracking-tight">Overview</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Command Center & Live Request Tracking</p>
        </div>

        {/* Key Insights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
          
          <div className="bg-white rounded-[20px] shadow-sm border border-[#E8DCC4] p-6 relative overflow-hidden group hover:border-[#D4AF37] transition-colors">
            <div className="absolute top-0 right-0 p-5 text-amber-50 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500"><Flame size={64} /></div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10">Physical Sevas</h3>
            <div className="flex items-end gap-3 relative z-10">
              <span className="text-4xl font-black text-[#2a0b06] leading-none">{stats.physicalToday}</span>
              <span className="text-[10px] font-bold text-amber-700 mb-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wider">Today</span>
            </div>
          </div>

          <div className="bg-white rounded-[20px] shadow-sm border border-[#E8DCC4] p-6 relative overflow-hidden group hover:border-blue-300 transition-colors">
            <div className="absolute top-0 right-0 p-5 text-blue-50 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500"><Globe size={64} /></div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10">Virtual Sevas</h3>
            <div className="flex items-end gap-3 relative z-10">
              <span className="text-4xl font-black text-[#2a0b06] leading-none">{stats.virtualToday}</span>
              <span className="text-[10px] font-bold text-blue-700 mb-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">Today</span>
            </div>
          </div>

          <div className="bg-[#2a0b06] rounded-[20px] shadow-md border border-[#4a1c13] p-6 relative overflow-hidden group text-white">
            <div className="absolute top-0 right-0 p-5 text-[#4a1c13] transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500"><Package size={64} /></div>
            <h3 className="text-[10px] font-bold text-[#E8DCC4] uppercase tracking-widest mb-2 relative z-10">Mantrakshata</h3>
            <div className="flex items-end gap-3 relative z-10">
              <span className="text-4xl font-black text-white leading-none">{stats.mantraPending}</span>
              <span className="text-[10px] font-bold text-rose-300 mb-1 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-900 uppercase tracking-wider">Pending</span>
            </div>
          </div>

          <div className="bg-white rounded-[20px] shadow-sm border border-[#E8DCC4] p-6 relative overflow-hidden group hover:border-emerald-300 transition-colors">
            <div className="absolute top-0 right-0 p-5 text-emerald-50 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500"><Users size={64} /></div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10">Web Traffic</h3>
            <div className="flex items-end gap-3 relative z-10">
              <span className="text-4xl font-black text-[#2a0b06] leading-none">{stats.visitorsToday.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-emerald-700 mb-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">Visits</span>
            </div>
          </div>

        </div>

        {/* Main Content Grid: Tracking & Schedule */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-start">
          
          {/* Left Column: Tabbed Data */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            
            {/* Tabs */}
            <div className="flex bg-white rounded-xl shadow-sm border border-[#E8DCC4] p-1">
              <button 
                onClick={() => setActiveTableTab("mantrakshata")} 
                className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                  activeTableTab === 'mantrakshata' ? 'bg-[#FAF6F0] text-[#722013] shadow-sm border border-[#E8DCC4]' : 'text-gray-500 hover:text-[#2a0b06] hover:bg-gray-50'
                }`}
              >
                Mantrakshata Tracker
              </button>
              <button 
                onClick={() => setActiveTableTab("sevas")} 
                className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                  activeTableTab === 'sevas' ? 'bg-[#FAF6F0] text-[#722013] shadow-sm border border-[#E8DCC4]' : 'text-gray-500 hover:text-[#2a0b06] hover:bg-gray-50'
                }`}
              >
                Recent Bookings
              </button>
            </div>

            {/* Content: Mantrakshata */}
            {activeTableTab === "mantrakshata" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-[20px] shadow-sm border border-[#E8DCC4] overflow-hidden">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-[#FAF6F0] border-b border-[#E8DCC4]">
                      <tr className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        <th className="p-4 pl-6 w-[25%]">Request Info</th>
                        <th className="p-4 w-[35%]">Devotee & Purpose</th>
                        <th className="p-4 w-[25%]">Status</th>
                        <th className="p-4 pr-6 text-right w-[15%]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DCC4]">
                      {mantraRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-[#FCF8F2] transition-colors">
                          <td className="p-4 pl-6">
                            <div className="font-bold text-[#2a0b06]">{req.id}</div>
                            <div className="text-[11px] font-medium text-gray-500 mt-1 flex items-center gap-1.5"><CalendarIcon size={12}/> {req.date}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-[#2a0b06]">{req.name} <span className="text-xs font-medium text-gray-500 ml-1">({req.city})</span></div>
                            <div className="text-[10px] text-[#722013] font-bold mt-1.5 bg-rose-50 inline-block px-2 py-0.5 rounded border border-rose-100 uppercase tracking-wider">{req.purpose}</div>
                          </td>
                          <td className="p-4">
                            {req.status === "Pending" ? (
                              <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                                <AlertCircle size={12}/> Pending
                              </span>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                                  <Truck size={12}/> Shipped
                                </span>
                                <div className="text-[10px] font-mono font-bold text-gray-500 mt-1.5 ml-1">{req.tracking}</div>
                              </div>
                            )}
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button onClick={() => openUpdateModal(req)} className="bg-white border border-[#E8DCC4] hover:border-[#D4AF37] hover:text-[#722013] text-gray-600 font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition-colors">
                              Update
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden flex flex-col gap-4">
                  {mantraRequests.map((req) => (
                    <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8DCC4] flex flex-col gap-3 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Req ID</p>
                          <p className="font-bold text-[#2a0b06]">{req.id}</p>
                        </div>
                        {req.status === "Pending" ? (
                          <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest">Pending</span>
                        ) : (
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest">Shipped</span>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-bold text-[#2a0b06] text-lg leading-tight">{req.name}</p>
                        <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mt-1"><MapPin size={12}/> {req.city}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-1">
                        <div className="bg-[#FAF6F0] p-2.5 rounded-xl border border-[#E8DCC4]">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Date</p>
                          <p className="text-xs font-bold text-[#2a0b06]">{req.date}</p>
                        </div>
                        <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[#722013] mb-0.5">Purpose</p>
                          <p className="text-xs font-bold text-[#722013] truncate">{req.purpose}</p>
                        </div>
                      </div>

                      {req.tracking && (
                        <p className="text-[10px] font-mono font-bold text-gray-500 mt-1">Tracking: {req.tracking}</p>
                      )}

                      <button onClick={() => openUpdateModal(req)} className="w-full bg-white border border-[#E8DCC4] hover:border-[#D4AF37] text-[#2a0b06] font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest shadow-sm mt-2 transition-colors">
                        Update Status
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Content: Recent Bookings */}
            {activeTableTab === "sevas" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-[20px] shadow-sm border border-[#E8DCC4] overflow-hidden">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-[#FAF6F0] border-b border-[#E8DCC4]">
                      <tr className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        <th className="p-4 pl-6 w-[25%]">Booking ID</th>
                        <th className="p-4 w-[35%]">Devotee</th>
                        <th className="p-4 w-[25%]">Seva Type</th>
                        <th className="p-4 pr-6 w-[15%] text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DCC4]">
                      {recentBookings.length === 0 ? (
                        <tr><td colSpan="4" className="p-6 text-center text-sm text-gray-500">No recent bookings found.</td></tr>
                      ) : (
                        recentBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-[#FCF8F2] transition-colors">
                            <td className="p-4 pl-6 font-bold text-[#2a0b06]">{booking.bookingId || booking.id}</td>
                            <td className="p-4 font-bold text-gray-800">{booking.name}</td>
                            <td className="p-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                                booking.seva === 'Virtual Pada Pooja' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {booking.seva || "Physical Seva"}
                              </span>
                            </td>
                            <td className="p-4 pr-6 font-bold text-gray-500 text-right">{booking.time || "N/A"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden flex flex-col gap-4">
                  {recentBookings.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500 bg-white rounded-2xl border border-[#E8DCC4]">No recent bookings.</div>
                  ) : (
                    recentBookings.map((booking) => (
                      <div key={booking.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8DCC4] flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Booking ID</p>
                            <p className="font-bold text-[#2a0b06]">{booking.bookingId || booking.id}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border ${
                            booking.seva === 'Virtual Pada Pooja' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {booking.seva === 'Virtual Pada Pooja' ? 'Virtual' : 'Physical'}
                          </span>
                        </div>
                        
                        <div>
                          <p className="font-bold text-[#2a0b06] text-lg leading-tight">{booking.name}</p>
                          <p className="text-xs font-semibold text-gray-500 mt-1 truncate">{booking.seva || "Seva"}</p>
                        </div>

                        <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#E8DCC4] flex items-center gap-2 text-sm font-bold text-gray-700 mt-1">
                          <Clock size={14} className="text-[#D4AF37]" /> {booking.time || "Not specified"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Today's Schedule */}
          <div className="bg-white rounded-[20px] shadow-sm border border-[#E8DCC4] overflow-hidden flex flex-col lg:sticky lg:top-24">
            <div className="bg-[#FAF6F0] border-b border-[#E8DCC4] px-6 py-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#722013]" />
                <h2 className="text-lg font-serif font-bold text-[#2a0b06] leading-none">Today's Itinerary</h2>
              </div>
              <Link to="/admin/schedule" className="text-[10px] font-bold text-gray-500 hover:text-[#722013] uppercase tracking-widest border border-gray-300 hover:border-[#722013] px-2.5 py-1 rounded transition-colors">Manage</Link>
            </div>
            
            <div className={`p-6 flex-1 bg-white overflow-y-auto max-h-[500px] ${hideScrollbar}`}>
              {todaysSchedule.length === 0 ? (
                <div className="text-center py-10">
                  <CalendarIcon size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-bold text-gray-600">No scheduled events for today.</p>
                  <p className="text-xs text-gray-400 mt-1">Check the Schedule tab to add events.</p>
                </div>
              ) : (
                <div className="space-y-4 relative">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#E8DCC4]" />

                  {todaysSchedule.map((item, idx) => (
                    <div key={item.id || idx} className="relative pl-6">
                      {/* Timeline dot */}
                      <div className={`absolute left-0 top-2 w-3.5 h-3.5 rounded-full border-2 border-white ${item.status === 'upcoming' ? 'bg-[#D4AF37] ring-2 ring-[#E8DCC4]' : 'bg-gray-300'}`} />
                      
                      <div className={`p-4 rounded-xl border transition-colors ${item.status === 'upcoming' ? 'bg-[#FAF6F0] border-[#D4AF37] shadow-sm' : 'bg-white border-[#E8DCC4]'}`}>
                        <div className={`text-xs font-bold tracking-widest uppercase mb-1 ${item.status === 'upcoming' ? 'text-[#722013]' : 'text-gray-400'}`}>
                          {item.startTime || item.time}
                        </div>
                        <div className={`font-bold text-sm ${item.status === 'upcoming' ? 'text-[#2a0b06]' : 'text-gray-600'}`}>
                          {item.title}
                        </div>
                        {item.status === 'upcoming' && (
                          <div className="mt-2 inline-flex items-center gap-1.5 bg-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest text-[#722013] border border-[#E8DCC4]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span> Next
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* ===========================
          MANTRAKSHATA UPDATE MODAL
      ============================ */}
      <AnimatePresence>
        {updateModalOpen && selectedRequest && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 10 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 10 }} 
                className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl overflow-hidden border border-[#E8DCC4]"
              >
                <div className="bg-[#FAF6F0] px-6 py-4 border-b border-[#E8DCC4] flex justify-between items-center">
                  <h2 className="text-lg font-serif font-bold text-[#2a0b06]">Update Status</h2>
                  <button onClick={() => setUpdateModalOpen(false)} className="text-gray-400 hover:text-[#2a0b06] bg-white rounded-full p-1.5 border border-[#E8DCC4] transition-colors"><X size={14}/></button>
                </div>
                
                <form onSubmit={handleUpdateRequest} className="p-6 space-y-5">
                  <div className="bg-white border border-[#E8DCC4] rounded-xl p-4 text-sm shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Request ID</span>
                      <span className="font-mono font-bold text-[#2a0b06] text-xs">{selectedRequest.id}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Devotee</span>
                      <span className="font-bold text-[#2a0b06] text-sm text-right">{selectedRequest.name}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Delivery Status</label>
                    <select 
                      value={selectedRequest.status} 
                      onChange={(e) => setSelectedRequest({...selectedRequest, status: e.target.value})}
                      className="w-full bg-[#FCF8F2] border border-[#E8DCC4] rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37] text-sm font-bold text-[#2a0b06] transition-colors appearance-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped / Dispatched</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  {selectedRequest.status === "Shipped" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 mt-2">Tracking Info</label>
                      <input 
                        type="text" 
                        placeholder="e.g. India Post EK123..." 
                        value={selectedRequest.tracking}
                        required
                        onChange={(e) => setSelectedRequest({...selectedRequest, tracking: e.target.value})}
                        className="w-full bg-[#FCF8F2] border border-[#E8DCC4] rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37] text-sm font-mono font-bold text-[#2a0b06] transition-colors"
                      />
                      <p className="text-[9px] uppercase tracking-widest text-emerald-600 mt-2 font-bold flex items-center gap-1.5 bg-emerald-50 p-2 rounded-lg border border-emerald-200"><CheckCircle size={12}/> Triggers WhatsApp notification.</p>
                    </motion.div>
                  )}

                  <div className="pt-2">
                    <button type="submit" className="w-full bg-[#2a0b06] hover:bg-[#722013] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-colors shadow-md">
                      Save & Notify
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}