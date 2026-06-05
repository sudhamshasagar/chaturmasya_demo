import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Schedule = () => {
  const fileInputRef = useRef(null);

  // UI States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Data States
  const [previewSchedules, setPreviewSchedules] = useState([]);
  const [formData, setFormData] = useState({
    date: null,
    time: "",
    title: "",
    description: "",
  });

  // Mock initial published data
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      date: new Date("2026-06-06T00:00:00"),
      time: "06:00 AM",
      title: "Suprabhata & Nirmalya",
      description: "Morning awakening seva and nirmalya visarjana.",
    },
    {
      id: 2,
      date: new Date("2026-06-06T00:00:00"),
      time: "10:00 AM",
      title: "Pravachana",
      description: "Spiritual discourse by Pujya Sri Swamiji.",
    },
  ]);

  // Generate time slots (05:00 AM to 09:00 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 5; i <= 21; i++) {
      const hour12 = i > 12 ? i - 12 : i === 0 ? 12 : i;
      const ampm = i >= 12 ? "PM" : "AM";
      const h = hour12.toString().padStart(2, "0");
      slots.push(`${h}:00 ${ampm}`);
      slots.push(`${h}:30 ${ampm}`);
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  // --- SINGLE ITEM FORM LOGIC ---
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

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this schedule item?")) {
      setSchedules(schedules.filter((s) => s.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.title) {
      alert("Please fill in the date, time, and title.");
      return;
    }

    if (editingId) {
      setSchedules(
        schedules.map((s) => (s.id === editingId ? { ...s, ...formData } : s))
      );
    } else {
      setSchedules([...schedules, { id: Date.now(), ...formData }]);
    }
    resetForm();
  };

  // --- BULK IMPORT LOGIC ---
  const toggleImportView = () => {
    setIsFormOpen(false);
    setPreviewSchedules([]);
    setIsImportOpen(!isImportOpen);
  };

  const downloadTemplate = () => {
    const headers = "Date (YYYY-MM-DD),Time (HH:MM AM/PM),Title,Description\n";
    const sampleRow1 = "2026-06-08,09:00 AM,Sri Rama Pooja,Daily morning rituals\n";
    const sampleRow2 = '2026-06-08,10:30 AM,Special Pravachana,"Enclose descriptions with commas in quotes"';
    const csvContent = headers + sampleRow1 + sampleRow2;
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Schedule_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Basic CSV Parser that handles quotes around descriptions
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

      // Skip header (i=1)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const cols = parseCSVRow(row);
        if (cols.length >= 3) {
          const [dateStr, time, title, description] = cols;
          const dateObj = new Date(dateStr);
          
          if (!isNaN(dateObj) && time && title) {
            parsed.push({
              id: `prev-${Date.now()}-${i}`, // Temporary ID for preview
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
    e.target.value = null; // Reset input
  };

  const confirmImport = () => {
    // Generate permanent IDs for the preview items
    const newItems = previewSchedules.map(item => ({
      ...item,
      id: Date.now() + Math.random(),
    }));
    
    setSchedules([...schedules, ...newItems]);
    setPreviewSchedules([]);
    setIsImportOpen(false);
    alert(`${newItems.length} schedule items imported successfully!`);
  };

  // --- GROUPING LOGIC FOR PUBLISHED SCHEDULES ---
  const groupedSchedules = schedules.reduce((acc, curr) => {
    if (!curr.date) return acc;
    const dateStr = curr.date.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(curr);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSchedules).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      
      {/* Breadcrumb */}
      <nav className="flex text-stone-500 text-sm font-bold uppercase tracking-wider mb-6">
        <Link to="/admin" className="hover:text-orange-700 transition">Admin</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-900">Daily Schedule</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b-2 border-stone-800 pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900 uppercase tracking-tight">
            Schedule Manager
          </h1>
          <p className="text-stone-500 font-serif italic mt-1 text-lg">
            Plan, import, and publish the daily itinerary.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={toggleImportView}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all ${
              isImportOpen ? "bg-stone-200 text-stone-700" : "bg-white border-2 border-stone-200 text-stone-700 hover:border-orange-600 hover:text-orange-600"
            }`}
          >
            <span>📁</span> Bulk Import
          </button>
          
          <button
            onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all ${
              isFormOpen ? "bg-stone-200 text-stone-700" : "bg-orange-600 text-white hover:bg-orange-700"
            }`}
          >
            {isFormOpen ? <><span>✕</span> Close Editor</> : <><span>➕</span> Add Single Item</>}
          </button>
        </div>
      </div>

      {/* --- BULK IMPORT SECTION --- */}
      {isImportOpen && (
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden mb-10 animate-fade-in">
          <div className="bg-stone-900 px-6 py-4 border-b border-stone-800 flex justify-between items-center">
            <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
              Import Schedule via CSV
            </h2>
            <button onClick={downloadTemplate} className="text-xs font-bold bg-stone-700 hover:bg-stone-600 text-white px-3 py-1.5 rounded transition">
              Download Template
            </button>
          </div>

          <div className="p-6 md:p-8">
            {previewSchedules.length === 0 ? (
              // Upload State
              <div className="border-2 border-dashed border-stone-300 bg-stone-50 rounded-2xl p-10 text-center hover:bg-orange-50 hover:border-orange-400 transition-colors cursor-pointer" onClick={() => fileInputRef.current.click()}>
                <span className="text-4xl block mb-3">📄</span>
                <h3 className="text-lg font-bold text-stone-900 mb-1">Click to browse or drag CSV here</h3>
                <p className="text-stone-500 text-sm">Please ensure the file matches the downloaded template format.</p>
                <input 
                  type="file" 
                  accept=".csv" 
                  ref={fileInputRef}
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </div>
            ) : (
              // Preview State
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-end border-b border-stone-200 pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-stone-900">Preview Import Data</h3>
                    <p className="text-sm text-stone-500">Found {previewSchedules.length} valid items.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setPreviewSchedules([])} className="px-4 py-2 text-sm font-bold text-stone-600 hover:bg-stone-100 rounded-lg transition">
                      Discard
                    </button>
                    <button onClick={confirmImport} className="px-5 py-2 text-sm font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition">
                      Confirm & Publish
                    </button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-stone-100 sticky top-0 border-b border-stone-200">
                      <tr>
                        <th className="p-3 font-bold text-stone-600 uppercase tracking-wide">Date</th>
                        <th className="p-3 font-bold text-stone-600 uppercase tracking-wide">Time</th>
                        <th className="p-3 font-bold text-stone-600 uppercase tracking-wide">Title</th>
                        <th className="p-3 font-bold text-stone-600 uppercase tracking-wide">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {previewSchedules.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50">
                          <td className="p-3 whitespace-nowrap">{item.date.toLocaleDateString()}</td>
                          <td className="p-3 whitespace-nowrap font-medium text-orange-700">{item.time}</td>
                          <td className="p-3 font-bold text-stone-900">{item.title}</td>
                          <td className="p-3 text-stone-500 truncate max-w-xs" title={item.description}>{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SINGLE ITEM EDITOR --- */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden mb-10 animate-fade-in">
          <div className="bg-stone-900 px-6 py-4 border-b border-stone-800">
            <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
              {editingId ? "Edit Schedule Item" : "New Schedule Item"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Event Date</label>
                <DatePicker
                  selected={formData.date}
                  onChange={(date) => setFormData({ ...formData, date })}
                  dateFormat="dd MMM yyyy"
                  placeholderText="Select a date"
                  className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Event Time</label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Select Time Slot</option>
                  {timeSlots.map((slot, idx) => (
                    <option key={idx} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Event Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Mahamangalarati & Teertha Prasada"
                  className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-serif text-lg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide brief details about this specific schedule item..."
                  rows="3"
                  className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
              <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl font-bold text-stone-600 hover:bg-stone-100 transition-colors">
                Cancel
              </button>
              <button type="submit" className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition-colors">
                {editingId ? "Save Changes" : "Publish to Schedule"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- PUBLISHED SCHEDULES LIST --- */}
      <div className="space-y-10 mt-6">
        {sortedDates.length > 0 ? (
          sortedDates.map((dateGroup) => (
            <div key={dateGroup} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              
              {/* Date Header */}
              <div className="bg-stone-100/50 px-6 py-4 border-b border-stone-200 flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <h2 className="text-xl font-serif font-black text-stone-900 tracking-tight">
                  {dateGroup}
                </h2>
              </div>

              {/* Schedule Items for the Day */}
              <div className="divide-y divide-stone-100">
                {groupedSchedules[dateGroup]
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((item) => (
                    <div key={item.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-orange-50/30 transition-colors group">
                      
                      {/* Time Marker */}
                      <div className="md:w-40 flex-shrink-0">
                        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1.5 rounded-lg font-bold text-sm tracking-wide border border-orange-200 shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          {item.time}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-stone-900 mb-1">{item.title}</h3>
                        {item.description && (
                          <p className="text-stone-600 text-sm leading-relaxed max-w-2xl">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 self-start md:opacity-0 md:group-hover:opacity-100 transition-opacity mt-4 md:mt-0">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-400 font-bold p-2 rounded-lg transition-colors shadow-sm"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 font-bold p-2 rounded-lg transition-colors shadow-sm"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>

                    </div>
                  ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center shadow-sm">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-bold text-stone-900">No schedule items published</h3>
            <p className="text-stone-500 text-sm mt-1">Add items manually or use bulk import to build your itinerary.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Schedule;