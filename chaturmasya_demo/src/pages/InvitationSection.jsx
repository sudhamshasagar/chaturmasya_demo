import React, { useState } from "react";
import {
  Calendar,
  Users,
  Phone,
  X,
  User,
  Sparkles,
  Flame,
  MapPin,
  HandHeart,
  ChevronRight,
} from "lucide-react";

export default function ChaturmasyaPortal() {
  const [activeMonth, setActiveMonth] = useState("July");
  const [activeTab, setActiveTab] = useState("schedule"); // schedule | seva
  const [isOpen, setIsOpen] = useState(false);

  const events = [
    { d: "28", m: "Jul", time: "6:30 PM", title: "Arrival of Ubhaya Swamiji", month: "July" },
    { d: "29", m: "Jul", time: "10:00 AM", title: "Guru Poornima & Vyasa Pooja", month: "July", star: true },
    { d: "21", m: "Aug", time: "All Day", title: "Kunkumarchane by Matruvarga", month: "August" },
    { d: "31", m: "Aug", time: "All Day", title: "Sankastahara Chaturthi Udyapane", month: "August" },
    { d: "06", m: "Sep", time: "All Day", title: "Pushparchane", month: "September" },
    { d: "08", m: "Sep", time: "All Day", title: "Durga Deepa Namaskara", month: "September" },
    { d: "20", m: "Sep", time: "All Day", title: "Mangala Chandika Homa", month: "September" },
    { d: "26", m: "Sep", time: "8:00 AM", title: "Seemollanghana", month: "September", star: true },
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

  const mainCommittee = [
    { name: "Shri Mohan Shet M K", role: "Honorary President" },
    { name: "Shri Arun Kumar M S", role: "President" },
    { name: "Shri Manjunatha V Varnekar", role: "Working President" },
    { name: "Shri Suryakantha N Raikar", role: "Chief Secretary" },
    { name: "Shri Raghavendra R", role: "Treasurer" },
  ];

  const subCommittees = [
    { title: "Alankara Samithi", coord: "Shri Prashantha M Shet", phone: "+91 9900797631" },
    { title: "Cultural Desk", coord: "Shri CA Shashikanth", phone: "+91 9448519501" },
    { title: "Seva Desk (Women)", coord: "Smt. Mamatha Arun", phone: "+91 9739493673" },
  ];

  const filtered = events.filter((e) => e.month === activeMonth);

  return (
    <section className="bg-[#FBF7EF] py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* COMPACT HEADER STRIP */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#722013] text-white grid place-items-center">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#722013]">Chaturmasya 2026</p>
              <h1 className="text-lg sm:text-xl font-serif text-[#2a0b06] truncate">Sacred 60-Day Sojourn</h1>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-[#2a0b06] text-white text-sm px-4 py-2 rounded-full hover:bg-[#4a1810] transition shrink-0"
          >
            <Users size={14} /> Committee
          </button>
        </div>

        {/* HERO — Start / End / Weekly compact strip */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4">
          <div className="bg-gradient-to-br from-[#2a0b06] to-[#4a1810] text-white rounded-2xl p-4 flex items-center gap-3">
            <div className="text-center shrink-0">
              <p className="text-2xl sm:text-3xl font-serif leading-none">29</p>
              <p className="text-[9px] uppercase tracking-widest text-amber-300 mt-1">Jul</p>
            </div>
            <div className="min-w-0 border-l border-white/15 pl-3">
              <p className="text-[9px] uppercase tracking-widest text-amber-400">Start</p>
              <p className="text-sm font-semibold truncate">Vyasa Pooja</p>
              <p className="text-[10px] text-white/60">10:00 AM</p>
            </div>
          </div>

          <div className="bg-white border border-[#E8DCC4] rounded-2xl p-4 flex items-center gap-3">
            <div className="text-center shrink-0">
              <p className="text-2xl sm:text-3xl font-serif leading-none text-[#2a0b06]">26</p>
              <p className="text-[9px] uppercase tracking-widest text-[#722013] mt-1">Sep</p>
            </div>
            <div className="min-w-0 border-l border-[#E8DCC4] pl-3">
              <p className="text-[9px] uppercase tracking-widest text-[#722013]">End</p>
              <p className="text-sm font-semibold text-[#2a0b06] truncate">Seemollanghana</p>
              <p className="text-[10px] text-stone-500">8:00 AM</p>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-500 text-white grid place-items-center">
              <Flame size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-widest text-amber-700">Every Monday</p>
              <p className="text-sm font-semibold text-[#2a0b06] truncate">Rudrabhisheka</p>
              <p className="text-[10px] text-stone-500">Morning · Contact office</p>
            </div>
          </div>
        </div>

        {/* MAIN CARD — Tabbed to eliminate scrolling */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center justify-between border-b border-stone-100 px-3 sm:px-5">
            <div className="flex">
              {[
                { id: "schedule", label: "Schedule", icon: Calendar },
                { id: "seva", label: "Seva", icon: HandHeart },
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-semibold border-b-2 transition ${
                      active
                        ? "border-[#722013] text-[#722013]"
                        : "border-transparent text-stone-400 hover:text-stone-600"
                    }`}
                  >
                    <Icon size={15} /> {t.label}
                  </button>
                );
              })}
            </div>
            {activeTab === "schedule" && (
              <div className="hidden sm:flex gap-1 bg-stone-100 p-1 rounded-full">
                {["July", "August", "September"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setActiveMonth(m)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                      activeMonth === m ? "bg-white text-[#722013] shadow-sm" : "text-stone-500"
                    }`}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            )}
            <a
              href="tel:+919448724275"
              className="hidden md:flex items-center gap-1.5 text-xs font-bold text-[#722013]"
            >
              <Phone size={12} /> 94487 24275
            </a>
          </div>

          {/* Mobile month pills */}
          {activeTab === "schedule" && (
            <div className="flex sm:hidden gap-1 p-2 border-b border-stone-100 overflow-x-auto">
              {["July", "August", "September"].map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMonth(m)}
                  className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full transition ${
                    activeMonth === m ? "bg-[#722013] text-white" : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="p-3 sm:p-5">
            {activeTab === "schedule" ? (
              <ul className="grid sm:grid-cols-2 gap-2">
                {filtered.map((e, i) => (
                  <li
                    key={i}
                    className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl p-2.5 border transition ${
                      e.star
                        ? "bg-[#FAF6F0] border-[#E8DCC4]"
                        : "bg-white border-stone-100 hover:border-stone-200"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-lg grid place-items-center shrink-0 ${
                        e.star ? "bg-[#722013] text-white" : "bg-stone-50 text-[#2a0b06]"
                      }`}
                    >
                      <div className="text-center leading-none">
                        <p className="text-base font-bold">{e.d}</p>
                        <p className="text-[8px] uppercase tracking-widest mt-0.5 opacity-70">{e.m}</p>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#2a0b06] truncate">{e.title}</p>
                      <p className="text-[11px] text-stone-500">{e.time}</p>
                    </div>
                    {e.star && (
                      <Sparkles size={14} className="text-amber-500 shrink-0" />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="grid sm:grid-cols-2 gap-2">
                {sevas.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 bg-white border border-stone-100 hover:border-[#E8DCC4] hover:bg-[#FAF6F0]/50 transition"
                  >
                    <span className="text-sm text-[#2a0b06] truncate">{s.name}</span>
                    <span className="text-sm font-bold text-[#722013] shrink-0">₹{s.price}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer bar */}
          <div className="flex items-center justify-between gap-3 px-3 sm:px-5 py-3 bg-stone-50 border-t border-stone-100 text-xs">
            <span className="text-stone-500 flex items-center gap-1.5 min-w-0">
              <MapPin size={12} className="text-[#722013] shrink-0" />
              <span className="truncate">Contact office for bookings & timings</span>
            </span>
            <a
              href="tel:+919448724275"
              className="flex items-center gap-1.5 text-[#722013] font-bold shrink-0 md:hidden"
            >
              <Phone size={12} /> Call
            </a>
          </div>
        </div>

        {/* COMMITTEE MODAL */}
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl"
            >
              <div className="sticky top-0 bg-white flex justify-between items-center px-5 py-4 border-b border-stone-100">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#722013]">Chaturmasya 2026</p>
                  <h2 className="text-lg font-serif font-bold text-[#2a0b06]">Organizing Committee</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-full"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#722013] mb-3">
                    Core Members
                  </h3>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {mainCommittee.map((m, i) => (
                      <div
                        key={i}
                        className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E8DCC4]/60"
                      >
                        <p className="font-bold text-xs text-[#2a0b06] truncate">{m.name}</p>
                        <p className="text-[10px] text-stone-500 mt-0.5">{m.role}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#722013] mb-3">
                    Sub-Committees
                  </h3>
                  <div className="space-y-1.5">
                    {subCommittees.map((s, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-3 md:items-center gap-2 p-3 bg-white border border-stone-100 rounded-xl hover:border-amber-300 transition"
                      >
                        <div className="font-semibold text-sm text-[#2a0b06]">{s.title}</div>
                        <div className="hidden md:flex text-xs text-stone-600 items-center gap-1.5 min-w-0">
                          <User size={12} className="text-amber-600 shrink-0" />
                          <span className="truncate">{s.coord}</span>
                        </div>
                        <a
                          href={`tel:${s.phone}`}
                          className="flex items-center gap-1.5 text-xs text-[#722013] font-bold justify-end"
                        >
                          <Phone size={12} /> <span className="hidden sm:inline">{s.phone}</span>
                          <span className="sm:hidden">Call</span>
                        </a>
                        <p className="md:hidden col-span-2 text-[11px] text-stone-500 flex items-center gap-1.5">
                          <User size={11} className="text-amber-600" /> {s.coord}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
