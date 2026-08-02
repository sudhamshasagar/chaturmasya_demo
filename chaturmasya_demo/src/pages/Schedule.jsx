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
  ChevronDown
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

const generateGoogleCalendarUrl = (event, selectedDate) => {
  const title = encodeURIComponent(event.title || "Chaturmasya Event");
  const details = encodeURIComponent(event.description || "");
  const location = encodeURIComponent(event.location || "");
  
  const d = selectedDate ? new Date(selectedDate) : new Date();
  let datesStr = "";

  const eventTime = event.startTime || event.time;

  const match = eventTime
    ? eventTime.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/)
    : null;

  if (match) {
    let [_, h, m, modifier] = match;
    let hour = parseInt(h, 10);

    if (modifier) {
      if (modifier.toLowerCase() === "pm" && hour < 12) hour += 12;
      if (modifier.toLowerCase() === "am" && hour === 12) hour = 0;
    }
    d.setHours(hour, parseInt(m, 10), 0);
    
    const endD = new Date(d.getTime() + 2 * 60 * 60 * 1000);
    const fmt = (dt) => `${dt.getFullYear()}${String(dt.getMonth()+1).padStart(2,"0")}${String(dt.getDate()).padStart(2,"0")}T${String(dt.getHours()).padStart(2,"0")}${String(dt.getMinutes()).padStart(2,"0")}00`;
    datesStr = `${fmt(d)}/${fmt(endD)}`;
  } else {
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
const formatTime = (time) => {
  if (!time) return "";

  const [hour, minute] = time.split(":").map(Number);

  const h = hour % 12 || 12;
  const period = hour >= 12 ? "PM" : "AM";

  return `${h}:${String(minute).padStart(2, "0")} ${period}`;
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
    year: "numeric"
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

const timeToMinutes = (time) => {
  if (!time) return 0;

  // 24-hour format
  if (!time.includes("AM") && !time.includes("PM") && !time.includes("am") && !time.includes("pm")) {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  }

  // 12-hour format
  const [clock, modifier] = time.split(" ");
  let [hour, minute] = clock.split(":").map(Number);

  if (hour === 12) hour = 0;
  if (modifier.toUpperCase() === "PM") hour += 12;

  return hour * 60 + minute;
};

const getDateTime = (date, time) => {
  if (!date || !time) return null;

  const d = new Date(date);

  // 24-hour format
  if (!time.includes("AM") && !time.includes("PM") && !time.includes("am") && !time.includes("pm")) {
    const [hour, minute] = time.split(":").map(Number);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  // 12-hour format
  const [clock, modifier] = time.split(" ");
  let [hour, minute] = clock.split(":").map(Number);

  if (modifier.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (modifier.toUpperCase() === "AM" && hour === 12) hour = 0;

  d.setHours(hour, minute, 0, 0);

  return d;
};

const getEventStatus = (event, now) => {
  const start = getDateTime(event.date, event.startTime || event.time);
  const end = getDateTime(event.date, event.endTime || event.startTime || event.time);

  if (!start || !end) return { status: "upcoming", minutesLeft: null };
  if (now < start) return { status: "upcoming", minutesLeft: Math.floor((start - now) / 60000) };
  if (now >= start && now <= end) return { status: "live", minutesLeft: 0 };
  return { status: "completed", minutesLeft: -1 };
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

  const [selectedEvent, setSelectedEvent] = useState(null); // Desktop Modal
  const [expandedEventId, setExpandedEventId] = useState(null); // Mobile Accordion
  
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Mobile specific view states
  const [showMobileFullSchedule, setShowMobileFullSchedule] = useState(false);
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribeSchedules = onSnapshot(query(collection(db, "schedules")), (snapshot) => {
      setSchedules(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const unsubscribeHistory = onSnapshot(query(collection(db, "history")), (snapshot) => {
      setHistory(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeSchedules();
      unsubscribeHistory();
    };
  }, []);

  // Events for selected date
  const visibleEvents = useMemo(() => {
    const targetDate = selectedDate < FESTIVAL_START ? FESTIVAL_START : selectedDate;
    return schedules
      .filter((event) => event.date && isSameDay(new Date(event.date), targetDate) && getEventStatus(event, currentTime).status !== "completed")
      .sort((a, b) => timeToMinutes(a.startTime || a.time) - timeToMinutes(b.startTime || b.time));
  }, [selectedDate, schedules, currentTime]);

  // Featured Event for Mobile Main Screen (Based on TODAY, not selectedDate)
  const featuredEvent = useMemo(() => {
    const displayDate =
      today < FESTIVAL_START ? FESTIVAL_START : today;

    const events = schedules
      .filter(
        (e) =>
          e.date &&
          isSameDay(new Date(e.date), displayDate)
      )
      .sort(
        (a, b) =>
          timeToMinutes(a.startTime || a.time) -
          timeToMinutes(b.startTime || b.time)
      );

    const liveEvent = events.find(
      (e) => getEventStatus(e, currentTime).status === "live"
    );

    const nextEvent = events.find(
      (e) => getEventStatus(e, currentTime).status === "upcoming"
    );

    return liveEvent || nextEvent || events[0] || null;
  }, [schedules, currentTime, today]);

  const historyEvents = useMemo(() => {
    return schedules
      .filter((event) => event.date && getEventStatus(event, currentTime).status === "completed")
      .sort((a, b) => getDateTime(b.date, b.startTime || b.time) - getDateTime(a.date, a.startTime || a.time));
  }, [schedules, currentTime]);

  const calendarDays = useMemo(() => createCalendarDays(calendarMonth), [calendarMonth]);
  const hasEvents = (date) => schedules.some((event) => event.date && isSameDay(new Date(event.date), date));

  const previousMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  const nextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));

  const handleDateSelect = (date) => {
  setShowMobileCalendar(false);

  setTimeout(() => { 
    setSelectedDate(date);
  }, 200);
};

  const openMobileFullSchedule = () => {
    setSelectedDate(today < FESTIVAL_START ? FESTIVAL_START : today); // Reset to today when opening
    setShowMobileFullSchedule(true);
  };

  /* ===========================
     SHARED CALENDAR UI
  ============================ */
  const renderCalendar = () => (
    <div className="bg-white rounded-2xl shadow-lg lg:shadow-sm border border-stone-200 overflow-hidden w-full max-w-sm mx-auto">
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
          <div key={day} className="text-center text-[10px] font-bold uppercase text-stone-400">{day}</div>
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
                selected ? "bg-amber-600 text-white shadow-md"
                : isToday ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
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
    <section
      id="schedule"
      className="relative bg-stone-50 text-stone-800 flex flex-col min-h-fit lg:h-[100dvh] mt-6"
    >
      
      {/* HEADER */}
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={36} className="animate-spin text-amber-600" />
          </div>
        ) : tab === "current" ? (
          <div className="flex-1 flex h-full">
            
            {/* =========================================
                MOBILE VIEW (Main Screen) 
            ========================================= */}
            <div className="lg:hidden p-4 bg-stone-50">
              <div className="flex flex-col max-w-md mx-auto w-full gap-6 pt-6 pb-6">
                <div>
                  <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 text-center">
                    {today < FESTIVAL_START
                      ? "FESTIVAL BEGINS ON 28 JULY"
                      : featuredEvent &&
                        getEventStatus(featuredEvent, currentTime).status === "live"
                      ? "🔴 LIVE NOW"
                      : "UPCOMING NEXT"}
                  </h2>
                  {featuredEvent ? (
                    <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                      <div className="flex flex-col gap-2">
                        <span className="text-2xl font-black text-amber-600 tracking-tight">
                          {featuredEvent.startTime || featuredEvent.time || "All Day"}
                        </span>
                        <h3 className="text-xl font-bold text-stone-900 leading-snug">
                          {featuredEvent.title}
                        </h3>
                        {featuredEvent.location && (
                          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-medium mt-1">
                            <MapPin size={12} /> {featuredEvent.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm text-center">
                      <CalendarIcon className="mx-auto text-stone-300 mb-3" size={32} />
                      <p className="text-stone-600 font-medium">No more events scheduled for today.</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={openMobileFullSchedule}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 rounded-xl shadow-md transition-transform active:scale-95 flex justify-center items-center gap-2"
                >
                  <CalendarDays size={18} /> View Full Schedule
                </button>
              </div>
            </div>

            {/* =========================================
                DESKTOP VIEW (Side-by-side) 
            ========================================= */}
            <div className="hidden lg:flex w-full h-full">
              {/* DESKTOP CALENDAR PANEL */}
              <div className={`w-80 xl:w-96 shrink-0 bg-stone-50 border-r border-stone-200 p-6 overflow-y-auto ${hideScrollbar}`}>
                {renderCalendar()}
              </div>

              {/* DESKTOP EVENTS LIST */}
              <div className={`flex-1 overflow-y-auto bg-white p-8 ${hideScrollbar}`}>
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-end justify-between mb-6 pb-2 border-b border-stone-100">
                    <h3 className="text-2xl font-serif font-bold text-stone-900">
                      {formatLongDate(selectedDate)}
                    </h3>
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
                                onClick={() => setSelectedEvent(event)} // Opens Desktop Modal
                                className={`flex flex-row items-center p-4 rounded-xl cursor-pointer transition-all border
                                  ${eventStatus.status === "live"
                                      ? "border-green-500 bg-green-50 shadow-lg animate-pulse"
                                      : eventStatus.status === "upcoming" && eventStatus.minutesLeft <= 30 && eventStatus.minutesLeft > 0
                                      ? "border-amber-500 bg-amber-50 shadow-md"
                                      : "border-stone-200 bg-stone-50/50 hover:border-amber-300 hover:bg-white hover:shadow-md"
                                  }`}
                              >
                                <div className="w-28 shrink-0 flex flex-col justify-center">
                                  <span className="text-sm font-bold text-amber-700 whitespace-nowrap">
                                    {formatTime(event.startTime || event.time) || "All Day"}
                                  </span>
                                </div>
                                <div className="flex-1 pl-4 border-l border-stone-200">
                                  <h4 className="text-base font-semibold text-stone-900 leading-tight">
                                    {event.title}
                                  </h4>
                                  {eventStatus.status === "live" && (
                                    <span className="inline-block mt-2 px-2 py-1 rounded-full bg-green-600 text-white text-[10px] font-bold uppercase">LIVE NOW</span>
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
          </div>
        ) : (
          /* =========================================
             HISTORY TAB (Shared Desktop & Mobile) 
          ========================================= */
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

      {/* =========================================================
          MOBILE FULL SCHEDULE BOTTOM SHEET
      ========================================================= */}
      <AnimatePresence>
        {showMobileFullSchedule && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFullSchedule(false)}
              className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[110] lg:hidden flex flex-col bg-stone-50 rounded-t-3xl shadow-2xl h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-stone-200 shrink-0">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Schedule for</p>
                  <h3 className="text-lg font-serif font-bold text-stone-900">{formatShortDate(selectedDate)}</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowMobileCalendar(true)}
                    className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <CalendarDays size={14} /> Select Date
                  </button>
                  <button onClick={() => setShowMobileFullSchedule(false)} className="p-1.5 bg-stone-100 rounded-lg text-stone-600">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Scrollable Events List (Inline Accordion) */}
              <div className={`flex-1 overflow-y-auto p-4 ${hideScrollbar}`}>
                {visibleEvents.length === 0 ? (
                  <div className="py-12 text-center">
                    <CalendarDays className="mx-auto text-stone-300 mb-3" size={40} />
                    <p className="text-stone-500 text-sm font-medium">No events scheduled.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pb-8">
                    {visibleEvents.map((event) => {
                      const eventStatus = getEventStatus(event, currentTime);
                      const isExpanded = expandedEventId === event.id;

                      return (
                        <div key={event.id} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden transition-all">
                          {/* Accordion Header */}
                          <div 
                            onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                            className="p-4 flex gap-3 cursor-pointer"
                          >
                            <div className="w-16 shrink-0 pt-0.5">
                              <span className="text-xs font-bold text-amber-700 block">
                                {event.startTime || event.time || "All Day"}
                              </span>
                              {eventStatus.status === "live" && (
                                <span className="inline-block mt-1 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded font-black uppercase">LIVE</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pr-2 border-l border-stone-100 pl-3">
                              <h4 className="text-sm font-bold text-stone-900 leading-tight">
                                {event.title}
                              </h4>
                            </div>
                            <ChevronDown size={18} className={`text-stone-400 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </div>

                          {/* Accordion Body */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-stone-50"
                              >
                                <div className="p-4 border-t border-stone-100">
                                  {event.image && (
                                    <img src={event.image} alt={event.title} className="w-full h-32 object-cover rounded-lg mb-3 shadow-sm" />
                                  )}
                                  <p className="text-sm text-stone-600 whitespace-pre-line leading-relaxed mb-4">
                                    {event.description || "No description provided."}
                                  </p>
                                  <a
                                    href={generateGoogleCalendarUrl(event, selectedDate)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition"
                                  >
                                    <CalendarPlus size={14} /> Add to Calendar
                                  </a>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* =========================================================
          MOBILE CALENDAR POPUP (Used inside Mobile Full Schedule)
      ========================================================= */}
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

      {/* =========================================================
          DESKTOP EVENT / HISTORY MODAL (Standard Popup)
      ========================================================= */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 z-[130] bg-stone-900/40 backdrop-blur-sm hidden lg:block" // Hidden on mobile
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[140] justify-center pointer-events-none pb-4 hidden lg:flex" // Hidden on mobile
            >
              <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[85vh]">
                <div className="relative flex justify-center items-center p-4 shrink-0 bg-white z-10 border-b border-stone-100">
                  <div className="w-12 h-1.5 bg-stone-200 rounded-full" />
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="absolute right-4 p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className={`overflow-y-auto overflow-x-hidden p-8 ${hideScrollbar}`}>
                  {selectedEvent.image && (
                    <img
                      src={selectedEvent.image}
                      alt={selectedEvent.title}
                      className="w-full h-64 object-cover rounded-2xl mb-6 shadow-sm border border-stone-100"
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

                  <h2 className="text-3xl font-bold text-stone-900 mb-4 font-serif leading-tight">
                    {selectedEvent.title}
                  </h2>
                  
                  <div className="prose prose-base prose-stone max-w-none mb-8">
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
                        className="inline-flex justify-center items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition shadow-md"
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