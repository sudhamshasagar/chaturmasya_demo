import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { QRCodeCanvas } from "qrcode.react";
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

// -----------------------------------------------------
// SMALL COMPONENTS
// -----------------------------------------------------
const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-start gap-4 py-2 border-b border-dashed border-[#E8E2D2] last:border-0">
    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
      {label}
    </span>
    <span className="text-sm font-bold text-gray-900 text-right break-words">
      {value}
    </span>
  </div>
);

const BookingDetail = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
      {label}
    </p>
    <p className="text-sm sm:text-base font-bold text-gray-900 mt-1 break-words">
      {value}
    </p>
  </div>
);

const SectionCard = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-[#E8E2D2] p-6 sm:p-8 ${className}`}
  >
    {children}
  </div>
);

// -----------------------------------------------------
// MAIN
// -----------------------------------------------------
const VirtualPadaPuja = () => {
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState("selection");
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
    setBookingData({
      bookingId: "",
      mobile: "",
      name: "",
      address: "",
      participants: "1",
      date: null,
      seva: "Virtual Pada Pooja",
      meetLink: MEET_LINK,
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
          setError(
            "No upcoming Virtual Pada Pooja booking was found for this mobile number."
          );
        }
      }
    } catch (err) {
      console.error("Error fetching Virtual Pada Pooja booking:", err);
      setError("Unable to retrieve your booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingSubmit = async () => {
    if (
      !bookingData.name.trim() ||
      !bookingData.address.trim() ||
      !bookingData.date
    ) {
      setError("Please enter your name, detailed address and preferred date.");
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
    else if (currentView === "book_form") setCurrentView("mobile_input");
    else if (currentView === "join_details") setCurrentView("mobile_input");
    else resetFlow();
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBF2] via-[#FDF6E3] to-[#FFFBF2]">
      {/* NAV */}
      <div className="sticky top-0 z-20 backdrop-blur bg-[#FFFBF2]/80 border-b border-[#E8E2D2] print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-orange-700 transition-colors"
          >
            <span aria-hidden>←</span>
            {currentView === "selection" ? "Back" : "Back"}
          </button>
        </div>
      </div>

      {/* HEADER */}
      <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8 text-center">
        <div className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200 text-3xl sm:text-4xl shadow-sm mb-5">
          🙏
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900">
          Virtual Pada Pooja
        </h1>
        <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
          Receive divine blessings from the comfort of your home during the sacred Chaturmasya.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#800000] bg-white/60 border border-[#E8E2D2] rounded-full px-4 py-1.5">
          <span>29 July → 26 September 2026</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {/* SELECTION */}
        {currentView === "selection" && (
          <div className="grid gap-5 sm:gap-6 grid-cols-1 md:grid-cols-2">
            <button
              onClick={() => {
                setFlowType("book");
                setCurrentView("mobile_input");
              }}
              className="group text-left bg-white rounded-3xl p-7 sm:p-8 shadow-sm border border-[#E8E2D2] hover:border-orange-400 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="h-14 w-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-3xl mb-5 group-hover:scale-105 transition-transform">
                🪔
              </div>
              <h3 className="text-xl font-bold text-gray-900">Book Virtual Pada Pooja</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Reserve your Virtual Pada Pooja during Chaturmasya and participate from home.
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-orange-700">
                Book now <span aria-hidden>→</span>
              </span>
            </button>

            <button
              onClick={() => {
                setFlowType("join");
                setCurrentView("mobile_input");
              }}
              className="group text-left bg-white rounded-3xl p-7 sm:p-8 shadow-sm border border-[#E8E2D2] hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl mb-5 group-hover:scale-105 transition-transform">
                🎥
              </div>
              <h3 className="text-xl font-bold text-gray-900">Join Virtual Pada Pooja</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Already booked? Access your Virtual Pada Pooja and join through Google Meet.
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-blue-700">
                Join meeting <span aria-hidden>→</span>
              </span>
            </button>
          </div>
        )}

        {/* MOBILE INPUT */}
        {currentView === "mobile_input" && (
          <SectionCard className="max-w-md mx-auto text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100 text-2xl mb-5">
              📱
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {flowType === "book" ? "Enter Mobile Number" : "Find Your Virtual Pooja"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {flowType === "book"
                ? "Enter your mobile number to continue with the booking."
                : "Enter the mobile number used while booking your Virtual Pada Pooja."}
            </p>

            {error && (
              <div className="mt-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="mt-6 flex items-stretch rounded-xl border border-[#E8E2D2] bg-[#FFFDF8] focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-50 overflow-hidden">
              <span className="px-4 flex items-center text-gray-500 font-semibold border-r border-[#E8E2D2]">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={mobileInput}
                onChange={(e) => {
                  setMobileInput(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                maxLength="10"
                placeholder="10-digit Mobile Number"
                className="flex-1 min-w-0 bg-transparent p-4 text-center text-lg font-medium outline-none"
              />
            </div>

            <button
              onClick={handleMobileSubmit}
              disabled={mobileInput.length !== 10 || isLoading}
              className="mt-5 w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-base shadow-md transition-all"
            >
              {isLoading ? "Checking..." : "Continue"}
            </button>
          </SectionCard>
        )}

        {/* EXISTING BOOKINGS */}
        {currentView === "existing_bookings" && (
          <SectionCard className="max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Your Virtual Pada Pooja Bookings
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              We found the following upcoming bookings for +91 {mobileInput}.
            </p>

            <div className="mt-6 space-y-3">
              {existingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-4 bg-[#FFFDF8] border border-[#E8E2D2] rounded-2xl p-4 sm:p-5"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{booking.name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{formatDate(booking.date)}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#800000] mt-1">
                      {booking.bookingId}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (flowType === "join") {
                        setSelectedBooking(booking);
                        setCurrentView("join_details");
                      } else {
                        setBookingData(booking);
                        setCurrentView("book_receipt");
                      }
                    }}
                    className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl text-sm whitespace-nowrap"
                  >
                    {flowType === "join" ? "View & Join" : "View"}
                  </button>
                </div>
              ))}
            </div>

            {flowType === "book" && (
              <button
                onClick={() => {
                  setBookingData({
                    bookingId: "",
                    mobile: mobileInput,
                    name: "",
                    address: "",
                    participants: "1",
                    date: null,
                    seva: "Virtual Pada Pooja",
                    meetLink: MEET_LINK,
                  });
                  setCurrentView("book_form");
                }}
                className="w-full mt-6 border-2 border-orange-600 text-orange-700 hover:bg-orange-50 font-bold py-3.5 rounded-xl transition-colors"
              >
                + Book Another Virtual Pada Pooja
              </button>
            )}
          </SectionCard>
        )}

        {/* BOOKING FORM */}
        {currentView === "book_form" && (
          <SectionCard className="max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Book Virtual Pada Pooja
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Enter the devotee details below to reserve your Virtual Pada Pooja.
            </p>

            {error && (
              <div className="mt-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Devotee Name *
                  </label>
                  <input
                    type="text"
                    value={bookingData.name}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, name: e.target.value })
                    }
                    placeholder="Full name"
                    className="w-full border border-[#E8E2D2] bg-[#FFFDF8] focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 p-3.5 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={`+91 ${mobileInput}`}
                    disabled
                    className="w-full border border-[#E8E2D2] bg-gray-50 text-gray-500 p-3.5 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Number of Participants
                </label>
                <select
                  value={bookingData.participants}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, participants: e.target.value })
                  }
                  className="w-full border border-[#E8E2D2] bg-[#FFFDF8] focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 p-3.5 rounded-xl outline-none"
                >
                  {[...Array(15)].map((_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1} {i === 0 ? "Person" : "Persons"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Detailed Address *
                </label>
                <textarea
                  rows={3}
                  value={bookingData.address}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, address: e.target.value })
                  }
                  placeholder="House / Street / City / State / PIN"
                  className="w-full border border-[#E8E2D2] bg-[#FFFDF8] focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 p-3.5 rounded-xl outline-none resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Please provide your complete postal address including PIN code.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Preferred Date *
                </label>
                <DatePicker
                  selected={bookingData.date}
                  onChange={(date) => setBookingData({ ...bookingData, date })}
                  minDate={START_DATE}
                  maxDate={END_DATE}
                  dateFormat="dd MMMM yyyy"
                  placeholderText="Select Virtual Pada Pooja Date"
                  wrapperClassName="w-full"
                  className="w-full border border-[#E8E2D2] bg-[#FFFDF8] focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 p-3.5 rounded-xl outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Available from 29 July to 26 September 2026.
                </p>
              </div>

              <button
                onClick={handleBookingSubmit}
                disabled={
                  !bookingData.name.trim() ||
                  !bookingData.address.trim() ||
                  !bookingData.date ||
                  isLoading
                }
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-base sm:text-lg shadow-md transition-all"
              >
                {isLoading ? "Confirming Booking..." : "Confirm Virtual Pada Pooja"}
              </button>
            </div>
          </SectionCard>
        )}

        {/* RECEIPT */}
        {currentView === "book_receipt" && (
          <div className="max-w-md mx-auto">
            <div
              id="virtual-pooja-receipt"
              className="bg-white rounded-3xl shadow-xl border-2 border-[#D4AF37] overflow-hidden"
            >
              <div className="bg-gradient-to-b from-[#FFFDF8] to-white border-b border-[#E8E2D2] p-6 sm:p-8 text-center">
                <p className="text-[#800000] text-[11px] font-bold tracking-[0.25em] uppercase mb-2">
                  Karki Mutt Chaturmasya
                </p>
                <h2 className="text-2xl font-black text-gray-900">Virtual Pada Pooja</h2>
                <p className="text-gray-500 text-sm mt-1">Booking Confirmation</p>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex justify-center mb-6">
                  <div className="p-4 border border-[#E8E2D2] rounded-2xl bg-white">
                    <QRCodeCanvas
                      value={JSON.stringify({
                        bookingId: bookingData.bookingId,
                        seva: "Virtual Pada Pooja",
                      })}
                      size={140}
                      fgColor="#333333"
                    />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-[11px] text-[#800000] font-bold uppercase tracking-widest">
                    Booking Reference
                  </p>
                  <p className="text-2xl sm:text-3xl font-black mt-1 text-gray-900">
                    {bookingData.bookingId}
                  </p>
                </div>

                <div className="bg-[#FFFDF8] border border-[#E8E2D2] p-5 rounded-2xl">
                  <DetailRow label="Devotee" value={bookingData.name} />
                  <DetailRow label="Mobile" value={bookingData.mobile || mobileInput} />
                  <DetailRow label="Date" value={formatDate(bookingData.date)} />
                  <DetailRow label="Participants" value={bookingData.participants} />
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                  <p className="text-sm text-blue-800">
                    On the day of your Virtual Pada Pooja, return to this page and select{" "}
                    <strong>"Join Virtual Pada Pooja"</strong>. Enter your registered mobile
                    number to access the Google Meet link.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 print:hidden">
              <button
                onClick={resetFlow}
                className="flex-1 bg-white border border-[#E8E2D2] hover:bg-gray-50 font-bold py-3 rounded-xl"
              >
                Done
              </button>
              <button
                onClick={handlePrint}
                className="sm:flex-[2] bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-md"
              >
                Download PDF / Print
              </button>
            </div>
          </div>
        )}

        {/* JOIN */}
        {currentView === "join_details" && selectedBooking && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm border border-[#E8E2D2] overflow-hidden">
            <div className="bg-[#FFFDF8] border-b border-[#E8E2D2] p-5 sm:p-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  Virtual Pada Pooja
                </p>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  Your Booking
                </h2>
              </div>
              <span className="shrink-0 bg-green-100 text-green-800 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Confirmed
              </span>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-2 gap-4 sm:gap-5 bg-[#FFFDF8] p-5 rounded-2xl border border-[#E8E2D2]">
                <BookingDetail label="Devotee" value={selectedBooking.name} />
                <BookingDetail label="Booking ID" value={selectedBooking.bookingId} />
                <BookingDetail label="Date" value={formatDate(selectedBooking.date)} />
                <BookingDetail label="Participants" value={selectedBooking.participants} />
              </div>

              <div className="mt-6 p-6 border-2 border-dashed border-blue-200 bg-blue-50/60 rounded-2xl text-center">
                <div className="text-4xl mb-3">🎥</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Join Virtual Pada Pooja
                </h3>

                {canJoinMeeting(selectedBooking.date) ? (
                  <>
                    <p className="text-sm text-gray-600 mb-5">
                      Your Virtual Pada Pooja is scheduled for today. Click below to join via
                      Google Meet.
                    </p>
                    <a
                      href={selectedBooking.meetLink || MEET_LINK}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-md"
                    >
                      <span className="text-xl" aria-hidden>🎥</span>
                      Join Google Meet
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      The Google Meet link becomes available on your scheduled date.
                    </p>
                    <div className="bg-white border border-gray-200 rounded-xl py-4 px-5">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        Scheduled Date
                      </p>
                      <p className="font-bold text-lg mt-1 text-gray-900">
                        {formatDate(selectedBooking.date)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PRINT CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #virtual-pooja-receipt,
          #virtual-pooja-receipt * { visibility: visible; }
          #virtual-pooja-receipt {
            position: absolute;
            left: 0; top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VirtualPadaPuja;
