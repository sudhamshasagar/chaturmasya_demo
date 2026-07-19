import { useState, useMemo } from "react";
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

// --- CONSTANTS & HELPERS ---
const START_DATE = new Date(2026, 6, 29); // July 29, 2026 (0-indexed month)
const END_DATE = new Date(2026, 8, 26);   // September 26, 2026

// Zero out time for accurate Firestore equality checks
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// --- MAIN COMPONENT ---
const BookSeva = () => {
  // State Machine: 'MOBILE' | 'EXISTING' | 'FORM' | 'RECEIPT'
  const [currentStep, setCurrentStep] = useState("MOBILE");
  const [mobile, setMobile] = useState("");
  const [existingBookings, setExistingBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [bookingData, setBookingData] = useState({
    bookingId: "",
    name: "",
    address: "",
    date: null,
    seva: "Physical Pada Pooja",
    participants: "1",
  });
  // --- HANDLERS ---
  const resetFlow = () => {
    setMobile("");
    setExistingBookings([]);
    setError("");
    setCurrentStep("MOBILE");
    setBookingData({
      bookingId: "",
      name: "",
      address: "",
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
        .map((doc) => ({ id: doc.id, ...doc.data() }))
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

      const counterRef = doc(
        db,
        "counters",
        `physicalPadaPooja-${datePrefix}`
      );

      const bookingId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);

        const nextNumber = counterDoc.exists()
          ? (counterDoc.data().lastNumber || 0) + 1
          : 1;

        transaction.set(counterRef, {
          lastNumber: nextNumber,
        });

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

  const handlePrint = () => {
    window.print();
  };

  const formattedReceiptDate = bookingData.date?.toDate
    ? bookingData.date.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : bookingData.date
    ? new Date(bookingData.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="min-h-screen bg-[#FFFDF8] font-sans flex flex-col items-center py-8 px-4 text-[#333333]">
      
      {/* Top Navigation & Header */}
      <div className="w-full max-w-3xl mb-8 flex flex-col items-center print:hidden">
        <div className="w-full flex justify-start mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#555555] hover:text-orange-600 font-medium transition-colors bg-white px-5 py-2.5 rounded-full shadow-sm border border-[#E8E2D2]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Ashram
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex justify-center mb-3">
            <span className="text-4xl">🪔</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#333333] tracking-tight mb-2">
            Physical Pada Pooja
          </h1>
          <p className="text-[#800000] font-medium text-lg opacity-90">
            Reserve your sacred offering
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4 rounded-full"></div>
        </motion.div>
      </div>

      {/* Dynamic Step Content Area */}
      <div className="w-full max-w-3xl relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: MOBILE ENTRY */}
          {currentStep === "MOBILE" && (
            <motion.div
              key="mobile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E8E2D2] p-8 md:p-12 text-center max-w-md mx-auto"
            >
              <h2 className="text-2xl font-bold text-[#333333] mb-2">Welcome Devotee</h2>
              <p className="text-[#666666] mb-8 text-sm">
                Enter your mobile number to view your sacred schedule or arrange a new offering.
              </p>

              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                maxLength="10"
                className="w-full border-2 border-[#E8E2D2] bg-[#FFFDF8] focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 p-4 rounded-xl text-center text-xl font-medium transition-all duration-300 outline-none mb-6"
                placeholder="10-digit Mobile Number"
              />

              <button
                onClick={checkMobile}
                disabled={mobile.length < 10 || isLoading}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Continue"
                )}
              </button>
            </motion.div>
          )}

          {/* STEP 2: EXISTING BOOKINGS */}
          {currentStep === "EXISTING" && (
            <motion.div
              key="existing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E8E2D2] p-6 md:p-10"
            >
              <div className="flex justify-between items-center mb-8 border-b border-[#E8E2D2] pb-4">
                <h2 className="text-2xl font-bold text-[#333333]">Upcoming Sevas</h2>
                <button
                  onClick={resetFlow}
                  className="text-sm text-[#800000] hover:text-orange-600 font-semibold transition-colors"
                >
                  Change Number
                </button>
              </div>

              <div className="space-y-4 mb-8">
                {existingBookings.map((booking, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={booking.bookingId}
                    className="border border-[#E8E2D2] rounded-xl p-5 hover:border-[#D4AF37] hover:shadow-md transition-all bg-[#FFFDF8]"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                          Confirmed
                        </span>
                        <h3 className="text-lg font-bold text-[#333333] mt-3">{booking.seva}</h3>
                        <p className="text-sm text-[#666666] mt-1">
                          {booking.date?.toDate().toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setBookingData(booking);
                          setCurrentStep("RECEIPT");
                        }}
                        className="w-full md:w-auto bg-white border border-[#D4AF37] text-[#333333] hover:bg-[#FFFDF8] font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm shadow-sm"
                      >
                        View e-Pass
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => setCurrentStep("FORM")}
                className="w-full bg-[#FFFDF8] border-2 border-orange-600 text-orange-700 hover:bg-orange-50 font-bold py-4 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2"
              >
                <span className="text-xl">+</span> Book Another Seva
              </button>
            </motion.div>
          )}

          {/* STEP 3: BOOKING FORM */}
          {currentStep === "FORM" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E8E2D2] p-6 md:p-10"
            >
              <div className="flex justify-between items-center mb-8 border-b border-[#E8E2D2] pb-4">
                <h2 className="text-2xl font-bold text-[#333333]">{bookingData.seva}</h2>
                <button
                  onClick={resetFlow}
                  className="text-sm text-[#800000] hover:text-orange-600 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-lg">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#333333] mb-2">Devotee Name</label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={bookingData.name}
                      onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                      className="w-full border border-[#E8E2D2] bg-[#FFFDF8] focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 p-3.5 rounded-xl transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#333333] mb-2">Participants</label>
                    <select
                      value={bookingData.participants}
                      onChange={(e) => setBookingData({ ...bookingData, participants: e.target.value })}
                      className="w-full border border-[#E8E2D2] bg-[#FFFDF8] focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 p-3.5 rounded-xl transition outline-none appearance-none"
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i === 0 ? "Person" : "Persons"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#333333] mb-2">Complete Address</label>
                  <textarea
                    placeholder="Enter your full residential address"
                    value={bookingData.address}
                    onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                    className="w-full border border-[#E8E2D2] bg-[#FFFDF8] focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 p-3.5 rounded-xl transition outline-none resize-none"
                    rows="2"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#333333] mb-2">
                      Preferred Date
                    </label>

                    <DatePicker
                      selected={bookingData.date}
                      onChange={(date) =>
                        setBookingData({
                          ...bookingData,
                          date,
                        })
                      }
                      minDate={START_DATE}
                      maxDate={END_DATE}
                      dateFormat="dd MMMM yyyy"
                      placeholderText="Select Date"
                      className="w-full border border-[#E8E2D2] bg-[#FFFDF8] focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 p-3.5 rounded-xl transition outline-none"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleBookingSubmit}
                    disabled={
                      !bookingData.name.trim() ||
                      !bookingData.address.trim() ||
                      !bookingData.date ||
                      isLoading
                    }
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition duration-300 shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Confirm Seva Booking"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: DIGITAL RECEIPT */}
          {currentStep === "RECEIPT" && (
            <motion.div
              key="receipt"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto"
            >
              {/* Printable Pass Card */}
              <div
                id="seva-receipt"
                className="bg-white rounded-2xl shadow-xl border border-[#D4AF37] overflow-hidden relative print:shadow-none print:border-2 print:border-black"
              >
                {/* Luxury Temple Header */}
                <div className="bg-[#FFFDF8] border-b border-[#E8E2D2] p-8 text-center relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: "radial-gradient(#D4AF37 1px, transparent 1px)", backgroundSize: "10px 10px" }}
                  ></div>
                  <p className="text-[#800000] text-xs font-bold tracking-[0.2em] uppercase mb-2 relative z-10">
                    Karki Mutt Chaturmasya
                  </p>
                  <h2 className="text-2xl font-black text-[#333333] mb-1 relative z-10">Seva e-Pass</h2>
                  <p className="text-[#666666] text-sm relative z-10">Sagara, Karnataka - 2026</p>
                </div>

                {/* Body Details */}
                <div className="p-8 bg-white relative">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-white border border-[#E8E2D2] rounded-xl shadow-sm">
                      <QRCodeCanvas value={bookingData.bookingId || "KM26-0000"} size={140} fgColor="#333333" />
                    </div>
                  </div>

                  <div className="text-center mb-8 border-b border-dashed border-[#E8E2D2] pb-6">
                    <p className="text-[#800000] text-xs uppercase font-bold tracking-widest mb-1">Booking Reference</p>
                    <p className="text-3xl font-black text-[#333333] tracking-wider">{bookingData.bookingId}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[#666666] text-sm">Seva Type</span>
                      <span className="font-bold text-[#333333] text-sm border-b border-[#F5F5F5] flex-grow ml-4 text-right pb-1">
                        {bookingData.seva}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[#666666] text-sm">Devotee</span>
                      <span className="font-bold text-[#333333] text-sm border-b border-[#F5F5F5] flex-grow ml-4 text-right pb-1">
                        {bookingData.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[#666666] text-sm">Date</span>
                      <span className="font-bold text-[#333333] text-sm border-b border-[#F5F5F5] flex-grow ml-4 text-right pb-1">
                        {formattedReceiptDate}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[#666666] text-sm">Participants</span>
                      <span className="font-bold text-[#333333] text-sm border-b border-[#F5F5F5] flex-grow ml-4 text-right pb-1">
                        {bookingData.participants}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-xs text-[#666666] italic">
                      Please present this QR code at the temple entrance.<br />
                      May the divine blessings be with you.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Hidden when Printing) */}
              <div className="mt-6 flex gap-4 print:hidden">
                <button
                  onClick={resetFlow}
                  className="flex-1 bg-white border border-[#E8E2D2] text-[#333333] hover:bg-[#FFFDF8] font-bold py-3.5 rounded-xl transition text-sm shadow-sm"
                >
                  Done
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-[2] bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl transition shadow-md text-sm flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF / Print
                </button>
              </div>

              {/* Dynamic Print CSS */}
              <style>{`
                @media print {
                  body * { visibility: hidden; }
                  #seva-receipt, #seva-receipt * { visibility: visible; }
                  #seva-receipt { 
                    position: absolute; 
                    left: 0; 
                    top: 0; 
                    width: 100%; 
                    border: none !important; 
                    box-shadow: none !important; 
                  }
                }
              `}</style>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookSeva;