import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import "react-datepicker/dist/react-datepicker.css";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  runTransaction,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Video,
  Smartphone,
  CheckCircle2,
  Loader2,
  Printer,
  ChevronRight,
  User,
  MapPin,
  Users,
  AlertCircle,
  QrCode
} from "lucide-react";

// -----------------------------------------------------
// CONSTANTS
// -----------------------------------------------------
const START_DATE = new Date(2026, 6, 29); // 29 July 2026
const END_DATE = new Date(2026, 8, 26); // 26 September 2026
const MEET_LINK = "https://meet.google.com/abc-defg-hij";

// -----------------------------------------------------
// HELPERS
// -----------------------------------------------------
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const toJsDate = (d) => (d?.toDate ? d.toDate() : new Date(d));

const formatDate = (date) => {
  if (!date) return "";
  return toJsDate(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const isTuesdayOrWednesday = (date) => {
  const day = date.getDay();
  return day === 2 || day === 3; // Tuesday = 2, Wednesday = 3
};

// -----------------------------------------------------
// MAIN
// -----------------------------------------------------
const VirtualPadaPuja = () => {
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState("selection");
  const [formStep, setFormStep] = useState(1); // 1 = Details, 2 = Calendar
  const [flowType, setFlowType] = useState("");
  const [mobileInput, setMobileInput] = useState("");
  const [existingBookings, setExistingBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [bookingData, setBookingData] = useState({
    bookingId: "",
    mobile: "",
    name: "",
    address: "",
    participants: "1",
    date: null,
    seva: "Virtual Pada Pooja",
    meetLink: MEET_LINK,
  });

  const resetFlow = () => {
    setCurrentView("selection");
    setFlowType("");
    setMobileInput("");
    setExistingBookings([]);
    setSelectedBooking(null);
    setError("");
    setFormStep(1);
    setBookingData({
      bookingId: "", mobile: "", name: "", address: "", participants: "1",
      date: null, seva: "Virtual Pada Pooja", meetLink: MEET_LINK,
    });
  };

  const handleMobileSubmit = async () => {
    if (mobileInput.length !== 10) return;
    setIsLoading(true);
    setError("");

    try {
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("mobile", "==", mobileInput),
        where("seva", "==", "Virtual Pada Pooja")
      );
      const snapshot = await getDocs(bookingsQuery);
      const today = normalizeDate(new Date());

      const virtualBookings = snapshot.docs
        .map((b) => ({ id: b.id, ...b.data() }))
        .filter((b) => b.date && normalizeDate(toJsDate(b.date)) >= today)
        .sort((a, b) => toJsDate(a.date) - toJsDate(b.date));

      if (flowType === "book") {
        setBookingData((p) => ({ ...p, mobile: mobileInput }));
        if (virtualBookings.length > 0) {
          setExistingBookings(virtualBookings);
          setCurrentView("existing_bookings");
        } else {
          setCurrentView("book_form");
          setFormStep(1);
        }
      }

      if (flowType === "join") {
        if (virtualBookings.length > 0) {
          setExistingBookings(virtualBookings);
          if (virtualBookings.length === 1) {
            setSelectedBooking(virtualBookings[0]);
            setCurrentView("join_details");
          } else {
            setCurrentView("existing_bookings");
          }
        } else {
          setError("No upcoming Virtual Pada Pooja booking was found for this mobile number.");
        }
      }
    } catch (err) {
      console.error("Error fetching Virtual Pada Pooja booking:", err);
      setError("Unable to retrieve your booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const proceedToCalendar = () => {
    if (!bookingData.name.trim() || !bookingData.address.trim()) {
      setError("Please complete your name and address before proceeding.");
      return;
    }
    setError("");
    setFormStep(2);
  };

  const handleBookingSubmit = async () => {
    if (!bookingData.date) {
      setError("Please select a valid date for your Virtual Pada Pooja.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const normalizedBookingDate = normalizeDate(bookingData.date);
      const counterRef = doc(db, "counters", "bookingCounter");

      const bookingId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        if (!counterDoc.exists()) throw new Error("Booking counter does not exist.");
        const currentNumber = counterDoc.data().lastNumber || 0;
        const nextNumber = currentNumber + 1;
        transaction.update(counterRef, { lastNumber: nextNumber });
        return `KM26-${String(nextNumber).padStart(3, "0")}`;
      });

      const newBooking = {
        bookingId,
        mobile: mobileInput,
        name: bookingData.name.trim(),
        address: bookingData.address.trim(),
        participants: bookingData.participants,
        date: Timestamp.fromDate(normalizedBookingDate),
        seva: "Virtual Pada Pooja",
        meetLink: MEET_LINK,
        bookingMode: "Virtual",
        status: "Confirmed",
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "bookings"), newBooking);
      setBookingData(newBooking);
      setCurrentView("book_receipt");
    } catch (err) {
      console.error("Virtual Pada Pooja Booking Error:", err);
      setError("An error occurred while confirming your booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canJoinMeeting = (targetDate) => {
    if (!targetDate) return false;
    const now = normalizeDate(new Date());
    const bookingDate = normalizeDate(toJsDate(targetDate));
    return now.getTime() === bookingDate.getTime();
  };

  const handleBack = () => {
    if (currentView === "selection") navigate("/");
    else if (currentView === "mobile_input") resetFlow();
    else if (currentView === "existing_bookings") setCurrentView("mobile_input");
    else if (currentView === "book_form") {
      if (formStep === 2) setFormStep(1);
      else setCurrentView("mobile_input");
    }
    else if (currentView === "join_details") setCurrentView("mobile_input");
    else resetFlow();
  };

  const handlePrint = () => window.print();

  return (
    // STRICT SCREEN FIT: h-[100dvh] and overflow-hidden ensures NO full page scroll
    <div className="font-sans flex flex-col bg-[#FDFBF7] text-gray-900 h-[100dvh] overflow-hidden relative">
      
      {/* Warm Digital Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(to right, #D4AF37 1px, transparent 1px), linear-gradient(to bottom, #D4AF37 1px, transparent 1px)`,
        backgroundSize: '3rem 3rem'
      }} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-100/40 via-transparent to-transparent" />

      {/* TOP NAVIGATION */}
      <nav className="shrink-0 relative z-20 backdrop-blur-xl bg-white/60 border-b border-orange-200/50 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {currentView === "selection" ? "Home" : "Back"}
          </button>
          <div className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-orange-600 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Digital Seva
          </div>
        </div>
      </nav>

      {/* MAIN DYNAMIC CONTENT AREA (Flex-1 handles internal scrolling) */}
      <main className="flex-1 min-h-0 flex flex-col w-full max-w-5xl mx-auto px-4 py-6 relative z-10 print:p-0">
        <AnimatePresence mode="wait">

          {/* 1. SELECTION */}
          {currentView === "selection" && (
            <motion.div key="selection" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">
              <div className="text-center mb-10">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-200 text-3xl shadow-sm mb-4">🙏</div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">Virtual Pooja Portal</h1>
                <p className="mt-2 text-sm text-gray-500">Secure digital connection for sacred blessings.</p>
              </div>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <button onClick={() => { setFlowType("book"); setCurrentView("mobile_input"); }} className="group relative text-left bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-orange-100 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><CalendarIcon size={80} /></div>
                  <div className="h-12 w-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                    <CalendarIcon size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Initiate Booking</h3>
                  <p className="mt-2 text-sm text-gray-500 relative z-10">Reserve your Virtual Pooja slot and participate remotely via secure feed.</p>
                </button>

                <button onClick={() => { setFlowType("join"); setCurrentView("mobile_input"); }} className="group relative text-left bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-orange-100 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Video size={80} /></div>
                  <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                    <Video size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Access Meeting</h3>
                  <p className="mt-2 text-sm text-gray-500 relative z-10">Enter your credentials to join your scheduled live Google Meet session.</p>
                </button>
              </div>
            </motion.div>
          )}

          {/* 2. MOBILE INPUT */}
          {currentView === "mobile_input" && (
            <motion.div key="mobile" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 to-amber-500" />
                
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 border border-orange-100 text-orange-600 mb-5">
                  <Smartphone size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Identify Devotee</h2>
                <p className="mt-2 text-xs text-gray-500 font-mono">SECURE AUTHENTICATION</p>

                {error && (
                  <div className="mt-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 text-left">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
                  </div>
                )}

                <div className="mt-6 flex items-stretch rounded-xl border border-gray-200 bg-gray-50 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-50 overflow-hidden transition-all">
                  <span className="px-4 flex items-center text-gray-400 font-mono border-r border-gray-200 bg-white">+91</span>
                  <input type="tel" inputMode="numeric" value={mobileInput}
                    onChange={(e) => { setMobileInput(e.target.value.replace(/\D/g, "")); setError(""); }}
                    maxLength="10" placeholder="10-digit ID"
                    className="flex-1 min-w-0 bg-transparent p-4 text-center text-xl font-mono text-gray-900 outline-none placeholder:text-gray-300"
                    autoFocus
                  />
                </div>

                <button onClick={handleMobileSubmit} disabled={mobileInput.length !== 10 || isLoading}
                  className="mt-6 w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(234,88,12,0.3)] transition-all flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authenticate"}
                </button>
              </div>
            </motion.div>
          )}

          {/* 3. EXISTING BOOKINGS */}
          {currentView === "existing_bookings" && (
            <motion.div key="existing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col h-full max-w-2xl mx-auto w-full">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-orange-100 flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-orange-100 bg-orange-50/30 flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Active Records</h2>
                    <p className="text-xs font-mono text-gray-500 mt-1">ID: +91 {mobileInput}</p>
                  </div>
                </div>

                {/* Internally scrollable list */}
                <div className="flex-1 overflow-y-auto hide-scrollbar p-6 space-y-3">
                  {existingBookings.map((booking) => (
                    <div key={booking.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-4 hover:border-orange-300 transition-colors">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{booking.name}</p>
                        <p className="text-xs font-mono text-gray-500 mt-1 flex items-center gap-1.5"><CalendarIcon size={12}/> {formatDate(booking.date)}</p>
                        <p className="text-[10px] font-mono font-bold uppercase text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded mt-2">{booking.bookingId}</p>
                      </div>
                      <button onClick={() => {
                          if (flowType === "join") { setSelectedBooking(booking); setCurrentView("join_details"); }
                          else { setBookingData(booking); setCurrentView("book_receipt"); }
                        }}
                        className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                      >
                        {flowType === "join" ? "Access Terminal" : "View Details"}
                      </button>
                    </div>
                  ))}
                </div>

                {flowType === "book" && (
                  <div className="p-6 shrink-0 border-t border-gray-100 bg-gray-50/50">
                    <button onClick={() => {
                        setBookingData({ bookingId: "", mobile: mobileInput, name: "", address: "", participants: "1", date: null, seva: "Virtual Pada Pooja", meetLink: MEET_LINK });
                        setCurrentView("book_form"); setFormStep(1);
                      }}
                      className="w-full border-2 border-dashed border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 font-bold py-3.5 rounded-xl transition-colors"
                    >
                      + Register New Pooja
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 4. BOOK FORM (2-Step Process) */}
          {currentView === "book_form" && (
            <motion.div key="form" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full max-w-xl mx-auto w-full">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 flex flex-col h-full overflow-hidden">
                
                {/* Header & Progress */}
                <div className="p-6 border-b border-gray-100 shrink-0 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Virtual Configuration</h2>
                    <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">STEP {formStep}/2</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-orange-500 transition-all" />
                    <div className={`h-1.5 flex-1 rounded-full transition-all ${formStep === 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
                  </div>
                </div>

                {error && (
                  <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-start gap-2 shrink-0">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
                  </div>
                )}

                {/* Form Body - Internally Scrollable */}
                <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
                  
                  {/* STEP 1: Details */}
                  {formStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><User size={12}/> Devotee Name</label>
                        <input type="text" value={bookingData.name} onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                          placeholder="Enter full name" autoFocus
                          className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 p-3.5 rounded-xl outline-none transition-all text-sm font-medium" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Smartphone size={12}/> Mobile</label>
                          <input type="text" value={`+91 ${mobileInput}`} disabled className="w-full bg-gray-100 border border-gray-200 text-gray-500 p-3.5 rounded-xl outline-none text-sm font-mono cursor-not-allowed" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Users size={12}/> Participants</label>
                          <select value={bookingData.participants} onChange={(e) => setBookingData({ ...bookingData, participants: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 p-3.5 rounded-xl outline-none transition-all text-sm font-medium appearance-none">
                            {[...Array(15)].map((_, i) => (<option key={i + 1} value={String(i + 1)}>{i + 1} {i === 0 ? "Person" : "Persons"}</option>))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin size={12}/> Delivery Address</label>
                        <textarea rows={3} value={bookingData.address} onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                          placeholder="Complete address including PIN for prasada..."
                          className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 p-3.5 rounded-xl outline-none resize-none transition-all text-sm font-medium" />
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Calendar */}
                  {formStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center justify-center min-h-[300px]">
                      <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1"><CalendarIcon size={12}/> Select Schedule</label>
                      <div className="bg-white border border-gray-200 p-2 rounded-2xl shadow-sm">
                        <DatePicker
                          selected={bookingData.date} onChange={(date) => setBookingData({ ...bookingData, date })}
                          minDate={START_DATE} maxDate={END_DATE} filterDate={isTuesdayOrWednesday}
                          inline // Always inline for this dedicated step
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-4 text-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                        Available exclusively on <strong>Tuesdays</strong> and <strong>Wednesdays</strong>.
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Form Footer (Pinned) */}
                <div className="shrink-0 p-5 bg-gray-50/80 border-t border-gray-100">
                  {formStep === 1 ? (
                    <button onClick={proceedToCalendar} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                      Next: Select Date <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button onClick={handleBookingSubmit} disabled={!bookingData.date || isLoading}
                      className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(234,88,12,0.3)] transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Pooja"}
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* 5. BOOK RECEIPT (Compact Landscape Layout) */}
          {currentView === "book_receipt" && (
            <motion.div key="receipt" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} 
              className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full"
            >
              <div id="virtual-pooja-receipt" className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden print:shadow-none print:border-black">
                
                {/* Header */}
                <div className="bg-gray-900 text-white p-5 flex items-center justify-between print:bg-white print:text-black print:border-b">
                  <div>
                    <p className="text-[10px] tracking-widest font-mono text-orange-400 uppercase">Chaturmasya 2026</p>
                    <h2 className="text-xl font-bold">Virtual E-Pass</h2>
                  </div>
                  <QrCode size={24} className="text-gray-500 print:hidden" />
                </div>

                {/* Grid Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiAvPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMSIgZmlsbD0iI2Y1ZjVmNSIgLz4KPC9zdmc+')]">
                  
                  {/* Left: QR & ID */}
                  <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-2xl shadow-sm shrink-0">
                    <QRCodeCanvas value={JSON.stringify({ id: bookingData.bookingId, seva: "Virtual Pada Pooja" })} size={100} />
                    <div className="mt-3 text-center">
                      <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Reference ID</p>
                      <p className="text-sm font-mono font-bold text-gray-900">{bookingData.bookingId}</p>
                    </div>
                  </div>

                  {/* Right: Details Grid */}
                  <div className="grid grid-cols-2 gap-4 bg-white/80 backdrop-blur p-5 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-mono text-gray-400 font-bold">Devotee</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{bookingData.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-mono text-gray-400 font-bold">Mobile</p>
                      <p className="text-sm font-mono font-bold text-gray-900 mt-0.5 truncate">{bookingData.mobile || mobileInput}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-mono text-gray-400 font-bold">Date</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{formatDate(bookingData.date)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-mono text-gray-400 font-bold">Participants</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{bookingData.participants}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border-t border-orange-100 p-4 text-center">
                  <p className="text-xs text-orange-800 font-medium">
                    Return to the portal on <strong>{formatDate(bookingData.date)}</strong> to access your secure Google Meet link.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 no-print">
                <button onClick={resetFlow} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 font-bold py-3.5 rounded-xl transition-colors">
                  Finish
                </button>
                <button onClick={handlePrint} className="sm:flex-[2] bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2">
                  <Printer size={16} /> Save / Print Receipt
                </button>
              </div>
            </motion.div>
          )}

          {/* 6. JOIN DETAILS */}
          {currentView === "join_details" && selectedBooking && (
            <motion.div key="join" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} 
              className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full"
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-full">
                
                <div className="bg-gray-900 text-white p-6 flex items-center justify-between shrink-0">
                  <div>
                    <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mb-1">Terminal Status</p>
                    <h2 className="text-xl font-bold">Virtual Room</h2>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded uppercase tracking-widest ${canJoinMeeting(selectedBooking.date) ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                    {canJoinMeeting(selectedBooking.date) ? 'Live' : 'Locked'}
                  </span>
                </div>

                <div className="p-6 flex-1 overflow-y-auto hide-scrollbar space-y-6">
                  
                  {/* Info Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 border border-gray-100 p-4 rounded-xl">
                    <div><p className="text-[9px] uppercase font-mono text-gray-400 font-bold">ID</p><p className="text-xs font-mono font-bold text-gray-900 truncate">{selectedBooking.bookingId}</p></div>
                    <div><p className="text-[9px] uppercase font-mono text-gray-400 font-bold">Name</p><p className="text-xs font-bold text-gray-900 truncate">{selectedBooking.name}</p></div>
                    <div><p className="text-[9px] uppercase font-mono text-gray-400 font-bold">Date</p><p className="text-xs font-bold text-gray-900 truncate">{formatDate(selectedBooking.date)}</p></div>
                    <div><p className="text-[9px] uppercase font-mono text-gray-400 font-bold">People</p><p className="text-xs font-bold text-gray-900 truncate">{selectedBooking.participants}</p></div>
                  </div>

                  {/* Action Area */}
                  <div className="border border-gray-200 bg-white rounded-2xl p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 border border-gray-100 mb-4">
                      <Video size={24} className={canJoinMeeting(selectedBooking.date) ? "text-green-600" : "text-gray-400"} />
                    </div>
                    
                    {canJoinMeeting(selectedBooking.date) ? (
                      <>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Room is Open</h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Your secure video feed is ready. Ensure a stable internet connection before joining.</p>
                        <a href={selectedBooking.meetLink || MEET_LINK} target="_blank" rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(22,163,74,0.3)] transition-all"
                        >
                          Launch Google Meet
                        </a>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Access Restricted</h3>
                        <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">The secure link will activate automatically on your scheduled date.</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl py-3 px-5 inline-block">
                          <p className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-widest">Unlocks On</p>
                          <p className="font-bold text-lg mt-1 text-gray-900">{formatDate(selectedBooking.date)}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* PRINT CSS & SCROLLBAR HIDING */}
      <style>{`
        /* Elegant internal scrolling */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @media print {
          body * { visibility: hidden; }
          #virtual-pooja-receipt, #virtual-pooja-receipt * { visibility: visible; }
          #virtual-pooja-receipt {
            position: absolute; left: 0; top: 0; width: 100%; max-width: 100%;
            box-shadow: none !important; border: 1px solid #000 !important; background: white !important;
          }
          .no-print { display: none !important; }
        }

        /* React Datepicker styling for "Digital/Terminal" feel */
        .react-datepicker { border: none !important; font-family: inherit !important; background-color: transparent !important; }
        .react-datepicker__header { background-color: transparent !important; border-bottom: 1px solid #E5E7EB !important; }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected { background-color: #ea580c !important; color: white !important; font-weight: bold; border-radius: 8px; }
        .react-datepicker__day:hover:not(.react-datepicker__day--disabled) { background-color: #ffedd5 !important; color: #c2410c !important; border-radius: 8px; }
      `}</style>
    </div>
  );
};

export default VirtualPadaPuja;