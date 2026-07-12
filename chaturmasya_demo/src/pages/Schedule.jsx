import { useState } from "react";
import { motion } from "framer-motion";
import {
  PlayCircle,
  Clock,
  Calendar,
  Sun,
  Moon,
  Flame,
  Flower2,
  Utensils,
  Music,
  BookOpen,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const ritualData = [
  {
    d: "05", 
    m: "Jul",
    time: "06:00 AM",
    title: "Suprabhata Seva",
    badgeText: "Morning awakening",
    statusClasses: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    d: "05",
    m: "Jul",
    time: "08:30 AM",
    title: "Mangala Arati",
    badgeText: "First offering",
    statusClasses: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    d: "05",
    m: "Jul",
    time: "10:00 AM",
    title: "Kalasha Abhisheka",
    badgeText: "Sacred bath",
    statusClasses: "bg-sky-100 text-sky-800 border-sky-200",
  },
  {
    d: "05",
    m: "Jul",
    time: "12:15 PM",
    title: "Madhya Arati",
    badgeText: "Midday worship",
    statusClasses: "bg-orange-100 text-orange-800 border-orange-200",
  },
  {
    d: "05",
    m: "Jul",
    time: "04:30 PM",
    title: "Panchamrita Abhisheka",
    badgeText: "Evening offering",
    statusClasses: "bg-rose-100 text-rose-800 border-rose-200",
  },
  {
    d: "05",
    m: "Jul",
    time: "07:00 PM",
    title: "Ratri Arati",
    badgeText: "Night ceremony",
    statusClasses: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
];

const iconMap = {
  "Suprabhata Seva": Sun,
  "Mangala Arati": Flame,
  "Kalasha Abhisheka": Flower2,
  "Madhya Arati": Utensils,
  "Panchamrita Abhisheka": Music,
  "Ratri Arati": Moon,
};

export default function ScheduleSection() {
  return (
    <section id="schedule" className="scroll-mt-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="overflow-hidden rounded-[2rem] border border-[var(--brand-gold)]/20 bg-[var(--brand-cream)] shadow-xl"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-[var(--brand-gold)]/20 bg-[var(--brand-maroon)] px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[var(--brand-gold)] sm:text-3xl">
              Live Darshan & Today's Rituals
            </h2>
            <p className="mt-1 text-sm text-[var(--brand-cream)]/80">
              Sacred timings observed in IST
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-[var(--brand-gold)]/30 bg-[var(--brand-cream)]/10 px-4 py-2 text-sm font-medium text-[var(--brand-cream)] backdrop-blur-sm">
            <Calendar className="h-4 w-4 text-[var(--brand-gold)]" />
            Sunday, 12 July 2026
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-5">
          {/* Video - takes more space */}
          <div className="relative bg-gradient-to-br from-[#2a0b06] to-[#1a0503] p-4 lg:col-span-3">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_50%)]" />
            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                    Live Now
                  </span>
                </div>
                <span className="text-xs text-[var(--brand-cream)]/60">
                  Udupi Sri Krishna Matha
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl bg-black shadow-2xl">
                <div className="relative aspect-video w-full">
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src="https://www.youtube.com/embed/FSLngWAw1Lo?si=ZLqTYwdK-C7xvZiN"
                    title="Shri Jnaneshwari Shloka"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#D4AF37]/40 bg-white/10 p-4 shadow-lg backdrop-blur-sm">

                <div className="flex items-center gap-3">

                  {/* Play Icon */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] shadow-md">
                    <PlayCircle className="h-5 w-5 text-[#2a0b06]" />
                  </div>

                  {/* Event Details */}
                  <div>
                    <p className="text-sm font-bold text-white">
                      Mangala Arati in progress
                    </p>

                    <p className="mt-1 text-xs font-medium text-[#E8DCC4]">
                      Started at 08:30 AM IST
                    </p>
                  </div>

                </div>

                {/* Join Live Button */}
                <button
                  className="
                    shrink-0
                    rounded-full
                    bg-[#D4AF37]
                    px-5
                    py-2.5
                    text-xs
                    font-bold
                    text-[#2a0b06]
                    shadow-md
                    transition-all
                    duration-300
                    hover:bg-[#E5C45B]
                    hover:shadow-lg
                    hover:-translate-y-0.5
                  "
                >
                  Join Live
                </button>

              </div>
            </div>
          </div>

          {/* Schedule - compact side panel */}
          <div className="border-t border-[var(--brand-gold)]/10 bg-white p-4 lg:col-span-2 lg:border-t-0 lg:border-l">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[var(--brand-maroon)]">
                Today's Rituals
              </h3>
              <span className="rounded-full bg-[var(--brand-gold)]/10 px-2 py-1 text-xs font-bold text-[var(--brand-maroon)]">
                6 events
              </span>
            </div>

            <div className="space-y-3">
              {ritualData.map((ritual, index) => {
                const Icon = iconMap[ritual.title] || BookOpen;
                return (
                  <motion.div
                    key={ritual.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="group flex items-center gap-3 rounded-xl border border-[var(--brand-gold)]/10 bg-[var(--brand-cream)]/40 p-3 transition hover:border-[var(--brand-gold)]/30 hover:bg-[var(--brand-cream)]"
                  >
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--brand-maroon)] text-[var(--brand-cream)]">
                      <span className="text-xs font-bold uppercase">
                        {ritual.m}
                      </span>
                      <span className="text-lg font-bold leading-none">
                        {ritual.d}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate font-semibold text-[var(--brand-maroon)]">
                          {ritual.title}
                        </h4>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${ritual.statusClasses}`}
                        >
                          {ritual.badgeText}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {ritual.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          IST
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--brand-gold)] opacity-0 transition group-hover:opacity-100" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
