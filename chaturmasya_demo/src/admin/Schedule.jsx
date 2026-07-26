import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  CalendarDays,
  Clock,
  Plus,
  UploadCloud,
  Download,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  FileText,
} from "lucide-react";

/* =========================================================
   UTILS
========================================================= */
const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

export default function ScheduleManager() {
  const fileInputRef = useRef(null);

  // UI States
  const [activeModal, setActiveModal] = useState("none"); // 'none' | 'form' | 'import'
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Data States
  const [schedules, setSchedules] = useState([]);
  const [previewSchedules, setPreviewSchedules] = useState([]);
  const [approvedProgrammes, setApprovedProgrammes] = useState([]);
  const [formData, setFormData] = useState({
    date: null,
    category: "Ritual",
    culturalRequestId: "",
    startTime: "",
    endTime: "",
    durationMinutes: "",
    title: "",
    description: "",
  });

  // ============ FIREBASE LISTENERS ============
  useEffect(() => {
    const q = query(collection(db, "schedules"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => {
          const docData = d.data();
          return {
            id: d.id,
            ...docData,
            date: docData.date ? new Date(docData.date) : null,
          };
        });
        setSchedules(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching schedules: ", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "culturalRequests"), where("status", "==", "approved"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const programmes = snapshot.docs.map((doc) => {
        const data = {
          id: doc.id,
          ...doc.data(),
        };

        console.log(data);

        return data;
      });
      setApprovedProgrammes(programmes);
    });
    return () => unsubscribe();
  }, []);

