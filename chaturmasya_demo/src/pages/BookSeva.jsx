import { useState, useEffect } from "react";
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
  Map,
  Check
} from "lucide-react";

// --- CONSTANTS & HELPERS ---
const START_DATE = new Date(2026, 6, 29);
const END_DATE = new Date(2026, 8, 26);

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const MAIN_STEPS = [
  { key: "MOBILE", label: "Verify" },
  { key: "FORM", label: "Details" },
  { key: "RECEIPT", label: "e-Pass" },
];

const FORM_SUB_STEPS = [
  { id: 1, title: "Devotee Info", icon: User },
  { id: 2, title: "Address Details", icon: MapPin },
  { id: 3, title: "Date & Confirm", icon: CalendarIcon },
];

const BookSeva = () => {
  const [currentStep, setCurrentStep] = useState("MOBILE");
  const [formStep, setFormStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [existingBookings, setExistingBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Track window resize to ensure DatePicker renders correctly inline on desktop
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const KARNATAKA_DISTRICTS = [
    "Bagalkote", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
    "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
    "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri",
    "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur",
    "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada",
    "Vijayapura", "Yadgir", "Vijayanagara",
  ];

  const resetFlow = () => {
    setMobile("");
    setExistingBookings([]);
    setError("");
    setCurrentStep("MOBILE");
    setFormStep(1);
    setBookingData({
      bookingId: "", name: "", addressLine1: "", addressLine2: "",
      city: "", district: "", state: "Karnataka", pincode: "",
      date: null, seva: "Physical Pada Pooja", participants: "1",
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
        setFormStep(1);
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

  // Step Validation Logic
  const isStep1Valid = bookingData.name.trim().length > 0;
  const isStep2Valid =
    bookingData.addressLine1.trim().length > 0 &&
    bookingData.city.trim().length > 0 &&
    bookingData.pincode.trim().length === 6 &&
    (bookingData.state === "Others" || bookingData.district !== "");
  const isStep3Valid = bookingData.date !== null;

  const stepIndex = currentStep === "MOBILE" ? 0 : currentStep === "FORM" || currentStep === "EXISTING" ? 1 : 2;

  return (
    <div 
      className={`font-sans flex flex-col bg-gradient-to-b from-[#1a0d08] via-[#2a1810] to-[#1a0d08] relative overflow-x-hidden ${
        currentStep === "FORM" ? "min-h-screen lg:h-screen lg:overflow-hidden" : "min-h-screen"
      }`}
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: `radial-gradient(circle at 20% 10%, #FFD700 0px, transparent 40%), radial-gradient(circle at 80% 80%, #FF6B00 0px, transparent 40%)`,
      }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />

      {/* NAV */}
      <nav className="relative z-10 border-b border-[#D4AF37]/15 backdrop-blur-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-[#F5E6C8] hover:text-[#FFD700] transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]/70">
            <Sparkles className="w-3 h-3" /> Chaturmasya 2026
          </div>
        </div>
      </nav>

      {/* HEADER (Hidden during the FORM step on large screens to maximize space) */}
      {currentStep !== "FORM" && (
        <header className="relative z-10 pt-2 sm:pt-10 pb-4 px-4 sm:px-6 text-center flex flex-col items-center shrink-0">
          <p className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] mb-1">Sacred Reservation</p>
          <h1 className="text-2xl sm:text-4xl font-serif text-[#F5E6C8] leading-tight">Physical Pada Pooja</h1>
          
          <div className="mt-6 flex items-center justify-center gap-2 sm:gap-3">
            {MAIN_STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2 sm:gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] sm:text-[11px] font-semibold tracking-wide uppercase transition-all
                  ${i <= stepIndex ? "bg-[#D4AF37] text-[#1a0d08]" : "bg-white/5 text-[#C9B896]/50 border border-white/10"}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    i < stepIndex ? "bg-[#1a0d08] text-[#D4AF37]" : i === stepIndex ? "bg-[#1a0d08]/20" : "bg-white/10"
                  }`}>
                    {i < stepIndex ? "✓" : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < MAIN_STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-[#D4AF37]/40" />}
              </div>
            ))}
          </div>
        </header>
      )}

      {/* MAIN CONTENT AREA */}
      <main className={`relative z-10 mx-auto px-4 sm:px-6 w-full flex-grow flex flex-col ${
        currentStep === "FORM" ? "max-w-6xl py-6 lg:py-8 lg:min-h-0" : "max-w-3xl py-6"
      }`}>
        <AnimatePresence mode="wait">
          
          {/* STEP 1: MOBILE */}
          {currentStep === "MOBILE" && (
            <motion.div key="mobile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="relative mt-2">
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#D4AF37]/40 via-transparent to-[#D4AF37]/20 blur-xl opacity-60" />
                <div className="relative bg-[#FFFDF8] rounded-2xl border border-[#D4AF37]/20 shadow-2xl p-3 sm:p-10">
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
                        className="w-full border-2 border-[#E8E2D2] bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 pl-20 pr-4 py-4 rounded-2xl text-lg font-medium tracking-wider transition-all outline-none"
                        placeholder="10-digit number"
                      />
                    </div>

                    <button
                      onClick={checkMobile}
                      disabled={mobile.length < 10 || isLoading}
                      className="mt-6 w-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#FFD700] disabled:opacity-40 disabled:cursor-not-allowed text-[#1a0d08] font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#1a0d08]" /> : <>Continue <ChevronRight className="w-5 h-5" /></>}
                    </button>

                    <p className="text-center text-xs text-[#8b6f47]/70 mt-5 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Your number is used only to link your bookings
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: EXISTING BOOKINGS */}
          {currentStep === "EXISTING" && (
            <motion.div key="existing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-[#FFFDF8] rounded-3xl border border-[#D4AF37]/20 shadow-2xl p-6 sm:p-8">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6 border-b border-[#E8E2D2] pb-6">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#B8860B] font-bold">Sacred Schedule</p>
                    <h2 className="text-2xl sm:text-3xl font-serif text-[#2a1810] mt-1">Upcoming Sevas</h2>
                  </div>
                  <button onClick={resetFlow} className="text-sm font-medium text-[#8b6f47] hover:text-[#B8860B] underline underline-offset-4">
                    Change Number
                  </button>
                </div>

                <div className="space-y-4">
                  {existingBookings.map((booking, index) => (
                    <motion.div key={booking.id || index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                      className="group relative overflow-hidden rounded-2xl border border-[#E8E2D2] hover:border-[#D4AF37] bg-white hover:shadow-lg transition-all"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#D4AF37] to-[#B8860B]" />
                      <div className="p-5 pl-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        <div className="flex-1 min-w-0">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full mb-2">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </span>
                          <h3 className="text-lg sm:text-xl font-serif text-[#2a1810] truncate">{booking.seva}</h3>
                          <p className="text-sm text-[#6b5842] mt-1.5 flex items-center gap-1.5 font-medium">
                            <CalendarIcon className="w-4 h-4 text-[#B8860B]" />
                            {booking.date?.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <button
                          onClick={() => { setBookingData(booking); setCurrentStep("RECEIPT"); }}
                          className="w-full sm:w-auto bg-[#2a1810] hover:bg-[#1a0d08] text-[#F5E6C8] font-semibold px-6 py-3 rounded-xl transition-colors text-sm inline-flex items-center justify-center gap-2"
                        >
                          <FileText className="w-4 h-4" /> View e-Pass
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={() => { setCurrentStep("FORM"); setFormStep(1); }}
                  className="mt-8 w-full bg-white border-2 border-dashed border-[#D4AF37]/50 text-[#B8860B] hover:bg-[#FFFDF8] hover:border-[#D4AF37] font-bold py-4 rounded-2xl transition-all flex justify-center items-center gap-2 shadow-sm"
                >
                  <Plus className="w-5 h-5" /> Book Another Seva
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: FORM WIZARD */}
          {currentStep === "FORM" && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-grow flex flex-col lg:min-h-0">
              
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-grow lg:min-h-0">
                
                {/* LEFT SIDEBAR (Desktop) / TOP HEADER (Mobile) */}
                <div className="lg:w-1/3 flex flex-col gap-6 shrink-0 lg:overflow-y-auto hide-scrollbar">
                  {/* Title Card */}
                  <div className="bg-gradient-to-br from-[#2a1810] to-[#1a0d08] rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/20 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="w-24 h-24 text-[#D4AF37]" /></div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-bold mb-2">New Booking</p>
                    <h2 className="text-2xl sm:text-3xl font-serif text-[#F5E6C8] relative z-10">{bookingData.seva}</h2>
                    <button onClick={resetFlow} className="mt-4 text-xs text-[#C9B896] hover:text-white underline underline-offset-4 relative z-10 transition-colors">
                      Cancel & Go Back
                    </button>
                  </div>

                  {/* Desktop Stepper */}
                  <div className="hidden lg:block bg-[#FFFDF8] rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/20 shadow-xl mb-6">
                    <h3 className="text-sm font-bold text-[#8b6f47] uppercase tracking-widest mb-6">Booking Steps</h3>
                    <div className="space-y-6">
                      {FORM_SUB_STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isCompleted = formStep > step.id;
                        const isActive = formStep === step.id;
                        return (
                          <div key={step.id} className="flex items-start gap-4 relative">
                            {idx !== FORM_SUB_STEPS.length - 1 && (
                              <div className={`absolute left-5 top-10 bottom-[-24px] w-0.5 ${isCompleted ? 'bg-[#D4AF37]' : 'bg-[#E8E2D2]'}`} />
                            )}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-white transition-colors duration-300 shrink-0 ${
                              isCompleted ? 'bg-[#D4AF37] border-[#D4AF37] text-white' : 
                              isActive ? 'border-[#B8860B] text-[#B8860B] shadow-[0_0_15px_rgba(184,134,11,0.2)]' : 'border-[#E8E2D2] text-[#C9B896]'
                            }`}>
                              {isCompleted ? <Check className="w-5 h-5 text-[#1a0d08]" /> : <Icon className="w-4 h-4" />}
                            </div>
                            <div className="pt-2">
                              <p className={`text-sm font-bold ${isActive ? 'text-[#2a1810]' : isCompleted ? 'text-[#6b5842]' : 'text-[#C9B896]'}`}>
                                {step.title}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Horizontal Stepper */}
                  <div className="lg:hidden flex items-center justify-between px-2">
                    {FORM_SUB_STEPS.map((step, idx) => (
                       <div key={step.id} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                            formStep === step.id ? 'bg-[#D4AF37] text-[#1a0d08] ring-4 ring-[#D4AF37]/20' : 
                            formStep > step.id ? 'bg-[#2a1810] text-[#D4AF37]' : 'bg-white text-[#C9B896] border border-[#E8E2D2]'
                          }`}>
                            {formStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                          </div>
                          {idx !== FORM_SUB_STEPS.length - 1 && (
                            <div className={`h-1 w-12 sm:w-24 mx-2 rounded-full ${formStep > step.id ? 'bg-[#2a1810]' : 'bg-white/10'}`} />
                          )}
                       </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT CONTENT AREA (Internal Scrolling on Desktop) */}
                <div className="lg:w-2/3 flex flex-col flex-grow lg:min-h-0">
                  <div className="bg-[#FFFDF8] rounded-3xl border border-[#D4AF37]/20 shadow-2xl overflow-hidden flex flex-col flex-grow lg:min-h-0">
                    
                    {error && (
                      <div className="m-6 mb-0 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm p-4 rounded-r-xl whitespace-pre-line flex items-start gap-3 shrink-0">
                        <ShieldCheck className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                        <p>{error}</p>
                      </div>
                    )}

                    {/* Scrollable Form Body */}
                    <div className="p-6 sm:p-8 flex-grow overflow-y-auto hide-scrollbar">
                      
                      {/* SUB-STEP 1: DEVOTEE INFO */}
                      {formStep === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <h3 className="text-xl font-serif text-[#2a1810] border-b border-[#E8E2D2] pb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-[#B8860B]" /> Devotee Details
                          </h3>
                          <div className="space-y-5">
                            <Field label="Full Name">
                              <input
                                type="text"
                                value={bookingData.name}
                                onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                                className={inputCls}
                                placeholder="Name as per records"
                                autoFocus
                              />
                            </Field>
                            <Field label="Number of Participants" icon={<Users className="w-3.5 h-3.5" />}>
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
                        </motion.div>
                      )}

                      {/* SUB-STEP 2: ADDRESS */}
                      {formStep === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <h3 className="text-xl font-serif text-[#2a1810] border-b border-[#E8E2D2] pb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-[#B8860B]" /> Residential Address
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="Pincode" className="md:col-span-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={bookingData.pincode}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                                  setBookingData((prev) => ({
                                    ...prev,
                                    pincode: value,
                                    date: value === "577401" && prev.date && isWeekend(prev.date) ? null : prev.date,
                                  }));
                                  if (value === "577401" && bookingData.date && isWeekend(bookingData.date)) {
                                    setError(weekendRestrictionMessage);
                                  } else {
                                    setError("");
                                  }
                                }}
                                className={inputCls}
                                placeholder="6-digit PIN"
                              />
                            </Field>

                            <Field label="State">
                              <select
                                value={bookingData.state}
                                onChange={(e) => {
                                  const state = e.target.value;
                                  setBookingData((prev) => ({
                                    ...prev, state, district: state === "Others" ? "Others" : "",
                                  }));
                                }}
                                className={inputCls}
                              >
                                <option value="Karnataka">Karnataka</option>
                                <option value="Others">Others</option>
                              </select>
                            </Field>
                            
                            <Field label="District">
                              <select
                                value={bookingData.district}
                                disabled={bookingData.state === "Others"}
                                onChange={(e) => setBookingData({ ...bookingData, district: e.target.value })}
                                className={inputCls}
                              >
                                <option value="">Select District</option>
                                {bookingData.state === "Karnataka" && KARNATAKA_DISTRICTS.map((district) => (
                                  <option key={district} value={district}>{district}</option>
                                ))}
                                {bookingData.state === "Others" && <option value="Others">Others</option>}
                              </select>
                            </Field>

                            <Field label="City / Town / Village" className="md:col-span-2">
                              <input
                                type="text"
                                value={bookingData.city}
                                onChange={(e) => setBookingData({ ...bookingData, city: e.target.value })}
                                className={inputCls}
                              />
                            </Field>

                            <Field label="House / Building / Street" className="md:col-span-2">
                              <input
                                type="text"
                                value={bookingData.addressLine1}
                                onChange={(e) => setBookingData({ ...bookingData, addressLine1: e.target.value })}
                                className={inputCls}
                              />
                            </Field>

                            <Field label="Area / Locality (Optional)" className="md:col-span-2">
                              <input
                                type="text"
                                value={bookingData.addressLine2}
                                onChange={(e) => setBookingData({ ...bookingData, addressLine2: e.target.value })}
                                className={inputCls}
                              />
                            </Field>
                          </div>
                        </motion.div>
                      )}

                      {/* SUB-STEP 3: DATE & CONFIRM */}
                      {formStep === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <h3 className="text-xl font-serif text-[#2a1810] border-b border-[#E8E2D2] pb-4 flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-[#B8860B]" /> Select Date
                          </h3>
                          
                          {isLocalPincode && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 shadow-sm">
                              <p className="font-semibold flex items-center gap-2"><Map className="w-4 h-4" /> Local Devotee Notice</p>
                              <p className="mt-2 opacity-90">Saturday and Sunday are reserved for devotees coming from outside Sagara. Please select a weekday.</p>
                              <p className="mt-1 text-xs opacity-70">ಶನಿವಾರ ಮತ್ತು ಭಾನುವಾರ ಸಾಗರದ ಹೊರಗಿನಿಂದ ಬರುವ ಭಕ್ತರಿಗಾಗಿ ಮೀಸಲಾಗಿರುತ್ತದೆ.</p>
                            </div>
                          )}

                          <div className="py-6 flex flex-col justify-center items-center">
                            <Field label="Choose your preferred date" className="w-full max-w-sm mx-auto text-center items-center flex flex-col">
                              <DatePicker
                                selected={bookingData.date}
                                onChange={handleDateChange}
                                minDate={START_DATE}
                                maxDate={END_DATE}
                                filterDate={(date) => (isLocalPincode ? !isWeekend(date) : true)}
                                dateFormat="dd MMMM yyyy"
                                placeholderText="Tap to select date"
                                className={`${inputCls} text-center text-lg font-medium shadow-inner`}
                                inline={isDesktop} // Render inline directly on desktop to avoid popover clipping
                              />
                            </Field>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* WIZARD FOOTER (Pinned to Bottom) */}
                    <div className="bg-[#fcfaf5] border-t border-[#E8E2D2] p-4 sm:p-6 flex items-center justify-between shrink-0">
                      {formStep > 1 ? (
                        <button 
                          onClick={() => setFormStep(p => p - 1)}
                          className="px-5 py-3 rounded-xl font-semibold text-[#8b6f47] hover:bg-[#E8E2D2]/50 transition-colors"
                        >
                          Back
                        </button>
                      ) : (
                        <div /> // Spacer
                      )}

                      {formStep < 3 ? (
                        <button
                          onClick={() => setFormStep(p => p + 1)}
                          disabled={(formStep === 1 && !isStep1Valid) || (formStep === 2 && !isStep2Valid)}
                          className="bg-[#2a1810] hover:bg-[#1a0d08] disabled:opacity-30 disabled:cursor-not-allowed text-[#F5E6C8] font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2 shadow-md"
                        >
                          Next Step <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleBookingSubmit}
                          disabled={isLoading || !isStep3Valid}
                          className="bg-gradient-to-r from-orange-600 via-[#B8860B] to-[#D4AF37] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-[#1a0d08] font-bold px-6 sm:px-8 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm <span className="hidden sm:inline">Booking</span> <CheckCircle2 className="w-5 h-5" /></>}
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: RECEIPT */}
          {currentStep === "RECEIPT" && (
            <motion.div key="receipt" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="max-w-md mx-auto">
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
                  <div className="relative h-6 bg-[#1a0d08]">
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
                    className="w-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-[#1a0d08] font-bold py-3.5 rounded-2xl transition-all shadow-lg inline-flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Download e-Pass
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        /* Hide scrollbar classes */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        /* Print formatting */
        @media print {
          body * { visibility: hidden; }
          #seva-receipt, #seva-receipt * { visibility: visible; }
          #seva-receipt {
            position: absolute; left: 0; top: 0; width: 100%; max-width: 100%;
            border: none !important; box-shadow: none !important; background: white !important;
          }
          .no-print { display: none !important; }
        }

        /* Customize datepicker inline style for aesthetics */
        .react-datepicker { border: none !important; font-family: inherit !important; }
        .react-datepicker__header { background-color: #FFFDF8 !important; border-bottom: 1px solid #E8E2D2 !important; }
        .react-datepicker__day--selected { background-color: #B8860B !important; }
        .react-datepicker__day:hover { background-color: #D4AF37 !important; color: white !important; }
      `}</style>
    </div>
  );
};

// --- Small subcomponents / styles ---
const inputCls =
  "w-full border-2 border-[#E8E2D2] bg-[#fcfaf5] focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 p-3.5 rounded-xl transition-all outline-none text-[#2a1810] font-medium";

const Field = ({ label, icon, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8b6f47] mb-2">
      {icon} {label}
    </label>
    {children}
  </div>
);

const ReceiptRow = ({ label, value }) => (
  <div>
    <p className="text-[10px] tracking-[0.25em] uppercase text-[#8b6f47]">{label}</p>
    <p className="text-[#2a1810] font-bold mt-1 break-words">{value}</p>
  </div>
);

export default BookSeva;