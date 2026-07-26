import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  Search,
  Download,
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  Users,
  FileText,
  MapPin,
  Globe,
  Trash2,
  Link as LinkIcon,
  Copy,
  Save,
  Send,
  Loader2
} from "lucide-react";

/* =========================================================
   UTILS
========================================================= */
const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";
const DEFAULT_MEET_LINK = "https://meet.google.com/abc-defg-hij";

export default function Bookings() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("physical"); // 'physical' | 'virtual'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Virtual Bookings Specific State
  const [meetLink, setMeetLink] = useState(DEFAULT_MEET_LINK);
  
  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ============ FIREBASE LISTENER ============
  useEffect(() => {
    const q = query(
      collection(db, "bookings"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((document) => {
          const booking = document.data();
          return {
            id: document.id,
            ...booking,
            // Handle both Firestore Timestamp and plain strings gracefully
            date: booking.date?.toDate 
              ? booking.date.toDate().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
              : new Date(booking.date || 0).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            status: booking.status || "Confirmed",
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

  // ============ FILTERING LOGIC ============
  const physicalBookings = bookings.filter(b => 
    b.seva !== "Virtual Pada Pooja" && !b.seva?.toLowerCase().includes("virtual")
  );
  
  const virtualBookings = bookings.filter(b => 
    b.seva === "Virtual Pada Pooja" || b.seva?.toLowerCase().includes("virtual")
  );

  const baseList = activeTab === "physical" ? physicalBookings : virtualBookings;

  const displayedBookings = baseList.filter((booking) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      booking.bookingId?.toLowerCase().includes(q) ||
      booking.mobile?.includes(q) ||
      booking.name?.toLowerCase().includes(q) ||
      booking.address?.toLowerCase().includes(q)
    );
  });

  // ============ DELETE HANDLER ============
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "bookings", deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ============ VIRTUAL BOOKING ACTIONS ============
  const saveMeetLink = () => {
    if (!meetLink.trim()) return alert("Please enter a valid Google Meet link.");
    alert("Master Meet Link Saved locally.");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(meetLink);
      alert("Google Meet Link Copied!");
    } catch (err) {
      alert("Unable to copy the Google Meet link.");
    }
  };

  const handleSendLink = (booking) => {
    const bookingMeetLink = booking.meetLink || meetLink;
    if (!booking.mobile) return alert("Mobile number is not available for this booking.");

    const whatsappMessage = 
`Namaskara ${booking.name || "Devotee"} 🙏

Your Virtual Pada Pooja booking details:
Booking ID: ${booking.bookingId || "-"}
Date: ${booking.date}
Participants: ${booking.participants || "1"}

Google Meet Link:
${bookingMeetLink}

Please use the above link on your scheduled Virtual Pada Pooja date.

Karki Mutt Chaturmasya`;

    const whatsappUrl = `https://wa.me/91${booking.mobile}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  // ============ RECEIPT & EXPORT ============
  const handleDownload = (booking) => {
    const receiptWindow = window.open("", "_blank");
    if (!receiptWindow) return alert("Please allow pop-ups to print the receipt.");

    const isVirtual = activeTab === "virtual";

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${booking.bookingId || "Booking Receipt"}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #292524; }
            .receipt { max-width: 600px; margin: auto; border: 2px solid #d4af37; border-radius: 16px; padding: 30px; }
            h1 { text-align: center; margin-bottom: 5px; color: #722013; }
            .subtitle { text-align: center; color: #9a3412; margin-bottom: 30px; font-weight: bold; }
            .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e7e5e4; }
            .label { color: #78716c; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
            .value { font-weight: bold; text-align: right; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <h1>${booking.seva || "Seva Booking"}</h1>
            <div class="subtitle">Karki Mutt Chaturmasya 2026</div>
            <div class="row"><span class="label">Booking ID</span><span class="value">${booking.bookingId || "-"}</span></div>
            <div class="row"><span class="label">Devotee</span><span class="value">${booking.name || "-"}</span></div>
            <div class="row"><span class="label">Mobile</span><span class="value">${booking.mobile || "-"}</span></div>
            <div class="row"><span class="label">Date</span><span class="value">${booking.date}</span></div>
            ${!isVirtual ? `<div class="row"><span class="label">Time</span><span class="value">${booking.time || "-"}</span></div>` : ""}
            <div class="row"><span class="label">Participants</span><span class="value">${booking.participants || "1"}</span></div>
            ${isVirtual ? `<div class="row"><span class="label">Address</span><span class="value" style="max-width: 250px;">${booking.address || "-"}</span></div>` : ""}
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    receiptWindow.document.close();
  };

  const handleExportCSV = () => {
    const headers = ["Booking ID", "Devotee Name", "Mobile", "Seva", "Type", "Date", "Time", "Address", "Participants", "Status"];
    const rows = displayedBookings.map(b => [
      `"${b.bookingId || ""}"`,
      `"${b.name || ""}"`,
      `"${b.mobile || ""}"`,
      `"${b.seva || ""}"`,
      `"${activeTab === "physical" ? "Physical" : "Virtual"}"`,
      `"${b.date || ""}"`,
      `"${b.time || ""}"`,
      `"${b.address?.replace(/"/g, '""') || ""}"`,
      `"${b.participants || ""}"`,
      `"${b.status || ""}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Seva_Bookings_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Loading Bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-stone-50 overflow-hidden font-sans selection:bg-amber-200 selection:text-amber-900">
      
      {/* ============ HEADER (Fixed) ============ */}
      <header className="shrink-0 bg-white border-b border-stone-200 px-4 md:px-8 py-4 md:py-5 z-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-1.5">
              <Link to="/admin" className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors">
                <ArrowLeft size={16} />
              </Link>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Admin Control</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 tracking-tight">Seva Bookings</h1>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search ID, Name, Mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white transition-colors"
              />
            </div>
            <button
              onClick={handleExportCSV}
              disabled={displayedBookings.length === 0}
              className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-sm"
            >
              <Download size={14} /> Export
            </button>
          </div>
        </div>
      </header>

      {/* ============ TABS & STATS (Fixed) ============ */}
      <div className="shrink-0 bg-white border-b border-stone-200 px-4 md:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className={`flex gap-2 overflow-x-auto ${hideScrollbar}`}>
            <button
              onClick={() => setActiveTab("physical")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                activeTab === "physical" ? "bg-amber-100 text-amber-800" : "bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              <MapPin size={16} /> Physical Pada Pooja
              <span className={`px-2 py-0.5 rounded-md text-[10px] tabular-nums ${activeTab === "physical" ? "bg-white border border-amber-200 text-amber-700" : "bg-stone-100 text-stone-500"}`}>
                {physicalBookings.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("virtual")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                activeTab === "virtual" ? "bg-amber-100 text-amber-800" : "bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              <Globe size={16} /> Virtual Pada Pooja
              <span className={`px-2 py-0.5 rounded-md text-[10px] tabular-nums ${activeTab === "virtual" ? "bg-white border border-amber-200 text-amber-700" : "bg-stone-100 text-stone-500"}`}>
                {virtualBookings.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ============ MEET LINK BAR (VIRTUAL ONLY) ============ */}
      {activeTab === "virtual" && (
        <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-4 md:px-8 py-3 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-widest w-full sm:w-auto">
             <LinkIcon size={14}/> Master Meet Link
          </div>
          <div className="flex w-full sm:w-auto gap-2">
             <input 
               type="text" 
               value={meetLink} 
               onChange={(e) => setMeetLink(e.target.value)}
               placeholder="Paste Google Meet URL..."
               className="flex-1 sm:w-64 bg-white border border-amber-200 text-stone-900 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
             />
             <button onClick={saveMeetLink} className="bg-amber-600 hover:bg-orange-500 text-white p-2 rounded-lg transition" title="Save Link"><Save size={16}/></button>
             <button onClick={handleCopyLink} className="bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 p-2 rounded-lg transition" title="Copy Link"><Copy size={16}/></button>
          </div>
        </div>
      )}

      {/* ============ MAIN CONTENT AREA (Scrollable) ============ */}
      <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${hideScrollbar}`}>
        {displayedBookings.length === 0 ? (
          <div className="h-full w-full bg-white border border-stone-200 rounded-[24px] flex flex-col items-center justify-center p-6 text-center shadow-sm max-w-5xl mx-auto">
            <Search className="w-12 h-12 text-stone-300 mb-4" />
            <p className="text-xl font-serif font-bold text-stone-900">No bookings found</p>
            <p className="text-sm text-stone-500 mt-1 max-w-md">No records match your search criteria.</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto pb-10">
            
            {/* =========================================================
                DESKTOP TABLE VIEW (lg and above)
            ========================================================= */}
            <div className="hidden lg:block bg-white border border-stone-200 rounded-[24px] shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="bg-stone-50 border-b border-stone-200 sticky top-0 z-10">
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                    <th className="px-6 py-4 w-[20%]">Booking Info</th>
                    <th className="px-6 py-4 w-[25%]">Devotee Details</th>
                    <th className="px-6 py-4 w-[20%]">{activeTab === "physical" ? "Schedule" : "Date & Address"}</th>
                    <th className="px-6 py-4 w-[15%] text-center">Status</th>
                    <th className="px-6 py-4 w-[20%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {displayedBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-amber-50/50 transition-colors align-middle group">
                      
                      {/* Booking Info */}
                      <td className="px-6 py-5">
                        <div className="font-bold text-stone-900 break-words">{booking.bookingId}</div>
                        <div className="text-amber-700 text-sm font-serif font-bold mt-1 break-words leading-tight">{booking.seva}</div>
                      </td>

                      {/* Devotee Details */}
                      <td className="px-6 py-5">
                        <div className="font-bold text-stone-900 break-words mb-1">{booking.name}</div>
                        <div className="text-stone-500 text-xs font-semibold flex items-center gap-3">
                          <span className="flex items-center gap-1.5"><Phone size={12}/> {booking.mobile}</span>
                          <span className="flex items-center gap-1.5"><Users size={12}/> {booking.participants} Pax</span>
                        </div>
                      </td>

                      {/* Schedule / Address */}
                      <td className="px-6 py-5">
                        <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1">
                          <Calendar size={14} className="text-stone-400"/> {booking.date}
                        </div>
                        {activeTab === "physical" ? (
                          <div className="text-stone-500 text-xs font-semibold flex items-center gap-1.5">
                            <Clock size={14} className="text-stone-400"/> {booking.time}
                          </div>
                        ) : (
                          <div className="text-stone-500 text-xs font-semibold mt-1 truncate pr-4" title={booking.address}>
                            {booking.address || "No address provided"}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-widest">
                          {booking.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          {activeTab === "virtual" && (
                            <button
                              onClick={() => handleSendLink(booking)}
                              className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-lg transition-colors text-[10px] uppercase tracking-widest shadow-sm"
                              title="Send WhatsApp Invite"
                            >
                              <Send size={14} /> Invite
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(booking)}
                            className="inline-flex items-center gap-1.5 bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-bold px-3 py-1.5 rounded-lg transition-colors text-[10px] uppercase tracking-widest shadow-sm"
                            title="Download Receipt"
                          >
                            <FileText size={14} /> Receipt
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(booking.id)}
                            className="inline-flex items-center gap-1.5 bg-white border border-stone-200 text-stone-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 px-2 py-1.5 rounded-lg transition-colors shadow-sm"
                            title="Delete Booking"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* =========================================================
                MOBILE / TABLET CARDS VIEW (below lg)
            ========================================================= */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedBookings.map((booking) => (
                <article key={booking.id} className="bg-white rounded-[24px] border border-stone-200 shadow-sm overflow-hidden flex flex-col">
                  
                  {/* Card Header */}
                  <div className="bg-stone-50/50 p-4 border-b border-stone-100 flex justify-between items-start">
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-0.5">Booking ID</div>
                      <div className="font-bold text-stone-900">{booking.bookingId}</div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-widest">
                      {booking.status}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <div>
                      <div className="text-amber-700 font-serif font-bold text-lg leading-tight mb-2">
                        {booking.seva}
                      </div>
                      <div className="font-bold text-stone-900 text-base">{booking.name}</div>
                      <div className="text-stone-500 text-xs font-semibold flex flex-wrap gap-4 mt-2">
                        <span className="flex items-center gap-1.5"><Phone size={14} className="text-stone-400"/> {booking.mobile}</span>
                        <span className="flex items-center gap-1.5"><Users size={14} className="text-stone-400"/> {booking.participants} Pax</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <div className={`bg-stone-50 border border-stone-100 rounded-xl p-3 ${activeTab === "virtual" ? "col-span-2 sm:col-span-1" : ""}`}>
                        <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mb-1"><Calendar size={12}/> Date</span>
                        <span className="font-bold text-stone-800 text-sm">{booking.date}</span>
                      </div>
                      
                      {activeTab === "physical" ? (
                        <div className="bg-stone-50 border border-stone-100 rounded-xl p-3">
                          <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mb-1"><Clock size={12}/> Time</span>
                          <span className="font-bold text-stone-800 text-sm">{booking.time}</span>
                        </div>
                      ) : (
                        <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 col-span-2 sm:col-span-1">
                          <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mb-1"><MapPin size={12}/> Address</span>
                          <span className="font-bold text-stone-800 text-xs line-clamp-2">{booking.address || "Not provided"}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions Grid */}
                    <div className={`grid gap-2 ${activeTab === "virtual" ? "grid-cols-2" : "grid-cols-1"}`}>
                      {activeTab === "virtual" && (
                        <button
                          onClick={() => handleSendLink(booking)}
                          className="w-full flex justify-center items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-2.5 rounded-xl transition-all shadow-sm text-[10px] uppercase tracking-widest"
                        >
                          <Send size={14} /> Invite
                        </button>
                      )}
                        <button
                          onClick={() => handleDownload(booking)}
                          className="w-full flex justify-center items-center gap-1.5 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold px-3 py-2.5 rounded-xl transition-all shadow-sm text-[10px] uppercase tracking-widest"
                        >
                          <FileText size={14} /> Receipt
                        </button>
                    </div>

                    <button
                      onClick={() => setDeleteConfirmId(booking.id)}
                      className="w-full flex justify-center items-center gap-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold px-3 py-2.5 rounded-xl transition-all shadow-sm text-[10px] uppercase tracking-widest mt-1"
                    >
                      <Trash2 size={14} /> Delete Booking
                    </button>
                  </div>

                </article>
              ))}
            </div>

          </div>
        )}
      </main>

      {/* ===========================
          DELETE CONFIRM MODAL
      ============================ */}
      <AnimatePresence>
        {deleteConfirmId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm p-8 text-center pointer-events-auto border border-stone-100">
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">Delete Booking?</h3>
                <p className="text-sm font-medium text-stone-500 mb-8">This action cannot be undone. It will permanently remove this record from the system.</p>
                <div className="flex flex-col gap-3">
                  <button onClick={handleDelete} disabled={isDeleting} className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-sm flex items-center justify-center gap-2">
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin"/> : "Yes, Delete Booking"}
                  </button>
                  <button onClick={() => setDeleteConfirmId(null)} disabled={isDeleting} className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs uppercase tracking-widest rounded-xl transition">
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}