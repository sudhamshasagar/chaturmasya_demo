import React, { useState, useMemo } from "react";
import {
  CalendarDays,
  Phone,
  Sparkles,
  Flame,
  MapPin,
  HandHeart,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  X,
  Info
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { portalText } from "../translation/portalText";

export default function ChaturmasyaPortal() {
  const [isSevaOpen, setIsSevaOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("All");
  
  const { language } = useLanguage();
  const t = portalText[language];

  // Integrated descriptions into the existing events array
  const events = [
    { 
      d: "21", m: "Aug", time: "All Day", 
      title: "Kunkumarchane by Matruvarga",
      kanTitle: "ಕುಂಕುಮಾರ್ಚನೆ",
      desc: "ಅಷ್ಟಲಕ್ಷ್ಮೀ ಸ್ವರೂಪಿಣಿಯಾದ ಶ್ರೀ ರಾಜರಾಜೇಶ್ವರಿ ದೇವಿಯ ಆರಾಧನೆಯಾದ ಕುಂಕುಮಾರ್ಚನೆಯು ಭಕ್ತರಿಗೆ ಸರ್ವಮಂಗಳವನ್ನು ಅನುಗ್ರಹಿಸುವ ಪವಿತ್ರ ಸೇವೆಯಾಗಿದೆ. ಈ ಪೂಜೆಯಿಂದ ಮನೆಯಲ್ಲಿನ ಅಮಂಗಲ ದೋಷಗಳ ನಿವಾರಣೆ, ಸನ್ಮಂಗಳದ ವೃದ್ಧಿ, ದೀರ್ಘ ಸೌಭಾಗ್ಯ ಪ್ರಾಪ್ತಿ, ಕುಟುಂಬದಲ್ಲಿ ಸುಖ, ಶಾಂತಿ, ಆರೋಗ್ಯ, ಐಶ್ವರ್ಯ ಹಾಗೂ ಸಂಪತ್ತಿನ ಅಭಿವೃದ್ದಿ ಉಂಟಾಗಿ ದೇವಿಯ ಕೃಪೆಗೆ ಪಾತ್ರರಾಗುತ್ತಾರೆ."
    },
    {  
      d: "31", m: "Aug", time: "All Day", 
      title: "Sankastahara Chaturthi Udyapane",
      kanTitle: "ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿ ಉದ್ಯಾಪನ",
      desc: "ಶ್ರೀ ಮಹಾಗಣಪತಿಯ ಅನುಗ್ರಹ ಪ್ರಾಪ್ತಿಗಾಗಿ, ವಿಘ್ನದೋಷಗಳ ನಿವಾರಣೆ, ಸಂಕಷ್ಟಗಳ ಪರಿಹಾರ ಹಾಗೂ ಕೈಗೊಂಡ ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿ ವ್ರತದ ಸಂಪೂರ್ಣ ಫಲಪ್ರಾಪ್ತಿಗಾಗಿ ಆಚರಿಸುವ ವಿಶೇಷ ಪೂಜೆಯೇ ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿ ಉದ್ಯಾಪನ. ಮುಂದಿನ ದಿನಗಳಲ್ಲಿ ವ್ರತಾಚರಣೆ ನಡೆಸಲು ಅಶಕ್ತರಾಗಿರುವವರು ಅಥವಾ ಹಲವು ವರ್ಷಗಳಿಂದ ಭಕ್ತಿಯಿಂದ ವ್ರತವನ್ನು ಆಚರಿಸಿ ಅದರ ಪೂರ್ಣ ಫಲವನ್ನು ಪಡೆಯಲು ಬಯಸುವವರು ಈ ಉದ್ಯಾಪನ ಸೇವೆಯನ್ನು ನೆರವೇರಿಸಬಹುದು."
    },
    { 
      d: "06", m: "Sep", time: "All Day", 
      title: "Pushparchane",
      kanTitle: "ಪುಷ್ಪಾರ್ಚನೆ",
      desc: "ಶ್ರೀ ರಾಜರಾಜೇಶ್ವರಿ ದೇವಿಗೆ ಪುಷ್ಪಾರ್ಚನೆ ಸಲ್ಲಿಸುವುದರಿಂದ ದೇವಿಯ ಅನುಗ್ರಹ ಪ್ರಾಪ್ತಿಯಾಗಿ, ಸ್ಥಿರ ಉದ್ಯೋಗ, ವ್ಯಾಪಾರದಲ್ಲಿ ಯಶಸ್ಸು ಹಾಗೂ ಅಭಿವೃದ್ಧಿ, ಚಂಚಲ ಮನಸ್ಸಿಗೆ ಸ್ಥಿರತೆ, ಇಚ್ಛಿತ ಮನೋಕಾಮನೆಗಳ ಪರಿಪೂರ್ಣತೆ, ಧನ, ಕನಕ, ಧಾನ್ಯ ಸಮೃದ್ಧಿ ಹಾಗೂ ಸರ್ವಾಂಗೀಣ ಐಶ್ವರ್ಯ ವೃದ್ಧಿಯಾಗುತ್ತದೆ. ಈ ಪವಿತ್ರ ಸೇವೆಯು ಭಕ್ತರ ಜೀವನದಲ್ಲಿ ಸುಖ, ಶಾಂತಿ ಮತ್ತು ಮಂಗಳವನ್ನು ಕರುಣಿಸುತ್ತದೆ."
    },
    { 
      d: "08", m: "Sep", time: "All Day", 
      title: "Durga Deepa Namaskara",
      kanTitle: "ದುರ್ಗಾ ದೀಪ ನಮಸ್ಕಾರ",
      desc: "ಶ್ರೀ ದುರ್ಗಾಪರಮೇಶ್ವರಿಯ ಆರಾಧನೆಯಾದ ದುರ್ಗಾ ದೀಪ ನಮಸ್ಕಾರವು ಭಕ್ತರ ಜೀವನದಲ್ಲಿ ದೈವಾನುಗ್ರಹವನ್ನು ವೃದ್ಧಿಸುವ ಪವಿತ್ರ ಸೇವೆಯಾಗಿದೆ. ಈ ಸೇವೆಯಿಂದ ಶತ್ರುಬಾಧೆಗಳ ನಿವಾರಣೆ, ಕೃತ್ರಿಮ ಬಾಧೆಗಳ ನಿವೃತ್ತಿ, ದುರ್ಗಾಪರಮೇಶ್ವರಿಯ ವಿಶೇಷ ಅನುಗ್ರಹ, ಸಕಲ ಸಂಪತ್ತು ಹಾಗೂ ಸಮೃದ್ಧಿಯ ವೃದ್ಧಿ, ಇಚ್ಛಿತ ಮನೋಕಾಮನೆಗಳ ಪರಿಪೂರ್ಣತೆ ಮತ್ತು ಸರ್ವಮಂಗಳದ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ."
    },
    { 
      d: "20", m: "Sep", time: "All Day", 
      title: "Mangala Chandika Homa",
      kanTitle: "ಮಂಗಳ ಚಂಡಿಕಾ ಹೋಮ",
      desc: "ಶ್ರೀ ಮಂಗಳ ಚಂಡಿಕಾ ದೇವಿಯ ಅನುಗ್ರಹವನ್ನು ಪಡೆಯಲು ನೆರವೇರಿಸುವ ಈ ಮಹತ್ವದ ಹೋಮವು ವಿವಾಹ ಪ್ರತಿಬಂಧಕ ದೋಷಗಳ ನಿವಾರಣೆ, ಶೀಘ್ರ ವಿವಾಹಯೋಗದ ಪ್ರಾಪ್ತಿ, ಗೃಹದಲ್ಲಿ ನಿರಂತರ ಸನ್ಮಾಂಗಲ್ಯದ ವೃದ್ಧಿ, ಕುಟುಂಬದ ಸುಖ, ಶಾಂತಿ ಹಾಗೂ ಐಶ್ವರ್ಯದ ಅಭಿವೃದ್ಧಿಗೆ ಕಾರಣವಾಗುತ್ತದೆ. ದೇವಿಯ ಕೃಪೆಯಿಂದ ಇಚ್ಛಿತ ಶುಭಕಾರ್ಯಗಳು ನಿರ್ವಿಘ್ನವಾಗಿ ನೆರವೇರಿ ಜೀವನದಲ್ಲಿ ಸರ್ವಮಂಗಳವು ನೆಲೆಸುತ್ತದೆ."
    },
    { d: "26", m: "Sep", time: "8:00 AM", title: "Seemollanghana", star: true },
  ];

  const sevas = [
    { name: "Chaturmasya Samrakshana", price: "1,00,000" },
    { name: "Udayastamana Seve", price: "50,000" },
    { name: "Pada Pooja + Sampoorna", price: "25,000" },
    { name: "Pada Pooja + Maha Annadana", price: "10,000" },
    { name: "Sankastahara Udyapane", price: "9,000" },
    { name: "Pada Pooja + Annadana", price: "5,000" },
    { name: "Durga Deepa Namaskara", price: "3,000" },
    { name: "Pada Pooja", price: "1,000" },
  ];

  // Derive unique months for the filter tabs
  const months = useMemo(() => {
    const uniqueMonths = [...new Set(events.map(e => e.m))];
    return ["All", ...uniqueMonths];
  }, []);

  // Filter events based on the selected month
  const filteredEvents = useMemo(() => {
    if (selectedMonth === "All") return events;
    return events.filter(e => e.m === selectedMonth);
  }, [selectedMonth, events]);

  return (
    <section className="bg-[#FBF7EF] py-4 sm:py-6 relative font-sans">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        
        {/* COMPACT HEADER STRIP */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-[#722013] text-white grid place-items-center shadow-sm">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#722013]">
                {t.header.year}
              </p>
              <h1 className="text-base sm:text-lg font-serif font-bold text-[#2a0b06] truncate">
                {t.header.title}
              </h1>
            </div>
          </div>
          <a
            href="tel:+918749073557"
            className="hidden sm:flex items-center gap-1.5 bg-[#FAF6F0] border border-[#E8DCC4] text-[#722013] text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#722013] hover:text-white transition shrink-0"
          >
            <Phone size={12} /> 8749073557
          </a>
        </div>

        {/* COMPACT HERO STRIP (Dates & Weekly) */}
        <div className="bg-gradient-to-r from-[#2a0b06] to-[#4a1810] rounded-xl p-3 sm:px-5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white mb-4 shadow-md">
          {/* Timeline */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2.5">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-serif leading-none text-amber-300">29</p>
                <p className="text-[9px] uppercase tracking-widest mt-0.5">Jul</p>
              </div>
              <div className="border-l border-white/20 pl-2.5">
                <p className="text-[9px] uppercase tracking-widest text-amber-400/80">{t.start}</p>
                <p className="text-xs sm:text-sm font-semibold">Vyasa Pooja</p>
              </div>
            </div>
            
            <ArrowRight size={16} className="text-white/30 shrink-0" />
            
            <div className="flex items-center gap-2.5">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-serif leading-none text-amber-300">26</p>
                <p className="text-[9px] uppercase tracking-widest mt-0.5">Sep</p>
              </div>
              <div className="border-l border-white/20 pl-2.5">
                <p className="text-[9px] uppercase tracking-widest text-amber-400/80">{t.end}</p>
                <p className="text-xs sm:text-sm font-semibold">Seemollanghana</p>
              </div>
            </div>
          </div>

          {/* Weekly Event */}
          <div className="flex items-center gap-2.5 md:border-l border-white/20 md:pl-6 pt-3 md:pt-0 border-t md:border-t-0">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-amber-500/20 text-amber-400 grid place-items-center">
              <Flame size={16} />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-amber-400/80">{t.weekly.everyMonday}</p>
              <p className="text-xs sm:text-sm font-semibold">{t.weekly.title}</p>
            </div>
          </div>
        </div>

        {/* SPECIAL EVENTS SECTION */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm mb-4 overflow-hidden">
          {/* Header & Tabs */}
          <div className="border-b border-stone-100">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-[#722013]" />
                <h2 className="text-sm font-bold text-[#2a0b06]">Special Events</h2>
              </div>
            </div>
            
            {/* Compact Monthly Tabs */}
            <div className="flex gap-2 px-3 pb-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {months.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                    selectedMonth === m
                      ? "bg-[#722013] text-white shadow-sm"
                      : "bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {m === "All" ? "All Months" : m}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Events Grid */}
          <div className="p-2.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredEvents.map((e, i) => (
              <button
                key={i}
                onClick={() => e.desc && setSelectedEvent(e)}
                // Differentiate styles: detailed vs star vs default
                className={`w-full text-left flex items-start gap-3 rounded-lg p-2.5 border transition-all ${
                  e.desc
                    ? "bg-white border-stone-200 shadow-sm hover:border-[#722013]/30 cursor-pointer"
                    : e.star
                    ? "bg-[#FAF6F0] border-amber-200/60 cursor-default"
                    : "bg-stone-50/70 border-stone-100 cursor-default"
                }`}
              >
                {/* Date Box */}
                <div className={`w-10 h-10 rounded shrink-0 grid place-items-center mt-0.5 ${
                  e.star ? "bg-[#722013] text-white" : "bg-white border border-stone-200 text-[#2a0b06]"
                }`}>
                  <div className="text-center leading-none">
                    <p className="text-sm font-bold">{e.d}</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest mt-0.5 opacity-80">{e.m}</p>
                  </div>
                </div>
                
                {/* Text Wrapping Content */}
                <div className="min-w-0 flex-1">
                  {e.kanTitle && (
                    <p className="text-sm font-bold text-[#2a0b06] mb-0.5">{e.kanTitle}</p>
                  )}
                  <p className="text-[11px] font-semibold text-stone-600 leading-snug whitespace-normal">
                    {e.title}
                  </p>
                  <p className="text-[10px] font-medium text-stone-400 mt-1 flex items-center gap-1">
                    {e.time}
                  </p>
                </div>
                
                {/* Right Badges/Icons */}
                {e.desc ? (
                  <div className="shrink-0 mt-0.5">
                    <span className="bg-[#722013]/10 text-[#722013] text-[9px] font-bold uppercase tracking-wider px-1.5 py-1 rounded">
                      Details
                    </span>
                  </div>
                ) : e.star ? (
                  <Sparkles size={14} className="text-amber-500 shrink-0 mt-1" />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* SEVA COLLAPSIBLE SECTION */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-4">
          <button
            onClick={() => setIsSevaOpen(!isSevaOpen)}
            className="w-full px-4 py-3 flex items-center justify-between bg-stone-50 hover:bg-[#FAF6F0] transition-colors"
          >
            <div className="flex items-center gap-2">
              <HandHeart size={16} className="text-[#722013]" />
              <h2 className="text-sm font-bold text-[#2a0b06]">Seva Offerings</h2>
            </div>
            {isSevaOpen ? (
              <ChevronUp size={18} className="text-stone-400" />
            ) : (
              <ChevronDown size={18} className="text-stone-400" />
            )}
          </button>
          
          {isSevaOpen && (
            <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 border-t border-stone-100">
              {sevas.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 bg-white border border-stone-100 hover:border-[#E8DCC4] transition"
                >
                  <span className="text-xs font-medium text-[#2a0b06] truncate" title={s.name}>
                    {s.name}
                  </span>
                  <span className="text-xs font-bold text-[#722013] shrink-0">
                    ₹{s.price}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER STRIP */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl border border-stone-200 shadow-sm text-xs">
          <span className="text-stone-500 flex items-center gap-1.5 min-w-0">
            <MapPin size={12} className="text-[#722013] shrink-0" />
            <span className="truncate">{t.footer.booking}</span>
          </span>
          <a
            href="tel:+918749073557"
            className="flex items-center gap-1.5 text-[#722013] font-bold shrink-0 sm:hidden"
          >
            <Phone size={12} /> Call
          </a>
        </div>
        
      </div>

      {/* COMPACT BOTTOM SHEET / MODAL FOR EVENT DETAILS */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm transition-opacity">
          {/* Overlay click to close */}
          <div 
            className="absolute inset-0 z-0" 
            onClick={() => setSelectedEvent(null)}
          ></div>
          
          <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in duration-200">
            
            {/* Header */}
            <div className="bg-[#FAF6F0] px-4 py-3 border-b border-[#E8DCC4] flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#722013] font-bold mb-0.5">
                  {selectedEvent.d} {selectedEvent.m} • {selectedEvent.time}
                </p>
                <h3 className="text-base font-serif font-bold text-[#2a0b06] leading-tight">
                  {selectedEvent.kanTitle}
                </h3>
                <p className="text-xs font-medium text-stone-600 mt-1">
                  {selectedEvent.title}
                </p>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 bg-white border border-stone-200 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-4 bg-white max-h-[50vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex items-start gap-2.5">
                <Info size={16} className="text-[#722013] mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed text-stone-700 text-justify font-medium">
                  {selectedEvent.desc}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}