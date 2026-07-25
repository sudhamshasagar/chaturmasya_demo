import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CalendarDays,
  Loader2,
  Calendar,
  MapPin,
  ChevronRight,
  X,
  Sparkles
} from "lucide-react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Ensure correct path

/* ---------- Helpers ---------- */
const timeToMinutes = (t) => {
  if (!t) return 0;
  const [time, modifier] = t.split(" ");
  if (!time || !modifier) return 0;
  let [hours, minutes] = time.split(":").map(Number);
  if (hours === 12) hours = 0;
  if (modifier.toUpperCase() === "PM") hours += 12;
  return hours * 60 + minutes;
};

// Animation Variants for Mobile List
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

/* ---------- Component ---------- */
export default function DailySchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRitual, setSelectedRitual] = useState(null);

  useEffect(() => {
  console.log("selectedRitual changed:", selectedRitual);
}, [selectedRitual]);

  /* Live Clock */
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  /* Firebase Subscription */
  useEffect(() => {
    const q = query(collection(db, "schedules"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setSchedules(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching schedules:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  /* Filter Today's Schedule */
  const displayedSchedule = useMemo(() => {
    const todayStr = currentDate.toDateString();
    const todayItems = schedules.filter(
      (i) => i.date && new Date(i.date).toDateString() === todayStr
    );
    if (todayItems.length > 0) {
      return [...todayItems].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    }
    // Fallback logic
    const fallback = schedules.filter((i) => {
      if (!i.date) return false;
      const d = new Date(i.date);
      return d.getFullYear() === 2026 && d.getMonth() === 6 && d.getDate() === 28;
    });
    return [...fallback].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  }, [schedules, currentDate]);

  const formattedDate = currentDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentTimeStr = currentDate.toLocaleTimeString("en-IN", {
    hour: '2-digit',
    minute: '2-digit'
  });

  const closeModal = useCallback(() => {
    console.log("Closing modal");
    setSelectedRitual(null);
  }, []);

  return (
    <div className="w-full min-h-screen bg-stone-50 font-sans text-stone-900 pb-20" id="schedule">
      
      {/* HEADER SECTION (Uniform across devices) */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 px-4 md:px-8 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-stone-900">
              Daily Itinerary
            </h1>
            <p className="text-xs md:text-sm text-stone-500 font-medium mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" /> Timings in Indian Standard Time (IST)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-xl border border-amber-200/50">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wide">{formattedDate}</span>
            </div>
            <div className="hidden sm:block text-right border-l border-stone-200 pl-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Current Time</p>
              <p className="text-sm font-bold text-stone-700">{currentTimeStr}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-amber-600 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Loading Schedule...</p>
          </div>
        ) : displayedSchedule.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-32 px-6 bg-white rounded-3xl border border-stone-200 shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
              <CalendarDays className="w-10 h-10 text-stone-300" />
            </div>
            <p className="font-serif font-bold text-2xl text-stone-900">No Rituals Scheduled</p>
            <p className="text-base text-stone-500 mt-2">There are no events planned for today. Please check back later.</p>
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* LARGE SCREEN UI: SPLIT-PANE TIMELINE (Hidden on mobile/tablet)            */}
            {/* ========================================================================= */}
            <div
              className={`hidden lg:grid gap-8 items-start relative transition-all duration-500 ${
                selectedRitual ? "lg:grid-cols-12" : "lg:grid-cols-1"
              }`}
            >
              
              {/* LEFT COLUMN: Scrollable Timeline */}
              <div
                className={`relative transition-all duration-500 ${
                  selectedRitual ? "col-span-5" : "col-span-12 max-w-5xl mx-auto"
                }`}
              >
                {/* Vertical Line Connector */}
                <div className="absolute left-[27px] top-4 bottom-8 w-px bg-stone-200" />
                
                <div className="flex flex-col gap-6">
                  {displayedSchedule.map((ritual) => {
                    const isSelected = selectedRitual?.id === ritual.id;
                    const [timeVal, ampm] = ritual.time ? ritual.time.split(" ") : ["--:--", ""];
                    
                    return (
                      <button
                        key={ritual.id}
                        onClick={() => {
                          console.log("User clicked:", ritual.title);
                          setSelectedRitual(ritual);
                        }}
                        className={`group relative flex items-start text-left transition-all ${
                          isSelected ? "opacity-100" : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        {/* Timeline Node */}
                        <div className={`relative z-10 w-14 h-14 shrink-0 rounded-full flex flex-col items-center justify-center border-4 border-stone-50 transition-colors shadow-sm ${
                          isSelected ? "bg-amber-600 text-white" : "bg-white text-stone-400 group-hover:border-amber-100 group-hover:text-amber-600"
                        }`}>
                          <Clock className={`w-5 h-5 ${isSelected ? "text-white" : ""}`} />
                        </div>

                        {/* Content Card */}
                        <div className="ml-6 flex-1 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm group-hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-1">
                            <p className={`font-serif text-lg font-bold ${isSelected ? "text-amber-700" : "text-stone-900"}`}>
                              {ritual.title}
                            </p>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-stone-50 px-2 py-1 rounded-md shrink-0 ml-2">
                              {timeVal} {ampm}
                            </span>
                          </div>
                          <p className="text-sm text-stone-500 line-clamp-1">
                            {ritual.description || "No description provided."}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              {selectedRitual && (
                <div className="col-span-7 sticky top-[104px]">
                  <div className="bg-white border border-stone-200 rounded-[2rem] shadow-xl overflow-hidden flex flex-col min-h-[500px]">
                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-50 to-white pointer-events-none" />

                    <div className="relative p-10 flex-1 flex flex-col">
                      <button
                        onClick={closeModal}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full border border-stone-200 bg-white hover:bg-stone-100 flex items-center justify-center transition-colors"
                      >
                        <X className="w-5 h-5 text-stone-500" />
                      </button>

                      <div className="inline-flex items-center gap-2 bg-white border border-stone-200 px-4 py-2 rounded-full shadow-sm mb-6 self-start">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-600">
                          {selectedRitual.time} IST
                        </span>
                      </div>

                      <h3 className="font-serif text-4xl font-bold text-stone-900 leading-tight mb-8">
                        {selectedRitual.title}
                      </h3>

                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-4 border-b border-stone-100 pb-3">
                          Event Details & Context
                        </p>

                        {selectedRitual.description ? (
                          <p className="text-lg text-stone-600 leading-relaxed whitespace-pre-wrap">
                            {selectedRitual.description}
                          </p>
                        ) : (
                          <div className="py-12 text-center flex flex-col items-center text-stone-400 bg-stone-50 rounded-2xl">
                            <Sparkles className="w-8 h-8 mb-3 text-stone-300" />
                            <p className="italic">
                              No additional details have been provided for this ritual.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* MOBILE & TABLET UI: CARD LIST (Hidden on large screens)                   */}
            {/* ========================================================================= */}
            <div className="lg:hidden">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-3 md:gap-4"
              >
                {displayedSchedule.map((ritual) => {
                  const [timeVal, ampm] = ritual.time ? ritual.time.split(" ") : ["--:--", ""];
                  
                  return (
                    <motion.button
                      variants={itemVariants}
                      key={ritual.id}
                      onClick={() => {
                        console.log("User clicked:", ritual.title);
                        setSelectedRitual(ritual);
                      }}
                      className="group flex items-center bg-white border border-stone-200 rounded-2xl p-4 text-left transition-all active:scale-[0.98] shadow-sm hover:border-amber-300 w-full"
                    >
                      {/* Left: Time Square */}
                      <div className="flex flex-col items-center justify-center w-16 h-16 shrink-0 bg-stone-50 rounded-xl border border-stone-100 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                        <span className="font-serif text-xl font-bold text-amber-700">
                          {timeVal}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">
                          {ampm}
                        </span>
                      </div>

                      {/* Middle: Content */}
                      <div className="flex-1 min-w-0 pl-4 pr-2">
                        <h3 className="font-serif text-lg font-bold text-stone-900 truncate mb-1">
                          {ritual.title}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-1">
                          {ritual.description || <span className="italic">Tap for details</span>}
                        </p>
                      </div>

                      {/* Right: Chevron */}
                      <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-stone-300 group-hover:text-amber-600 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>
          </>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MOBILE POP-UP MODAL (Only renders on lg:hidden screens)                   */}
      {/* ========================================================================= */}
      <div className="lg:hidden">
        <AnimatePresence>
          {selectedRitual && (
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={closeModal}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="relative w-full md:max-w-xl bg-white rounded-t-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-amber-50 to-white pointer-events-none" />

                <div className="relative px-6 pt-6 pb-2 flex justify-between items-start gap-4">
                  <div className="mt-2">
                    <div className="inline-flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-full shadow-sm mb-3">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">
                        {selectedRitual.time} IST
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 leading-tight">
                      {selectedRitual.title}
                    </h3>
                  </div>
                  <button
                    onClick={closeModal}
                    className="shrink-0 p-2.5 bg-white/50 hover:bg-stone-100 backdrop-blur border border-stone-200 rounded-full text-stone-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative p-6 overflow-y-auto flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-3 border-b border-stone-100 pb-2">
                    Details
                  </p>
                  {selectedRitual.description ? (
                    <p className="text-sm md:text-base text-stone-600 leading-relaxed whitespace-pre-wrap">
                      {selectedRitual.description}
                    </p>
                  ) : (
                    <div className="py-10 text-center text-stone-400 italic bg-stone-50 rounded-xl">
                      No additional description provided.
                    </div>
                  )}
                </div>

                <div className="p-4 md:p-6 border-t border-stone-100 bg-white">
                  <button
                    onClick={closeModal}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white px-4 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-lg active:scale-[0.98]"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}