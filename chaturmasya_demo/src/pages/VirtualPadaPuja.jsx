import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { QRCodeCanvas } from "qrcode.react";
import "react-datepicker/dist/react-datepicker.css";

const VirtualPadaPuja = () => {
  const navigate = useNavigate();
  const MEET_LINK = "https://meet.google.com/abc-defg-hij";

  // Flow states: 'selection', 'mobile_input', 'book_exists', 'book_form', 'book_receipt', 'join_details'
  const [currentView, setCurrentView] = useState("selection");
  const [flowType, setFlowType] = useState(""); // 'book' or 'join'
  const [mobileInput, setMobileInput] = useState("");

  const [bookingData, setBookingData] = useState({
    bookingId: "",
    mobile: "",
    name: "",
    address: "",
    gothra: "",
    nakshatra: "",
    participants: "1", // Added Participants
    date: null,
    time: "",
  });

  const [mockExistingBooking, setMockExistingBooking] = useState(null);

  // Helper to load mock data for testing
  const loadMockBooking = () => {
    const today = new Date();
    setMockExistingBooking({
      bookingId: "VP26-5542",
      name: "Srinivas Rao",
      mobile: "9999999999",
      date: today,
      time: "02:30 PM", 
      participants: "4",
    });
  };

  const handleMobileSubmit = () => {
    if (flowType === "book") {
      if (mobileInput === "9999999999") {
        // Booking exists for this number
        setCurrentView("book_exists");
      } else {
        // Fresh number, go straight to booking form
        setBookingData({ ...bookingData, mobile: mobileInput });
        setCurrentView("book_form");
      }
    } else if (flowType === "join") {
      if (mobileInput === "9999999999") {
        loadMockBooking();
        setCurrentView("join_details");
      } else {
        alert("No booking found for this number. Try 9999999999");
      }
    }
  };

  const handleBookingSubmit = () => {
    const bookingId = `VP26-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingData({
      ...bookingData,
      bookingId,
    });
    setCurrentView("book_receipt");
  };

  const canJoinMeeting = (targetDate, targetTime) => {
    if (!targetDate || !targetTime) return false;
    
    const now = new Date();
    const dateStr = targetDate.toDateString();
    const bookingDateTime = new Date(`${dateStr} ${targetTime}`);
    
    // 15 minutes before
    const joinTime = new Date(bookingDateTime.getTime() - 15 * 60 * 1000);
    return now >= joinTime;
  };

  const resetFlow = () => {
    setCurrentView("selection");
    setFlowType("");
    setMobileInput("");
    setBookingData({
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
    setMockExistingBooking(null);
  };

  const handleBack = () => {
    if (currentView === "selection") navigate("/");
    else if (currentView === "mobile_input") resetFlow();
    else if (currentView === "book_exists") setCurrentView("mobile_input");
    else if (currentView === "book_form") setCurrentView("mobile_input");
    else if (currentView === "join_details") setCurrentView("mobile_input");
    else resetFlow();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans flex flex-col items-center">
      
      {/* Top Navigation */}
      <div className="w-full max-w-3xl mb-6">
        <button 
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 font-medium transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          {currentView === 'selection' ? "Back to Home" : "Back"}
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-3">
          <span className="text-orange-600">🙏</span> Virtual Pada Puja
        </h1>
        <p className="text-gray-600 mt-3 text-lg">Participate in the sacred rituals from your home</p>
      </div>

      <div className="w-full max-w-3xl">

        {/* View 1: Selection Screen */}
        {currentView === "selection" && (
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
            <button 
              onClick={() => { setFlowType("book"); setCurrentView("mobile_input"); }}
              className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-md transition-all text-left flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">🪔</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Book a Puja</h2>
              <p className="text-gray-500">Schedule a new Virtual Pada Puja session and receive your digital invite.</p>
            </button>

            <button 
              onClick={() => { setFlowType("join"); setCurrentView("mobile_input"); }}
              className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all text-left flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">🎥</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Join a Puja</h2>
              <p className="text-gray-500">Already booked? Get your live meeting link and join the session.</p>
            </button>
          </div>
        )}

        {/* View 2: Shared Mobile Input */}
        {currentView === "mobile_input" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10 text-center max-w-md mx-auto animate-fade-in">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${flowType === 'book' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
              <span className="text-3xl">📱</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {flowType === 'book' ? "Enter Mobile Number" : "Find Your Booking"}
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
              {flowType === 'book' ? "We'll check if you already have a session booked." : "Enter the mobile number used during booking."}
            </p>
            
            <input
              type="tel"
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
              maxLength="10"
              className={`w-full border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 p-4 rounded-xl text-center text-lg font-medium transition duration-200 outline-none mb-4 ${flowType === 'book' ? 'focus:border-orange-500 focus:ring-orange-200' : 'focus:border-blue-500 focus:ring-blue-200'}`}
              placeholder="10-digit Mobile Number"
            />
            
            <button
              onClick={handleMobileSubmit}
              disabled={mobileInput.length < 10}
              className={`w-full text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 ${flowType === 'book' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Continue
            </button>
          </div>
        )}

        {/* View 3: Book - Booking Already Exists */}
        {currentView === "book_exists" && (
          <div className="bg-white rounded-3xl shadow-sm border border-orange-200 p-8 md:p-10 text-center max-w-lg mx-auto animate-fade-in">
            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">ℹ️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Seva Already Exists</h2>
            <p className="text-gray-600 mb-8">
              We found an existing Virtual Pada Puja booking linked to <strong className="text-gray-900">+91 {mobileInput}</strong>. What would you like to do?
            </p>

            <div className="space-y-4">
              <button
                onClick={() => { loadMockBooking(); setCurrentView("join_details"); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition duration-300 shadow-sm flex justify-center items-center gap-2"
              >
                <span>🎥</span> Get Meeting Link
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button
                onClick={() => { setBookingData({ ...bookingData, mobile: mobileInput }); setCurrentView("book_form"); }}
                className="w-full bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-bold py-4 rounded-xl transition duration-300 flex justify-center items-center gap-2"
              >
                <span>🪔</span> Book Another Session
              </button>
            </div>
          </div>
        )}

        {/* View 4: Book - Form */}
        {currentView === "book_form" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">
              Schedule Virtual Pada Puja
            </h2>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Devotee Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={bookingData.name}
                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3.5 rounded-xl transition outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    value={bookingData.mobile}
                    readOnly
                    className="w-full border border-gray-200 bg-gray-100 text-gray-500 p-3.5 rounded-xl outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Gothra</label>
                  <input
                    type="text"
                    placeholder="E.g., Kashyapa"
                    value={bookingData.gothra}
                    onChange={(e) => setBookingData({ ...bookingData, gothra: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3.5 rounded-xl transition outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nakshatra</label>
                  <input
                    type="text"
                    placeholder="E.g., Ashwini"
                    value={bookingData.nakshatra}
                    onChange={(e) => setBookingData({ ...bookingData, nakshatra: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3.5 rounded-xl transition outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Participants</label>
                  <select
                    value={bookingData.participants}
                    onChange={(e) => setBookingData({ ...bookingData, participants: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3.5 rounded-xl transition outline-none appearance-none"
                  >
                    {[...Array(15)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? "Person" : "Persons"}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Complete Address</label>
                <textarea
                  placeholder="Enter your full address"
                  rows="3"
                  value={bookingData.address}
                  onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3.5 rounded-xl transition outline-none resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Date</label>
                  <DatePicker
                    selected={bookingData.date}
                    onChange={(date) => setBookingData({ ...bookingData, date })}
                    minDate={new Date()}
                    placeholderText="Select Date"
                    dateFormat="dd MMM yyyy"
                    className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3.5 rounded-xl transition outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Time</label>
                  <select
                    value={bookingData.time}
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3.5 rounded-xl transition outline-none appearance-none"
                  >
                    <option value="" disabled>Select Time Slot</option>
                    <option>09:00 AM</option>
                    <option>09:30 AM</option>
                    <option>10:00 AM</option>
                    <option>10:30 AM</option>
                    <option>02:30 PM</option> 
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleBookingSubmit}
                  disabled={!bookingData.name || !bookingData.date || !bookingData.time}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold py-4 rounded-xl text-lg transition duration-300 shadow-md hover:shadow-lg"
                >
                  Confirm Virtual Pada Puja
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View 5: Book - Receipt */}
        {currentView === "book_receipt" && (
          <div className="max-w-md mx-auto bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden animate-fade-in relative">
            
            <div className="bg-orange-600 p-8 text-center text-white">
              <p className="text-orange-200 text-sm font-bold tracking-widest uppercase mb-1">Booking Confirmed</p>
              <h2 className="text-2xl font-bold mb-1">Virtual Pada Puja</h2>
              <p className="text-orange-100 text-sm opacity-90">Karki Mutt Chaturmasya</p>
            </div>

            <div className="p-8 bg-white relative">
              <div className="flex justify-center my-4">
                <div className="p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                  <QRCodeCanvas 
                    value={JSON.stringify({ bookingId: bookingData.bookingId, meetLink: MEET_LINK })} 
                    size={120} 
                    fgColor="#ea580c" 
                  />
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Booking Reference</p>
                <p className="text-2xl font-black text-gray-900">{bookingData.bookingId}</p>
              </div>

              <div className="space-y-3 bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Devotee</span>
                  <span className="font-bold text-gray-900 text-sm">{bookingData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Mobile</span>
                  <span className="font-bold text-gray-900 text-sm">{bookingData.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Participants</span>
                  <span className="font-bold text-gray-900 text-sm">{bookingData.participants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Gothra / Nakshatra</span>
                  <span className="font-bold text-gray-900 text-sm">{bookingData.gothra} / {bookingData.nakshatra}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Date & Time</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {bookingData.date?.toLocaleDateString('en-GB')} at {bookingData.time}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <p className="text-sm text-blue-800 font-medium">
                  Return to this page and select "Join a Puja" using your mobile number on the day of your Seva.
                </p>
              </div>
            </div>

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

        {/* View 6: Join - Booking Details & Meet Link */}
        {currentView === "join_details" && mockExistingBooking && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in max-w-xl mx-auto">
            <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Your Session Details</h2>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Confirmed</span>
            </div>
            
            <div className="p-8 text-center space-y-6">
              <div className="grid grid-cols-2 gap-4 text-left bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
                <div><span className="block text-xs text-gray-400 uppercase">Devotee</span><span className="font-bold text-gray-800">{mockExistingBooking.name}</span></div>
                <div><span className="block text-xs text-gray-400 uppercase">Booking ID</span><span className="font-bold text-gray-800">{mockExistingBooking.bookingId}</span></div>
                <div><span className="block text-xs text-gray-400 uppercase">Date</span><span className="font-bold text-gray-800">{mockExistingBooking.date.toLocaleDateString()}</span></div>
                <div><span className="block text-xs text-gray-400 uppercase">Time</span><span className="font-bold text-gray-800">{mockExistingBooking.time}</span></div>
                <div className="col-span-2"><span className="block text-xs text-gray-400 uppercase">Participants</span><span className="font-bold text-gray-800">{mockExistingBooking.participants}</span></div>
              </div>

              <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl">
                <h3 className="font-bold text-gray-900 mb-2">Live Google Meet</h3>
                <p className="text-sm text-gray-500 mb-6">The meeting link activates 15 minutes before your scheduled time.</p>
                
                {canJoinMeeting(mockExistingBooking.date, mockExistingBooking.time) ? (
                  <a
                    href={MEET_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition duration-300 shadow-md"
                  >
                    <span className="text-xl">🎥</span> Join Virtual Puja Now
                  </a>
                ) : (
                  <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-4 rounded-xl cursor-not-allowed border border-gray-200">
                    Meeting opens 15 mins prior
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VirtualPadaPuja;