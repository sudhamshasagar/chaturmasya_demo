import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Search,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  AlertCircle,
  Loader2,
  X,
  CalendarDays,
} from "lucide-react";

/* =========================================================
   CONSTANTS & UTILS
========================================================= */
// const MAX_BOOKINGS_PER_DAY = 3;

// const getMaxBookingsForDate = (dateString) => {
//   if (!dateString) return MAX_BOOKINGS_PER_DAY;
//   const [year, month, day] = dateString.split("-").map(Number);
//   const date = new Date(year, month - 1, day);
//   return date.getDay() === 1 ? 2 : 3;
// };

const DURATION_OPTIONS = [
  { label: "10 Min", value: 10 },
  { label: "15 Min", value: 15 },
  { label: "30 Min", value: 30 },
  { label: "45 Min", value: 45 },
  { label: "1 Hour", value: 60 },
];

const PROGRAM_CATEGORIES = [
  "Harikatha", "Bhajan", "Vocal Music", "Instrumental", 
  "Classical Dance", "Spiritual Discourse", "Group Chanting", "Others",
];

const STATUS_META = {
  pending: {
    label: "Pending",
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-200",
    icon: Clock,
  },
  approved: {
    label: "Allocated",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
    icon: CheckCircle,
  },
  rejected: {
    label: "Declined",
    bg: "bg-rose-100",
    text: "text-rose-800",
    border: "border-rose-200",
    icon: XCircle,
  },
};