const filteredProgrammes = useMemo(() => {
  if (!formData.date) return [];

  const year = formData.date.getFullYear();
  const month = String(formData.date.getMonth() + 1).padStart(2, "0");
  const day = String(formData.date.getDate()).padStart(2, "0");

  const selectedDate = `${year}-${month}-${day}`;

  return approvedProgrammes.filter(
    (programme) => programme.date === selectedDate
  );
}, [approvedProgrammes, formData.date]);

  useEffect(() => {
    if (formData.category === "Cultural Programme" && formData.startTime && formData.durationMinutes) {
      setFormData((prev) => ({
        ...prev,
        endTime: calculateEndTime(prev.startTime, prev.durationMinutes),
      }));
    }
  }, [formData.category, formData.startTime, formData.durationMinutes]);

  // ============ TIME SLOTS ============
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 4; i <= 22; i++) {
      const hour12 = i > 12 ? i - 12 : i === 0 ? 12 : i;
      const ampm = i >= 12 ? "PM" : "AM";
      const h = hour12.toString().padStart(2, "0");
      slots.push(`${h}:00 ${ampm}`);
      slots.push(`${h}:30 ${ampm}`);
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  const timeToMinutes = (t) => {
    if (!t) return 0;
    const [time, modifier] = t.split(" ");
    if (!time || !modifier) return 0;
    let [hours, minutes] = time.split(":").map(Number);
    if (hours === 12) hours = 0;
    if (modifier === "PM") hours += 12;
    return hours * 60 + minutes;
  };

  const minutesToTime = (totalMinutes) => {
    const hours24 = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const modifier = hours24 >= 12 ? "PM" : "AM";
    let hours12 = hours24 % 12;
    if (hours12 === 0) hours12 = 12;
    return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${modifier}`;
  };

  const convert24To12 = (time24) => {
  if (!time24) return "";

  const [hour, minute] = time24.split(":").map(Number);

  const period = hour >= 12 ? "PM" : "AM";

  let h = hour % 12;
  if (h === 0) h = 12;

  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
};

  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return "";
    const start = timeToMinutes(startTime);
    return minutesToTime(start + Number(durationMinutes));
  };

  // ============ SINGLE ITEM FORM LOGIC ============
  const resetForm = () => {
    setFormData({
      date: null,
      category: "Ritual",
      culturalRequestId: "",
      startTime: "",
      endTime: "",
      durationMinutes: "",
      title: "",
      description: "",
    });
    setEditingId(null);
    setActiveModal("none");
  };

  const handleEdit = (item) => {
    setFormData({
      date: item.date,
      category: item.category || "Ritual",
      culturalRequestId: item.culturalRequestId || "",
      startTime: item.startTime || item.time || "",
      endTime: item.endTime || "",
      durationMinutes: item.durationMinutes || "",
      title: item.title,
      description: item.description,
    });
    setEditingId(item.id);
    setActiveModal("form");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule item?")) {
      try {
        await deleteDoc(doc(db, "schedules", id));
      } catch (error) {
        console.error("Error deleting schedule:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.date ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.title.trim() ||
      (formData.category === "Cultural Programme" && !formData.durationMinutes)
    ) {
      alert("Please complete all required fields.");
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        date: formData.date.toISOString(),
        category: formData.category,
        startTime: formData.startTime,
        endTime: formData.endTime,
        durationMinutes: formData.category === "Cultural Programme" ? Number(formData.durationMinutes) : null,
        title: formData.title.trim(),
        description: formData.description.trim(),
        culturalRequestId: formData.culturalRequestId || null,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "schedules", editingId), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "schedules"), payload);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Failed to save schedule item.");
    } finally {
      setProcessing(false);
    }
  };

  // ============ BULK IMPORT LOGIC ============
  const downloadTemplate = () => {
    const headers = "Date (YYYY-MM-DD),Category,Start Time,End Time,Duration (Minutes),Title,Description\n";
    const sampleRow1 = "2026-07-29,Ritual,06:00 AM,07:00 AM,,Suprabhata & Nirmalya,Morning awakening seva\n";
    const sampleRow2 = '2026-07-29,Cultural Programme,06:00 PM,,45,Bhajan,"Bhajan by XYZ Group"';
    const csvContent = headers + sampleRow1 + sampleRow2;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Schedule_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSVRow = (str) => {
    const result = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '"') inQuote = !inQuote;
      else if (str[i] === "," && !inQuote) {
        result.push(cur.trim());
        cur = "";
      } else cur += str[i];
    }
    result.push(cur.trim());
    return result.map((s) => s.replace(/^"|"$/g, ""));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n");
      const parsed = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const cols = parseCSVRow(row);
        if (cols.length >= 3) {
          const [dateStr, category, startTime, endTime, durationMinutes, title, description] = cols;
          const [year, month, day] = dateStr.split("-").map(Number);
          if (!year || !month || !day) continue;
          
          const dateObj = new Date(year, month - 1, day);
          if (!isNaN(dateObj) && startTime?.trim() && title?.trim()) {
            parsed.push({
              id: `prev-${Date.now()}-${i}`,
              date: dateObj,
              category: category || "Ritual",
              startTime,
              endTime,
              durationMinutes: durationMinutes ? Number(durationMinutes) : null,
              title,
              description: description || "",
            });
          }
        }
      }
      if (parsed.length > 0) setPreviewSchedules(parsed);
      else alert("Could not parse valid schedule items.");
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const confirmImport = async () => {
    if (previewSchedules.length === 0) return;
    setProcessing(true);
    try {
      const batch = writeBatch(db);
      previewSchedules.forEach((item) => {
        const ref = doc(collection(db, "schedules"));
        batch.set(ref, {
          date: item.date.toISOString(),
          category: item.category,
          startTime: item.startTime,
          endTime: item.endTime,
          durationMinutes: item.durationMinutes,
          title: item.title,
          description: item.description,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      setPreviewSchedules([]);
      setActiveModal("none");
      alert(`${previewSchedules.length} items imported successfully!`);
    } catch (error) {
      console.error("Bulk import failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  // ============ GROUPING & SORTING ============
  const groupedSchedules = useMemo(() => {
    const groups = schedules.reduce((acc, curr) => {
      if (!curr.date) return acc;
      const dateStr = curr.date.toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric",
      });
      if (!acc[dateStr]) acc[dateStr] = { dateObj: curr.date, items: [] };
      acc[dateStr].items.push(curr);
      return acc;
    }, {});

    Object.keys(groups).forEach((key) => {
      groups[key].items.sort((a, b) => timeToMinutes(a.startTime || a.time) - timeToMinutes(b.startTime || b.time));
    });
    return Object.entries(groups).sort((a, b) => a[1].dateObj - b[1].dateObj);
  }, [schedules]);

  if (loading) {
    return (
      <div className="h-[100dvh] bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Loading Schedules...</p>
        </div>
      </div>
    );
  }

  return (
    // Fixed viewport height to handle internal scrolling
    <div className="h-[100dvh] flex flex-col bg-stone-50 font-sans overflow-hidden">
      
      {/* ============ HEADER ============ */}
      <header className="shrink-0 bg-white border-b border-stone-200 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/admin" className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Admin Control</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 leading-tight">Schedule Manager</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveModal("import")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold uppercase tracking-widest hover:bg-stone-100 hover:border-stone-300 transition-all shadow-sm"
          >
            <UploadCloud size={16} /> Import
          </button>
          <button
            onClick={() => { resetForm(); setActiveModal("form"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-sm"
          >
            <Plus size={16} /> Add Event
          </button>
        </div>
      </header>

      {/* ============ MAIN CONTENT (LIST VIEW) ============ */}
      <main className={`flex-1 overflow-y-auto p-4 md:p-8 bg-stone-50 ${hideScrollbar}`}>
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
          {groupedSchedules.length > 0 ? (
            groupedSchedules.map(([dateString, group]) => (
              <div key={dateString} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                {/* Date Header Sticky */}
                <div className="sticky top-0 bg-stone-100/90 backdrop-blur px-5 py-3 border-b border-stone-200 flex justify-between items-center z-10">
                  <div className="flex items-center gap-2 text-stone-800">
                    <CalendarDays size={16} className="text-stone-500" />
                    <h2 className="font-bold text-sm uppercase tracking-wide">{dateString}</h2>
                  </div>
                  <span className="text-xs font-bold bg-white text-stone-600 border border-stone-200 px-2.5 py-1 rounded-md">
                    {group.items.length} Items
                  </span>
                </div>

                {/* Event Rows */}
                <div className="divide-y divide-stone-100">
                  {group.items.map((item) => (
                    <div key={item.id} className="group flex flex-col md:flex-row md:items-center gap-4 p-5 hover:bg-amber-50/40 transition-colors">
                      
                      {/* Time Block */}
                      <div className="w-36 shrink-0 flex flex-col">
                        <span className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                          <Clock size={14} className="text-amber-500" /> {item.startTime || item.time}
                        </span>
                        {item.endTime && <span className="text-[11px] font-semibold text-stone-500 ml-5 mt-0.5 uppercase tracking-wider">to {item.endTime}</span>}
                      </div>

                      {/* Content Block */}
                      <div className="flex-1 min-w-0 border-l-2 border-stone-100 pl-4 group-hover:border-amber-300 transition-colors">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
                            item.category === "Cultural Programme" 
                              ? "bg-amber-50 border-amber-200 text-amber-700" 
                              : "bg-stone-50 border-stone-200 text-stone-600"
                          }`}>
                            {item.category || "Ritual"}
                          </span>
                        </div>
                        <h4 className="font-bold text-stone-900 text-base leading-tight">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Actions Block */}
                      <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity justify-end shrink-0">
                        <button onClick={() => handleEdit(item)} className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200 p-20 text-center shadow-sm">
              <CalendarDays className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-2">No Schedule Items</h3>
              <p className="text-sm text-stone-500">Create new events or import them via CSV to build the itinerary.</p>
            </div>
          )}
        </div>
      </main>

      {/* ===========================
          SIDE PANEL (ADD/EDIT FORM)
      ============================ */}
      <AnimatePresence>
        {activeModal === "form" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-stone-200"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 shrink-0 bg-stone-50/50">
                <h2 className="text-lg font-bold text-stone-900">
                  {editingId ? "Edit Event" : "Add Event"}
                </h2>
                <button onClick={resetForm} className="p-2 text-stone-400 hover:text-stone-900 bg-white border border-stone-200 hover:bg-stone-100 rounded-full transition">
                  <X size={16} />
                </button>
              </div>

              <div className={`flex-1 overflow-y-auto p-6 ${hideScrollbar}`}>
                <form id="schedule-form" onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Date */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Date *</label>
                    <DatePicker
                      selected={formData.date}
                      onChange={(date) => setFormData({ ...formData, date })}
                      dateFormat="dd MMM yyyy"
                      placeholderText="Select date"
                      className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 focus:bg-white transition-colors"
                      wrapperClassName="w-full"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 focus:bg-white transition-colors"
                    >
                      <option value="Ritual">Ritual</option>
                      <option value="Cultural Programme">Cultural Programme</option>
                    </select>
                  </div>

                  {/* Dynamic Cultural Request Select */}
                  {formData.category === "Cultural Programme" && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1.5">Approved Programme *</label>
                      <select
                        value={formData.culturalRequestId}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "manual") {
                            setFormData((prev) => ({
                              ...prev,
                              culturalRequestId: "manual",
                              startTime: "",
                              endTime: "",
                              durationMinutes: "",
                              title: "",
                              description: "",
                            }));
                            return;
                          }

                          const prog = approvedProgrammes.find(
                            (p) => p.id === value
                          );

                          if (!prog) return;

                          setFormData((prev) => ({
                            ...prev,
                            culturalRequestId: prog.id,
                            startTime: convert24To12(prog.startTime),
                            durationMinutes: String(prog.durationMinutes || ""),
                            title: `Cultural Programme by ${prog.name}`,
                            description: prog.description || "",
                          }));
                        }}
                        className="w-full bg-amber-50 border border-amber-200 text-stone-900 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-500 transition-colors"
                      >
                        <option value="">Select Programme</option>
                        <option value="manual">Program Not Listed (Manual Entry)</option>
                        {filteredProgrammes.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.category} - {p.groupName || p.name} ({p.durationMinutes} mins)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Times */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Start Time *</label>
                      <select
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 focus:bg-white transition-colors"
                      >
                        <option value="">Select</option>
                        {timeSlots.map((slot) => (<option key={slot} value={slot}>{slot}</option>))}
                      </select>
                    </div>

                    {formData.category === "Cultural Programme" ? (
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Duration *</label>
                        <select
                          value={formData.durationMinutes}
                          onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 focus:bg-white transition-colors"
                        >
                          <option value="">Select</option>
                          <option value="30">30 Min</option>
                          <option value="45">45 Min</option>
                          <option value="60">60 Min</option>
                          <option value="90">90 Min</option>
                          <option value="120">120 Min</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">End Time *</label>
                        <select
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 focus:bg-white transition-colors"
                        >
                          <option value="">Select</option>
                          {timeSlots.map((slot) => (<option key={slot} value={slot}>{slot}</option>))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Event title"
                      className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional details..."
                      rows="4"
                      className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:bg-white transition-colors resize-none"
                    />
                  </div>
                </form>
              </div>

              {/* Form Actions */}
              <div className="p-5 border-t border-stone-100 bg-white shrink-0 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-100 transition">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="schedule-form"
                  disabled={processing} 
                  className="bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm transition flex items-center gap-2"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? "Save Changes" : "Publish")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===========================
          CENTER MODAL (CSV IMPORT)
      ============================ */}
      <AnimatePresence>
        {activeModal === "import" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center shrink-0">
                  <h2 className="text-xl font-bold text-stone-900">Bulk Import Schedule (CSV)</h2>
                  <div className="flex items-center gap-3">
                    <button onClick={downloadTemplate} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-md hover:bg-amber-100 transition shadow-sm">
                      <Download size={14} /> Template
                    </button>
                    <button onClick={resetForm} className="p-1.5 text-stone-400 hover:text-stone-900 bg-white border border-stone-200 hover:bg-stone-100 rounded-full transition">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className={`p-6 md:p-8 overflow-y-auto bg-white ${hideScrollbar}`}>
                  {previewSchedules.length === 0 ? (
                    <div 
                      onClick={() => fileInputRef.current.click()}
                      className="border-2 border-dashed border-stone-300 bg-stone-50/50 rounded-2xl p-14 text-center hover:bg-stone-100 hover:border-amber-400 transition-colors cursor-pointer"
                    >
                      <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                      <h3 className="text-sm font-bold text-stone-900 mb-1">Click to browse or drag CSV</h3>
                      <p className="text-xs text-stone-500">File must match the provided template format exactly.</p>
                      <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    </div>
                  ) : (
                    <div className="space-y-4 flex flex-col h-full">
                      <div className="flex items-center justify-between shrink-0">
                        <p className="text-xs font-bold uppercase tracking-widest text-green-600 flex items-center gap-1.5">
                          <CheckCircle2 size={16} /> Parsed {previewSchedules.length} valid events
                        </p>
                        <button onClick={() => setPreviewSchedules([])} className="text-xs font-bold text-stone-500 hover:text-stone-900 underline">
                          Upload Different File
                        </button>
                      </div>

                      {/* Preview Table */}
                      <div className={`border border-stone-200 rounded-xl overflow-hidden overflow-y-auto max-h-[50vh] ${hideScrollbar}`}>
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-stone-50 sticky top-0 border-b border-stone-200 z-10">
                            <tr>
                              <th className="px-5 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest">Date</th>
                              <th className="px-5 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest">Time</th>
                              <th className="px-5 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest">Title</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {previewSchedules.map((item) => (
                              <tr key={item.id} className="hover:bg-stone-50/50">
                                <td className="px-5 py-3 font-semibold text-stone-900">{item.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                                <td className="px-5 py-3 text-stone-600 text-xs font-bold">{item.startTime || item.time} {item.endTime && `- ${item.endTime}`}</td>
                                <td className="px-5 py-3 font-medium text-stone-900 truncate max-w-[250px]">{item.title}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {previewSchedules.length > 0 && (
                  <div className="p-5 border-t border-stone-100 bg-white flex justify-end gap-3 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button onClick={resetForm} className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-100 transition">
                      Cancel
                    </button>
                    <button onClick={confirmImport} disabled={processing} className="bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm transition flex items-center gap-2">
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Import"}
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}