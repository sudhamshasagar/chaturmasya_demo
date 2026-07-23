import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircle,
  Clock,
  CalendarDays,
  Flame,
  Flower2,
  Music,
  BookOpen,
  ChevronRight,
  Sun,
  Moon,
  Loader2,
  Calendar,
  Volume2,
  Radio,
  X,
  Sparkles,
  MapPin,
} from "lucide-react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Adjust path if needed

/* ---------- helpers ---------- */
const timeToMinutes = (t) => {
  if (!t) return 0;
  const [time, modifier] = t.split(" ");
  if (!time || !modifier) return 0;
  let [hours, minutes] = time.split(":").map(Number);
  if (hours === 12) hours = 0;
  if (modifier === "PM") hours += 12;
  return hours * 60 + minutes;
};

const getIconForTitle = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("arati") || t.includes("aarti") || t.includes("deepa")) return Flame;
  if (t.includes("abhisheka") || t.includes("pooja") || t.includes("puja")) return Flower2;
  if (t.includes("bhajan") || t.includes("music") || t.includes("chanting")) return Music;
  if (t.includes("pravachana") || t.includes("discourse") || t.includes("katha")) return BookOpen;
  if (t.includes("suprabhata") || t.includes("morning")) return Sun;
  if (t.includes("ratri") || t.includes("night") || t.includes("shayana")) return Moon;
  return Sparkles;
};

const getPeriod = (time) => {
  const mins = timeToMinutes(time);
  if (mins < 12 * 60) return "Morning";
  if (mins < 17 * 60) return "Afternoon";
  if (mins < 20 * 60) return "Evening";
  return "Night";
};

