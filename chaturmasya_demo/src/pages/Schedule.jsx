import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CalendarDays,
  Flame,
  Flower2,
  Music,
  BookOpen,
  Sun,
  Moon,
  Loader2,
  Calendar,
  Volume2,
  MapPin,
  Radio
} from "lucide-react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase/firebase";

/* ---------- Helpers ---------- */
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
  return Flame;
};

/* ---------- Component ---------- */
export default function ScheduleSection() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const playerRef = useRef(null);
  const youtubePlayerRef = useRef(null);

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

  /* YouTube Player Initialization */
  useEffect(() => {
    const initializePlayer = () => {
      if (!window.YT || !window.YT.Player || !playerRef.current || youtubePlayerRef.current) return;
      youtubePlayerRef.current = new window.YT.Player(playerRef.current, {
        videoId: "FSLngWAw1Lo",
        playerVars: { autoplay: 1, mute: 1, playsinline: 1, rel: 0, controls: 1, showinfo: 0, modestbranding: 1 },
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

  /* Filter Today's Schedule */
  const displayedSchedule = useMemo(() => {
    const todayStr = currentDate.toDateString();
    const todayItems = schedules.filter(
      (i) => i.date && new Date(i.date).toDateString() === todayStr
    );
    if (todayItems.length > 0) {
      return [...todayItems].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    }
    // Fallback Date
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

  return (
    // RESPONSIVE WRAPPER: Mobile scrolls naturally. Desktop locks to viewport height (100dvh) with no page scroll.
    <div className="min-h-screen lg:h-[100dvh] flex flex-col bg-[#FDFBF7] text-[#2a0b06] font-sans lg:overflow-hidden selection:bg-[#D4AF37] selection:text-white">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- HEADER --- */}
      <header className="shrink-0 bg-white border-b border-[#E8E2D2] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 shadow-sm">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#2a0b06]">
            Daily Rituals & Broadcast
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mt-1 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5" /> Live from the Sanctum
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#FCFAF8] border border-[#E8E2D2] rounded-full px-4 py-2 w-fit shadow-inner">
          <Calendar className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#5a4a3a]">{formattedDate}</span>
        </div>
      </header>

      {/* --- MAIN CONTENT (Side-by-Side on Desktop, Stacked on Mobile) --- */}
      <main className="flex-1 w-full max-w-[90rem] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6 lg:min-h-0">
        
        {/* LEFT: VIDEO BROADCAST (Takes up more visual weight) */}
        <div className="w-full lg:w-3/5 flex flex-col gap-4 lg:min-h-0 shrink-0 lg:shrink">
          
          {/* Main Video Player Container */}
          {/* aspect-video ensures it doesn't squish. On desktop, flex-1 keeps it large if space permits */}
          <div className="w-full bg-[#110603] rounded-2xl shadow-xl overflow-hidden relative border border-[#2a0b06] aspect-video flex-shrink-0">
            {/* Red Live Indicator Overlay */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">Live</span>
            </div>
            
            {/* The actual YouTube iframe */}
            <div ref={playerRef} className="absolute inset-0 w-full h-full" />
          </div>

          {/* Video Metadata & Controls */}
          <div className="bg-white border border-[#E8E2D2] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-1">
                Currently Broadcasting
              </p>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2a0b06] leading-snug break-words">
                Continuous Sanctum Feed
              </h2>
              <p className="text-xs font-medium text-[#8b6f47] mt-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Main Temple, Sagara
              </p>
            </div>
            
            <button
              onClick={handleJoinLive}
              className="shrink-0 flex items-center justify-center gap-2 bg-gradient-to-b from-[#2a0b06] to-[#4a1810] hover:from-[#4a1810] hover:to-[#5a190f] text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 w-full sm:w-auto"
            >
              <Volume2 className="w-4 h-4" /> Unmute Stream
            </button>
          </div>
        </div>

        {/* RIGHT: TIMELINE ITINERARY (Elegant continuous scroll) */}
        <div className="w-full lg:w-2/5 flex flex-col bg-white border border-[#E8E2D2] rounded-2xl shadow-sm lg:min-h-0 overflow-hidden">
          
          <div className="shrink-0 px-6 py-5 border-b border-[#E8E2D2] bg-gradient-to-r from-[#FCFAF8] to-white">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2a0b06] leading-tight break-words">
              Today's Sacred Itinerary
            </h2>
            <p className="text-xs font-semibold text-[#8b6f47] mt-1">
              {loading ? "Synchronizing schedule..." : `${displayedSchedule.length} events planned for the day`}
            </p>
          </div>

          {/* Timeline Scroll Area */}
          <div className="flex-1 overflow-y-auto hide-scrollbar p-6 bg-[#FDFBF7]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-[#8b6f47]">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#D4AF37]" />
                <p className="text-xs font-bold uppercase tracking-widest">Loading Itinerary...</p>
              </div>
            ) : displayedSchedule.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <CalendarDays className="w-12 h-12 text-[#E8E2D2] mb-4" />
                <p className="font-serif font-bold text-xl text-[#2a0b06]">No Rituals Scheduled</p>
                <p className="text-sm text-[#8b6f47] mt-2">There are no events planned for today's date.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-[#E8E2D2] ml-4 sm:ml-6 space-y-8 pb-4">
                {displayedSchedule.map((ritual, idx) => {
                  const Icon = getIconForTitle(ritual.title);
                  return (
                    <motion.div
                      key={ritual.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative pl-8 sm:pl-10"
                    >
                      {/* Timeline Dot with Icon */}
                      <div className="absolute -left-[17px] top-0.5 w-8 h-8 rounded-full bg-white border-2 border-[#D4AF37] flex items-center justify-center shadow-sm">
                        <Icon className="w-4 h-4 text-[#722013]" />
                      </div>

                      {/* Event Content - No truncation, allows wrapping */}
                      <div className="bg-white border border-[#E8E2D2] p-4 sm:p-5 rounded-xl shadow-sm hover:border-[#D4AF37]/50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span className="text-xs font-bold uppercase tracking-widest text-[#8b6f47]">
                            {ritual.time} IST
                          </span>
                        </div>
                        
                        {/* Title allows full visibility and breaks words naturally */}
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2a0b06] leading-snug break-words">
                          {ritual.title}
                        </h3>
                        
                        {ritual.description ? (
                          <p className="text-sm text-[#5a4a3a] mt-2 leading-relaxed break-words">
                            {ritual.description}
                          </p>
                        ) : (
                          <p className="text-xs text-[#b8a691] mt-2 italic">
                            No additional details provided.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}