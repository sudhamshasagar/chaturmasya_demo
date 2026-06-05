import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { QRCodeCanvas } from "qrcode.react";

const BookSeva = () => {
  const navigate = useNavigate();
  
  const [mobile, setMobile] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showExisting, setShowExisting] = useState(false);

  const [bookingData, setBookingData] = useState({
    bookingId: "",
    name: "",
    address: "",
    date: null,
    time: "",
    seva: "Pada Puja",
    participants: "1",
  });

  const [existingBookings] = useState([
    {
      bookingId: "KM26-0001",
      seva: "Pada Puja",
      date: "15-Jul-2026",
      time: "09:00 AM",
      participants: "2",
    },
  ]);

  const checkMobile = () => {
    // Basic mock check
    if (!mobile) return;

    if (mobile === "9999999999") {
      setShowExisting(true);
      setShowForm(false);
      setShowReceipt(false);
    } else {
      setShowForm(true);
      setShowExisting(false);
      setShowReceipt(false);
    }
  };

  const generateBookingId = () => {
    return `KM26-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleBooking = () => {
    const bookingId = generateBookingId();
    setBookingData({
      ...bookingData,
      bookingId,
    });
    setShowForm(false);
    setShowReceipt(true);
  };

  const resetFlow = () => {
    setMobile("");
    setShowForm(false);
    setShowReceipt(false);
    setShowExisting(false);
    setBookingData({
      bookingId: "",
      name: "",
      address: "",
      date: null,
      time: "",
      seva: "Pada Puja",
      participants: "1",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans flex flex-col items-center">
      
      {/* Top Navigation Back Button */}
      <div className="w-full max-w-2xl mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 font-medium transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-3">
          <span className="text-orange-600">🪔</span> Book Seva
        </h1>
        <p className="text-gray-600 mt-3 text-lg">Reserve your sacred offering online</p>
      </div>

      <div className="w-full max-w-2xl">
        
        {/* Step 1: Mobile Check */}
        {!showForm && !showReceipt && !showExisting && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10 text-center max-w-md mx-auto transform transition-all">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Devotee</h2>
            <p className="text-gray-500 mb-8 text-sm">Enter your mobile number to view existing bookings or create a new one.</p>
            
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              maxLength="10"
              className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-4 rounded-xl text-center text-lg font-medium transition duration-200 outline-none mb-4"
              placeholder="10-digit Mobile Number"
            />
            
            <button
              onClick={checkMobile}
              disabled={mobile.length < 10}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold py-4 rounded-xl transition-all duration-300"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Existing Bookings */}
        {showExisting && !showReceipt && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Bookings</h2>
              <button onClick={resetFlow} className="text-sm text-gray-500 hover:text-orange-600 font-medium">Change Number</button>
            </div>

            <div className="space-y-4 mb-8">
              {existingBookings.map((booking) => (
                <div key={booking.bookingId} className="border border-gray-200 rounded-2xl p-5 hover:border-orange-300 transition-colors bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Confirmed</span>
                      <h3 className="text-xl font-bold text-gray-900 mt-2">{booking.seva}</h3>
                    </div>
                    <span className="text-sm font-medium text-gray-500 border border-gray-300 px-2 py-1 rounded bg-white">{booking.bookingId}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4 mt-4">
                    <div><span className="block text-xs text-gray-400 uppercase">Date</span><span className="font-medium text-gray-800">{booking.date}</span></div>
                    <div><span className="block text-xs text-gray-400 uppercase">Time</span><span className="font-medium text-gray-800">{booking.time}</span></div>
                    <div><span className="block text-xs text-gray-400 uppercase">Participants</span><span className="font-medium text-gray-800">{booking.participants} Persons</span></div>
                  </div>

                  <button className="w-full sm:w-auto bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-bold px-5 py-2.5 rounded-xl transition duration-200 text-sm">
                    Download e-Receipt
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setShowForm(true); setShowExisting(false); }}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition duration-200 flex justify-center items-center gap-2"
            >
              <span>➕</span> Book Another Seva
            </button>
          </div>
        )}

        {/* Step 3: Booking Form */}
        {showForm && !showReceipt && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 animate-fade-in">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                New {bookingData.seva}
              </h2>
              <button onClick={resetFlow} className="text-sm text-gray-500 hover:text-orange-600 font-medium">Cancel</button>
            </div>

            <div className="space-y-6">
              {/* Grid for two-column layout on medium screens */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Devotee Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={bookingData.name}
                    className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3.5 rounded-xl transition outline-none"
                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">No. of Participants</label>
                  <select
                    value={bookingData.participants}
                    className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3.5 rounded-xl transition outline-none appearance-none"
                    onChange={(e) => setBookingData({ ...bookingData, participants: e.target.value })}
                  >
                    {[...Array(15)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? "Person" : "Persons"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Complete Address</label>
                <textarea
                  placeholder="Enter your full address"
                  value={bookingData.address}
                  className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3.5 rounded-xl transition outline-none resize-none"
                  rows="3"
                  onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Date</label>
                  <DatePicker
                    selected={bookingData.date}
                    onChange={(date) => setBookingData({ ...bookingData, date })}
                    dateFormat="dd MMM yyyy"
                    className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3.5 rounded-xl transition outline-none"
                    placeholderText="Select Date"
                    minDate={new Date()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Time</label>
                  <select
                    value={bookingData.time}
                    className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3.5 rounded-xl transition outline-none appearance-none"
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                  >
                    <option value="" disabled>Select Time Slot</option>
                    <option>09:00 AM</option>
                    <option>09:30 AM</option>
                    <option>10:00 AM</option>
                    <option>10:30 AM</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleBooking}
                  disabled={!bookingData.name || !bookingData.date || !bookingData.time}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold py-4 rounded-xl text-lg transition duration-300 shadow-md hover:shadow-lg"
                >
                  Confirm Booking
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Step 4: Digital Receipt */}
        {showReceipt && (
          <div className="max-w-md mx-auto bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden animate-fade-in relative">
            
            {/* Ticket Header */}
            <div className="bg-orange-600 p-8 text-center text-white">
              <p className="text-orange-200 text-sm font-bold tracking-widest uppercase mb-1">Seva e-Receipt</p>
              <h2 className="text-2xl font-bold mb-1">Karki Mutt Chaturmasya</h2>
              <p className="text-orange-100 text-sm opacity-90">Sagara, Karnataka - 2026</p>
            </div>

            {/* Ticket Body */}
            <div className="p-8 bg-white relative">
              {/* Cutouts for ticket effect */}
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-gray-50 rounded-full border-b border-r border-gray-100"></div>
              <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-50 rounded-full border-b border-l border-gray-100"></div>
              
              {/* Dashed Line */}
              <div className="absolute top-0 left-4 right-4 h-px border-t-2 border-dashed border-gray-300"></div>

              <div className="flex justify-center my-6">
                <div className="p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                  <QRCodeCanvas value={bookingData.bookingId} size={140} fgColor="#ea580c" />
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Booking Reference</p>
                <p className="text-2xl font-black text-gray-900">{bookingData.bookingId}</p>
              </div>

              <div className="space-y-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Seva Type</span>
                  <span className="font-bold text-gray-900 text-sm text-right">{bookingData.seva}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Devotee</span>
                  <span className="font-bold text-gray-900 text-sm text-right">{bookingData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Date & Time</span>
                  <span className="font-bold text-gray-900 text-sm text-right">
                    {bookingData.date?.toLocaleDateString('en-GB')} at {bookingData.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Participants</span>
                  <span className="font-bold text-gray-900 text-sm text-right">{bookingData.participants}</span>
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 mt-6 italic">
                This is a computer-generated receipt.<br/>Please present this QR code at the venue.
              </p>
            </div>

            {/* Ticket Footer Actions */}
            <div className="bg-gray-50 p-6 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => navigate("/")}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-100 font-bold py-3 rounded-xl transition text-sm"
              >
                Home
              </button>
              <button className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition shadow-md text-sm">
                Download PDF
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default BookSeva;