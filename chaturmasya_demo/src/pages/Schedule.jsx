import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Image as ImageIcon,
  X,
  History,
  Download,
  CalendarPlus,
} from "lucide-react";

import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase/firebase";

/* =========================================================
   CONFIG & UTILS
========================================================= */

const FESTIVAL_START = new Date(2026, 6, 28); // 28 July 2026

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

/* =========================================================
   HELPERS
========================================================= */

const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

// Accurately format time for Google Calendar specific timeslot
const generateGoogleCalendarUrl = (event, selectedDate) => {
  const title = encodeURIComponent(event.title || "Chaturmasya Event");
  const details = encodeURIComponent(event.description || "");
  const location = encodeURIComponent(event.location || "");
  
  const d = selectedDate ? new Date(selectedDate) : new Date();
  let datesStr = "";

  // Try to parse time (e.g., "10:30 AM" or "02:00 PM")
  const match = event.time ? event.time.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/) : null;

  if (match) {
    let [_, h, m, modifier] = match;
    let hour = parseInt(h, 10);
    if (modifier) {
      if (modifier.toLowerCase() === "pm" && hour < 12) hour += 12;
      if (modifier.toLowerCase() === "am" && hour === 12) hour = 0;
    }
    d.setHours(hour, parseInt(m, 10), 0);
    
    // Add 2 hours for default duration
    const endD = new Date(d.getTime() + 2 * 60 * 60 * 1000);

    const fmt = (dt) => `${dt.getFullYear()}${String(dt.getMonth()+1).padStart(2,"0")}${String(dt.getDate()).padStart(2,"0")}T${String(dt.getHours()).padStart(2,"0")}${String(dt.getMinutes()).padStart(2,"0")}00`;
    datesStr = `${fmt(d)}/${fmt(endD)}`;
  } else {
    // Fallback to All Day Event
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);
    const nYear = nextD.getFullYear();
    const nMonth = String(nextD.getMonth() + 1).padStart(2, "0");
    const nDay = String(nextD.getDate()).padStart(2, "0");
    
    datesStr = `${year}${month}${day}/${nYear}${nMonth}${nDay}`;
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${datesStr}`;
};

const formatLongDate = (date) =>
  date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatShortDate = (date) =>
  date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

const createCalendarDays = (monthDate) => {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells = [];

  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), i));
  }
  return cells;
};

// Sort helper
const timeToMinutes = (time) => {
  if (!time) return 0;
  try {
    const [clock, modifier] = time.split(" ");
    let [hour, minute] = clock.split(":").map(Number);
    if (hour === 12) hour = 0;
    if (modifier === "PM" || modifier === "pm") hour += 12;
    return hour * 60 + minute;
  } catch (e) {
    return 0;
  }
};

const getDateTime = (date, time) => {
  if (!date || !time) return null;

  const d = new Date(date);

  const [clock, modifier] = time.split(" ");
  let [hour, minute] = clock.split(":").map(Number);

  if (modifier.toUpperCase() === "PM" && hour !== 12)
    hour += 12;

  if (modifier.toUpperCase() === "AM" && hour === 12)
    hour = 0;

  d.setHours(hour, minute, 0, 0);

  return d;
};

const getEventStatus = (event, now) => {
  const start = getDateTime(event.date, event.startTime || event.time);

  const end = getDateTime(
    event.date,
    event.endTime || event.startTime || event.time
  );

  if (!start || !end)
    return {
      status: "upcoming",
      minutesLeft: null,
    };

  if (now < start) {
    return {
      status: "upcoming",
      minutesLeft: Math.floor((start - now) / 60000),
    };
  }

  if (now >= start && now <= end) {
    return {
      status: "live",
      minutesLeft: 0,
    };
  }

  return {
    status: "completed",
    minutesLeft: -1,
  };
};

/* =========================================================
   COMPONENT
========================================================= */

export default function DailySchedule() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("current");
  const [schedules, setSchedules] = useState([]);
  const [history, setHistory] = useState([]);
  
  const today = new Date();
  const defaultDate = today < FESTIVAL_START ? FESTIVAL_START : today;
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(defaultDate.getFullYear(), defaultDate.getMonth(), 1)
  );

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribeSchedules = onSnapshot(
      query(collection(db, "schedules")),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSchedules(data);
        setLoading(false);
      }
    );

    const unsubscribeHistory = onSnapshot(
      query(collection(db, "history")),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setHistory(data);
      }
    );

    return () => {
      unsubscribeSchedules();
      unsubscribeHistory();
    };
  }, []);

 const visibleEvents = useMemo(() => {
    const targetDate =
      selectedDate < FESTIVAL_START ? FESTIVAL_START : selectedDate;

    return schedules
      .filter((event) => {
        if (!event.date) return false;

        if (!isSameDay(new Date(event.date), targetDate))
          return false;

        const status = getEventStatus(event, currentTime);

        return status.status !== "completed";
      })
      .sort((a, b) =>
        timeToMinutes(a.startTime || a.time) -
        timeToMinutes(b.startTime || b.time)
      );
  }, [selectedDate, schedules, currentTime]);

  const historyEvents = useMemo(() => {
  return schedules
    .filter((event) => {
      if (!event.date) return false;

      const status = getEventStatus(event, currentTime);

      return status.status === "completed";
    })
    .sort((a, b) => {
      const dateA = getDateTime(a.date, a.startTime || a.time);
      const dateB = getDateTime(b.date, b.startTime || b.time);

      return dateB - dateA;
    });
}, [schedules, currentTime]);

  const calendarDays = useMemo(() => createCalendarDays(calendarMonth), [calendarMonth]);

  const hasEvents = (date) => {
    return schedules.some((event) => event.date && isSameDay(new Date(event.date), date));
  };

  const previousMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  const nextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowMobileCalendar(false);
  };

  /* ===========================
     SHARED CALENDAR UI
  ============================ */
  const renderCalendar = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50/50">
        <button onClick={previousMonth} className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 transition">
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-semibold text-stone-800">
          {MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
        </h2>
        <button onClick={nextMonth} className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 transition">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 px-4 pt-4 pb-2">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold uppercase text-stone-400">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 px-4 pb-4">
        {calendarDays.map((date, index) => {
          if (!date) return <div key={index} className="aspect-square" />;
          const selected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const eventExists = hasEvents(date);
          
          return (
            <button
              key={index}
              onClick={() => handleDateSelect(date)}
              className={`relative aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                selected
                  ? "bg-amber-600 text-white shadow-md"
                  : isToday
                  ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
                  : "hover:bg-stone-100 text-stone-700"
              }`}
            >
              {date.getDate()}
              {eventExists && !selected && <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-amber-500" />}
              {eventExists && selected && <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-white/70" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    // Uses full screen height and hides outer scroll to prevent page-level scrolling
    <section id="schedule" className="relative h-[100dvh] overflow-hidden bg-stone-50 text-stone-800 flex flex-col font-sans">
      
      {/* ===========================
          HEADER
      ============================ */}
      <header className="shrink-0 bg-stone-50 border-b border-stone-200 px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-1">
            Chaturmasya Schedule
          </h1>
          <p className="text-stone-600 text-xs md:text-sm">
            Browse daily rituals, discourses, and cultural programmes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white border border-stone-200 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setTab("current")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                tab === "current" ? "bg-amber-100 text-amber-800" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <CalendarDays size={14} /> Schedule
            </button>
            <button
              onClick={() => setTab("history")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                tab === "history" ? "bg-amber-100 text-amber-800" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <History size={14} /> History
            </button>
          </div>
          <a 
            href="/schedule.pdf" 
            download
            className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
          >
            <Download size={14} /> PDF
          </a>
        </div>
      </header>

      {/* ===========================
          MAIN CONTENT AREA
      ============================ */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={36} className="animate-spin text-amber-600" />
          </div>
        ) : tab === "current" ? (
          <div className="flex-1 flex flex-col lg:flex-row h-full">
            
            {/* MOBILE CALENDAR TOGGLE */}
            <div className="lg:hidden shrink-0 bg-white border-b border-stone-200 px-4 py-3 flex justify-between items-center z-10 shadow-sm">
              <div className="font-semibold text-stone-800 text-sm flex items-center gap-2">
                <CalendarIcon size={16} className="text-amber-600" />
                {formatShortDate(selectedDate)}
              </div>
              <button 
                onClick={() => setShowMobileCalendar(true)}
                className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md"
              >
                Select Date
              </button>
            </div>

            {/* DESKTOP CALENDAR PANEL */}
            <div className={`hidden lg:block w-80 xl:w-96 shrink-0 bg-stone-50 border-r border-stone-200 p-6 overflow-y-auto ${hideScrollbar}`}>
              {renderCalendar()}
            </div>

            {/* MOBILE CALENDAR POPUP */}
            <AnimatePresence>
              {showMobileCalendar && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[120] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 lg:hidden"
                  onClick={() => setShowMobileCalendar(false)}
                >
                  <motion.div 
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderCalendar()}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* EVENTS PANEL (Compact List with hidden scrollbar) */}
            <div className={`flex-1 overflow-y-auto bg-white p-4 lg:p-8 ${hideScrollbar}`}>
              <div className="max-w-3xl mx-auto">
                <div className="flex items-end justify-between mb-6 pb-2 border-b border-stone-100">
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
                    {formatLongDate(selectedDate)}
                  </h3>
                  {selectedDate < FESTIVAL_START && (
                    <span className="text-[10px] md:text-xs font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded">
                      Preview
                    </span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={formatLongDate(selectedDate)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {visibleEvents.length === 0 ? (
                      <div className="py-20 text-center bg-stone-50 rounded-2xl border border-stone-100">
                        <CalendarDays className="mx-auto text-stone-300 mb-3" size={40} />
                        <p className="text-stone-500 text-sm font-medium">No events scheduled for this day.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 pb-8">
                        {visibleEvents.map((event) => {
                          const eventStatus = getEventStatus(event, currentTime);

                          return (
                            <div
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className={`flex flex-row items-center p-4 rounded-xl cursor-pointer transition-all border
                                ${
                                  eventStatus.status === "live"
                                    ? "border-green-500 bg-green-50 shadow-lg animate-pulse"
                                    : eventStatus.status === "upcoming" &&
                                      eventStatus.minutesLeft <= 30 &&
                                      eventStatus.minutesLeft > 0
                                    ? "border-amber-500 bg-amber-50 shadow-md"
                                    : "border-stone-200 bg-stone-50/50 hover:border-amber-300 hover:bg-white hover:shadow-md"
                                }`}
                            >
                              <div className="w-20 md:w-28 shrink-0 flex flex-col justify-center">
                                <span className="text-xs md:text-sm font-bold text-amber-700 whitespace-nowrap">
                                  {event.startTime || event.time || "All Day"}
                                </span>
                              </div>

                              <div className="flex-1 pl-4 border-l border-stone-200">
                                <h4 className="text-sm md:text-base font-semibold text-stone-900 leading-tight">
                                  {event.title}
                                </h4>

                                {eventStatus.status === "live" && (
                                  <span className="inline-block mt-2 px-2 py-1 rounded-full bg-green-600 text-white text-[10px] font-bold uppercase">
                                    LIVE NOW
                                  </span>
                                )}

                                {eventStatus.status === "upcoming" &&
                                  eventStatus.minutesLeft <= 30 &&
                                  eventStatus.minutesLeft > 0 && (
                                    <span className="inline-block mt-2 px-2 py-1 rounded-full bg-amber-600 text-white text-[10px] font-bold">
                                      Starts in {eventStatus.minutesLeft} mins
                                    </span>
                                  )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : (
          /* ===========================
             HISTORY TAB
          ============================ */
          <div className={`flex-1 overflow-y-auto p-4 lg:p-8 bg-white ${hideScrollbar}`}>
            <div className="max-w-6xl mx-auto">
              {historyEvents.length === 0 ? (
                <div className="bg-stone-50 rounded-2xl border border-stone-200 p-16 text-center">
                  <ImageIcon size={48} className="mx-auto text-stone-300 mb-4" />
                  <h3 className="text-lg font-bold text-stone-800 mb-1">No History Yet</h3>
                  <p className="text-sm text-stone-500">Past highlights will appear here.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                  {historyEvents.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedEvent(item)}
                      className="bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 hover:shadow-lg cursor-pointer transition-all"
                    >
                      <div className="h-48 bg-stone-200 relative">
                        {item.image ? (
                           <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-stone-400" /></div>
                        )}
                        {item.year && (
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-stone-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            {item.year}
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h4 className="font-bold text-stone-900 mb-1 line-clamp-1">{item.title}</h4>
                        <p className="text-sm text-stone-500 line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ===========================
          BOTTOM SHEET (EVENT DETAILS)
      ============================ */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 z-[130] bg-stone-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[140] flex justify-center pointer-events-none px-0 md:px-4 pb-0 md:pb-4"
            >
              <div className="w-full max-w-2xl bg-white md:rounded-3xl rounded-t-3xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]">
                
                <div className="relative flex justify-center items-center p-4 shrink-0 bg-white z-10 border-b border-stone-100">
                  <div className="w-12 h-1.5 bg-stone-200 rounded-full" />
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="absolute right-4 p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className={`overflow-y-auto overflow-x-hidden p-5 md:p-8 ${hideScrollbar}`}>
                  {selectedEvent.image && (
                    <img
                      src={selectedEvent.image}
                      alt={selectedEvent.title}
                      className="w-full h-48 md:h-64 object-cover rounded-2xl mb-6 shadow-sm border border-stone-100"
                    />
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-amber-800">
                    {selectedEvent.time && (
                      <span className="flex items-center gap-1.5 bg-amber-100 px-3 py-1.5 rounded-full">
                        <Clock size={14} /> {selectedEvent.time}
                      </span>
                    )}
                    {selectedEvent.location && (
                      <span className="flex items-center gap-1.5 bg-stone-100 text-stone-600 px-3 py-1.5 rounded-full">
                        <MapPin size={14} /> {selectedEvent.location}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4 font-serif leading-tight">
                    {selectedEvent.title}
                  </h2>
                  
                  <div className="prose prose-sm md:prose-base prose-stone max-w-none mb-8">
                    <p className="whitespace-pre-line text-stone-600 leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  </div>

                  {tab === "current" && (
                    <div className="pt-6 border-t border-stone-100">
                      <a
                        href={generateGoogleCalendarUrl(selectedEvent, selectedDate)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition shadow-md"
                      >
                        <CalendarPlus size={18} /> Add to Google Calendar
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </section>
  );
}