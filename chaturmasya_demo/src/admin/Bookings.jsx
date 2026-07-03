import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const Bookings = () => {
  const [search, setSearch] = useState("");

 const [bookings, setBookings] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  const q = query(
    collection(db, "bookings"),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const booking = doc.data();

        return {
          id: doc.id,
          ...booking,
          date: booking.date?.toDate().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          status: "Confirmed",
        };
      });

      setBookings(data);
      setLoading(false);
    },
    (error) => {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    }
  );

  return () => unsubscribe();
}, []);

if (loading) {
  return (
    <div className="flex justify-center items-center h-64">
      <p className="text-gray-600">Loading bookings...</p>
    </div>
  );
}

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      booking.mobile.includes(search) ||
      booking.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (booking) => {
    alert(`Downloading receipt for ${booking.bookingId}`);
  };

  const handleExportCSV = () => {
    // 1. Define CSV Headers
    const headers = ["Booking ID", "Devotee Name", "Mobile", "Seva", "Date", "Time", "Participants", "Status"];
    
    // 2. Map data to rows
    const rows = filteredBookings.map(b => [
      b.bookingId,
      b.name,
      b.mobile,
      b.seva,
      b.date,
      b.time,
      b.participants,
      b.status
    ]);

    // 3. Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // 4. Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Seva_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    // Added max-w-7xl, mx-auto, and horizontal/vertical padding to fix the edge-to-edge stretching
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Sub-Navigation / Breadcrumb */}
      <nav className="flex text-stone-500 text-sm font-bold uppercase tracking-wider mb-6">
        <Link to="/admin" className="hover:text-orange-700 transition">Admin</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-900">Seva Bookings</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b-2 border-stone-800 pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900 uppercase tracking-tight">
            Seva Bookings
          </h1>
          <p className="text-stone-500 font-serif italic mt-1 text-lg">
            Manage and verify walk-in and online physical seva reservations.
          </p>
        </div>
        
        {/* Actions Container */}
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg border border-orange-200 text-sm font-bold shadow-sm whitespace-nowrap">
            Total Records: {filteredBookings.length}
          </div>
          <button 
            onClick={handleExportCSV}
            disabled={filteredBookings.length === 0}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition disabled:cursor-not-allowed whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-stone-200 mb-6 flex items-center focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
        <div className="pl-4 pr-2 text-stone-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input
          type="text"
          placeholder="Search by Booking ID, Name, or Mobile Number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent p-3 text-stone-900 outline-none font-medium placeholder:text-stone-400"
        />
        {search && (
          <button onClick={() => setSearch("")} className="pr-4 text-stone-400 hover:text-stone-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        )}
      </div>

      {/* DESKTOP VIEW: Editorial Table (Hidden on small screens) */}
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
                    <div className="text-orange-700 text-sm font-serif font-bold mt-0.5">{booking.seva}</div>
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
                    <button
                      onClick={() => handleDownload(booking)}
                      className="inline-flex items-center gap-2 bg-white border-2 border-stone-200 text-stone-700 hover:border-orange-600 hover:text-orange-600 font-bold px-4 py-2 rounded-lg transition-colors text-sm shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      Receipt
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-12 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-lg font-bold text-stone-900">No bookings found</h3>
                  <p className="text-stone-500 text-sm">Try adjusting your search criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW: Card Layout (Hidden on medium+ screens) */}
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
                  <div className="text-orange-700 font-serif font-bold text-lg">{booking.seva}</div>
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

                <button
                  onClick={() => handleDownload(booking)}
                  className="w-full flex justify-center items-center gap-2 bg-white border-2 border-stone-200 text-stone-700 hover:border-orange-600 hover:text-orange-600 font-bold px-4 py-3 rounded-xl transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download Receipt
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="bg-white p-10 rounded-2xl border border-stone-200 text-center shadow-sm">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-stone-900">No bookings found</h3>
            <p className="text-stone-500 text-sm mt-1">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Bookings;