import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
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
  MapPin,
  Truck,
  CheckCircle,
  AlertCircle,
  Calendar,
  TruckElectric,
  Calendar1,
  PlayIcon,
} from "lucide-react";

/* =========================================================
   UTILS
========================================================= */
const hideScrollbar =
  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

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

/* Small reusable stat tile */
function StatTile({ label, value, tag, tone = "amber", Icon, dark = false }) {
  const tones = {
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    blue: "text-blue-700 bg-blue-50 border-blue-200",
    rose: "text-rose-300 bg-rose-950/40 border-rose-900",
  };
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 transition-colors ${
        dark
          ? "bg-[#2a0b06] border-[#4a1c13] text-white"
          : "bg-white border-[#E8DCC4] hover:border-[#D4AF37]"
      }`}
    >
      <Icon
        size={56}
        className={`absolute -top-2 -right-2 ${
          dark ? "text-[#3d150d]" : "text-[#FAF3E6]"
        }`}
      />
      <p
        className={`relative text-[10px] font-bold uppercase tracking-widest ${
          dark ? "text-[#E8DCC4]" : "text-gray-400"
        }`}
      >
        {label}
      </p>
      <div className="relative mt-2 flex items-end gap-2">
        <span
          className={`text-3xl font-black leading-none ${
            dark ? "text-white" : "text-[#2a0b06]"
          }`}
        >
          {value}
        </span>
        <span
          className={`mb-0.5 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${tones[tone]}`}
        >
          {tag}
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  // --- State & Hooks ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTableTab, setActiveTableTab] = useState("mantrakshata");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [mantraRequests, setMantraRequests] = useState([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [savingYoutube, setSavingYoutube] = useState(false);

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
    { name: "Mantrakshate", path: "/admin/mantrakshata", icon: TruckElectric },
    { name: "Blogs", path: "/admin/blogs", icon: FileText },
    { name: "Schedule", path: "/admin/schedule", icon: Clock },
  ];

  // --- Data Fetching: Mantrakshata ---
  useEffect(() => {
    const q = query(collection(db, "mantrakshata"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMantraRequests(data);
    });
    return () => unsubscribe();
  }, []);

  // --- Data Fetching: Bookings ---
  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBookings(data);
    });
    return () => unsubscribe();
  }, []);

  // --- Livestream link ---
  useEffect(() => {
    async function loadYoutubeLink() {
      const snap = await getDoc(doc(db, "settings", "livestream"));
      if (snap.exists()) setYoutubeUrl(snap.data().youtubeUrl || "");
    }
    loadYoutubeLink();
  }, []);

  // --- Data Fetching: Schedules ---
  useEffect(() => {
    const q = query(collection(db, "schedules"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSchedules(data);
    });
    return () => unsubscribe();
  }, []);

  // --- Derived Data & Stats ---
  const now = new Date();
  const todayString = now.toDateString();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const physicalToday = bookings.filter((b) => {
    if (!b.date) return false;
    const bDate = b.date?.toDate ? b.date.toDate() : new Date(b.date);
    return bDate.toDateString() === todayString && b.seva !== "Virtual Pada Pooja";
  }).length;

  const virtualToday = bookings.filter((b) => {
    if (!b.date) return false;
    const bDate = b.date?.toDate ? b.date.toDate() : new Date(b.date);
    return bDate.toDateString() === todayString && b.seva === "Virtual Pada Pooja";
  }).length;

  const stats = {
    physicalToday,
    virtualToday,
    mantraPending: mantraRequests.filter((r) => r.status === "Pending").length,
    visitorsToday: 1432,
  };

  const recentBookings = bookings.slice(0, 6);

  const todaysSchedule = useMemo(() => {
    const todays = schedules.filter((s) => {
      if (!s.date) return false;
      const sDate = new Date(s.date);
      return (
        sDate.getFullYear() === now.getFullYear() &&
        sDate.getMonth() === now.getMonth() &&
        sDate.getDate() === now.getDate()
      );
    });

    return todays
      .map((s) => {
        const itemMinutes = timeToMinutes(s.startTime || s.time);
        const status = itemMinutes > currentMinutes ? "upcoming" : "past";
        return { ...s, status, minutes: itemMinutes };
      })
      .sort((a, b) => a.minutes - b.minutes);
  }, [schedules, now, currentMinutes]);

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
    setMantraRequests(
      mantraRequests.map((r) => (r.id === selectedRequest.id ? selectedRequest : r))
    );
    setUpdateModalOpen(false);
    setSelectedRequest(null);
    alert("Mantrakshata request updated. WhatsApp notification triggered.");
  };

  function getVideoId(url) {
    const regExp =
      /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11}).*/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  async function updateYoutubeLink() {
    const videoId = getVideoId(youtubeUrl);
    if (!videoId) {
      alert("Please enter a valid YouTube URL");
      return;
    }
    try {
      setSavingYoutube(true);
      await setDoc(
        doc(db, "settings", "livestream"),
        { youtubeUrl, videoId, updatedAt: serverTimestamp() },
        { merge: true }
      );
      alert("Live stream updated successfully.");
    } finally {
      setSavingYoutube(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] font-sans flex flex-col selection:bg-amber-200 selection:text-stone-900">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#E8DCC4]">
        <div className="mx-auto max-w-7xl px-3 sm:px-5">
          <div className="grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:h-16">
            {/* Brand + date */}
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#2a0b06] text-[11px] font-black text-[#E8DCC4]">
                AD
              </span>
              <div className="min-w-0">
                <h1 className="truncate font-serif text-base font-black uppercase tracking-tight text-[#2a0b06] sm:text-lg">
                  Admin Desk
                </h1>
                <p className="hidden truncate text-[10px] font-bold uppercase tracking-widest text-gray-400 sm:flex sm:items-center sm:gap-1.5">
                  <Calendar1 size={11} /> {currentDateDisplay}
                  <span className="mx-1 text-[#E8DCC4]">|</span>
                  <MapPin size={11} className="text-[#722013]" /> Sagara, KA
                </p>
              </div>
            </div>

            {/* Desktop nav + actions */}
            <div className="flex items-center gap-1">
              <nav className="hidden xl:flex items-center gap-0.5">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        isActive
                          ? "bg-[#FAF6F0] text-[#722013] ring-1 ring-[#E8DCC4]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-[#2a0b06]"
                      }`}
                    >
                      <link.icon size={13} /> {link.name}
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={handleLogout}
                className="ml-1 hidden items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-600 transition-colors hover:bg-rose-100 sm:flex"
              >
                <LogOut size={13} /> Logout
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-full p-2 text-stone-600 transition-colors hover:bg-[#FAF6F0] hover:text-[#2a0b06] xl:hidden"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute w-full overflow-hidden border-t border-[#E8DCC4] bg-white shadow-xl xl:hidden"
            >
              <nav className="grid grid-cols-2 gap-1.5 p-3 sm:grid-cols-3">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        isActive
                          ? "border-[#E8DCC4] bg-[#FAF6F0] text-[#722013]"
                          : "border-transparent bg-gray-50 text-gray-600 hover:text-[#2a0b06]"
                      }`}
                    >
                      <link.icon size={14} className="shrink-0" />
                      <span className="truncate">{link.name}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-rose-600"
                >
                  <LogOut size={14} /> Logout
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========== CONTENT ========== */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-5 sm:px-5 sm:py-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#2a0b06] sm:text-3xl">
              Overview
            </h2>
            <p className="text-xs font-medium text-gray-500">
              Command center & live request tracking
            </p>
          </div>
          <span className="rounded-full border border-[#E8DCC4] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 sm:hidden">
            {currentDateDisplay}
          </span>
        </div>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="Physical Sevas"
            value={stats.physicalToday}
            tag="Today"
            tone="amber"
            Icon={Flame}
          />
          <StatTile
            label="Virtual Sevas"
            value={stats.virtualToday}
            tag="Today"
            tone="blue"
            Icon={Globe}
          />
          <StatTile
            label="Mantrakshata"
            value={stats.mantraPending}
            tag="Pending"
            tone="rose"
            Icon={Package}
            dark
          />

          {/* YouTube manager — compact */}
          <div className="col-span-2 rounded-2xl border border-[#E8DCC4] bg-white p-4 lg:col-span-1">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <PlayIcon size={13} className="text-red-600" /> Live Stream
            </p>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Paste YouTube Live URL"
                className="min-w-0 flex-1 rounded-lg border border-[#E8DCC4] bg-[#FCF8F2] px-3 py-2 text-xs font-medium outline-none transition-colors focus:border-[#D4AF37]"
              />
              <button
                onClick={updateYoutubeLink}
                disabled={savingYoutube}
                className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {savingYoutube ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid items-start gap-5 lg:grid-cols-3">
          {/* Left: tabs */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            <div className="flex rounded-xl border border-[#E8DCC4] bg-white p-1">
              {[
                { id: "mantrakshata", label: "Mantrakshata Tracker" },
                { id: "sevas", label: "Recent Bookings" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTableTab(t.id)}
                  className={`flex-1 rounded-lg py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeTableTab === t.id
                      ? "bg-[#2a0b06] text-[#F5E9D6] shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-[#2a0b06]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Mantrakshata */}
            {activeTableTab === "mantrakshata" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
              >
                {/* Desktop table */}
                <div className="hidden overflow-hidden rounded-2xl border border-[#E8DCC4] bg-white md:block">
                  <table className="w-full text-left">
                    <thead className="border-b border-[#E8DCC4] bg-[#FAF6F0]">
                      <tr className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                        <th className="p-3 pl-5">Request</th>
                        <th className="p-3">Devotee</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 pr-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0E7D6]">
                      {mantraRequests.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-6 text-center text-sm text-gray-500">
                            No requests yet.
                          </td>
                        </tr>
                      ) : (
                        mantraRequests.map((req) => (
                          <tr key={req.id} className="transition-colors hover:bg-[#FCF8F2]">
                            <td className="p-3 pl-5">
                              <div className="text-sm font-bold text-[#2a0b06]">
                                {req.requestId}
                              </div>
                              <div className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-gray-500">
                                <Calendar1 size={10} /> {req.date}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm font-bold text-[#2a0b06]">
                                {req.name}
                                <span className="ml-1 text-[11px] font-medium text-gray-500">
                                  ({req.city})
                                </span>
                              </div>
                              <div className="mt-1 inline-block rounded border border-rose-100 bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#722013]">
                                {req.purpose}
                              </div>
                            </td>
                            <td className="p-3">
                              {req.status === "Pending" ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-700">
                                  <AlertCircle size={11} /> Pending
                                </span>
                              ) : (
                                <div>
                                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-700">
                                    <Truck size={11} /> {req.status || "Shipped"}
                                  </span>
                                  {req.tracking && (
                                    <div className="mt-1 font-mono text-[10px] font-bold text-gray-500">
                                      {req.tracking}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="p-3 pr-5 text-right">
                              <button
                                onClick={() => openUpdateModal(req)}
                                className="rounded-lg border border-[#E8DCC4] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 transition-colors hover:border-[#D4AF37] hover:text-[#722013]"
                              >
                                Update
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="flex flex-col gap-3 md:hidden">
                  {mantraRequests.length === 0 ? (
                    <div className="rounded-2xl border border-[#E8DCC4] bg-white p-5 text-center text-sm text-gray-500">
                      No requests yet.
                    </div>
                  ) : (
                    mantraRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex flex-col gap-2.5 rounded-2xl border border-[#E8DCC4] bg-white p-4"
                      >
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-base font-bold leading-tight text-[#2a0b06]">
                              {req.name}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-semibold text-gray-500">
                              <MapPin size={11} className="shrink-0" /> {req.city}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                              req.status === "Pending"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {req.status || "Pending"}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-xl border border-[#E8DCC4] bg-[#FAF6F0] p-2">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                              Req ID
                            </p>
                            <p className="truncate text-[11px] font-bold text-[#2a0b06]">
                              {req.requestId || req.id}
                            </p>
                          </div>
                          <div className="rounded-xl border border-[#E8DCC4] bg-[#FAF6F0] p-2">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                              Date
                            </p>
                            <p className="truncate text-[11px] font-bold text-[#2a0b06]">
                              {req.date}
                            </p>
                          </div>
                          <div className="rounded-xl border border-rose-100 bg-rose-50 p-2">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-[#722013]">
                              Purpose
                            </p>
                            <p className="truncate text-[11px] font-bold text-[#722013]">
                              {req.purpose}
                            </p>
                          </div>
                        </div>

                        {req.tracking && (
                          <p className="font-mono text-[10px] font-bold text-gray-500">
                            Tracking: {req.tracking}
                          </p>
                        )}

                        <button
                          onClick={() => openUpdateModal(req)}
                          className="w-full rounded-xl border border-[#E8DCC4] bg-white py-2 text-[10px] font-bold uppercase tracking-widest text-[#2a0b06] transition-colors hover:border-[#D4AF37]"
                        >
                          Update Status
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Recent bookings */}
            {activeTableTab === "sevas" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
              >
                <div className="hidden overflow-hidden rounded-2xl border border-[#E8DCC4] bg-white md:block">
                  <table className="w-full text-left">
                    <thead className="border-b border-[#E8DCC4] bg-[#FAF6F0]">
                      <tr className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                        <th className="p-3 pl-5">Booking ID</th>
                        <th className="p-3">Devotee</th>
                        <th className="p-3">Seva Type</th>
                        <th className="p-3 pr-5 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0E7D6]">
                      {recentBookings.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-6 text-center text-sm text-gray-500">
                            No recent bookings found.
                          </td>
                        </tr>
                      ) : (
                        recentBookings.map((booking) => (
                          <tr
                            key={booking.id}
                            className="transition-colors hover:bg-[#FCF8F2]"
                          >
                            <td className="p-3 pl-5 text-sm font-bold text-[#2a0b06]">
                              {booking.bookingId || booking.id}
                            </td>
                            <td className="p-3 text-sm font-bold text-gray-800">
                              {booking.name}
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                                  booking.seva === "Virtual Pada Pooja"
                                    ? "border-blue-200 bg-blue-50 text-blue-700"
                                    : "border-amber-200 bg-amber-50 text-amber-700"
                                }`}
                              >
                                {booking.seva || "Physical Seva"}
                              </span>
                            </td>
                            <td className="p-3 pr-5 text-right text-xs font-bold text-gray-500">
                              {booking.time || "N/A"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 md:hidden">
                  {recentBookings.length === 0 ? (
                    <div className="rounded-2xl border border-[#E8DCC4] bg-white p-5 text-center text-sm text-gray-500">
                      No recent bookings.
                    </div>
                  ) : (
                    recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex flex-col gap-2 rounded-2xl border border-[#E8DCC4] bg-white p-4"
                      >
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-base font-bold leading-tight text-[#2a0b06]">
                              {booking.name}
                            </p>
                            <p className="truncate text-[11px] font-semibold text-gray-500">
                              {booking.bookingId || booking.id}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                              booking.seva === "Virtual Pada Pooja"
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {booking.seva === "Virtual Pada Pooja"
                              ? "Virtual"
                              : "Physical"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-[#E8DCC4] bg-[#FAF6F0] px-3 py-2 text-xs font-bold text-gray-700">
                          <Clock size={13} className="shrink-0 text-[#D4AF37]" />
                          <span className="truncate">
                            {booking.time || "Not specified"}
                          </span>
                          <span className="ml-auto truncate text-[10px] font-semibold text-gray-500">
                            {booking.seva || "Seva"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: itinerary */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E8DCC4] bg-white lg:sticky lg:top-20">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#E8DCC4] bg-[#FAF6F0] px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <Clock size={14} className="shrink-0 text-[#722013]" />
                <h2 className="truncate font-serif text-base font-bold leading-none text-[#2a0b06]">
                  Today's Itinerary
                </h2>
              </div>
              <Link
                to="/admin/schedule"
                className="shrink-0 rounded border border-gray-300 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-500 transition-colors hover:border-[#722013] hover:text-[#722013]"
              >
                Manage
              </Link>
            </div>

            <div className={`max-h-[460px] flex-1 overflow-y-auto p-4 ${hideScrollbar}`}>
              {todaysSchedule.length === 0 ? (
                <div className="py-10 text-center">
                  <Calendar1 size={28} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-bold text-gray-600">No events today.</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Add events from the Schedule tab.
                  </p>
                </div>
              ) : (
                <div className="relative space-y-2.5">
                  <div className="absolute bottom-2 left-[6px] top-2 w-px bg-[#E8DCC4]" />
                  {todaysSchedule.map((item, idx) => (
                    <div key={item.id || idx} className="relative pl-5">
                      <div
                        className={`absolute left-0 top-3 h-3 w-3 rounded-full border-2 border-white ${
                          item.status === "upcoming"
                            ? "bg-[#D4AF37] ring-2 ring-[#E8DCC4]"
                            : "bg-gray-300"
                        }`}
                      />
                      <div
                        className={`rounded-xl border p-3 transition-colors ${
                          item.status === "upcoming"
                            ? "border-[#D4AF37] bg-[#FAF6F0]"
                            : "border-[#E8DCC4] bg-white"
                        }`}
                      >
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                          <div
                            className={`truncate text-[10px] font-bold uppercase tracking-widest ${
                              item.status === "upcoming"
                                ? "text-[#722013]"
                                : "text-gray-400"
                            }`}
                          >
                            {item.startTime || item.time}
                          </div>
                          {item.status === "upcoming" && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded border border-[#E8DCC4] bg-white px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-[#722013]">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4AF37]" />
                              Next
                            </span>
                          )}
                        </div>
                        <div
                          className={`mt-1 text-sm font-bold ${
                            item.status === "upcoming"
                              ? "text-[#2a0b06]"
                              : "text-gray-600"
                          }`}
                        >
                          {item.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ========== UPDATE MODAL ========== */}
      <AnimatePresence>
        {updateModalOpen && selectedRequest && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUpdateModalOpen(false)}
              className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
              <motion.div
                initial={{ scale: 0.97, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.97, opacity: 0, y: 20 }}
                className="w-full max-w-sm overflow-hidden rounded-t-3xl border border-[#E8DCC4] bg-white shadow-2xl sm:rounded-3xl"
              >
                <div className="flex items-center justify-between border-b border-[#E8DCC4] bg-[#FAF6F0] px-5 py-3">
                  <h2 className="font-serif text-base font-bold text-[#2a0b06]">
                    Update Status
                  </h2>
                  <button
                    onClick={() => setUpdateModalOpen(false)}
                    className="rounded-full border border-[#E8DCC4] bg-white p-1.5 text-gray-400 transition-colors hover:text-[#2a0b06]"
                  >
                    <X size={13} />
                  </button>
                </div>

                <form onSubmit={handleUpdateRequest} className="space-y-4 p-5">
                  <div className="rounded-xl border border-[#E8DCC4] bg-[#FCF8F2] p-3 text-sm">
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                        Request ID
                      </span>
                      <span className="truncate font-mono text-xs font-bold text-[#2a0b06]">
                        {selectedRequest.requestId || selectedRequest.id}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                        Devotee
                      </span>
                      <span className="truncate text-sm font-bold text-[#2a0b06]">
                        {selectedRequest.name}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Delivery Status
                    </label>
                    <select
                      value={selectedRequest.status}
                      onChange={(e) =>
                        setSelectedRequest({
                          ...selectedRequest,
                          status: e.target.value,
                        })
                      }
                      className="w-full appearance-none rounded-xl border border-[#E8DCC4] bg-[#FCF8F2] px-3 py-2.5 text-sm font-bold text-[#2a0b06] outline-none transition-colors focus:border-[#D4AF37]"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped / Dispatched</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  {selectedRequest.status === "Shipped" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Tracking Info
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. India Post EK123..."
                        value={selectedRequest.tracking || ""}
                        required
                        onChange={(e) =>
                          setSelectedRequest({
                            ...selectedRequest,
                            tracking: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-[#E8DCC4] bg-[#FCF8F2] px-3 py-2.5 font-mono text-sm font-bold text-[#2a0b06] outline-none transition-colors focus:border-[#D4AF37]"
                      />
                      <p className="mt-2 flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-[9px] font-bold uppercase tracking-widest text-emerald-600">
                        <CheckCircle size={11} /> Triggers WhatsApp notification.
                      </p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#2a0b06] py-3 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#722013]"
                  >
                    Save & Notify
                  </button>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
