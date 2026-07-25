import React, { useState } from "react";
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
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { portalText } from "../translation/portalText";

export default function ChaturmasyaPortal() {
  const [isSevaOpen, setIsSevaOpen] = useState(false);
  const { language } = useLanguage();
  const t = portalText[language];

  const events = [
    { d: "28", m: "Jul", time: "6:30 PM", title: "Arrival of Ubhaya Swamiji" },
    { d: "29", m: "Jul", time: "10:00 AM", title: "Guru Poornima & Vyasa Pooja", star: true },
    { d: "21", m: "Aug", time: "All Day", title: "Kunkumarchane by Matruvarga" },
    { d: "31", m: "Aug", time: "All Day", title: "Sankastahara Chaturthi Udyapane" },
    { d: "06", m: "Sep", time: "All Day", title: "Pushparchane" },
    { d: "08", m: "Sep", time: "All Day", title: "Durga Deepa Namaskara" },
    { d: "20", m: "Sep", time: "All Day", title: "Mangala Chandika Homa" },
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

  return (
    <section className="bg-[#FBF7EF] py-4 sm:py-6">
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

        {/* SPECIAL EVENTS GRID (All at once) */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm mb-4">
          <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-2">
            <CalendarDays size={16} className="text-[#722013]" />
            <h2 className="text-sm font-bold text-[#2a0b06]">Special Events</h2>
          </div>
          <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {events.map((e, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg p-2.5 border transition-colors ${
                  e.star
                    ? "bg-[#FAF6F0] border-amber-200/60"
                    : "bg-white border-stone-100 hover:border-stone-200"
                }`}
              >
                <div className={`w-10 h-10 rounded shrink-0 grid place-items-center ${
                  e.star ? "bg-[#722013] text-white" : "bg-stone-50 text-[#2a0b06] border border-stone-100"
                }`}>
                  <div className="text-center leading-none">
                    <p className="text-sm font-bold">{e.d}</p>
                    <p className="text-[8px] uppercase tracking-widest mt-0.5 opacity-80">{e.m}</p>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#2a0b06] leading-tight truncate" title={e.title}>
                    {e.title}
                  </p>
                  <p className="text-[10px] text-stone-500 mt-0.5">{e.time}</p>
                </div>
                {e.star && <Sparkles size={14} className="text-amber-500 shrink-0" />}
              </div>
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
    </section>
  );
}