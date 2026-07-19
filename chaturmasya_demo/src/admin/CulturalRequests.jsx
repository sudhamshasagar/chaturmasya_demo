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
  X,
  Users,
  User,
  Building2,
  UserCircle,
} from "lucide-react";

const MAX_BOOKINGS_PER_DAY = 3;

const getMaxBookingsForDate = (dateString) => {
  if (!dateString) return MAX_BOOKINGS_PER_DAY;
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getDay() === 1 ? 2 : 3;
};

const DURATION_OPTIONS = [
  { label: "30 Min", value: 30 },
  { label: "45 Min", value: 45 },
  { label: "1 Hour", value: 60 },
];

const PROGRAM_CATEGORIES = [
  "Harikatha",
  "Bhajan",
  "Vocal Music",
  "Instrumental",
  "Classical Dance",
  "Spiritual Discourse",
  "Group Chanting",
  "Others",
];

const STATUS_META = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Clock,
  },
  approved: {
    label: "Allocated",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle,
  },
  rejected: {
    label: "Declined",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: XCircle,
  },
};

const CulturalRequests = () => {
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

  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  // ============ ALL REQUESTS LISTENER ============
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

  // ============ OPEN APPROVAL MODAL ============
  const openApprovalModal = (req) => {
    setApprovalRequest(req);
    setSelectedDuration("");
    setSelectedStartTime("");
  };

  // ============ OPEN REJECTION MODAL ============
  const openRejectionModal = (req) => {
    setRejectionRequest(req);
    setRejectionReason("");
  };

  // ============ APPROVE (Quick Action) ============
  const handleApprove = async () => {
    if (!approvalRequest?.id || !approvalRequest?.date) return;
    if (!selectedDuration) return alert("Please select the duration.");
    if (!selectedStartTime) return alert("Please select the start time.");

    const durationMinutes = Number(selectedDuration);
    const endTime = calculateEndTime(selectedStartTime, durationMinutes);

    if (hasTimeConflictExcluding(approvalRequest.date, selectedStartTime, endTime, approvalRequest.id)) {
      alert("The selected time overlaps with another approved program.");
      return;
    }

    setProcessingId(approvalRequest.id);
    try {
      await runTransaction(db, async (transaction) => {
        const requestRef = doc(db, "culturalRequests", approvalRequest.id);
        const availabilityRef = doc(db, "culturalAvailability", approvalRequest.date);
        const requestSnapshot = await transaction.get(requestRef);
        const availabilitySnapshot = await transaction.get(availabilityRef);

        if (!requestSnapshot.exists()) throw new Error("REQUEST_NOT_FOUND");
        const latestRequest = requestSnapshot.data();
        if (latestRequest.status !== "pending" && latestRequest.status !== "Pending") {
          throw new Error("REQUEST_ALREADY_PROCESSED");
        }

        let approvedCount = 0;
        const maxSlots = getMaxBookingsForDate(approvalRequest.date);
        if (availabilitySnapshot.exists()) {
          approvedCount = Number(availabilitySnapshot.data().approvedCount) || 0;
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
      setApprovalRequest(null);
      setSelectedDuration("");
      setSelectedStartTime("");
    } catch (error) {
      console.error(error);
      if (error.message === "DATE_FULL") alert("This date already has maximum approved programs.");
      else if (error.message === "REQUEST_ALREADY_PROCESSED") alert("Request already processed.");
      else alert("Failed to approve request.");
    } finally {
      setProcessingId(null);
    }
  };

  // ============ REJECT (Quick Action) ============
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
        
        const latestStatus = requestSnapshot.data().status?.toLowerCase();
        if (latestStatus !== "pending") throw new Error("REQUEST_ALREADY_PROCESSED");
        
        transaction.update(requestRef, {
          status: "rejected",
          rejectionReason: reason,
          rejectedAt: serverTimestamp(),
        });
      });
      setRejectionRequest(null);
      setRejectionReason("");
    } catch (error) {
      console.error(error);
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
      const originalReq = allRequests.find((r) => r.id === editingRequest.id);
      if (!originalReq) throw new Error("Original request not found.");

      const oldStatus = originalReq.status?.toLowerCase();
      const newStatus = editingRequest.status?.toLowerCase();
      const oldDate = originalReq.date;
      const newDate = editingRequest.date;

      let finalEndTime = null;

      if (newStatus === "approved") {
        if (!editingRequest.startTime || !editingRequest.durationMinutes) {
          throw new Error("MISSING_ALLOCATION");
        }
        finalEndTime = calculateEndTime(editingRequest.startTime, editingRequest.durationMinutes);
        const conflict = hasTimeConflictExcluding(newDate, editingRequest.startTime, finalEndTime, editingRequest.id);
        if (conflict) throw new Error("TIME_CONFLICT");
      }

      await runTransaction(db, async (transaction) => {
        const reqRef = doc(db, "culturalRequests", editingRequest.id);

        const shouldRemoveOldSlot = oldStatus === "approved" && (newStatus !== "approved" || oldDate !== newDate);
        const shouldAddNewSlot = newStatus === "approved" && (oldStatus !== "approved" || oldDate !== newDate);

        const oldAvailRef = shouldRemoveOldSlot ? doc(db, "culturalAvailability", oldDate) : null;
        const newAvailRef = shouldAddNewSlot ? doc(db, "culturalAvailability", newDate) : null;

        const oldAvailSnap = oldAvailRef ? await transaction.get(oldAvailRef) : null;
        const newAvailSnap = newAvailRef ? await transaction.get(newAvailRef) : null;

        if (shouldAddNewSlot) {
          const currentCount = newAvailSnap?.exists() ? Number(newAvailSnap.data().approvedCount || 0) : 0;
          const maxSlots = getMaxBookingsForDate(newDate);
          if (currentCount >= maxSlots) throw new Error("NEW_DATE_FULL");
        }

        if (shouldRemoveOldSlot && oldAvailRef) {
          if (oldAvailSnap?.exists()) {
            const oldCount = Number(oldAvailSnap.data().approvedCount || 0);
            transaction.update(oldAvailRef, {
              approvedCount: Math.max(0, oldCount - 1),
              updatedAt: serverTimestamp(),
            });
          }
        }

        if (shouldAddNewSlot && newAvailRef) {
          const currentCount = newAvailSnap?.exists() ? Number(newAvailSnap.data().approvedCount || 0) : 0;
          const maxSlots = getMaxBookingsForDate(newDate);
          transaction.set(
            newAvailRef,
            {
              date: newDate,
              approvedCount: currentCount + 1,
              maxSlots,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }

        transaction.update(reqRef, {
          name: editingRequest.name || "",
          contact: editingRequest.contact || "",
          date: newDate || "",
          category: editingRequest.category || "",
          otherCategory: editingRequest.category === "Others" ? editingRequest.otherCategory || "" : null,
          participationType: editingRequest.participationType || "solo",
          groupName: editingRequest.participationType === "group" ? editingRequest.groupName || "" : null,
          managerName: editingRequest.participationType === "group" ? editingRequest.managerName || "" : null,
          participantCount: editingRequest.participationType === "group" ? Number(editingRequest.participantCount || 2) : 1,
          status: newStatus || "pending",
          startTime: newStatus === "approved" ? editingRequest.startTime || "" : null,
          durationMinutes: newStatus === "approved" ? Number(editingRequest.durationMinutes || 0) : null,
          endTime: newStatus === "approved" ? finalEndTime || "" : null,
          rejectionReason: newStatus === "rejected" ? editingRequest.rejectionReason || "" : null,
          updatedAt: serverTimestamp(),
        });
      });

      setEditingRequest(null);
    } catch (error) {
      console.error(error);
      if (error.message === "NEW_DATE_FULL") alert("The selected date is already full.");
      else if (error.message === "TIME_CONFLICT") alert("Time overlaps with an existing program on this date.");
      else if (error.message === "MISSING_ALLOCATION") alert("Approved programs require Start Time and Duration.");
      else alert("Failed to update request.");
    } finally {
      setProcessingId(null);
    }
  };

  // ============ DELETE ============
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setProcessingId(deleteConfirmId);
    try {
      const req = allRequests.find((r) => r.id === deleteConfirmId);
      if (req) {
        await runTransaction(db, async (transaction) => {
          const reqRef = doc(db, "culturalRequests", req.id);
          if (req.status?.toLowerCase() === "approved") {
            const availRef = doc(db, "culturalAvailability", req.date);
            const snap = await transaction.get(availRef);
            if (snap.exists()) {
              const c = Math.max(0, (snap.data().approvedCount || 1) - 1);
              transaction.update(availRef, { approvedCount: c });
            }
          }
          transaction.delete(reqRef);
        });
      }
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Failed to delete request.");
    } finally {
      setProcessingId(null);
    }
  };

  // ============ EXPORT ============
  const escapeCSV = (val) => `"${String(val || "").replace(/"/g, '""')}"`;
  const handleExportCSV = () => {
    const headers = [
      "Booking ID",
      "Devotee Name",
      "Contact",
      "Date",
      "Category",
      "Participation Type",
      "Group Name",
      "Manager Name",
      "Participants Count",
      "Status",
      "Start Time",
      "End Time",
      "Duration (Mins)",
      "Rejection Reason",
      "Created At"
    ];
    
    const rows = allRequests.map((r) => [
      escapeCSV(r.bookingId || r.id),
      escapeCSV(r.name),
      escapeCSV(r.contact),
      escapeCSV(r.date),
      escapeCSV(r.category === "Others" ? r.otherCategory : r.category),
      escapeCSV(r.participationType || "solo"),
      escapeCSV(r.groupName || "N/A"),
      escapeCSV(r.managerName || "N/A"),
      escapeCSV(r.participantCount || 1),
      escapeCSV(r.status || "pending"),
      escapeCSV(r.startTime || "N/A"),
      escapeCSV(r.endTime || "N/A"),
      escapeCSV(r.durationMinutes || "N/A"),
      escapeCSV(r.rejectionReason || "N/A"),
      escapeCSV(r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : ""),
    ]);
    
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cultural_Ledger_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // ============ DERIVED LISTS & SEARCH ============
  const pendingList = allRequests.filter((r) => r.status?.toLowerCase() === "pending");
  const approvedList = allRequests.filter((r) => r.status?.toLowerCase() === "approved");
  const rejectedList = allRequests.filter((r) => r.status?.toLowerCase() === "rejected");

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
          r.date?.toLowerCase().includes(q) ||
          r.groupName?.toLowerCase().includes(q) ||
          r.bookingId?.toLowerCase().includes(q)
        );
      })
    : baseList;

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#E8DCC4] border-t-[#722013] rounded-full animate-spin mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#722013]">Loading Ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#FDFBF7] overflow-hidden">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* ============ HEADER (Fixed) ============ */}
      <div className="shrink-0 px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to="/admin" className="p-1.5 rounded-md bg-white border border-[#E8DCC4] text-[#722013] hover:bg-[#FAF6F0] transition">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Admin Ledger</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2a0b06]">Cultural Seva</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#E8DCC4] rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-[#722013] transition shadow-sm"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-white border border-[#E8DCC4] text-[#2a0b06] px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#FAF6F0] transition shadow-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============ TABS & STATS (Fixed) ============ */}
      <div className="shrink-0 px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DCC4] pb-4">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar mask-edges">
            {[
              { id: "pending", label: "Pending", count: pendingList.length },
              { id: "approved", label: "Allocated", count: approvedList.length },
              { id: "rejected", label: "Declined", count: rejectedList.length },
              { id: "all", label: "All", count: allRequests.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-[#2a0b06] text-white shadow-md"
                    : "bg-white border border-[#E8DCC4] text-gray-500 hover:text-[#2a0b06]"
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-md text-[10px] tabular-nums ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-5 shrink-0">
            <div className="text-center">
              <p className="text-xl font-black text-[#2a0b06] tabular-nums leading-none">{pendingList.length}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 mt-1">Pending</p>
            </div>
            <div className="w-px h-6 bg-[#E8DCC4]" />
            <div className="text-center">
              <p className="text-xl font-black text-[#2a0b06] tabular-nums leading-none">{approvedList.length}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 mt-1">Allocated</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT AREA (Scrollable) ============ */}
      <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-6 lg:px-8 pb-6 overflow-hidden">
        
        {displayedRequests.length === 0 ? (
          <div className="flex-1 bg-white border border-[#E8DCC4] rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-sm">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-lg font-serif font-bold text-[#2a0b06]">No requests found</p>
            <p className="text-sm text-gray-500 mt-1">Adjust search or filters.</p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW (lg and above) */}
            <div className="hidden lg:flex flex-1 overflow-hidden bg-white border border-[#E8DCC4] rounded-2xl shadow-sm relative">
              <div className="w-full h-full overflow-y-auto hide-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="bg-[#FAF6F0] sticky top-0 z-10 shadow-sm outline outline-1 outline-[#E8DCC4]">
                    <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      <th className="px-6 py-4 border-b border-[#E8DCC4]">Request Info</th>
                      <th className="px-6 py-4 border-b border-[#E8DCC4]">Program Details</th>
                      <th className="px-6 py-4 border-b border-[#E8DCC4]">Group Info</th>
                      <th className="px-6 py-4 border-b border-[#E8DCC4]">Status & Allocation</th>
                      <th className="px-6 py-4 border-b border-[#E8DCC4] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DCC4]">
                    {displayedRequests.map((req) => {
                      const s = req.status?.toLowerCase() || "pending";
                      const meta = STATUS_META[s] || STATUS_META.pending;
                      const Icon = meta.icon;
                      const isGroup = req.participationType === "group";

                      return (
                        <tr key={req.id} className="hover:bg-[#FCF8F2] transition-colors align-top">
                          {/* 1. Request Info */}
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#722013]/10 text-[#722013] font-serif font-bold flex items-center justify-center shrink-0">
                                {req.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-[#2a0b06] truncate">{req.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{req.contact}</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1">ID: {req.bookingId || "N/A"}</p>
                              </div>
                            </div>
                          </td>

                          {/* 2. Program Details */}
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-[#2a0b06]">{req.date}</p>
                            <p className="text-xs text-gray-600 mt-0.5 font-medium">
                              {req.category === "Others" ? req.otherCategory : req.category}
                            </p>
                            <span className="inline-block mt-1.5 px-2 py-0.5 bg-gray-100 rounded text-[9px] font-bold uppercase tracking-widest text-gray-600">
                              {req.participationType || "Solo"}
                            </span>
                          </td>

                          {/* 3. Group Info */}
                          <td className="px-6 py-4">
                            {isGroup ? (
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-[#2a0b06] truncate">{req.groupName}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 truncate">Mgr: {req.managerName}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Members: {req.participantCount}</p>
                              </div>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>

                          {/* 4. Status & Allocation */}
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${meta.bg} ${meta.border} ${meta.text}`}>
                              <Icon className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">{meta.label}</span>
                            </div>
                            {s === "approved" && (
                              <div className="mt-2">
                                <p className="text-xs font-bold text-[#2a0b06] tabular-nums">
                                  {formatTime(req.startTime)} - {formatTime(req.endTime)}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Duration: {req.durationMinutes}m</p>
                              </div>
                            )}
                            {s === "rejected" && (
                              <p className="text-[10px] text-rose-600 mt-2 line-clamp-2" title={req.rejectionReason}>
                                Reason: {req.rejectionReason}
                              </p>
                            )}
                          </td>

                          {/* 5. Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col items-end gap-2">
                              {s === "pending" && (
                                <div className="flex items-center gap-2 mb-1">
                                  <button onClick={() => openRejectionModal(req)} className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[9px] font-bold uppercase tracking-widest transition">Reject</button>
                                  <button onClick={() => openApprovalModal(req)} className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-[9px] font-bold uppercase tracking-widest transition">Allocate</button>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <button onClick={() => setEditingRequest({ ...req })} className="p-1.5 text-gray-400 hover:text-[#D4AF37] hover:bg-[#FAF6F0] rounded transition" title="Edit Request">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeleteConfirmId(req.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition" title="Delete Request">
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
            </div>

            {/* MOBILE / TABLET CARDS VIEW (below lg) */}
            <div className="lg:hidden flex-1 overflow-y-auto hide-scrollbar -mx-4 px-4 pb-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedRequests.map((req) => {
                  const s = req.status?.toLowerCase() || "pending";
                  const meta = STATUS_META[s] || STATUS_META.pending;
                  const Icon = meta.icon;
                  const isGroup = req.participationType === "group";

                  return (
                    <article key={req.id} className="bg-white rounded-2xl border border-[#E8DCC4] shadow-sm flex flex-col">
                      <div className="p-4 flex flex-col gap-3 flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[#722013]/10 text-[#722013] font-serif font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {req.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-sm text-[#2a0b06] truncate">{req.name}</h3>
                              <p className="text-xs text-gray-500 mt-0.5 truncate">{req.contact}</p>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1">ID: {req.bookingId || "N/A"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => setEditingRequest({ ...req })} className="p-1.5 text-gray-400 hover:text-[#D4AF37] rounded"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteConfirmId(req.id)} className="p-1.5 text-gray-400 hover:text-rose-600 rounded"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Date & Prog</p>
                            <p className="text-xs font-bold text-[#2a0b06] mt-1">{req.date}</p>
                            <p className="text-[10px] text-gray-600 truncate mt-0.5">{req.category === "Others" ? req.otherCategory : req.category}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Type / Group</p>
                            <p className="text-xs font-bold text-[#2a0b06] mt-1">{isGroup ? req.groupName : "Solo"}</p>
                            {isGroup && <p className="text-[10px] text-gray-600 truncate mt-0.5">{req.participantCount} pax • Mgr: {req.managerName}</p>}
                          </div>
                        </div>

                        <div className="mt-2 bg-[#FAF6F0] rounded-xl p-3 border border-[#E8DCC4]">
                          <div className="flex justify-between items-center gap-2">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border ${meta.bg} ${meta.border} ${meta.text}`}>
                              <Icon className="w-3 h-3" /> {meta.label}
                            </div>
                            {s === "pending" && (
                              <div className="flex items-center gap-2">
                                <button onClick={() => openRejectionModal(req)} className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 rounded text-[9px] font-bold uppercase tracking-widest">Reject</button>
                                <button onClick={() => openApprovalModal(req)} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-[9px] font-bold uppercase tracking-widest">Allocate</button>
                              </div>
                            )}
                          </div>
                          {s === "approved" && (
                            <div className="mt-2.5">
                              <p className="text-xs font-bold text-[#2a0b06]">{formatTime(req.startTime)} - {formatTime(req.endTime)}</p>
                              <p className="text-[9px] text-gray-500 mt-0.5 uppercase tracking-widest">Duration: {req.durationMinutes} Min</p>
                            </div>
                          )}
                          {s === "rejected" && (
                            <p className="text-[10px] text-rose-600 mt-2 line-clamp-2">Reason: {req.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* =========================================================
          MODALS
      ========================================================= */}

      {/* 1. APPROVAL MODAL */}
      {approvalRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-full">
            <div className="p-5 border-b border-[#E8DCC4] shrink-0">
              <h3 className="font-serif text-xl font-bold text-[#2a0b06]">Allocate Program</h3>
              <p className="text-xs text-gray-500 mt-1">{approvalRequest.name} • {approvalRequest.date}</p>
            </div>
            <div className="p-5 space-y-4 bg-[#FAF6F0] overflow-y-auto hide-scrollbar flex-1">
              {/* Existing */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">Existing Programs on {approvalRequest.date}</p>
                {getApprovedProgramsForDate(approvalRequest.date).length === 0 ? (
                  <p className="text-[10px] italic text-gray-400">No programs allocated yet.</p>
                ) : (
                  <div className="space-y-2">
                    {getApprovedProgramsForDate(approvalRequest.date).map(p => (
                      <div key={p.id} className="text-[10px] bg-white border border-[#E8DCC4] p-2 rounded-lg flex justify-between items-center">
                        <span className="font-bold text-[#2a0b06] truncate mr-2">{p.name}</span>
                        <span className="tabular-nums text-gray-600 shrink-0">{formatTime(p.startTime)} - {formatTime(p.endTime)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Allocation inputs */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 mb-1.5">Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedDuration(opt.value)}
                      className={`py-2 rounded-lg text-[10px] font-bold border transition ${
                        Number(selectedDuration) === opt.value ? "bg-[#2a0b06] text-white border-[#2a0b06]" : "bg-white text-gray-600 border-[#E8DCC4] hover:border-[#D4AF37]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 mb-1.5">Start Time</label>
                <input
                  type="time"
                  value={selectedStartTime}
                  onChange={(e) => setSelectedStartTime(e.target.value)}
                  className="w-full bg-white border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013]"
                />
              </div>
              {/* Summary */}
              {selectedDuration && selectedStartTime && (
                <div className="p-3 bg-white border border-[#E8DCC4] rounded-lg">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Time Slot:</p>
                  <p className="text-sm font-bold text-[#2a0b06]">{formatTime(selectedStartTime)} - {formatTime(selectedEndTime)}</p>
                  {hasTimeConflictExcluding(approvalRequest.date, selectedStartTime, selectedEndTime, approvalRequest.id) && (
                    <p className="text-[10px] text-rose-600 font-bold mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Overlaps with an existing program.</p>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#E8DCC4] flex justify-end gap-3 bg-white shrink-0">
              <button onClick={() => setApprovalRequest(null)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 rounded-lg transition">Cancel</button>
              <button 
                onClick={handleApprove}
                disabled={processingId || !selectedDuration || !selectedStartTime || hasTimeConflictExcluding(approvalRequest.date, selectedStartTime, selectedEndTime, approvalRequest.id)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition"
              >
                {processingId === approvalRequest.id ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REJECTION MODAL */}
      {rejectionRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-[#E8DCC4] bg-rose-50">
              <h3 className="font-serif text-xl font-bold text-rose-900">Decline Request</h3>
              <p className="text-xs text-rose-700/80 mt-1">{rejectionRequest.name} • {rejectionRequest.date}</p>
            </div>
            <div className="p-5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 mb-1.5">Reason for Declining</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full bg-[#FAF6F0] border border-[#E8DCC4] rounded-lg p-3 text-sm outline-none focus:border-rose-500 resize-none"
                placeholder="Please provide a reason..."
              />
            </div>
            <div className="p-4 border-t border-[#E8DCC4] flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setRejectionRequest(null)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button 
                onClick={handleReject}
                disabled={processingId || rejectionReason.trim().length < 5}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition"
              >
                {processingId === rejectionRequest.id ? "Declining..." : "Decline"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. DELETE CONFIRM MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#2a0b06] mb-2">Delete Request?</h3>
            <p className="text-xs text-gray-500 mb-6">This action cannot be undone. Approved slots will be freed.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest rounded-lg transition">Cancel</button>
              <button onClick={handleDelete} disabled={processingId} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition">
                {processingId === deleteConfirmId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. COMPREHENSIVE EDIT MODAL */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl h-full max-h-[85vh] flex flex-col overflow-hidden border border-[#E8DCC4]">
            
            {/* Header (Fixed) */}
            <div className="p-5 border-b border-[#E8DCC4] flex justify-between items-center bg-[#FAF6F0] shrink-0">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2a0b06]">Edit Request</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">ID: {editingRequest.bookingId || editingRequest.id}</p>
              </div>
              <button onClick={() => setEditingRequest(null)} className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5"/></button>
            </div>
            
            {/* Form Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto hide-scrollbar p-5 sm:p-6 bg-white">
              <form id="editForm" onSubmit={handleEditSubmit} className="space-y-6">
                
                {/* Section 1: Devotee & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Devotee Name</label>
                    <input type="text" required value={editingRequest.name || ""} onChange={e => setEditingRequest({...editingRequest, name: e.target.value})} className="w-full border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Contact Number</label>
                    <input type="tel" required value={editingRequest.contact || ""} onChange={e => setEditingRequest({...editingRequest, contact: e.target.value})} className="w-full border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013]" />
                  </div>
                </div>

                {/* Section 2: Program Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Date (YYYY-MM-DD)</label>
                    <input type="date" required value={editingRequest.date || ""} onChange={e => setEditingRequest({...editingRequest, date: e.target.value})} className="w-full border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Category</label>
                    <select value={editingRequest.category || ""} onChange={e => setEditingRequest({...editingRequest, category: e.target.value, otherCategory: e.target.value === "Others" ? editingRequest.otherCategory : null})} className="w-full border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013]">
                      {PROGRAM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                {editingRequest.category === "Others" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Specify Other Category</label>
                    <input type="text" required value={editingRequest.otherCategory || ""} onChange={e => setEditingRequest({...editingRequest, otherCategory: e.target.value})} className="w-full border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013]" />
                  </div>
                )}
                {/* Date Check Info */}
                {editingRequest.date && (() => {
                  const programs = getApprovedProgramsForDate(editingRequest.date).filter((p) => p.id !== editingRequest.id);
                  const maxSlots = getMaxBookingsForDate(editingRequest.date);
                  const occupiedSlots = programs.length;
                  const slotsLeft = Math.max(0, maxSlots - occupiedSlots);
                  return (
                    <div className={`rounded-xl border p-4 ${slotsLeft > 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Date Availability</p>
                          <p className={`mt-0.5 text-xs font-bold ${slotsLeft > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                            {slotsLeft > 0 ? `${slotsLeft} of ${maxSlots} slots available` : "No slots available"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-[#2a0b06] tabular-nums leading-none">{occupiedSlots}/{maxSlots}</p>
                          <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-1">Allocated</p>
                        </div>
                      </div>
                      {programs.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-black/10">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Already Allocated</p>
                          <div className="space-y-1.5">
                            {programs.map((p) => (
                              <div key={p.id} className="flex justify-between items-center bg-white rounded border border-black/5 px-2 py-1.5">
                                <p className="text-[10px] font-bold text-[#2a0b06] truncate pr-2">{p.name}</p>
                                <p className="text-[10px] font-bold text-[#722013] shrink-0 tabular-nums">{formatTime(p.startTime)} - {formatTime(p.endTime)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Section 3: Participation Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Participation Type</label>
                    <select value={editingRequest.participationType || "solo"} onChange={e => setEditingRequest({...editingRequest, participationType: e.target.value})} className="w-full border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013]">
                      <option value="solo">Solo</option>
                      <option value="group">Group</option>
                    </select>
                  </div>
                  {editingRequest.participationType === "group" && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Participant Count</label>
                      <input type="number" min="2" required value={editingRequest.participantCount || 2} onChange={e => setEditingRequest({...editingRequest, participantCount: e.target.value})} className="w-full border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013]" />
                    </div>
                  )}
                </div>
                
                {editingRequest.participationType === "group" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Group Name</label>
                      <input type="text" required value={editingRequest.groupName || ""} onChange={e => setEditingRequest({...editingRequest, groupName: e.target.value})} className="w-full border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Manager Name</label>
                      <input type="text" required value={editingRequest.managerName || ""} onChange={e => setEditingRequest({...editingRequest, managerName: e.target.value})} className="w-full border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013]" />
                    </div>
                  </div>
                )}

                <hr className="border-[#E8DCC4]" />

                {/* Section 4: Status & Admin Data */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Booking Status</label>
                  <select value={editingRequest.status?.toLowerCase() || "pending"} onChange={e => setEditingRequest({...editingRequest, status: e.target.value})} className="w-full border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013] font-bold">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved / Allocated</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {editingRequest.status?.toLowerCase() === "approved" && (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* START TIME */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-1.5">Start Time</label>
                      <input type="time" required value={editingRequest.startTime || ""} onChange={(e) => setEditingRequest({...editingRequest, startTime: e.target.value})} className="w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                    </div>
                    {/* DURATION */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-1.5">Duration</label>
                      <select required value={editingRequest.durationMinutes || ""} onChange={(e) => setEditingRequest({...editingRequest, durationMinutes: e.target.value})} className="w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500">
                        <option value="" disabled>Select...</option>
                        {DURATION_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                      </select>
                    </div>
                    {/* LIVE TIME AVAILABILITY */}
                    {editingRequest.startTime && editingRequest.durationMinutes && (() => {
                        const endTime = calculateEndTime(editingRequest.startTime, editingRequest.durationMinutes);
                        const hasConflict = hasTimeConflictExcluding(editingRequest.date, editingRequest.startTime, endTime, editingRequest.id);
                        return (
                          <div className={`sm:col-span-2 p-3 rounded-lg border ${hasConflict ? "bg-rose-100 border-rose-300" : "bg-white border-emerald-200"}`}>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">Selected Time Slot</p>
                            <p className="font-bold text-[#2a0b06] text-sm tabular-nums">{formatTime(editingRequest.startTime)} - {formatTime(endTime)}</p>
                            {hasConflict ? (
                              <p className="text-[10px] font-bold uppercase tracking-widest text-rose-700 mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Overlaps with an existing program.</p>
                            ) : (
                              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mt-2">✓ Slot Available</p>
                            )}
                          </div>
                        );
                    })()}
                  </div>
                )}

                {editingRequest.status?.toLowerCase() === "rejected" && (
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-rose-700 mb-1.5">Rejection Reason</label>
                    <textarea rows={3} required value={editingRequest.rejectionReason || ""} onChange={e => setEditingRequest({...editingRequest, rejectionReason: e.target.value})} className="w-full border border-rose-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-500 resize-none" />
                  </div>
                )}

              </form>
            </div>

            {/* Footer (Fixed) */}
            <div className="p-4 border-t border-[#E8DCC4] flex justify-end gap-3 bg-[#FAF6F0] shrink-0">
              <button type="button" onClick={() => setEditingRequest(null)} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancel</button>
              <button type="submit" form="editForm" disabled={processingId} className="px-6 py-2.5 bg-[#2a0b06] hover:bg-[#722013] text-white text-xs font-bold uppercase tracking-widest rounded-lg transition disabled:bg-gray-400">
                {processingId === editingRequest.id ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CulturalRequests;