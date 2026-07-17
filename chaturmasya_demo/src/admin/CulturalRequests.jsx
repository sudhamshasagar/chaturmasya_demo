import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
const MAX_BOOKINGS_PER_DAY = 3;
const getMaxBookingsForDate = (dateString) => {
  if (!dateString) return MAX_BOOKINGS_PER_DAY;

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  // Monday = maximum 2 slots
  return date.getDay() === 1 ? 2 : 3;
};
const DURATION_OPTIONS = [
  { label: "30 Min", value: 30 },
  { label: "45 Min", value: 45 },
  { label: "1 Hour", value: 60 },
];
const STATUS_META = {
  pending: {
    label: "Awaiting",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-800 border-amber-200",
  },
  approved: {
    label: "Allocated",
    dot: "bg-emerald-600",
    chip: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  rejected: {
    label: "Declined",
    dot: "bg-rose-600",
    chip: "bg-rose-50 text-rose-800 border-rose-200",
  },
};
const CulturalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [approvalRequest, setApprovalRequest] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [rejectionRequest, setRejectionRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  // ============ PENDING LISTENER ============
  useEffect(() => {
    const pendingQuery = query(
      collection(db, "culturalRequests"),
      where("status", "in", ["pending", "Pending"])
    );
    const unsubscribe = onSnapshot(
      pendingQuery,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRequests(data);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load pending requests:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);
  // ============ ALL LISTENER ============
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "culturalRequests"),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const aT = a.createdAt?.toMillis?.() || 0;
          const bT = b.createdAt?.toMillis?.() || 0;
          return bT - aT;
        });
        setAllRequests(data);
      },
      (error) => console.error("Failed to load all requests:", error)
    );
    return () => unsubscribe();
  }, []);
  // ============ APPROVED LISTENER ============
  useEffect(() => {
    const approvedQuery = query(
      collection(db, "culturalRequests"),
      where("status", "==", "approved")
    );
    const unsubscribe = onSnapshot(
      approvedQuery,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setApprovedRequests(data);
      },
      (error) => console.error("Failed to load approved:", error)
    );
    return () => unsubscribe();
  }, []);
  // ============ TIME HELPERS ============
  const timeToMinutes = (t) => {
    if (!t) return null;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const minutesToTime = (total) => {
    const n = total % (24 * 60);
    const h = Math.floor(n / 60);
    const m = n % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  const calculateEndTime = (start, dur) => {
    if (!start || !dur) return "";
    return minutesToTime(timeToMinutes(start) + Number(dur));
  };
  const selectedEndTime = useMemo(
    () => calculateEndTime(selectedStartTime, selectedDuration),
    [selectedStartTime, selectedDuration]
  );
  const getApprovedProgramsForDate = (date) =>
    approvedRequests
      .filter((r) => r.date === date)
      .sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
  const hasTimeConflict = (date, newStart, newEnd) => {
    const ns = timeToMinutes(newStart);
    const ne = timeToMinutes(newEnd);
    return getApprovedProgramsForDate(date).some((b) => {
      if (!b.startTime || !b.endTime) return false;
      const es = timeToMinutes(b.startTime);
      const ee = timeToMinutes(b.endTime);
      return ns < ee && ne > es;
    });
  };
  // ============ MODAL HANDLERS ============
  const openApprovalModal = (r) => {
    setApprovalRequest(r);
    setSelectedDuration("");
    setSelectedStartTime("");
  };
  const closeApprovalModal = () => {
    if (processingId) return;
    setApprovalRequest(null);
    setSelectedDuration("");
    setSelectedStartTime("");
  };
  const openRejectionModal = (r) => {
    setRejectionRequest(r);
    setRejectionReason("");
  };
  const closeRejectionModal = () => {
    if (processingId) return;
    setRejectionRequest(null);
    setRejectionReason("");
  };
  // ============ APPROVE ============
  const handleApprove = async () => {
    if (!approvalRequest?.id || !approvalRequest?.date) {
      alert("Invalid Cultural Seva request.");
      return;
    }
    if (!selectedDuration) return alert("Please select the program duration.");
    if (!selectedStartTime) return alert("Please select the program start time.");
    const durationMinutes = Number(selectedDuration);
    const endTime = calculateEndTime(selectedStartTime, durationMinutes);
    if (hasTimeConflict(approvalRequest.date, selectedStartTime, endTime)) {
      alert("The selected time overlaps with another approved program.");
      return;
    }
    setProcessingId(approvalRequest.id);
    try {
      await runTransaction(db, async (transaction) => {
        const requestRef = doc(db, "culturalRequests", approvalRequest.id);
        const availabilityRef = doc(
          db,
          "culturalAvailability",
          approvalRequest.date
        );
        const requestSnapshot = await transaction.get(requestRef);
        const availabilitySnapshot = await transaction.get(availabilityRef);
        if (!requestSnapshot.exists()) throw new Error("REQUEST_NOT_FOUND");
        const latestRequest = requestSnapshot.data();
        if (
          latestRequest.status !== "pending" &&
          latestRequest.status !== "Pending"
        )
          throw new Error("REQUEST_ALREADY_PROCESSED");
        let approvedCount = 0;
        const maxSlots = getMaxBookingsForDate(approvalRequest.date);
        if (availabilitySnapshot.exists()) {
          const a = availabilitySnapshot.data();
          approvedCount = Number(a.approvedCount) || 0;
        }
        if (approvedCount >= maxSlots) throw new Error("DATE_FULL");
        transaction.set(
          availabilityRef,
          {
            date: approvalRequest.date,
            approvedCount: approvedCount + 1,
            maxSlots,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        transaction.update(requestRef, {
          status: "approved",
          durationMinutes,
          startTime: selectedStartTime,
          endTime,
          approvedAt: serverTimestamp(),
          rejectionReason: null,
        });
      });
      alert(
        `Booking approved.\n\nDate: ${approvalRequest.date}\nTime: ${formatTime(
          selectedStartTime
        )} — ${formatTime(endTime)}\nDuration: ${
          durationMinutes === 60 ? "1 Hour" : `${durationMinutes} Minutes`
        }`
      );
      closeApprovalModal();
    } catch (error) {
      console.error("Approval failed:", error);
      if (error.message === "DATE_FULL")
        alert("This date already has 3 approved programs.");
      else if (error.message === "REQUEST_ALREADY_PROCESSED")
        alert("This request has already been processed.");
      else alert("Failed to approve request.");
    } finally {
      setProcessingId(null);
    }
  };
  // ============ REJECT ============
  const handleReject = async () => {
    if (!rejectionRequest?.id) return;
    const reason = rejectionReason.trim();
    if (!reason) return alert("Please provide a rejection reason.");
    if (reason.length < 5)
      return alert("Please provide a meaningful rejection reason.");
    setProcessingId(rejectionRequest.id);
    try {
      await runTransaction(db, async (transaction) => {
        const requestRef = doc(db, "culturalRequests", rejectionRequest.id);
        const requestSnapshot = await transaction.get(requestRef);
        if (!requestSnapshot.exists()) throw new Error("REQUEST_NOT_FOUND");
        const latestStatus = requestSnapshot.data().status;
        if (latestStatus !== "pending" && latestStatus !== "Pending")
          throw new Error("REQUEST_ALREADY_PROCESSED");
        transaction.update(requestRef, {
          status: "rejected",
          rejectionReason: reason,
          rejectedAt: serverTimestamp(),
        });
      });
      alert("Request rejected.");
      closeRejectionModal();
    } catch (error) {
      console.error("Rejection failed:", error);
      if (error.message === "REQUEST_ALREADY_PROCESSED")
        alert("This request has already been processed.");
      else alert("Failed to reject request.");
    } finally {
      setProcessingId(null);
    }
  };
  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Date", "Status", "Contact"];
    const rows = allRequests.map((r) => [
      r.bookingId ?? r.id,
      r.name,
      r.date,
      r.status,
      r.contact,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cultural_Requests_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };
  // ============ LOADING ============
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-14 h-14 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">
            Loading
          </p>
          <p className="font-serif italic text-stone-700 mt-1">
            Fetching Cultural Seva requests
          </p>
        </div>
      </div>
    );
  }
  // ============ DERIVED LISTS ============
  const pendingList = allRequests.filter(
    (r) => r.status?.toLowerCase() === "pending"
  );
  const approvedList = allRequests.filter(
    (r) => r.status?.toLowerCase() === "approved"
  );
  const rejectedList = allRequests.filter(
    (r) => r.status?.toLowerCase() === "rejected"
  );
  const baseList =
    activeTab === "pending"
      ? pendingList
      : activeTab === "approved"
      ? approvedList
      : activeTab === "rejected"
      ? rejectedList
      : allRequests;
  const displayedRequests = searchTerm
    ? baseList.filter((r) => {
        const q = searchTerm.toLowerCase();
        return (
          r.name?.toLowerCase().includes(q) ||
          r.contact?.toLowerCase().includes(q) ||
          r.date?.toLowerCase().includes(q)
        );
      })
    : baseList;
  const tabs = [
    { key: "pending", label: "Pending", count: pendingList.length, accent: "amber" },
    { key: "approved", label: "Approved", count: approvedList.length, accent: "emerald" },
    { key: "rejected", label: "Rejected", count: rejectedList.length, accent: "rose" },
    { key: "all", label: "All", count: allRequests.length, accent: "stone" },
  ];
  const accentClasses = {
    amber: "bg-amber-500 text-white shadow-lg shadow-amber-200/60",
    emerald: "bg-emerald-600 text-white shadow-lg shadow-emerald-200/60",
    rose: "bg-rose-600 text-white shadow-lg shadow-rose-200/60",
    stone: "bg-stone-900 text-white shadow-lg shadow-stone-300/60",
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-stone-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
        {/* ============ MASTHEAD ============ */}
        <header className="mb-10 pb-8 border-b border-stone-900/10">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:gap-6">
            <div className="flex items-start gap-3 sm:gap-5 min-w-0">
              <Link
                to="/admin"
                className="shrink-0 mt-1 p-2.5 border border-stone-300 hover:border-stone-900 hover:bg-stone-900 hover:text-white rounded-full transition-all group"
                aria-label="Back to admin"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="min-w-0">
               
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl leading-[0.95] text-stone-900 tracking-tight">
                  Cultural
                  <span className="italic font-light text-stone-700"> Requests</span>
                </h1>
                <p className="mt-3 font-serif italic text-stone-500 text-sm sm:text-base max-w-xl">
                  A curated ledger of devotional programme submissions — awaiting review, allocation, and blessing.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl lg:text-5xl font-black text-stone-900 tabular-nums">
                  {String(pendingList.length).padStart(2, "0")}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
                  Pending
                </span>
              </div>
              <div className="h-px w-24 bg-stone-900/20" />
              <p className="text-xs text-stone-500">
                {approvedList.length} allocated · {rejectedList.length} declined
              </p>
            </div>
          </div>
          {/* ACTION BAR */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by devotee, contact, or date…"
                className="w-full bg-white border border-stone-200 rounded-full pl-11 pr-4 py-3 text-sm outline-none focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5 transition"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-stone-700 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export Ledger
            </button>
          </div>
        </header>
        {/* ============ TABS ============ */}
        <nav className="mb-8 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {tabs.map((t) => {
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    active
                      ? accentClasses[t.accent]
                      : "bg-white border border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900"
                  }`}
                >
                  <span>{t.label}</span>
                  <span
                    className={`tabular-nums text-[10px] px-2 py-0.5 rounded-full ${
                      active ? "bg-white/25" : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
        {/* ============ EMPTY STATE ============ */}
        {displayedRequests.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-3xl p-12 sm:p-20 text-center">
            <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-stone-100 grid place-items-center">
              <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="font-serif italic text-lg text-stone-700">
              No {activeTab === "all" ? "" : activeTab} requests to display.
            </p>
            <p className="text-sm text-stone-400 mt-1">
              New submissions will appear here in real time.
            </p>
          </div>
        )}
        {/* ============ DESKTOP TABLE ============ */}
        {displayedRequests.length > 0 && (
          <div className="hidden lg:block bg-white rounded-3xl border border-stone-200/80 shadow-sm shadow-stone-200/40 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-stone-50/80 border-b border-stone-200">
                <tr className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-500">
                  <th className="px-8 py-5">Devotee</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Allocation</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {displayedRequests.map((request, idx) => {
                  const status = request.status?.toLowerCase() || "pending";
                  const meta = STATUS_META[status] || STATUS_META.pending;
                  const dateBookings = getApprovedProgramsForDate(request.date);
                  return (
                    <tr
                      key={request.id}
                      className="group hover:bg-stone-50/60 transition"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-orange-100 to-amber-200 grid place-items-center font-serif font-black text-orange-900">
                            {request.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-stone-900 truncate">
                              {request.name}
                            </div>
                            <div className="text-xs text-stone-500 truncate">
                              {request.contact}
                              {request.participationType &&
                                ` · ${request.participationType}`}
                            </div>
                          </div>
                          <span className="ml-2 text-[10px] font-black text-stone-300 tabular-nums">
                            №{String(idx + 1).padStart(3, "0")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="font-serif font-bold text-stone-800">
                          {request.date}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span
                          className={`inline-flex items-center gap-2 border rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${meta.chip}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        {dateBookings.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                              {Array.from({ length: MAX_BOOKINGS_PER_DAY }).map(
                                (_, i) => (
                                  <span
                                    key={i}
                                    className={`w-2 h-2 rounded-full border-2 border-white ${
                                      i < dateBookings.length
                                        ? "bg-orange-500"
                                        : "bg-stone-200"
                                    }`}
                                  />
                                )
                              )}
                            </div>
                            <span className="text-xs font-bold text-stone-600 tabular-nums">
                              {dateBookings.length}/{MAX_BOOKINGS_PER_DAY}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs italic text-stone-400">
                            No allocations
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        {status === "pending" ? (
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              onClick={() => openRejectionModal(request)}
                              className="px-4 py-2 text-xs font-black uppercase tracking-wider text-rose-700 border border-transparent hover:border-rose-200 hover:bg-rose-50 rounded-full transition"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => openApprovalModal(request)}
                              className="bg-stone-900 text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider hover:bg-orange-700 transition"
                            >
                              Allocate →
                            </button>
                          </div>
                        ) : status === "approved" ? (
                          <div className="inline-block text-left bg-emerald-50/70 border border-emerald-100 rounded-2xl px-4 py-2.5">
                            <p className="font-serif font-black text-stone-900 tabular-nums">
                              {formatTime(request.startTime)}
                              <span className="text-stone-400 mx-1">—</span>
                              {formatTime(request.endTime)}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mt-0.5">
                              {request.durationMinutes === 60
                                ? "1 Hour"
                                : `${request.durationMinutes} Minutes`}
                            </p>
                          </div>
                        ) : (
                          <div className="inline-block max-w-xs text-left bg-rose-50/70 border border-rose-100 rounded-2xl px-4 py-2.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">
                              Reason
                            </p>
                            <p className="text-xs text-stone-700 mt-1 line-clamp-2">
                              {request.rejectionReason || "No reason provided"}
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {/* ============ MOBILE / TABLET CARDS ============ */}
        {displayedRequests.length > 0 && (
          <div className="lg:hidden space-y-4">
            {displayedRequests.map((request, idx) => {
              const status = request.status?.toLowerCase() || "pending";
              const meta = STATUS_META[status] || STATUS_META.pending;
              const dateBookings = getApprovedProgramsForDate(request.date);
              return (
                <article
                  key={request.id}
                  className="bg-white rounded-3xl border border-stone-200 shadow-sm shadow-stone-100 overflow-hidden"
                >
                  <div className="p-5 sm:p-6">
                    {/* Header row */}
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 mb-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-orange-100 to-amber-200 grid place-items-center font-serif font-black text-orange-900">
                          {request.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-stone-300 tabular-nums">
                            №{String(idx + 1).padStart(3, "0")}
                          </p>
                          <h3 className="font-black text-stone-900 truncate">
                            {request.name}
                          </h3>
                          <p className="text-xs text-stone-500 truncate">
                            {request.contact}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1.5 border rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${meta.chip}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </div>
                    {/* Meta row */}
                    <div className="grid grid-cols-2 gap-3 mb-5 pb-5 border-b border-stone-100">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">
                          Date
                        </p>
                        <p className="font-serif font-bold text-stone-800 text-sm">
                          {request.date}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">
                          Allocated
                        </p>
                        <p className="font-bold text-stone-800 text-sm tabular-nums">
                          {dateBookings.length}
                          <span className="text-stone-400">
                            /{MAX_BOOKINGS_PER_DAY}
                          </span>
                        </p>
                      </div>
                    </div>
                    {/* Action area */}
                    {status === "pending" ? (
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => openRejectionModal(request)}
                          className="py-3 border border-stone-200 rounded-full font-black text-xs uppercase tracking-wider text-stone-700 hover:border-rose-300 hover:text-rose-700 transition"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => openApprovalModal(request)}
                          className="py-3 bg-stone-900 text-white rounded-full font-black text-xs uppercase tracking-wider hover:bg-orange-700 transition"
                        >
                          Allocate →
                        </button>
                      </div>
                    ) : status === "approved" ? (
                      <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                          Programme Slot
                        </p>
                        <p className="font-serif text-xl font-black text-stone-900 mt-1 tabular-nums">
                          {formatTime(request.startTime)}
                          <span className="text-stone-400 mx-1.5">—</span>
                          {formatTime(request.endTime)}
                        </p>
                        <p className="text-xs text-stone-500 mt-1">
                          {request.durationMinutes === 60
                            ? "1 Hour"
                            : `${request.durationMinutes} Minutes`}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">
                          Rejection Reason
                        </p>
                        <p className="text-sm text-stone-700 mt-1">
                          {request.rejectionReason || "No reason provided"}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {/* ============ APPROVAL MODAL ============ */}
        {approvalRequest && (
          <div
            className="fixed inset-0 z-[9999] bg-stone-900/70 backdrop-blur-md p-4 flex items-end sm:items-center justify-center animate-fade-in"
            onClick={closeApprovalModal}
          >
            <div
              className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 sm:p-8">
                <div className="mb-6 pb-6 border-b border-stone-100">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700 mb-3">
                    Allocate Programme Slot
                  </p>
                  <h2 className="font-serif text-3xl font-black text-stone-900 leading-tight">
                    Approve
                    <span className="italic font-light"> Cultural Seva</span>
                  </h2>
                  <p className="text-sm text-stone-500 mt-3 flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-stone-800">
                      {approvalRequest.name}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span>{approvalRequest.date}</span>
                  </p>
                </div>
                {/* Existing programs */}
                <div className="mb-6">
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-stone-500 mb-3">
                    Existing Programs — This Date
                  </label>
                  {getApprovedProgramsForDate(approvalRequest.date).length === 0 ? (
                    <div className="bg-stone-50 border border-dashed border-stone-200 rounded-2xl p-5 text-center">
                      <p className="text-sm italic text-stone-500">
                        No programmes allocated yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getApprovedProgramsForDate(approvalRequest.date).map(
                        (p) => (
                          <div
                            key={p.id}
                            className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 items-center bg-orange-50/60 border border-orange-100 rounded-2xl p-3"
                          >
                            <div className="w-1 h-10 bg-orange-500 rounded-full" />
                            <div className="min-w-0">
                              <p className="font-serif font-black text-stone-900 tabular-nums text-sm">
                                {formatTime(p.startTime)} — {formatTime(p.endTime)}
                              </p>
                              <p className="text-xs text-stone-500 truncate">
                                {p.name}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
                {/* Duration */}
                <div className="mb-5">
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-stone-500 mb-3">
                    Programme Duration *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATION_OPTIONS.map((option) => {
                      const active = Number(selectedDuration) === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSelectedDuration(option.value)}
                          className={`py-3.5 rounded-2xl border-2 text-sm font-black transition ${
                            active
                              ? "bg-stone-900 border-stone-900 text-white shadow-lg shadow-stone-300"
                              : "bg-white border-stone-200 text-stone-600 hover:border-stone-900"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Start time */}
                <div className="mb-5">
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-stone-500 mb-3">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={selectedStartTime}
                    onChange={(e) => setSelectedStartTime(e.target.value)}
                    className="w-full border-2 border-stone-200 rounded-2xl px-4 py-3.5 text-base font-bold text-stone-900 outline-none focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5 transition"
                  />
                </div>
                {/* Summary */}
                {selectedDuration && selectedStartTime && (
                  <div
                    className={`border rounded-2xl p-5 mb-6 ${
                      hasTimeConflict(
                        approvalRequest.date,
                        selectedStartTime,
                        selectedEndTime
                      )
                        ? "bg-rose-50 border-rose-200"
                        : "bg-emerald-50 border-emerald-200"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-black uppercase tracking-[0.25em] mb-2 ${
                        hasTimeConflict(
                          approvalRequest.date,
                          selectedStartTime,
                          selectedEndTime
                        )
                          ? "text-rose-700"
                          : "text-emerald-700"
                      }`}
                    >
                      Allocation Summary
                    </p>
                    <p className="font-serif text-2xl font-black text-stone-900 tabular-nums">
                      {formatTime(selectedStartTime)}
                      <span className="text-stone-400 mx-2">—</span>
                      {formatTime(selectedEndTime)}
                    </p>
                    <p className="text-sm text-stone-600 mt-1">
                      {Number(selectedDuration) === 60
                        ? "1 Hour"
                        : `${selectedDuration} Minutes`}
                    </p>
                    {hasTimeConflict(
                      approvalRequest.date,
                      selectedStartTime,
                      selectedEndTime
                    ) && (
                      <p className="mt-3 pt-3 border-t border-rose-200 text-sm font-bold text-rose-700">
                        ⚠ Overlaps with an existing programme.
                      </p>
                    )}
                  </div>
                )}
                {/* Buttons */}
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <button
                    type="button"
                    disabled={Boolean(processingId)}
                    onClick={closeApprovalModal}
                    className="px-6 py-3.5 border border-stone-200 rounded-full font-black text-xs uppercase tracking-wider text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={
                      Boolean(processingId) ||
                      !selectedDuration ||
                      !selectedStartTime ||
                      hasTimeConflict(
                        approvalRequest.date,
                        selectedStartTime,
                        selectedEndTime
                      )
                    }
                    onClick={handleApprove}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-full font-black text-xs uppercase tracking-wider disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed transition shadow-lg shadow-emerald-200/60 disabled:shadow-none"
                  >
                    {processingId ? "Approving…" : "Confirm Approval"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ============ REJECTION MODAL ============ */}
        {rejectionRequest && (
          <div
            className="fixed inset-0 z-[9999] bg-stone-900/70 backdrop-blur-md p-4 flex items-end sm:items-center justify-center animate-fade-in"
            onClick={closeRejectionModal}
          >
            <div
              className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 sm:p-8">
                <div className="mb-6 pb-6 border-b border-stone-100">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-700 mb-3">
                    Decline Request
                  </p>
                  <h2 className="font-serif text-3xl font-black text-stone-900 leading-tight">
                    Provide
                    <span className="italic font-light"> Rejection Reason</span>
                  </h2>
                  <p className="text-sm text-stone-500 mt-3 flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-stone-800">
                      {rejectionRequest.name}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span>{rejectionRequest.date}</span>
                  </p>
                </div>
                <div className="mb-6">
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-stone-500 mb-3">
                    Reason *
                  </label>
                  <textarea
                    rows={5}
                    maxLength={500}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Kindly share the reason for declining this Cultural Seva request…"
                    className="w-full resize-none border-2 border-stone-200 rounded-2xl px-4 py-3.5 text-sm text-stone-800 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-100 transition"
                  />
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-stone-400 italic">
                      Minimum 5 characters
                    </p>
                    <p className="text-xs text-stone-400 tabular-nums">
                      {rejectionReason.length}/500
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <button
                    type="button"
                    disabled={Boolean(processingId)}
                    onClick={closeRejectionModal}
                    className="px-6 py-3.5 border border-stone-200 rounded-full font-black text-xs uppercase tracking-wider text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={
                      Boolean(processingId) ||
                      rejectionReason.trim().length < 5
                    }
                    onClick={handleReject}
                    className="bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-full font-black text-xs uppercase tracking-wider disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed transition shadow-lg shadow-rose-200/60 disabled:shadow-none"
                  >
                    {processingId ? "Declining…" : "Confirm Rejection"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CulturalRequests;