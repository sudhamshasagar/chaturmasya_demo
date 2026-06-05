import { useState } from "react";
import { Link } from "react-router-dom";

const VirtualBookings = () => {
  const [meetLink, setMeetLink] = useState("https://meet.google.com/abc-defg-hij");
  const [search, setSearch] = useState("");

  const bookings = [
    {
      bookingId: "VP26-0001",
      name: "Ramesh Sharma",
      mobile: "9876543210",
      date: "15-Jul-2026",
      time: "10:00 AM",
      participants: "2",
      status: "Confirmed",
    },
    {
      bookingId: "VP26-0002",
      name: "Suresh Kumar",
      mobile: "9999999999",
      date: "16-Jul-2026",
      time: "11:00 AM",
      participants: "1",
      status: "Confirmed",
    },
  ];

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      booking.mobile.includes(search) ||
      booking.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetLink);
    alert("Google Meet Link Copied");
  };

  const handleSendLink = (booking) => {
    const whatsappMessage = `Namaskara ${booking.name},\n\nVirtual Pada Puja Details\n\nBooking ID: ${booking.bookingId}\nDate: ${booking.date}\nTime: ${booking.time}\n\nGoogle Meet Link:\n${meetLink}\n\nPlease join 15 minutes before your scheduled time.`;
    const whatsappUrl = `https://wa.me/91${booking.mobile}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  const saveMeetLink = () => {
    alert("Master Meet Link Saved");
  };

  const handleDownload = (booking) => {
    alert(`Downloading receipt for ${booking.bookingId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      
      {/* Sub-Navigation / Breadcrumb */}
      <nav className="flex text-stone-500 text-sm font-bold uppercase tracking-wider mb-6">
        <Link to="/admin" className="hover:text-orange-700 transition">Admin</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-900">Virtual Bookings</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b-2 border-stone-800 pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900 uppercase tracking-tight">
            Virtual Pada Puja
          </h1>
          <p className="text-stone-500 font-serif italic mt-1 text-lg">
            Manage online sessions, update meeting links, and send invites.
          </p>
        </div>
        <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg border border-orange-200 text-sm font-bold shadow-sm whitespace-nowrap">
          Total Records: {filteredBookings.length}
        </div>
      </div>

      {/* Top Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Meet Link Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 flex flex-col justify-center">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-blue-500">🎥</span> Master Google Meet Link
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              className="flex-1 bg-stone-50 border border-stone-200 text-stone-900 font-medium rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Paste Meet URL here..."
            />
            <div className="flex gap-2">
              <button 
                onClick={saveMeetLink} 
                className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-sm"
              >
                Save
              </button>
              <button 
                onClick={handleCopyLink} 
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-3 rounded-xl transition-colors border border-stone-200" 
                title="Copy Link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 flex flex-col justify-center focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-orange-500">🔍</span> Find Booking
          </h2>
          <input
            type="text"
            placeholder="Search by Booking ID, Name, or Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-3 outline-none font-medium placeholder:text-stone-400"
          />
        </div>

      </div>

      {/* DESKTOP VIEW: Editorial Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 text-xs uppercase tracking-wider font-bold">
              <th className="p-5">Booking Info</th>
              <th className="p-5">Devotee Details</th>
              <th className="p-5">Schedule</th>
              <th className="p-5 text-center">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <tr key={booking.bookingId} className="hover:bg-orange-50/50 transition-colors group">
                  
                  <td className="p-5">
                    <div className="font-bold text-stone-900">{booking.bookingId}</div>
                    <div className="text-orange-700 text-sm font-serif font-bold mt-0.5">Virtual Pada Puja</div>
                  </td>

                  <td className="p-5">
                    <div className="font-bold text-stone-900">{booking.name}</div>
                    <div className="text-stone-500 text-sm flex items-center gap-2 mt-0.5">
                      <span>📞 {booking.mobile}</span>
                      <span>•</span>
                      <span>{booking.participants} Person(s)</span>
                    </div>
                  </td>

                  <td className="p-5">
                    <div className="font-bold text-stone-900">{booking.date}</div>
                    <div className="text-stone-500 text-sm mt-0.5">{booking.time}</div>
                  </td>

                  <td className="p-5 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 uppercase tracking-wide">
                      {booking.status}
                    </span>
                  </td>

                  <td className="p-5 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleSendLink(booking)}
                        className="inline-flex items-center gap-2 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-2 rounded-lg transition-colors text-sm shadow-sm"
                        title="Send WhatsApp Invite"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        Invite
                      </button>
                      <button
                        onClick={() => handleDownload(booking)}
                        className="inline-flex items-center gap-2 bg-white border-2 border-stone-200 text-stone-700 hover:border-orange-600 hover:text-orange-600 font-bold px-3 py-2 rounded-lg transition-colors text-sm shadow-sm"
                        title="Download Receipt"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Receipt
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-12 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-lg font-bold text-stone-900">No virtual bookings found</h3>
                  <p className="text-stone-500 text-sm">Try adjusting your search criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW: Card Layout */}
      <div className="md:hidden space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking.bookingId} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
              
              <div className="bg-stone-50 p-4 border-b border-stone-100 flex justify-between items-start">
                <div>
                  <div className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">Booking ID</div>
                  <div className="font-black text-stone-900 text-lg">{booking.bookingId}</div>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 uppercase tracking-wide">
                  {booking.status}
                </span>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="text-orange-700 font-serif font-bold text-lg">Virtual Pada Puja</div>
                  <div className="font-bold text-stone-900 text-xl mt-1">{booking.name}</div>
                  <div className="text-stone-500 text-sm mt-1 flex gap-3">
                    <span>📞 {booking.mobile}</span>
                    <span>👥 {booking.participants}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <div>
                    <span className="block text-xs font-bold text-stone-400 uppercase">Date</span>
                    <span className="font-bold text-stone-800">{booking.date}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-stone-400 uppercase">Time</span>
                    <span className="font-bold text-stone-800">{booking.time}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSendLink(booking)}
                    className="flex justify-center items-center gap-2 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-bold px-4 py-3 rounded-xl"
                  >
                    Send Invite
                  </button>
                  <button
                    onClick={() => handleDownload(booking)}
                    className="flex justify-center items-center gap-2 bg-white border-2 border-stone-200 text-stone-700 font-bold px-4 py-3 rounded-xl"
                  >
                    Receipt
                  </button>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="bg-white p-10 rounded-2xl border border-stone-200 text-center shadow-sm">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-stone-900">No virtual bookings found</h3>
            <p className="text-stone-500 text-sm mt-1">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default VirtualBookings;