/* ---------- component ---------- */
export default function ScheduleSection() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRitual, setSelectedRitual] = useState(null);
  const playerRef = useRef(null);
  const youtubePlayerRef = useRef(null);

  /* live clock */
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  /* firebase */
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

  /* youtube */
  useEffect(() => {
    const initializePlayer = () => {
      if (!window.YT || !window.YT.Player || !playerRef.current || youtubePlayerRef.current) return;
      youtubePlayerRef.current = new window.YT.Player(playerRef.current, {
        videoId: "FSLngWAw1Lo",
        playerVars: { autoplay: 1, mute: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: (event) => {
            event.target.mute();
            event.target.setVolume(80);
            event.target.playVideo();
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      if (!document.getElementById("youtube-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        initializePlayer();
      };
    }

    return () => {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
        youtubePlayerRef.current = null;
      }
    };
  }, []);

  /* today or fallback (Jul 28 2026) */
  const displayedSchedule = useMemo(() => {
    const todayStr = currentDate.toDateString();
    const todayItems = schedules.filter(
      (i) => i.date && new Date(i.date).toDateString() === todayStr
    );
    if (todayItems.length > 0) {
      return [...todayItems].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    }
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

  const handleJoinLive = () => {
    const player = youtubePlayerRef.current;
    if (!player) return;
    player.setVolume(80);
    player.unMute();
    player.playVideo();
  };

  /* modal escape + body lock */
  const closeModal = useCallback(() => setSelectedRitual(null), []);
  useEffect(() => {
    if (!selectedRitual) return;
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selectedRitual, closeModal]);

  return (
    <section
      id="schedule"
      className="scroll-mt-32 max-w-7xl mx-auto px-4 sm:px-6 mb-20 lg:mb-32"
    >
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .gold-shimmer {
          background: linear-gradient(90deg,#D4AF37 0%,#F5E0A0 50%,#D4AF37 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 6s linear infinite;
        }
      `}</style>

      {/* ============ HEADING ============ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-8 md:mb-12 text-center"
      >
        <div className="inline-flex items-center gap-2 bg-[#FAF6F0] border border-[#E8DCC4] rounded-full px-4 py-1.5 mb-4">
          <Radio className="w-3.5 h-3.5 text-[#722013]" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#722013]">
            Live Darshan · Streaming Now
          </span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#2a0b06] tracking-tight leading-[1.05]">
          Daily Rituals &{" "}
          <span className="gold-shimmer italic">Sacred Timings</span>
        </h2>
        <p className="text-sm md:text-base text-gray-500 mt-3 max-w-xl mx-auto">
          Witness the day's ceremonies as they unfold. All timings observed in Indian Standard Time.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 bg-white border border-[#E8DCC4] rounded-full px-4 py-2 shadow-sm">
          <Calendar className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-bold text-[#2a0b06] tracking-wide">{formattedDate}</span>
        </div>
      </motion.div>

      {/* ============ GRID ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 md:gap-6">
        {/* -------- VIDEO CARD -------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-3 relative"
        >
          {/* decorative glow */}
          <div className="absolute -inset-1 bg-gradient-to-br from-[#D4AF37]/20 via-transparent to-[#722013]/10 rounded-3xl blur-xl pointer-events-none" />

          <div className="relative bg-white border border-[#E8DCC4] rounded-2xl md:rounded-3xl shadow-xl shadow-[#722013]/5 overflow-hidden flex flex-col">
            {/* head */}
            <div className="flex items-center justify-between px-5 py-4 md:px-6 md:py-5 border-b border-[#E8DCC4] bg-gradient-to-r from-[#FDFBF7] via-white to-[#FDFBF7]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                </span>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-rose-700">
                  Live Now
                </span>
                <span className="hidden sm:inline text-xs text-gray-300">|</span>
                <span className="hidden sm:inline text-xs text-gray-500 font-medium truncate">
                  Broadcasting from the Sanctum
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#722013] bg-[#FAF6F0] px-2.5 py-1 rounded-full border border-[#E8DCC4] shrink-0">
                HD · 1080p
              </span>
            </div>

            {/* video */}
            <div className="p-4 sm:p-5 md:p-6">
              <div className="w-full bg-[#110603] rounded-xl md:rounded-2xl overflow-hidden shadow-inner aspect-video relative ring-1 ring-[#D4AF37]/20">
                <div ref={playerRef} className="absolute inset-0 w-full h-full" />
              </div>
            </div>

            {/* now playing */}
            <div className="mx-4 mb-4 sm:mx-5 sm:mb-5 md:mx-6 md:mb-6 bg-gradient-to-br from-[#FAF6F0] via-white to-[#FAF6F0] border border-[#E8DCC4] rounded-xl md:rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-white flex items-center justify-center border border-[#D4AF37]/60 shadow-sm">
                  <PlayCircle className="w-6 h-6 md:w-7 md:h-7 text-[#722013]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D4AF37] mb-1">
                    Now Playing
                  </p>
                  <p className="text-sm md:text-base font-bold text-[#2a0b06] leading-tight truncate font-serif">
                    Shri Jnaneshwari Shloka
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">Main Sanctum · Live from IST</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleJoinLive}
                className="shrink-0 group inline-flex items-center justify-center gap-2 bg-gradient-to-br from-[#2a0b06] to-[#722013] hover:from-[#722013] hover:to-[#8B2A18] active:scale-[0.98] text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-[#722013]/20 w-full sm:w-auto"
              >
                <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Join Live
              </button>
            </div>
          </div>
        </motion.div>

        {/* -------- SCHEDULE CARD -------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 bg-white border border-[#E8DCC4] rounded-2xl md:rounded-3xl shadow-xl shadow-[#722013]/5 overflow-hidden flex flex-col"
        >
          <div className="px-5 py-4 md:px-6 md:py-5 border-b border-[#E8DCC4] bg-gradient-to-br from-[#2a0b06] to-[#722013] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D4AF37] mb-1">
                Today's Itinerary
              </p>
              <h3 className="font-serif text-lg md:text-xl font-bold text-white truncate">
                Schedule of 28th July
              </h3>
            </div>
            <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-[#2a0b06] bg-[#D4AF37] px-3 py-1.5 rounded-full">
              {loading ? "…" : `${displayedSchedule.length} Events`}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar p-4 sm:p-5 space-y-2.5 bg-[#FDFBF7] lg:max-h-[600px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mb-3 text-[#D4AF37]" />
                <p className="text-xs font-bold uppercase tracking-widest">Loading Itinerary…</p>
              </div>
            ) : displayedSchedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white border border-dashed border-[#E8DCC4] rounded-2xl">
                <CalendarDays className="w-8 h-8 text-gray-300 mb-3" />
                <p className="font-serif font-bold text-[#2a0b06] text-lg">No rituals scheduled</p>
                <p className="text-xs text-gray-500 mt-1">There are no events planned for today yet.</p>
              </div>
            ) : (
              displayedSchedule.map((ritual, idx) => {
                const Icon = getIconForTitle(ritual.title);
                const period = getPeriod(ritual.time);
                return (
                  <motion.button
                    type="button"
                    key={ritual.id}
                    onClick={() => setSelectedRitual(ritual)}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="group relative w-full text-left grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-4 bg-white border border-[#E8DCC4] rounded-xl md:rounded-2xl p-3 sm:p-4 hover:border-[#D4AF37] hover:shadow-lg hover:shadow-[#D4AF37]/10 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {/* number rail */}
                    <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-[#D4AF37] to-[#722013] opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="shrink-0 relative flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#FAF6F0] to-white border border-[#E8DCC4] group-hover:border-[#D4AF37]/60 transition-colors">
                      <Icon className="w-5 h-5 text-[#722013] mb-0.5" />
                      <span className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest">
                        {period}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3 h-3 text-[#D4AF37] shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#722013]">
                          {ritual.time}
                        </span>
                        <span className="text-[9px] text-gray-300">·</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                          IST
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#2a0b06] truncate group-hover:text-[#722013] transition-colors font-serif">
                        {ritual.title}
                      </h4>
                      {ritual.description && (
                        <p className="text-xs text-gray-500 truncate mt-0.5 italic">
                          {ritual.description}
                        </p>
                      )}
                    </div>

                    <ChevronRight className="shrink-0 w-4 h-4 text-[#D4AF37] opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </motion.button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {selectedRitual && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2a0b06]/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="
                relative
                w-full
                max-w-md
                max-h-[90vh]
                bg-white
                rounded-2xl
                shadow-2xl
                overflow-hidden
                border border-[#E8DCC4]
                flex flex-col
              "
            >
              {/* Compact Header */}
              <div className="relative shrink-0 bg-gradient-to-br from-[#2a0b06] via-[#722013] to-[#8B2A18] px-5 py-5">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 30%, #D4AF37 0%, transparent 40%), radial-gradient(circle at 80% 70%, #F5E0A0 0%, transparent 40%)",
                  }}
                />

                <button
                  onClick={closeModal}
                  aria-label="Close"
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="relative flex items-center gap-4 pr-10">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-white/10 border border-[#D4AF37]/40 flex items-center justify-center">
                    {(() => {
                      const Icon = getIconForTitle(selectedRitual.title);
                      return <Icon className="w-6 h-6 text-[#D4AF37]" />;
                    })()}
                  </div>

                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1.5 bg-[#D4AF37] text-[#2a0b06] px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-1.5">
                      <Clock className="w-3 h-3" />
                      {selectedRitual.time} IST
                    </div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">
                      {getPeriod(selectedRitual.time)} Ritual
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto hide-scrollbar p-5">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2a0b06] leading-tight">
                  {selectedRitual.title}
                </h3>

                {selectedRitual.description ? (
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed font-serif italic">
                    “{selectedRitual.description}”
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-gray-400 italic">
                    No additional details provided for this ritual.
                  </p>
                )}

                {/* Compact Meta */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="bg-[#FAF6F0] border border-[#E8DCC4] rounded-lg px-3 py-2.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#D4AF37]">
                      Time
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-[#2a0b06]">
                      {selectedRitual.time}
                    </p>
                  </div>

                  <div className="bg-[#FAF6F0] border border-[#E8DCC4] rounded-lg px-3 py-2.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#D4AF37]">
                      Period
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-[#2a0b06]">
                      {getPeriod(selectedRitual.time)}
                    </p>
                  </div>

                  {selectedRitual.date && (
                    <div className="col-span-2 bg-[#FAF6F0] border border-[#E8DCC4] rounded-lg px-3 py-2.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-[#D4AF37]">
                        Date
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-[#2a0b06]">
                        {new Date(selectedRitual.date).toLocaleDateString("en-IN", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      handleJoinLive();
                      closeModal();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-br from-[#2a0b06] to-[#722013] hover:from-[#722013] hover:to-[#8B2A18] text-white px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all"
                  >
                    <Volume2 className="w-4 h-4" />
                    Watch Live
                  </button>

                  <button
                    onClick={closeModal}
                    className="flex-1 inline-flex items-center justify-center bg-white hover:bg-[#FAF6F0] text-[#2a0b06] px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all border border-[#E8DCC4]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
