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
  AlertCircle,
  Loader2,
  ArrowLeft,
  FileText,
} from "lucide-react";

const ScheduleManager = () => {
  const fileInputRef = useRef(null);

  // UI States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Data States
  const [schedules, setSchedules] = useState([]);
  const [previewSchedules, setPreviewSchedules] = useState([]);
  const [formData, setFormData] = useState({
    date: null,
    time: "",
    title: "",
    description: "",
  });

  // ============ FIREBASE LISTENER ============
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
            // Convert stored ISO string back to Date object for the DatePicker
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

  // ============ SINGLE ITEM FORM LOGIC ============
  const resetForm = () => {
    setFormData({ date: null, time: "", title: "", description: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item) => {
    setIsImportOpen(false);
    setFormData({
      date: item.date,
      time: item.time,
      title: item.title,
      description: item.description,
    });
    setEditingId(item.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule item?")) {
      try {
        await deleteDoc(doc(db, "schedules", id));
      } catch (error) {
        console.error("Error deleting schedule:", error);
        alert("Failed to delete item.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.title.trim()) {
      alert("Please fill in the date, time, and title.");
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        date: formData.date.toISOString(),
        time: formData.time,
        title: formData.title.trim(),
        description: formData.description.trim(),
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
  const toggleImportView = () => {
    setIsFormOpen(false);
    setPreviewSchedules([]);
    setIsImportOpen(!isImportOpen);
  };

  const downloadTemplate = () => {
    const headers = "Date (YYYY-MM-DD),Time (HH:MM AM/PM),Title,Description\n";
    const sampleRow1 = "2026-07-29,06:00 AM,Suprabhata & Nirmalya,Morning awakening seva\n";
    const sampleRow2 = '2026-07-29,10:30 AM,Pravachana,"Spiritual discourse by Pujya Sri Swamiji"';
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
      } else {
        cur += str[i];
      }
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
          const [dateStr, time, title, description] = cols;
          
          // Construct date properly avoiding timezone shifts
          const [year, month, day] = dateStr.split("-").map(Number);
          if (!year || !month || !day) continue;
          
          const dateObj = new Date(year, month - 1, day);

          if (!isNaN(dateObj) && time && title) {
            parsed.push({
              id: `prev-${Date.now()}-${i}`,
              date: dateObj,
              time: time,
              title: title,
              description: description || "",
            });
          }
        }
      }

      if (parsed.length > 0) {
        setPreviewSchedules(parsed);
      } else {
        alert("Could not parse valid schedule items. Please check the format.");
      }
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
          time: item.time,
          title: item.title,
          description: item.description,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
      setPreviewSchedules([]);
      setIsImportOpen(false);
      alert(`${previewSchedules.length} items imported successfully!`);
    } catch (error) {
      console.error("Bulk import failed:", error);
      alert("Failed to import schedules.");
    } finally {
      setProcessing(false);
    }
  };

  // ============ GROUPING & SORTING ============
  const groupedSchedules = useMemo(() => {
    const groups = schedules.reduce((acc, curr) => {
      if (!curr.date) return acc;
      // Normalizing date string for grouping
      const dateStr = curr.date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      if (!acc[dateStr]) acc[dateStr] = { dateObj: curr.date, items: [] };
      acc[dateStr].items.push(curr);
      return acc;
    }, {});

    // Sort items within each group by time
    Object.keys(groups).forEach((key) => {
      groups[key].items.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    });

    // Sort groups by date
    return Object.entries(groups).sort((a, b) => a[1].dateObj - b[1].dateObj);
  }, [schedules]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-[#722013] animate-spin mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#722013]">Loading Schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ============ HEADER ============ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-[#E8DCC4] pb-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link to="/admin" className="p-2 rounded-full bg-white border border-[#E8DCC4] text-[#722013] hover:bg-[#FAF6F0] transition shadow-sm">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Admin Control</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#2a0b06] mb-2">Schedule Manager</h1>
            <p className="text-sm text-gray-500 max-w-lg">Plan, import, and publish the daily itinerary for Chaturmasya.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleImportView}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition shadow-sm border ${
                isImportOpen ? "bg-[#FAF6F0] text-[#722013] border-[#722013]" : "bg-white border-[#E8DCC4] text-[#2a0b06] hover:bg-[#FAF6F0]"
              }`}
            >
              <UploadCloud className="w-4 h-4" /> Import CSV
            </button>
            <button
              onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition shadow-sm border ${
                isFormOpen ? "bg-white border-[#E8DCC4] text-gray-600" : "bg-[#2a0b06] text-white border-[#2a0b06] hover:bg-[#722013] hover:border-[#722013]"
              }`}
            >
              {isFormOpen ? <><X className="w-4 h-4" /> Close Editor</> : <><Plus className="w-4 h-4" /> Add Item</>}
            </button>
          </div>
        </div>

        {/* ============ BULK IMPORT SECTION ============ */}
        <AnimatePresence>
          {isImportOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="mb-10 overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-[#E8DCC4] overflow-hidden">
                <div className="bg-[#FAF6F0] px-6 py-4 border-b border-[#E8DCC4] flex justify-between items-center">
                  <h2 className="text-lg font-serif font-bold text-[#2a0b06]">Import Schedule via CSV</h2>
                  <button onClick={downloadTemplate} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#722013] hover:bg-white border border-[#E8DCC4] bg-[#FDFBF7] px-3 py-1.5 rounded-lg transition shadow-sm">
                    <Download className="w-3.5 h-3.5" /> Template
                  </button>
                </div>

                <div className="p-6 md:p-8">
                  {previewSchedules.length === 0 ? (
                    <div 
                      onClick={() => fileInputRef.current.click()}
                      className="border-2 border-dashed border-[#D4AF37]/40 bg-[#FAF6F0]/50 rounded-2xl p-10 text-center hover:bg-[#FAF6F0] hover:border-[#D4AF37] transition-colors cursor-pointer"
                    >
                      <FileText className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
                      <h3 className="text-sm font-bold text-[#2a0b06] mb-1">Click to browse or drag CSV here</h3>
                      <p className="text-xs text-gray-500">Ensure the file matches the template format exactly.</p>
                      <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8DCC4] pb-4">
                        <div>
                          <h3 className="font-serif text-xl font-bold text-[#2a0b06]">Preview Import</h3>
                          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Found {previewSchedules.length} valid items
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setPreviewSchedules([])} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 rounded-lg transition">
                            Discard
                          </button>
                          <button onClick={confirmImport} disabled={processing} className="px-5 py-2 text-xs font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-lg shadow-sm transition flex items-center gap-2">
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Publish"}
                          </button>
                        </div>
                      </div>

                      <div className="max-h-[400px] overflow-y-auto border border-[#E8DCC4] rounded-xl hide-scrollbar relative">
                        <table className="w-full text-left text-sm min-w-[600px]">
                          <thead className="bg-[#FAF6F0] sticky top-0 border-b border-[#E8DCC4] shadow-sm z-10">
                            <tr>
                              <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
                              <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Time</th>
                              <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Title</th>
                              <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E8DCC4]">
                            {previewSchedules.map((item) => (
                              <tr key={item.id} className="hover:bg-[#FCF8F2]">
                                <td className="p-4 whitespace-nowrap font-bold text-[#2a0b06]">{item.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                                <td className="p-4 whitespace-nowrap font-bold text-[#722013]">{item.time}</td>
                                <td className="p-4 font-bold text-[#2a0b06]">{item.title}</td>
                                <td className="p-4 text-gray-500 truncate max-w-[250px]" title={item.description}>{item.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============ SINGLE ITEM FORM ============ */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="mb-10 overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-[#E8DCC4]">
                <div className="bg-[#FAF6F0] px-6 py-4 border-b border-[#E8DCC4]">
                  <h2 className="text-lg font-serif font-bold text-[#2a0b06]">
                    {editingId ? "Edit Schedule Item" : "New Schedule Item"}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                        <CalendarDays className="w-3.5 h-3.5 text-[#D4AF37]" /> Event Date *
                      </label>
                      <DatePicker
                        selected={formData.date}
                        onChange={(date) => setFormData({ ...formData, date })}
                        dateFormat="dd MMM yyyy"
                        placeholderText="Select date"
                        className="w-full bg-[#FCF8F2] border border-[#E8DCC4] text-[#2a0b06] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#722013] transition"
                        wrapperClassName="w-full"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> Event Time *
                      </label>
                      <select
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full bg-[#FCF8F2] border border-[#E8DCC4] text-[#2a0b06] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#722013] transition cursor-pointer"
                      >
                        <option value="" disabled>Select Time Slot</option>
                        {timeSlots.map((slot, idx) => (
                          <option key={idx} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Event Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Mahamangalarati & Teertha Prasada"
                        className="w-full bg-[#FCF8F2] border border-[#E8DCC4] text-[#2a0b06] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#722013] transition"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Description (Optional)</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief details about the event..."
                        rows="3"
                        className="w-full bg-[#FCF8F2] border border-[#E8DCC4] text-[#2a0b06] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#722013] transition resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-[#E8DCC4]">
                    <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition">
                      Cancel
                    </button>
                    <button type="submit" disabled={processing} className="bg-[#2a0b06] hover:bg-[#722013] disabled:bg-gray-300 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition flex items-center gap-2">
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? "Save Changes" : "Publish to Schedule"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============ PUBLISHED SCHEDULES ============ */}
        <div className="space-y-12">
          {groupedSchedules.length > 0 ? (
            groupedSchedules.map(([dateString, group]) => (
              <div key={dateString} className="relative pl-4 md:pl-8">
                {/* Timeline vertical line */}
                <div className="absolute left-0 top-2 bottom-0 w-px bg-gradient-to-b from-[#D4AF37] via-[#E8DCC4] to-transparent" />
                
                {/* Date Header */}
                <div className="relative flex items-center gap-4 mb-6">
                  <div className="absolute -left-[21px] md:-left-[37px] w-3 h-3 rounded-full bg-[#D4AF37] ring-4 ring-[#FDFBF7]" />
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2a0b06] tracking-tight bg-white border border-[#E8DCC4] px-5 py-2 rounded-full shadow-sm">
                    {dateString}
                  </h2>
                </div>

                {/* Schedule Cards */}
                <div className="space-y-4">
                  {group.items.map((item) => (
                    <div key={item.id} className="group bg-white border border-[#E8DCC4] rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-start gap-4 md:gap-6 relative overflow-hidden">
                      {/* Left color bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#722013] opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Time Pill */}
                      <div className="shrink-0">
                        <div className="inline-flex items-center justify-center gap-1.5 bg-[#FAF6F0] border border-[#E8DCC4] text-[#722013] px-3.5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                          {item.time}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-[#2a0b06] mb-1 leading-snug">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 leading-relaxed font-serif italic max-w-2xl">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity mt-2 md:mt-0">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-white border border-[#E8DCC4] text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37] p-2 rounded-lg transition shadow-sm"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-white border border-[#E8DCC4] text-gray-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 p-2 rounded-lg transition shadow-sm"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8DCC4] shadow-sm flex flex-col items-center justify-center p-12 text-center">
              <CalendarDays className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-serif font-bold text-[#2a0b06]">No Schedule Items</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-md">Add items manually or use bulk import to build the itinerary.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleManager;