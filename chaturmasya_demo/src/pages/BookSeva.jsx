import { useState } from "react";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
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
  Phone,
  User,
  Users,
  MapPin,
  Calendar as CalendarIcon,
  CheckCircle2,
  Loader2,
  Printer,
  Plus,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  FileText,
} from "lucide-react";

// --- CONSTANTS & HELPERS ---
const START_DATE = new Date(2026, 6, 29);
const END_DATE = new Date(2026, 8, 26);

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const STEPS = [
  { key: "MOBILE", label: "Verify" },
  { key: "FORM", label: "Details" },
  { key: "RECEIPT", label: "e-Pass" },
];

const BookSeva = () => {
  const [currentStep, setCurrentStep] = useState("MOBILE");
  const [mobile, setMobile] = useState("");
  const [existingBookings, setExistingBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [bookingData, setBookingData] = useState({
    bookingId: "",
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    state: "Karnataka",
    pincode: "",
    date: null,
    seva: "Physical Pada Pooja",
    participants: "1",
  });

  const resetFlow = () => {
    setMobile("");
    setExistingBookings([]);
    setError("");
    setCurrentStep("MOBILE");
    setBookingData({
      bookingId: "",
      name: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      district: "",
      state: "Karnataka",
      pincode: "",
      date: null,
      seva: "Physical Pada Pooja",
      participants: "1",
    });
  };

  const checkMobile = async () => {
    if (!mobile || mobile.length < 10) return;
    setIsLoading(true);
    setError("");
    try {
      const q = query(collection(db, "bookings"), where("mobile", "==", mobile));
      const snapshot = await getDocs(q);
      const today = normalizeDate(new Date());
      const upcoming = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((data) => {
          if (!data.date) return false;
          const bookingDate = data.date.toDate ? data.date.toDate() : new Date(data.date);
          return normalizeDate(bookingDate) >= today;
        })
        .sort((a, b) => (a.date?.toDate() > b.date?.toDate() ? 1 : -1));

      if (upcoming.length > 0) {
        setExistingBookings(upcoming);
        setCurrentStep("EXISTING");
      } else {
        setCurrentStep("FORM");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      alert("Failed to access sacred records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingSubmit = async () => {
    setIsLoading(true);
    setError("");
    try {
      const normalizedBookingDate = normalizeDate(bookingData.date);
      const dd = String(normalizedBookingDate.getDate()).padStart(2, "0");
      const mm = String(normalizedBookingDate.getMonth() + 1).padStart(2, "0");
      const yy = String(normalizedBookingDate.getFullYear()).slice(-2);
      const datePrefix = `${dd}${mm}${yy}`;
      const counterRef = doc(db, "counters", `physicalPadaPooja-${datePrefix}`);

      const bookingId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        const nextNumber = counterDoc.exists() ? (counterDoc.data().lastNumber || 0) + 1 : 1;
        transaction.set(counterRef, { lastNumber: nextNumber });
        return `${datePrefix}-${String(nextNumber).padStart(3, "0")}`;
      });

      const newBooking = {
        ...bookingData,
        bookingId,
        mobile,
        date: Timestamp.fromDate(normalizedBookingDate),
        createdAt: Timestamp.now(),
      };
      await addDoc(collection(db, "bookings"), newBooking);
      setBookingData(newBooking);
      setCurrentStep("RECEIPT");
    } catch (err) {
      console.error("Booking Error:", err);
      setError("An error occurred while securing your offering. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const formattedReceiptDate = bookingData.date?.toDate
    ? bookingData.date.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : bookingData.date
    ? new Date(bookingData.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const isLocalPincode = bookingData.pincode.trim() === "577401";
  const isWeekend = (date) => {
    if (!date) return false;
    const day = date.getDay();
    return day === 0 || day === 6;
  };
  const isWeekendBlockedForLocal = (date) => isLocalPincode && isWeekend(date);
  const weekendRestrictionMessage =
    "Saturday and Sunday are reserved for devotees coming from outside Sagara. Please select a weekday.\n\nಶನಿವಾರ ಮತ್ತು ಭಾನುವಾರ ಸಾಗರದ ಹೊರಗಿನಿಂದ ಬರುವ ಭಕ್ತರಿಗಾಗಿ ಮೀಸಲಾಗಿರುತ್ತದೆ. ದಯವಿಟ್ಟು ವಾರದ ದಿನವನ್ನು ಆಯ್ಕೆಮಾಡಿ.";

  const handleDateChange = (date) => {
    if (isWeekendBlockedForLocal(date)) {
      setError(weekendRestrictionMessage);
      setBookingData((prev) => ({ ...prev, date: null }));
      return;
    }
    setError("");
    setBookingData((prev) => ({ ...prev, date }));
  };

  const stepIndex = currentStep === "MOBILE" ? 0 : currentStep === "FORM" || currentStep === "EXISTING" ? 1 : 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0d08] via-[#2a1810] to-[#1a0d08] relative overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: `radial-gradient(circle at 20% 10%, #FFD700 0px, transparent 40%), radial-gradient(circle at 80% 80%, #FF6B00 0px, transparent 40%)`,
      }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />

      {/* NAV */}
      <nav className="relative z-10 border-b border-[#D4AF37]/15 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-[#F5E6C8] hover:text-[#FFD700] transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]/70">
            <Sparkles className="w-3 h-3" /> Chaturmasya 2026
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative z-10 pt-4 sm:pt-8 pb-4 px-4 sm:px-6 text-center flex flex-col items-center">
        <p className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] mb-1">
          Sacred Reservation
        </p>
        <h1 className="text-2xl sm:text-3xl font-serif text-[#F5E6C8] leading-tight">
          Physical Pada Pooja
        </h1>
        <p className="text-[#C9B896]/80 mt-1 text-xs sm:text-sm max-w-md mx-auto">
          Reserve your sacred offering with the mutt
        </p>

        {/* Stepper */}
        <div className="mt-4 flex items-center justify-center gap-1.5 sm:gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1.5 sm:gap-2">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-semibold tracking-wide uppercase transition-all
                ${i <= stepIndex
                  ? "bg-[#D4AF37] text-[#1a0d08]"
                  : "bg-white/5 text-[#C9B896]/50 border border-white/10"}`}>
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${
                  i < stepIndex ? "bg-[#1a0d08] text-[#D4AF37]" : i === stepIndex ? "bg-[#1a0d08]/20" : "bg-white/10"
                }`}>
                  {i < stepIndex ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-[#D4AF37]/40" />}
            </div>
          ))}
        </div>
      </header>

      {/* CONTENT */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <AnimatePresence mode="wait">
          {/* STEP 1: MOBILE */}
          {currentStep === "MOBILE" && (
            <motion.div
              key="mobile"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="relative"
            >
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#D4AF37]/40 via-transparent to-[#D4AF37]/20 blur-xl opacity-60" />
              <div className="relative bg-[#FFFDF8] rounded-3xl border border-[#D4AF37]/20 shadow-2xl p-6 sm:p-10">
                <div className="flex flex-col items-center text-center">
                  <h2 className="text-2xl sm:text-3xl font-serif text-[#2a1810]">Welcome, Devotee</h2>
                  <p className="text-[#6b5842] mt-2 max-w-sm text-sm sm:text-base">
                    Enter your mobile number to view your sacred schedule or arrange a new offering.
                  </p>
                </div>

                <div className="mt-8 max-w-sm mx-auto">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#8b6f47] mb-2">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-[#8b6f47] font-medium border-r border-[#E8E2D2] pr-3">+91</span>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                      maxLength="10"
                      className="w-full border-2 border-[#E8E2D2] bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 pl-20 pr-4 py-4 rounded-2xl text-lg font-medium tracking-wider transition-all outline-none"
                      placeholder="10-digit number"
                    />
                  </div>

                  <button
                    onClick={checkMobile}
                    disabled={mobile.length < 10 || isLoading}
                    className="mt-6 w-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#FFD700] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ChevronRight className="w-5 h-5" /></>}
                  </button>

                  <p className="text-center text-xs text-[#8b6f47]/70 mt-4 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Your number is used only to link your bookings
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: EXISTING */}
          {currentStep === "EXISTING" && (
            <motion.div key="existing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-[#FFFDF8] rounded-3xl border border-[#D4AF37]/20 shadow-2xl p-6 sm:p-8">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#B8860B] font-bold">Sacred Schedule</p>
                    <h2 className="text-2xl sm:text-3xl font-serif text-[#2a1810] mt-1">Upcoming Sevas</h2>
                  </div>
                  <button onClick={resetFlow} className="text-sm text-[#8b6f47] hover:text-orange-700 underline underline-offset-4">
                    Change Number
                  </button>
                </div>

                <div className="space-y-3">
                  {existingBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id || index}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                      className="group relative overflow-hidden rounded-2xl border border-[#E8E2D2] hover:border-[#D4AF37] bg-white hover:shadow-lg transition-all"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#D4AF37] to-[#B8860B]" />
                      <div className="p-5 pl-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                        <div className="flex-1 min-w-0">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </span>
                          <h3 className="mt-2 text-lg font-serif text-[#2a1810] truncate">{booking.seva}</h3>
                          <p className="text-sm text-[#6b5842] mt-1 flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {booking.date?.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <button
                          onClick={() => { setBookingData(booking); setCurrentStep("RECEIPT"); }}
                          className="w-full md:w-auto bg-[#2a1810] hover:bg-[#1a0d08] text-[#F5E6C8] font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm inline-flex items-center justify-center gap-2"
                        >
                          <FileText className="w-4 h-4" /> View e-Pass
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentStep("FORM")}
                  className="mt-6 w-full bg-white border-2 border-dashed border-[#D4AF37] text-[#B8860B] hover:bg-[#FFFDF8] font-bold py-4 rounded-2xl transition-all flex justify-center items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Book Another Seva
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: FORM */}
          {currentStep === "FORM" && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-[#FFFDF8] rounded-3xl border border-[#D4AF37]/20 shadow-2xl overflow-hidden">
                {/* Form header */}
                <div className="bg-gradient-to-r from-[#2a1810] to-[#3a2418] px-6 sm:px-8 py-6 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37]">Seva Details</p>
                    <h2 className="text-xl sm:text-2xl font-serif text-[#F5E6C8] mt-1">{bookingData.seva}</h2>
                  </div>
                  <button onClick={resetFlow} className="text-xs text-[#C9B896] hover:text-white uppercase tracking-widest">
                    Cancel
                  </button>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-800 text-sm p-4 rounded-r-xl whitespace-pre-line">
                      {error}
                    </div>
                  )}

                  {/* Devotee */}
                  <section>
                    <h3 className="flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] uppercase text-[#B8860B] mb-4">
                      <User className="w-3.5 h-3.5" /> Devotee Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Full Name">
                        <input
                          type="text"
                          value={bookingData.name}
                          onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                          className={inputCls}
                          placeholder="As per records"
                        />
                      </Field>
                      <Field label="Participants" icon={<Users className="w-3.5 h-3.5" />}>
                        <select
                          value={bookingData.participants}
                          onChange={(e) => setBookingData({ ...bookingData, participants: e.target.value })}
                          className={inputCls + " appearance-none"}
                        >
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} {i === 0 ? "Person" : "Persons"}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </section>

                  {/* Address */}
                  <section>
                    <h3 className="flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] uppercase text-[#B8860B] mb-4">
                      <MapPin className="w-3.5 h-3.5" /> Residential Address
                    </h3>
                    <div className="space-y-4">
                      <Field label="House / Building / Street">
                        <input
                          type="text"
                          value={bookingData.addressLine1}
                          onChange={(e) => setBookingData({ ...bookingData, addressLine1: e.target.value })}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Area / Locality / Landmark">
                        <input
                          type="text"
                          value={bookingData.addressLine2}
                          onChange={(e) => setBookingData({ ...bookingData, addressLine2: e.target.value })}
                          className={inputCls}
                        />
                      </Field>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="City / Town / Village">
                          <input
                            type="text"
                            value={bookingData.city}
                            onChange={(e) => setBookingData({ ...bookingData, city: e.target.value })}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="District">
                          <input
                            type="text"
                            value={bookingData.district}
                            onChange={(e) => setBookingData({ ...bookingData, district: e.target.value })}
                            className={inputCls}
                          />
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="State">
                          <input
                            type="text"
                            value={bookingData.state}
                            onChange={(e) => setBookingData({ ...bookingData, state: e.target.value })}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Pincode">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={bookingData.pincode}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                              setBookingData((prev) => ({
                                ...prev,
                                pincode: value,
                                date:
                                  value === "577401" && prev.date && isWeekend(prev.date)
                                    ? null
                                    : prev.date,
                              }));
                              if (value === "577401" && bookingData.date && isWeekend(bookingData.date)) {
                                setError(weekendRestrictionMessage);
                              } else {
                                setError("");
                              }
                            }}
                            className={inputCls}
                          />
                        </Field>
                      </div>

                      {isLocalPincode && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-900">
                          <p className="font-semibold">Saturday and Sunday are reserved for devotees coming from outside Sagara. Please select a weekday.</p>
                          <p className="mt-1 opacity-80">ಶನಿವಾರ ಮತ್ತು ಭಾನುವಾರ ಸಾಗರದ ಹೊರಗಿನಿಂದ ಬರುವ ಭಕ್ತರಿಗಾಗಿ ಮೀಸಲಾಗಿರುತ್ತದೆ. ದಯವಿಟ್ಟು ವಾರದ ದಿನವನ್ನು ಆಯ್ಕೆಮಾಡಿ.</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Date */}
                  <section>
                    <h3 className="flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] uppercase text-[#B8860B] mb-4">
                      <CalendarIcon className="w-3.5 h-3.5" /> Preferred Date
                    </h3>
                    <Field label="Choose your date">
                      <DatePicker
                        selected={bookingData.date}
                        onChange={handleDateChange}
                        minDate={START_DATE}
                        maxDate={END_DATE}
                        filterDate={(date) => (isLocalPincode ? !isWeekend(date) : true)}
                        dateFormat="dd MMMM yyyy"
                        placeholderText="Select Date"
                        className={inputCls}
                      />
                    </Field>
                  </section>

                  {/* Submit */}
                  <button
                    onClick={handleBookingSubmit}
                    disabled={
                      isLoading ||
                      !bookingData.name ||
                      !bookingData.date ||
                      !bookingData.addressLine1 ||
                      !bookingData.city ||
                      !bookingData.pincode
                    }
                    className="w-full bg-gradient-to-r from-orange-600 via-[#B8860B] to-[#D4AF37] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex justify-center items-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm Seva Booking <ChevronRight className="w-5 h-5" /></>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: RECEIPT */}
          {currentStep === "RECEIPT" && (
            <motion.div key="receipt" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div id="seva-receipt" className="relative bg-gradient-to-b from-[#FFFDF8] to-[#F9F1E1] rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/40">
                {/* Ticket top */}
                <div className="relative bg-gradient-to-br from-[#2a1810] via-[#3a2418] to-[#2a1810] p-8 text-center">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent" />
                  <div className="inline-flex w-14 h-14 rounded-full bg-gradient-to-br from-[#FFD700] to-[#B8860B] items-center justify-center mb-3 shadow-lg">
                    <span className="text-2xl">🪔</span>
                  </div>
                  <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4AF37]">Karki Mutt Chaturmasya</p>
                  <h2 className="text-2xl sm:text-3xl font-serif text-[#F5E6C8] mt-1">Seva e-Pass</h2>
                  <p className="text-xs text-[#C9B896] mt-1">Sagara, Karnataka · 2026</p>
                </div>

                {/* Perforation */}
                <div className="relative h-6 bg-[#2a1810]">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1a0d08]" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1a0d08]" />
                  <div className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-[#D4AF37]/40" />
                </div>

                {/* Body */}
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-white rounded-2xl border border-[#E8E2D2] shadow-sm">
                      <QRCodeCanvas value={bookingData.bookingId || "N/A"} size={140} level="H" />
                    </div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#8b6f47] mt-4">Booking Reference</p>
                    <p className="text-xl font-mono font-bold text-[#2a1810] mt-1 tracking-wider">{bookingData.bookingId}</p>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
                    <ReceiptRow label="Seva Type" value={bookingData.seva} />
                    <ReceiptRow label="Devotee" value={bookingData.name} />
                    <ReceiptRow label="Date" value={formattedReceiptDate} />
                    <ReceiptRow label="Participants" value={bookingData.participants} />
                  </div>

                  <div className="mt-8 pt-6 border-t border-dashed border-[#D4AF37]/40 text-center">
                    <p className="text-xs text-[#6b5842] leading-relaxed">
                      Please present this QR code at the temple entrance.<br />
                      <span className="text-[#B8860B] font-medium">May the divine blessings be with you.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 no-print">
                <button
                  onClick={resetFlow}
                  className="w-full bg-white border border-[#D4AF37]/40 text-[#2a1810] hover:bg-[#FFFDF8] font-semibold py-3.5 rounded-2xl transition-all"
                >
                  Done
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg inline-flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Download PDF / Print
                </button>
              </div>

              <style>{`
                @media print {
                  body * { visibility: hidden; }
                  #seva-receipt, #seva-receipt * { visibility: visible; }
                  #seva-receipt {
                    position: absolute; left: 0; top: 0; width: 100%;
                    border: none !important; box-shadow: none !important;
                  }
                  .no-print { display: none !important; }
                }
              `}</style>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- Small subcomponents / styles ---
const inputCls =
  "w-full border border-[#E8E2D2] bg-white focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 p-3.5 rounded-xl transition outline-none text-[#2a1810]";

const Field = ({ label, icon, children }) => (
  <label className="block">
    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8b6f47] mb-1.5">
      {icon} {label}
    </span>
    {children}
  </label>
);

const ReceiptRow = ({ label, value }) => (
  <div>
    <p className="text-[10px] tracking-[0.25em] uppercase text-[#8b6f47]">{label}</p>
    <p className="text-[#2a1810] font-semibold mt-1 break-words">{value}</p>
  </div>
);

export default BookSeva;