const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function CulturalRequests() {
  const [allRequests, setAllRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Modals State
  const [approvalRequest, setApprovalRequest] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");

  const [rejectionRequest, setRejectionRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [editingRequest, setEditingRequest] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filters State
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState(""); 
  const [filterDate, setFilterDate] = useState("");

  // ============ FIREBASE LISTENERS ============
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "culturalRequests"),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const aT = a.createdAt?.toMillis?.() || 0;
          const bT = b.createdAt?.toMillis?.() || 0;
          return bT - aT; // Descending
        });
        setAllRequests(data);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load requests:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const approvedQuery = query(collection(db, "culturalRequests"), where("status", "==", "approved"));
    const unsubscribe = onSnapshot(approvedQuery, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setApprovedRequests(data);
    });
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
    return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
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
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const hasTimeConflictExcluding = (date, newStart, newEnd, excludeId = null) => {
    const ns = timeToMinutes(newStart);
    const ne = timeToMinutes(newEnd);
    return approvedRequests.some((b) => {
      if (excludeId && b.id === excludeId) return false;
      if (b.date !== date) return false;
      if (!b.startTime || !b.endTime) return false;
      const es = timeToMinutes(b.startTime);
      const ee = timeToMinutes(b.endTime);
      return ns < ee && ne > es;
    });
  };

  // ============ MODAL OPENERS ============
  const openApprovalModal = (req) => {
    setApprovalRequest(req);
    setSelectedDuration("");
    setSelectedStartTime("");
  };

  const openRejectionModal = (req) => {
    setRejectionRequest(req);
    setRejectionReason("");
  };

  // ============ QUICK ACTIONS ============
 const handleApprove = async () => {
  if (!approvalRequest?.id || !approvalRequest?.date) return;

  if (!selectedDuration)
    return alert("Please select the duration.");

  if (!selectedStartTime)
    return alert("Please select the start time.");

  const durationMinutes = Number(selectedDuration);
  const endTime = calculateEndTime(
    selectedStartTime,
    durationMinutes
  );

  if (
    hasTimeConflictExcluding(
      approvalRequest.date,
      selectedStartTime,
      endTime,
      approvalRequest.id
    )
  ) {
    return alert(
      "The selected time overlaps with another approved program."
    );
  }

  setProcessingId(approvalRequest.id);

  try {
    await runTransaction(db, async (transaction) => {
      const requestRef = doc(
        db,
        "culturalRequests",
        approvalRequest.id
      );

      const requestSnapshot =
        await transaction.get(requestRef);

      if (!requestSnapshot.exists())
        throw new Error("REQUEST_NOT_FOUND");

      const latestRequest = requestSnapshot.data();

      if (latestRequest.status !== "pending")
        throw new Error("REQUEST_ALREADY_PROCESSED");

      transaction.update(requestRef, {
        status: "approved",
        durationMinutes,
        startTime: selectedStartTime,
        endTime,
        approvedAt: serverTimestamp(),
        rejectionReason: null,
      });
    });

    setApprovalRequest(null);
  } catch (error) {
    if (error.message === "REQUEST_ALREADY_PROCESSED") {
      alert("Request already processed.");
    } else {
      alert("Failed to approve request.");
    }
  } finally {
    setProcessingId(null);
  }
}; 

  const handleReject = async () => {
    if (!rejectionRequest?.id) return;
    const reason = rejectionReason.trim();
    if (reason.length < 5) return alert("Please provide a meaningful reason.");

    setProcessingId(rejectionRequest.id);
    try {
      await runTransaction(db, async (transaction) => {
        const requestRef = doc(db, "culturalRequests", rejectionRequest.id);
        const requestSnapshot = await transaction.get(requestRef);
        if (!requestSnapshot.exists()) throw new Error("REQUEST_NOT_FOUND");
        if (requestSnapshot.data().status?.toLowerCase() !== "pending") throw new Error("REQUEST_ALREADY_PROCESSED");
        
        transaction.update(requestRef, {
          status: "rejected",
          rejectionReason: reason,
          rejectedAt: serverTimestamp(),
        });
      });
      setRejectionRequest(null);
    } catch (error) {
      alert("Failed to reject request.");
    } finally {
      setProcessingId(null);
    }
  };

  // ============ EDIT (Full Update) ============
  const handleEditSubmit = async (e) => {
  e.preventDefault();

  if (!editingRequest) return;

  setProcessingId(editingRequest.id);

  try {
    const originalReq = allRequests.find(
      (r) => r.id === editingRequest.id
    );

    const newStatus =
      editingRequest.status?.toLowerCase();

    let finalEndTime = null;

    if (newStatus === "approved") {
      if (
        !editingRequest.startTime ||
        !editingRequest.durationMinutes
      ) {
        throw new Error("MISSING_ALLOCATION");
      }

      finalEndTime = calculateEndTime(
        editingRequest.startTime,
        editingRequest.durationMinutes
      );

      if (
        hasTimeConflictExcluding(
          editingRequest.date,
          editingRequest.startTime,
          finalEndTime,
          editingRequest.id
        )
      ) {
        throw new Error("TIME_CONFLICT");
      }
    }

    await runTransaction(db, async (transaction) => {
      const reqRef = doc(
        db,
        "culturalRequests",
        editingRequest.id
      );

      transaction.update(reqRef, {
        name: editingRequest.name || "",
        contact: editingRequest.contact || "",
        date: editingRequest.date || "",

        category: editingRequest.category || "",

        otherCategory:
          editingRequest.category === "Others"
            ? editingRequest.otherCategory || ""
            : null,

        participationType:
          editingRequest.participationType || "solo",

        groupName:
          editingRequest.participationType === "group"
            ? editingRequest.groupName || ""
            : null,

        managerName:
          editingRequest.participationType === "group"
            ? editingRequest.managerName || ""
            : null,

        participantCount:
          editingRequest.participationType === "group"
            ? Number(
                editingRequest.participantCount || 2
              )
            : 1,

        status: newStatus,

        startTime:
          newStatus === "approved"
            ? editingRequest.startTime
            : null,

        durationMinutes:
          newStatus === "approved"
            ? Number(editingRequest.durationMinutes)
            : null,

        endTime:
          newStatus === "approved"
            ? finalEndTime
            : null,

        rejectionReason:
          newStatus === "rejected"
            ? editingRequest.rejectionReason || ""
            : null,

        updatedAt: serverTimestamp(),
      });
    });

    setEditingRequest(null);
  } catch (error) {
    if (error.message === "TIME_CONFLICT") {
      alert("Time overlaps with an existing program.");
    } else if (
      error.message === "MISSING_ALLOCATION"
    ) {
      alert(
        "Approved programs require Start Time and Duration."
      );
    } else {
      alert("Failed to update request.");
    }
  } finally {
    setProcessingId(null);
  }
};

  // ============ DELETE ============
  const handleDelete = async () => {
  if (!deleteConfirmId) return;

  setProcessingId(deleteConfirmId);

  try {
    const req = allRequests.find(
      (r) => r.id === deleteConfirmId
    );

    if (req) {
      await runTransaction(db, async (transaction) => {
        const reqRef = doc(
          db,
          "culturalRequests",
          req.id
        );

        transaction.delete(reqRef);
      });
    }

    setDeleteConfirmId(null);
  } catch (error) {
    alert("Failed to delete request.");
  } finally {
    setProcessingId(null);
  }
};

  // ============ EXPORT ============
  const escapeCSV = (val) => `"${String(val || "").replace(/"/g, '""')}"`;
  const handleExportCSV = () => {
    const headers = ["Booking ID", "Devotee Name", "Contact", "Date", "Category", "Participation Type", "Group Name", "Manager Name", "Participants Count", "Status", "Start Time", "End Time", "Duration (Mins)", "Rejection Reason", "Created At"];
    const rows = allRequests.map((r) => [
      escapeCSV(r.bookingId || r.id), escapeCSV(r.name), escapeCSV(r.contact), escapeCSV(r.date),
      escapeCSV(r.category === "Others" ? r.otherCategory : r.category), escapeCSV(r.participationType || "solo"),
      escapeCSV(r.groupName || "N/A"), escapeCSV(r.managerName || "N/A"), escapeCSV(r.participantCount || 1),
      escapeCSV(r.status || "pending"), escapeCSV(r.startTime || "N/A"), escapeCSV(r.endTime || "N/A"),
      escapeCSV(r.durationMinutes || "N/A"), escapeCSV(r.rejectionReason || "N/A"),
      escapeCSV(r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : ""),
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Cultural_Ledger_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // ============ FILTERING & DERIVED LISTS ============
  const pendingList = allRequests.filter((r) => r.status?.toLowerCase() === "pending");
  const approvedList = allRequests.filter((r) => r.status?.toLowerCase() === "approved");
  const rejectedList = allRequests.filter((r) => r.status?.toLowerCase() === "rejected");

  const baseList =
    activeTab === "pending" ? pendingList :
    activeTab === "approved" ? approvedList :
    activeTab === "rejected" ? rejectedList :
    allRequests;

  const displayedRequests = baseList.filter((r) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!(r.name?.toLowerCase().includes(q) || r.contact?.toLowerCase().includes(q) || r.date?.toLowerCase().includes(q) || r.groupName?.toLowerCase().includes(q) || r.bookingId?.toLowerCase().includes(q))) return false;
    }
    if (filterDate && r.date !== filterDate) return false;
    if (filterMonth && !r.date?.startsWith(filterMonth)) return false;
    return true;
  });

  const clearDateFilters = () => {
    setFilterDate("");
    setFilterMonth("");
  };

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-amber-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Loading Ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-amber-50 overflow-hidden font-sans selection:bg-amber-200 selection:text-amber-900">
      
      {/* ============ HEADER (Fixed) ============ */}
      <header className="shrink-0 bg-white border-b border-stone-200 px-4 md:px-8 py-4 z-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-1">
              <Link to="/admin" className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors">
                <ArrowLeft size={16} />
              </Link>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Admin Ledger</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">Cultural Requests</h1>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search name, ID, group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-amber-400 focus:bg-white transition-colors"
              />
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2">
              <div className="relative group">
                <input 
                  type="month" 
                  value={filterMonth}
                  onChange={(e) => { setFilterMonth(e.target.value); setFilterDate(""); }}
                  className="bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:border-amber-400 cursor-pointer"
                  title="Filter by Month"
                />
              </div>
              <span className="text-stone-300 text-sm">|</span>
              <div className="relative group">
                <input 
                  type="date" 
                  value={filterDate}
                  onChange={(e) => { setFilterDate(e.target.value); setFilterMonth(""); }}
                  className="bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:border-amber-400 cursor-pointer"
                  title="Filter by Exact Date"
                />
              </div>
              {(filterMonth || filterDate) && (
                <button onClick={clearDateFilters} className="p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 rounded-full transition" title="Clear Filters">
                  <X size={16}/>
                </button>
              )}
            </div>

            {/* Export */}
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition shadow-sm"
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
            {[
              { id: "pending", label: "Pending", count: pendingList.length },
              { id: "approved", label: "Allocated", count: approvedList.length },
              { id: "rejected", label: "Declined", count: rejectedList.length },
              { id: "all", label: "All", count: allRequests.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-amber-100 text-amber-800"
                    : "bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-md text-[10px] tabular-nums ${activeTab === tab.id ? "bg-white border border-amber-200 text-amber-700" : "bg-stone-100 text-stone-500"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="hidden lg:flex items-center gap-6 shrink-0 bg-stone-50 px-4 py-1.5 rounded-lg border border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"/>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Pending: <span className="text-stone-900">{pendingList.length}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"/>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Allocated: <span className="text-stone-900">{approvedList.length}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT AREA (Scrollable) ============ */}
      <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${hideScrollbar}`}>
        {displayedRequests.length === 0 ? (
          <div className="h-full bg-white border border-stone-200 rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-sm">
            <CalendarDays className="w-12 h-12 text-stone-300 mb-4" />
            <p className="text-xl font-serif font-bold text-stone-900">No requests found</p>
            <p className="text-sm text-stone-500 mt-1 max-w-md">No cultural requests match your current search, tab, or date filters.</p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW (lg and above) strictly fitted */}
            <div className="hidden lg:block bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden w-full">
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="bg-stone-50 border-b border-stone-200 sticky top-0 z-10">
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                    <th className="px-5 py-4 w-[28%]">Request Info</th>
                    <th className="px-5 py-4 w-[18%]">Program Details</th>
                    <th className="px-5 py-4 w-[22%]">Participation</th>
                    <th className="px-5 py-4 w-[22%]">Status & Allocation</th>
                    <th className="px-5 py-4 w-[10%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {displayedRequests.map((req) => {
                    const s = req.status?.toLowerCase() || "pending";
                    const meta = STATUS_META[s] || STATUS_META.pending;
                    const Icon = meta.icon;
                    const isGroup = req.participationType === "group";

                    return (
                      <tr key={req.id} className="hover:bg-amber-50/50 transition-colors align-top group">
                        
                        {/* 1. Request Info (Wrapped) */}
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 font-serif font-bold flex items-center justify-center shrink-0 border border-stone-200">
                              {req.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm text-stone-900 break-words">{req.name}</p>
                              <p className="text-xs text-stone-500 mt-0.5 break-words">{req.contact}</p>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 mt-1 break-words">ID: {req.bookingId || "N/A"}</p>
                            </div>
                          </div>
                        </td>

                        {/* 2. Program Details (Wrapped) */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-stone-900">{req.date}</p>
                          <p className="text-xs text-stone-600 mt-1 font-medium bg-stone-100 border border-stone-200 inline-block px-2 py-0.5 rounded-sm break-words">
                            {req.category === "Others" ? req.otherCategory : req.category}
                          </p>
                        </td>

                        {/* 3. Participation (Wrapped) */}
                        <td className="px-5 py-4">
                          {isGroup ? (
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-stone-900 break-words">{req.groupName}</p>
                              <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1 border border-stone-200 inline-block px-1.5 py-0.5 rounded bg-white break-words">Mgr: {req.managerName}</p>
                              <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">Members: {req.participantCount}</p>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-stone-100 px-2 py-1 rounded">Solo</span>
                          )}
                        </td>

                        {/* 4. Status & Allocation (Wrapped) */}
                        <td className="px-5 py-4 pr-2">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${meta.bg} ${meta.border} ${meta.text}`}>
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{meta.label}</span>
                          </div>
                          {s === "approved" && (
                            <div className="mt-3">
                              <p className="text-xs font-bold text-stone-900 tabular-nums break-words">
                                {formatTime(req.startTime)} - {formatTime(req.endTime)}
                              </p>
                              <p className="text-[10px] text-stone-500 mt-0.5 font-semibold">Duration: {req.durationMinutes} Min</p>
                            </div>
                          )}
                          {s === "rejected" && (
                            <p className="text-[10px] text-rose-600 mt-2 break-words max-w-[200px]" title={req.rejectionReason}>
                              "{req.rejectionReason}"
                            </p>
                          )}
                        </td>

                        {/* 5. Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex flex-col items-end gap-2">
                            {s === "pending" && (
                              <div className="flex flex-col xl:flex-row items-end xl:items-center gap-2 mb-1">
                                <button onClick={() => openRejectionModal(req)} className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-[10px] font-bold uppercase tracking-widest transition shadow-sm w-full xl:w-auto text-center">Reject</button>
                                <button onClick={() => openApprovalModal(req)} className="px-3 py-1.5 bg-amber-600 text-white hover:bg-orange-500 rounded-lg text-[10px] font-bold uppercase tracking-widest transition shadow-sm w-full xl:w-auto text-center">Allocate</button>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingRequest({ ...req })} className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-lg transition" title="Edit Request">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDeleteConfirmId(req.id)} className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition" title="Delete Request">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE / TABLET CARDS VIEW (below lg) */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
              {displayedRequests.map((req) => {
                const s = req.status?.toLowerCase() || "pending";
                const meta = STATUS_META[s] || STATUS_META.pending;
                const Icon = meta.icon;
                const isGroup = req.participationType === "group";

                return (
                  <article key={req.id} className="bg-white rounded-[24px] border border-stone-200 shadow-sm overflow-hidden flex flex-col">
                    
                    {/* Header */}
                    <div className="p-4 border-b border-stone-100 flex justify-between items-start bg-stone-50/50">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-white border border-stone-200 text-stone-600 font-serif font-bold flex items-center justify-center shrink-0">
                          {req.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-stone-900 truncate">{req.name}</h3>
                          <p className="text-[11px] font-semibold text-stone-500 mt-0.5 truncate">{req.contact}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 mt-1">ID: {req.bookingId || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 bg-white border border-stone-200 p-0.5 rounded-lg shadow-sm">
                        <button onClick={() => setEditingRequest({ ...req })} className="p-1.5 text-stone-400 hover:text-amber-600 rounded-md transition"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteConfirmId(req.id)} className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex-1 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-stone-50 border border-stone-100 rounded-xl p-3">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Date & Program</p>
                          <p className="text-xs font-bold text-stone-900 mt-1">{req.date}</p>
                          <p className="text-[10px] text-stone-600 truncate mt-1 bg-white border border-stone-200 inline-block px-1.5 py-0.5 rounded">{req.category === "Others" ? req.otherCategory : req.category}</p>
                        </div>
                        <div className="bg-stone-50 border border-stone-100 rounded-xl p-3">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Type / Group</p>
                          <p className="text-xs font-bold text-stone-900 mt-1">{isGroup ? req.groupName : "Solo"}</p>
                          {isGroup && <p className="text-[10px] text-stone-600 truncate mt-1">{req.participantCount} Pax • {req.managerName}</p>}
                        </div>
                      </div>

                      <div className={`mt-auto rounded-xl p-3 border ${meta.bg.replace('bg-','bg-').replace('100','50')} ${meta.border}`}>
                        <div className="flex justify-between items-center gap-2">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${meta.bg} ${meta.border} ${meta.text}`}>
                            <Icon className="w-3.5 h-3.5" /> {meta.label}
                          </div>
                          {s === "pending" && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => openRejectionModal(req)} className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-sm">Reject</button>
                              <button onClick={() => openApprovalModal(req)} className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-sm">Allocate</button>
                            </div>
                          )}
                        </div>
                        
                        {s === "approved" && (
                          <div className="mt-3 bg-white/60 p-2 rounded-lg border border-emerald-200/50">
                            <p className="text-xs font-bold text-stone-900">{formatTime(req.startTime)} - {formatTime(req.endTime)}</p>
                            <p className="text-[10px] text-stone-600 mt-0.5 font-semibold">Duration: {req.durationMinutes} Min</p>
                          </div>
                        )}
                        {s === "rejected" && (
                          <p className="text-[10px] text-rose-700 mt-2 bg-white/60 p-2 rounded-lg italic">"{req.rejectionReason}"</p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* =========================================================
          MODALS
      ========================================================= */}

      {/* 1. APPROVAL MODAL */}
      <AnimatePresence>
        {approvalRequest && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white rounded-[24px] shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto">
                <div className="p-5 border-b border-stone-100 bg-stone-50 flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-stone-900">Allocate Program</h3>
                    <p className="text-xs font-semibold text-stone-500 mt-0.5">{approvalRequest.name} • {approvalRequest.date}</p>
                  </div>
                  <button onClick={() => setApprovalRequest(null)} className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-200 rounded-full transition"><X size={18}/></button>
                </div>

                <div className={`p-5 space-y-5 overflow-y-auto ${hideScrollbar}`}>
                  {/* Existing Programs */}
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-stone-500 mb-2">Existing Programs on {approvalRequest.date}</p>
                    {getApprovedProgramsForDate(approvalRequest.date).length === 0 ? (
                      <p className="text-xs italic text-stone-400">No programs allocated yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {getApprovedProgramsForDate(approvalRequest.date).map(p => (
                          <div key={p.id} className="text-[11px] bg-white border border-stone-200 p-2 rounded-lg flex justify-between items-center shadow-sm">
                            <span className="font-bold text-stone-900 truncate mr-2">{p.name}</span>
                            <span className="tabular-nums text-amber-700 shrink-0 font-bold">{formatTime(p.startTime)} - {formatTime(p.endTime)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Inputs */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-2">Select Duration</label>
                    <div className="grid grid-cols-3 gap-2">
                      {DURATION_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setSelectedDuration(opt.value)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-colors shadow-sm ${
                            Number(selectedDuration) === opt.value ? "bg-amber-600 text-white border-amber-600" : "bg-white text-stone-600 border-stone-200 hover:border-amber-400"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={selectedStartTime}
                      onChange={(e) => setSelectedStartTime(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  {/* Summary */}
                  {selectedDuration && selectedStartTime && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-amber-700 mb-1">Proposed Time Slot</p>
                      <p className="text-base font-bold text-stone-900">{formatTime(selectedStartTime)} - {formatTime(selectedEndTime)}</p>
                      {hasTimeConflictExcluding(approvalRequest.date, selectedStartTime, selectedEndTime, approvalRequest.id) && (
                        <p className="text-xs text-rose-600 font-bold mt-2 flex items-center gap-1.5 bg-rose-50 p-2 rounded-lg border border-rose-200"><AlertCircle size={14}/> Overlaps with an existing program.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-stone-100 flex justify-end gap-3 shrink-0 bg-stone-50">
                  <button onClick={() => setApprovalRequest(null)} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-200 rounded-xl transition">Cancel</button>
                  <button 
                    onClick={handleApprove}
                    disabled={processingId || !selectedDuration || !selectedStartTime || hasTimeConflictExcluding(approvalRequest.date, selectedStartTime, selectedEndTime, approvalRequest.id)}
                    className="px-6 py-2.5 bg-amber-600 hover:bg-orange-500 disabled:bg-stone-300 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition shadow-sm flex items-center gap-2"
                  >
                    {processingId === approvalRequest.id ? <Loader2 className="w-4 h-4 animate-spin"/> : "Confirm & Allocate"}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* 2. REJECTION MODAL */}
      <AnimatePresence>
        {rejectionRequest && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white rounded-[24px] shadow-2xl border border-rose-100 w-full max-w-md overflow-hidden pointer-events-auto">
                <div className="p-5 border-b border-rose-100 bg-rose-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-rose-900">Decline Request</h3>
                    <p className="text-xs font-semibold text-rose-700/80 mt-0.5">{rejectionRequest.name} • {rejectionRequest.date}</p>
                  </div>
                  <button onClick={() => setRejectionRequest(null)} className="p-1.5 text-rose-400 hover:text-rose-900 hover:bg-rose-200 rounded-full transition"><X size={18}/></button>
                </div>
                <div className="p-6">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-2">Reason for Declining</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm font-semibold outline-none focus:border-rose-400 focus:bg-white transition-colors resize-none shadow-sm"
                    placeholder="Provide a reason for the devotee..."
                  />
                </div>
                <div className="p-4 border-t border-stone-100 flex justify-end gap-3 bg-stone-50">
                  <button onClick={() => setRejectionRequest(null)} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-200 rounded-xl transition">Cancel</button>
                  <button 
                    onClick={handleReject}
                    disabled={processingId || rejectionReason.trim().length < 5}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-stone-300 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition shadow-sm flex items-center gap-2"
                  >
                    {processingId === rejectionRequest.id ? <Loader2 className="w-4 h-4 animate-spin"/> : "Decline Request"}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* 3. DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm p-8 text-center pointer-events-auto border border-stone-100">
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">Delete Request?</h3>
                <p className="text-sm font-medium text-stone-500 mb-8">This action cannot be undone. Any approved slots tied to this request will be freed up.</p>
                <div className="flex flex-col gap-3">
                  <button onClick={handleDelete} disabled={processingId} className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-sm flex items-center justify-center gap-2">
                    {processingId === deleteConfirmId ? <Loader2 className="w-4 h-4 animate-spin"/> : "Yes, Delete Request"}
                  </button>
                  <button onClick={() => setDeleteConfirmId(null)} className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs uppercase tracking-widest rounded-xl transition">
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* 4. COMPREHENSIVE EDIT MODAL */}
      <AnimatePresence>
        {editingRequest && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 py-8 pointer-events-none">
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white rounded-[24px] shadow-2xl w-full max-w-3xl flex flex-col max-h-full border border-stone-200 pointer-events-auto overflow-hidden">
                
                <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-stone-50 shrink-0">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">Edit Request Details</h3>
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-1">ID: {editingRequest.bookingId || editingRequest.id}</p>
                  </div>
                  <button onClick={() => setEditingRequest(null)} className="p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-900 rounded-full transition shadow-sm bg-white border border-stone-200"><X size={18}/></button>
                </div>
                
                <div className={`flex-1 overflow-y-auto p-5 sm:p-8 bg-white ${hideScrollbar}`}>
                  <form id="editForm" onSubmit={handleEditSubmit} className="space-y-8">
                    
                    {/* Devotee Info */}
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-2 mb-4">Devotee Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1.5">Devotee Name</label>
                          <input type="text" required value={editingRequest.name || ""} onChange={e => setEditingRequest({...editingRequest, name: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 transition-colors" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1.5">Contact Number</label>
                          <input type="tel" required value={editingRequest.contact || ""} onChange={e => setEditingRequest({...editingRequest, contact: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 transition-colors" />
                        </div>
                      </div>
                    </div>

                    {/* Program Info */}
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-2 mb-4">Program Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1.5">Date</label>
                          <input type="date" required value={editingRequest.date || ""} onChange={e => setEditingRequest({...editingRequest, date: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 transition-colors" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1.5">Category</label>
                          <select value={editingRequest.category || ""} onChange={e => setEditingRequest({...editingRequest, category: e.target.value, otherCategory: e.target.value === "Others" ? editingRequest.otherCategory : null})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 transition-colors">
                            {PROGRAM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      
                      {editingRequest.category === "Others" && (
                        <div className="mb-5">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1.5">Specify Category</label>
                          <input type="text" required value={editingRequest.otherCategory || ""} onChange={e => setEditingRequest({...editingRequest, otherCategory: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 transition-colors" />
                        </div>
                      )}

                      {/* Date Availability Hint */}

                      {editingRequest.date && (
                        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-stone-500 mb-3">
                            Existing Programs on {editingRequest.date}
                          </p>

                          {getApprovedProgramsForDate(editingRequest.date)
                            .filter((p) => p.id !== editingRequest.id)
                            .length === 0 ? (
                            <p className="text-xs italic text-stone-400">
                              No other programs allocated for this date.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {getApprovedProgramsForDate(editingRequest.date)
                                .filter((p) => p.id !== editingRequest.id)
                                .map((program) => (
                                  <div
                                    key={program.id}
                                    className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-3"
                                  >
                                    <div>
                                      <p className="text-xs font-bold text-stone-900">
                                        {program.name}
                                      </p>
                                      <p className="text-[10px] text-stone-500">
                                        {program.category === "Others"
                                          ? program.otherCategory
                                          : program.category}
                                      </p>
                                    </div>

                                    <p className="text-xs font-bold text-amber-700">
                                      {formatTime(program.startTime)} - {formatTime(program.endTime)}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Participation */}
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-2 mb-4">Participation</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1.5">Type</label>
                          <select value={editingRequest.participationType || "solo"} onChange={e => setEditingRequest({...editingRequest, participationType: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 transition-colors">
                            <option value="solo">Solo</option>
                            <option value="group">Group</option>
                          </select>
                        </div>
                        {editingRequest.participationType === "group" && (
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1.5">Participant Count</label>
                            <input type="number" min="2" required value={editingRequest.participantCount || 2} onChange={e => setEditingRequest({...editingRequest, participantCount: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 transition-colors" />
                          </div>
                        )}
                      </div>
                      {editingRequest.participationType === "group" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1.5">Group Name</label>
                            <input type="text" required value={editingRequest.groupName || ""} onChange={e => setEditingRequest({...editingRequest, groupName: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1.5">Manager Name</label>
                            <input type="text" required value={editingRequest.managerName || ""} onChange={e => setEditingRequest({...editingRequest, managerName: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 transition-colors" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Admin Allocation & Status */}
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-amber-600 border-b border-stone-100 pb-2 mb-4">Admin Controls</h4>
                      <div className="mb-5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1.5">Status</label>
                        <select value={editingRequest.status?.toLowerCase() || "pending"} onChange={e => setEditingRequest({...editingRequest, status: e.target.value})} className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-amber-500 shadow-sm transition-colors">
                          <option value="pending">Pending</option>
                          <option value="approved">Approved & Allocated</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      {editingRequest.status?.toLowerCase() === "approved" && (
                        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-amber-800 mb-1.5">Start Time</label>
                            <input type="time" required value={editingRequest.startTime || ""} onChange={(e) => setEditingRequest({...editingRequest, startTime: e.target.value})} className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-500 shadow-sm" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-amber-800 mb-1.5">Duration</label>
                            <select required value={editingRequest.durationMinutes || ""} onChange={(e) => setEditingRequest({...editingRequest, durationMinutes: e.target.value})} className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-500 shadow-sm">
                              <option value="" disabled>Select...</option>
                              {DURATION_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                            </select>
                          </div>
                          {editingRequest.startTime && editingRequest.durationMinutes && (() => {
                              const endTime = calculateEndTime(editingRequest.startTime, editingRequest.durationMinutes);
                              const hasConflict = hasTimeConflictExcluding(editingRequest.date, editingRequest.startTime, endTime, editingRequest.id);
                              return (
                                <div className={`sm:col-span-2 p-4 rounded-xl border ${hasConflict ? "bg-rose-50 border-rose-200" : "bg-white border-emerald-200 shadow-sm"}`}>
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-stone-500 mb-1">Time Slot Summary</p>
                                  <p className="font-bold text-stone-900 text-sm tabular-nums">{formatTime(editingRequest.startTime)} - {formatTime(endTime)}</p>
                                  {hasConflict ? (
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-rose-700 mt-2 flex items-center gap-1.5"><AlertCircle size={14} /> Time overlap detected</p>
                                  ) : (
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mt-2 flex items-center gap-1.5"><CheckCircle size={14}/> Slot Available</p>
                                  )}
                                </div>
                              );
                          })()}
                        </div>
                      )}

                      {editingRequest.status?.toLowerCase() === "rejected" && (
                        <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-800 mb-1.5">Reason for rejection</label>
                          <textarea rows={3} required value={editingRequest.rejectionReason || ""} onChange={e => setEditingRequest({...editingRequest, rejectionReason: e.target.value})} className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-rose-400 shadow-sm resize-none" placeholder="Provide a reason..." />
                        </div>
                      )}
                    </div>
                  </form>
                </div>

                <div className="p-5 border-t border-stone-200 bg-stone-50 flex justify-end gap-3 shrink-0">
                  <button type="button" onClick={() => setEditingRequest(null)} className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-200 rounded-xl transition">Cancel</button>
                  <button type="submit" form="editForm" disabled={processingId} className="px-8 py-2.5 bg-amber-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition disabled:bg-stone-300 shadow-sm flex items-center gap-2">
                    {processingId === editingRequest.id ? <Loader2 className="w-4 h-4 animate-spin"/> : "Save Changes"}
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