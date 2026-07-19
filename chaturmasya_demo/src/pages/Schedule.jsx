import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Adjust path if needed

// Helper to convert "06:00 AM" to minutes for sorting
const timeToMinutes = (t) => {
  if (!t) return 0;
  const [time, modifier] = t.split(" ");
  if (!time || !modifier) return 0;
  let [hours, minutes] = time.split(":").map(Number);
  if (hours === 12) hours = 0;
  if (modifier === "PM") hours += 12;
  return hours * 60 + minutes;
};

// Dynamic Icon matching based on keywords in the title
const getIconForTitle = (title) => {
  const t = title.toLowerCase();
  if (t.includes("arati") || t.includes("aarti") || t.includes("deepa")) return Flame;
  if (t.includes("abhisheka") || t.includes("pooja") || t.includes("puja")) return Flower2;
  if (t.includes("bhajan") || t.includes("music") || t.includes("chanting")) return Music;
  if (t.includes("pravachana") || t.includes("discourse") || t.includes("katha")) return BookOpen;
  if (t.includes("suprabhata") || t.includes("morning")) return Sun;
  if (t.includes("ratri") || t.includes("night") || t.includes("shayana")) return Moon;
  return Clock;
};

export default function ScheduleSection() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const playerRef = useRef(null);
  const youtubePlayerRef = useRef(null);

  // Keep the current date updated (in case they leave the tab open)
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch from Firebase
  useEffect(() => {
    const q = query(collection(db, "schedules"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSchedules(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching schedules:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
  const initializePlayer = () => {
    if (
      !window.YT ||
      !window.YT.Player ||
      !playerRef.current ||
      youtubePlayerRef.current
    ) {
      return;
    }

    youtubePlayerRef.current = new window.YT.Player(
      playerRef.current,
      {
        videoId: "FSLngWAw1Lo",

        playerVars: {
          autoplay: 1,
          mute: 1,
          playsinline: 1,
          rel: 0,
        },

        events: {
          onReady: (event) => {
            // Autoplay muted because browsers block
            // autoplay with sound.
            event.target.mute();
            event.target.setVolume(80);
            event.target.playVideo();
          },
        },
      }
    );
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

    const previousCallback =
      window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) {
        previousCallback();
      }

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

  // Filter for "Today" and sort by time
const displayedSchedule = useMemo(() => {
  const todayStr = currentDate.toDateString();

  // First check today's schedule
  const todayItems = schedules.filter((item) => {
    if (!item.date) return false;

    return (
      new Date(item.date).toDateString() === todayStr
    );
  });

  // If today's schedule exists, show it
  if (todayItems.length > 0) {
    return [...todayItems].sort(
      (a, b) =>
        timeToMinutes(a.time) -
        timeToMinutes(b.time)
    );
  }

  // Otherwise show July 29 schedule
  const july29Items = schedules.filter((item) => {
    if (!item.date) return false;

    const date = new Date(item.date);

    return (
      date.getFullYear() === 2026 &&
      date.getMonth() === 6 &&
      date.getDate() === 29
    );
  });

  return [...july29Items].sort(
    (a, b) =>
      timeToMinutes(a.time) -
      timeToMinutes(b.time)
  );
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

  return (
    <section id="schedule" className="scroll-mt-32 max-w-7xl mx-auto px-4 sm:px-6 mb-20 lg:mb-32">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white border border-[#E8DCC4] rounded-2xl md:rounded-[2rem] shadow-sm overflow-hidden flex flex-col"
      >
        {/* =========================================
            HEADER
        ========================================= */}
        <div className="bg-[#FAF6F0] px-6 py-5 md:px-10 md:py-6 border-b border-[#E8DCC4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2a0b06] tracking-tight">
              Live Darshan & Daily Rituals
            </h2>
            <p className="text-sm text-gray-500 mt-1">Sacred timings observed in IST</p>
          </div>
          <div className="inline-flex items-center gap-2 self-start sm:self-auto bg-white border border-[#E8DCC4] rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#722013] shadow-sm">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            {formattedDate}
          </div>
        </div>

        {/* =========================================
            CONTENT GRID
        ========================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-5 bg-[#FDFBF7]">
          
          {/* LEFT: Live Video (Spans 3 cols) */}
          <div className="lg:col-span-3 p-5 md:p-8 border-b lg:border-b-0 lg:border-r border-[#E8DCC4]">
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-700">
                  Live Now
                </span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Udupi Sri Krishna Matha
              </span>
            </div>

            <div className="w-full bg-[#110603] rounded-2xl overflow-hidden shadow-lg border border-[#E8DCC4] aspect-video relative">
              <div
                ref={playerRef}
                className="absolute inset-0 w-full h-full"
              />
            </div>

            <div className="mt-5 bg-white border border-[#E8DCC4] rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-[#FAF6F0] flex items-center justify-center border border-[#D4AF37]/50">
                  <PlayCircle className="w-5 h-5 md:w-6 md:h-6 text-[#722013]" />
                </div>
                <div>
                  <p className="text-sm md:text-base font-bold text-[#2a0b06] leading-tight">
                    Shri Jnaneshwari Shloka
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Ongoing Broadcast</p>
                </div>
              </div>
              <button
                onClick={handleJoinLive}
                className="shrink-0 bg-[#2a0b06] hover:bg-[#722013] text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-md"
              >
                <span className="hidden sm:inline">Join</span> Live
              </button>
            </div>
          </div>

          {/* RIGHT: Today's Schedule List (Spans 2 cols) */}
          <div className="lg:col-span-2 flex flex-col h-[500px] lg:h-auto max-h-[600px]">
            <div className="px-6 py-5 border-b border-[#E8DCC4] bg-white flex items-center justify-between shrink-0">
              <h3 className="font-serif text-lg font-bold text-[#2a0b06]">
                Schedule of 29th July
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] bg-[#FAF6F0] px-2.5 py-1 rounded border border-[#E8DCC4]">
                {loading ? "..." : displayedSchedule.length} Events
              </span>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#FDFBF7] p-5 sm:p-6 space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-3 text-[#D4AF37]" />
                  <p className="text-xs font-bold uppercase tracking-widest">Loading Itinerary...</p>
                </div>
              ) : displayedSchedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-white border border-[#E8DCC4] rounded-2xl border-dashed">
                  <CalendarDays className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="font-serif font-bold text-[#2a0b06] text-lg">No rituals scheduled</p>
                  <p className="text-xs text-gray-500 mt-1">There are no events planned for today yet.</p>
                </div>
              ) : (
                displayedSchedule.map((ritual, idx) => {
                  const Icon = getIconForTitle(ritual.title);
                  
                  return (
                    <motion.div
                      key={ritual.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex gap-4 bg-white border border-[#E8DCC4] rounded-2xl p-4 hover:border-[#D4AF37]/60 hover:shadow-md transition-all duration-300 cursor-default"
                    >
                      <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-[#FAF6F0] border border-[#E8DCC4]">
                        <Icon className="w-5 h-5 text-[#D4AF37] mb-1" />
                        <span className="text-[9px] font-bold text-[#722013] uppercase tracking-widest">IST</span>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#722013]">
                            {ritual.time}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#2a0b06] truncate group-hover:text-[#722013] transition-colors">
                          {ritual.title}
                        </h4>
                        {ritual.description && (
                          <p className="text-xs text-gray-500 truncate mt-0.5 font-serif italic">
                            {ritual.description}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
            
            {/* Soft gradient fade at the bottom of the list */}
            <div className="h-6 bg-gradient-to-t from-[#FDFBF7] to-transparent shrink-0 -mt-6 pointer-events-none relative z-10" />
          </div>

        </div>
      </motion.div>
    </section>
  );
}