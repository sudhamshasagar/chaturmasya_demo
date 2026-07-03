import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { QRCodeCanvas } from "qrcode.react";
import "react-datepicker/dist/react-datepicker.css";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp, doc,
  runTransaction
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const AdminBookSeva = () => {
  const navigate = useNavigate();

  // Flow states: 'type_selection', 'mobile_input', 'existing_bookings', 'book_form', 'receipt'
  const [currentView, setCurrentView] = useState("type_selection");
  const [sevaType, setSevaType] = useState(""); // 'Physical' or 'Virtual'
  const [mobileInput, setMobileInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [bookingData, setBookingData] = useState({
    bookingId: "",
    mobile: "",
    name: "",
    address: "",
    gothra: "",
    nakshatra: "",
    participants: "1",
    date: null,
    time: "",
  });

  const [existingBookings, setExistingBookings] = useState([]);

  // Time slots adapted for Admin flexibilty
  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
    "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM"
  ];

  // --- Handlers ---
  const handleTypeSelect = (type) => {
    setSevaType(type);
    setCurrentView("mobile_input");
    setError("");
  };

  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const handleMobileCheck = async () => {
    if (!mobileInput || mobileInput.length < 10) return;
    setIsLoading(true);
    setError("");

    try {
      const q = query(collection(db, "bookings"), where("mobile", "==", mobileInput));
      const snapshot = await getDocs(q);
      const today = normalizeDate(new Date());

      const upcoming = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(data => {
          if (!data.date) return false;
          const bDate = data.date.toDate ? data.date.toDate() : new Date(data.date);
          return normalizeDate(bDate) >= today;
        })
        .sort((a, b) => ((a.date?.toDate() || 0) > (b.date?.toDate() || 0) ? 1 : -1));

      if (upcoming.length > 0) {
        setExistingBookings(upcoming);
        setCurrentView("existing_bookings");
      } else {
        setBookingData({ ...bookingData, mobile: mobileInput });
        setCurrentView("book_form");
      }
    } catch (err) {
      console.error("Error fetching admin bookings:", err);
      setError("Failed to fetch existing records. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const normalizedBookingDate = normalizeDate(bookingData.date);
      
      // Optional: Duplicate Slot Check
      const slotQuery = query(
        collection(db, "bookings"),
        where("date", "==", Timestamp.fromDate(normalizedBookingDate)),
        where("time", "==", bookingData.time),
        where("seva", "==", `${sevaType} Pada Puja`)
      );
      
      const existingSlot = await getDocs(slotQuery);
      
      if (!existingSlot.empty) {
        setError("This exact slot is already booked in the system. Please select another time.");
        setIsLoading(false);
        return;
      }

      const counterRef = doc(db, "counters", "bookingCounter");

      const bookingId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);

        if (!counterDoc.exists()) {
          throw new Error("Booking counter does not exist.");
        }

        const nextNumber = counterDoc.data().lastNumber + 1;

        transaction.update(counterRef, {
          lastNumber: nextNumber,
        });

        return `KM26-${String(nextNumber).padStart(3, "0")} (Admin Booked)`;
      });
      
      const newBooking = {
        ...bookingData,
        bookingId,
        seva: `${sevaType} Pada Puja`,
        date: Timestamp.fromDate(normalizedBookingDate),
        createdAt: Timestamp.now(),
        bookedBy: "Admin", // Explicitly saving admin flag to Firestore
      };

      // Clean up empty fields if Physical
      if (sevaType === "Physical") {
        delete newBooking.gothra;
        delete newBooking.nakshatra;
      }

      await addDoc(collection(db, "bookings"), newBooking);
      setBookingData(newBooking);
      setCurrentView("receipt");

    } catch (err) {
      console.error("Admin Booking Error:", err);
      setError("Failed to register the seva. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetFlow = () => {
    setCurrentView("type_selection");
    setSevaType("");
    setMobileInput("");
    setExistingBookings([]);
    setError("");
    setBookingData({
      bookingId: "", mobile: "", name: "", address: "", gothra: "", nakshatra: "", participants: "1", date: null, time: "",
    });
  };

  const handleBack = () => {
    if (currentView === "type_selection") navigate("/admin");
    else if (currentView === "mobile_input") resetFlow();
    else if (currentView === "existing_bookings") setCurrentView("mobile_input");
    else if (currentView === "book_form") setCurrentView("mobile_input");
    else resetFlow();
  };

  const formattedReceiptDate = bookingData.date?.toDate 
    ? bookingData.date.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
    : bookingData.date 
      ? new Date(bookingData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <nav className="flex text-stone-500 text-sm font-bold uppercase tracking-wider">
          <Link to="/admin" className="hover:text-orange-700 transition">Admin</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-900">Walk-in Desk</span>
        </nav>
        <button 
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-orange-600 font-bold text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          {currentView === 'type_selection' ? "Dashboard" : "Go Back"}
        </button>
      </div>

      {/* Header */}
      <div className="mb-8 border-b-2 border-stone-800 pb-4 print:hidden">
        <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900 uppercase tracking-tight">
          Admin Walk-in Booking
        </h1>
        <p className="text-stone-500 font-serif italic mt-1 text-lg">
          Register devotees for physical or virtual sevas directly from the desk.
        </p>
      </div>

      <div className="w-full max-w-3xl mx-auto mt-8 relative">

        {/* Global Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-lg print:hidden">
            {error}
          </div>
        )}

        {/* View 1: Select Seva Type */}
        {currentView === "type_selection" && (
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
            <button 
              onClick={() => handleTypeSelect("Physical")}
              className="group bg-white rounded-3xl p-8 shadow-sm border border-stone-200 hover:border-orange-400 hover:shadow-md transition-all text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">🪔</span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">Physical Pada Puja</h2>
              <p className="text-stone-500 text-sm">Book a walk-in devotee for an in-person seva at the mutt.</p>
            </button>

            <button 
              onClick={() => handleTypeSelect("Virtual")}
              className="group bg-white rounded-3xl p-8 shadow-sm border border-stone-200 hover:border-blue-400 hover:shadow-md transition-all text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">💻</span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">Virtual Pada Puja</h2>
              <p className="text-stone-500 text-sm">Register a devotee for an online Google Meet session.</p>
            </button>
          </div>
        )}

        {/* View 2: Mobile Input */}
        {currentView === "mobile_input" && (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 md:p-10 text-center max-w-md mx-auto animate-fade-in">
            <div className="w-16 h-16 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📱</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Devotee Mobile</h2>
            <p className="text-stone-500 mb-8 text-sm">Enter the number to check existing records.</p>
            
            <input
              type="tel"
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
              maxLength="10"
              className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-4 text-center text-lg font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all mb-4"
              placeholder="10-digit Mobile Number"
            />
            
            <button
              onClick={handleMobileCheck}
              disabled={mobileInput.length < 10 || isLoading}
              className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold py-4 rounded-xl transition-all duration-300 flex justify-center items-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Check Records"
              )}
            </button>
          </div>
        )}

        {/* View 3: Existing Bookings Found */}
        {currentView === "existing_bookings" && (
          <div className="bg-white rounded-3xl shadow-sm border border-orange-200 p-8 md:p-10 max-w-lg mx-auto animate-fade-in text-center">
            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">ℹ️</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Devotee Found</h2>
            <p className="text-stone-600 mb-6 text-sm">
              Records exist for <strong className="text-stone-900">+91 {mobileInput}</strong>.
            </p>

            <div className="space-y-3 mb-8 text-left max-h-60 overflow-y-auto pr-2">
              {existingBookings.map(b => (
                <div key={b.bookingId} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-stone-900">{b.bookingId}</span>
                    <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full uppercase">Confirmed</span>
                  </div>
                  <div className="text-sm text-stone-600 font-medium">{b.seva}</div>
                  <div className="text-xs text-stone-500 mt-1">
                    {b.date?.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {b.time}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setBookingData({ ...bookingData, mobile: mobileInput }); setCurrentView("book_form"); }}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition duration-300 shadow-sm"
            >
              Book New {sevaType} Seva
            </button>
          </div>
        )}

        {/* View 4: Booking Form */}
        {currentView === "book_form" && (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 md:p-10 animate-fade-in">
            <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">{sevaType} Pada Puja</h2>
                <p className="text-sm text-stone-500 font-medium mt-1">Admin Walk-in Registration</p>
              </div>
              <span className="bg-stone-100 text-stone-700 text-sm font-bold px-3 py-1 rounded-lg border border-stone-200">
                📞 {bookingData.mobile}
              </span>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Devotee Name</label>
                  <input
                    type="text"
                    required
                    value={bookingData.name}
                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Participants</label>
                  <select
                    value={bookingData.participants}
                    onChange={(e) => setBookingData({ ...bookingData, participants: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all appearance-none"
                  >
                    {[...Array(15)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1} {i === 0 ? "Person" : "Persons"}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conditional Fields for Virtual */}
              {sevaType === "Virtual" && (
                <div className="grid md:grid-cols-2 gap-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Gothra</label>
                    <input
                      type="text"
                      required
                      value={bookingData.gothra}
                      onChange={(e) => setBookingData({ ...bookingData, gothra: e.target.value })}
                      className="w-full bg-white border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Nakshatra</label>
                    <input
                      type="text"
                      required
                      value={bookingData.nakshatra}
                      onChange={(e) => setBookingData({ ...bookingData, nakshatra: e.target.value })}
                      className="w-full bg-white border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Complete Address</label>
                <textarea
                  required
                  rows="2"
                  value={bookingData.address}
                  onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Select Date</label>
                  <DatePicker
                    selected={bookingData.date}
                    onChange={(date) => setBookingData({ ...bookingData, date })}
                    minDate={new Date()}
                    required
                    dateFormat="dd MMM yyyy"
                    placeholderText="Choose date"
                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Select Time</label>
                  <select
                    required
                    value={bookingData.time}
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all appearance-none"
                  >
                    <option value="" disabled>Time Slot</option>
                    {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100">
                <button
                  type="submit"
                  disabled={isLoading || !bookingData.date || !bookingData.time}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold py-4 rounded-xl text-lg transition duration-300 shadow-md flex justify-center items-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Confirm Registration"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View 5: Receipt */}
        {currentView === "receipt" && (
          <div className="max-w-md mx-auto bg-white rounded-[2rem] shadow-xl border border-stone-200 overflow-hidden animate-fade-in relative">
            
            {/* Printable Area */}
            <div id="admin-receipt" className="print:shadow-none print:border-2 print:border-black">
              {/* Ticket Header */}
              <div className="bg-stone-900 p-8 text-center text-white relative">
                {/* ADMIN BADGE */}
                <div className="absolute top-4 right-4 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md border border-orange-400 transform rotate-2">
                  Booked by Admin
                </div>

                <p className="text-stone-400 text-sm font-bold tracking-widest uppercase mb-1">Official e-Receipt</p>
                <h2 className="text-2xl font-serif font-bold mb-1">{sevaType} Pada Puja</h2>
                <p className="text-stone-300 text-sm opacity-90">Karki Mutt Chaturmasya</p>
              </div>

              {/* Ticket Body */}
              <div className="p-8 bg-white relative">
                <div className="absolute top-0 left-4 right-4 h-px border-t-2 border-dashed border-stone-200"></div>

                <div className="flex justify-center my-6">
                  <div className="p-3 bg-white border-2 border-stone-100 rounded-2xl shadow-sm">
                    <QRCodeCanvas 
                      value={JSON.stringify({ id: bookingData.bookingId, type: sevaType, mobile: bookingData.mobile })} 
                      size={140} 
                      fgColor="#1c1917" 
                    />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-stone-400 text-xs uppercase font-bold tracking-wider mb-1">Booking Reference</p>
                  <p className="text-2xl font-black text-stone-900">{bookingData.bookingId}</p>
                </div>

                <div className="space-y-3 bg-stone-50 rounded-2xl p-5 border border-stone-100">
                  <div className="flex justify-between">
                    <span className="text-stone-500 text-sm font-medium">Devotee</span>
                    <span className="font-bold text-stone-900 text-sm">{bookingData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 text-sm font-medium">Mobile</span>
                    <span className="font-bold text-stone-900 text-sm">{bookingData.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 text-sm font-medium">Participants</span>
                    <span className="font-bold text-stone-900 text-sm">{bookingData.participants}</span>
                  </div>
                  
                  {sevaType === "Virtual" && (
                    <div className="flex justify-between border-t border-stone-200 pt-3 mt-3">
                      <span className="text-stone-500 text-sm font-medium">Gothra/Nakshatra</span>
                      <span className="font-bold text-stone-900 text-sm text-right">{bookingData.gothra} / {bookingData.nakshatra}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-stone-200 pt-3 mt-3">
                    <span className="text-stone-500 text-sm font-medium">Schedule</span>
                    <span className="font-bold text-stone-900 text-sm text-right">
                      {formattedReceiptDate} <br/> {bookingData.time}
                    </span>
                  </div>
                </div>

                <p className="text-center text-xs text-stone-400 mt-6 font-bold uppercase tracking-widest">
                  Issued at Admin Desk
                </p>
              </div>
            </div>

            {/* Footer Actions (Hidden on Print) */}
            <div className="bg-stone-50 p-6 border-t border-stone-100 flex gap-3 print:hidden">
              <button 
                onClick={resetFlow}
                className="flex-1 bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 font-bold py-3 rounded-xl transition text-sm shadow-sm"
              >
                New Booking
              </button>
              <button 
                onClick={handlePrint}
                className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition shadow-md text-sm"
              >
                Print Receipt
              </button>
            </div>

            {/* Print Styles injected directly */}
            <style>{`
              @media print {
                body * { visibility: hidden; }
                #admin-receipt, #admin-receipt * { visibility: visible; }
                #admin-receipt { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; }
              }
            `}</style>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminBookSeva;