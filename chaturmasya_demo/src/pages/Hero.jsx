import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { heroText } from "../translation/heroText";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

// ---- animation presets ----
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

// ---- carousel data ----
const heroImages = [
  { src: "/h1.jpeg", caption: "Peace is not the absence of trouble, but the presence of divinity." },
  { src: "/h2.jpeg", caption: "Devotion is the lamp that lights every inner path." },
  { src: "/h3.jpeg", caption: "The vow of silence is the loudest prayer of all." },
  { src: "/h4.jpeg", caption: "Where the mind rests, the divine appears." },
  { src: "/h5.jpeg", caption: "Every chant is a step toward the eternal." },
  { src: "/hero9.jpeg", caption: "Wisdom flows where the heart is humble." },
];

const fmt = (n) => new Intl.NumberFormat("en-IN").format(Number(n) || 0);

// ---- animated count ----
function AnimatedCount({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
  const from = display;
  const to = Number(value) || 0;

  if (from === to) return;

  const start = performance.now();
  const duration = 700;

  let raf;

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    setDisplay(Math.round(from + (to - from) * eased));

    if (progress < 1) {
      raf = requestAnimationFrame(tick);
    }
  };

  raf = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(raf);

  // ❌ remove display from dependencies
}, [value]);

  return <>{fmt(display)}</>;
}

export default function ChaturmasyaHero() {
  console.log("Hero render");
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    hasStarted: false,
  });
  const [globalTotals, setGlobalTotals] = useState({});
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const { language } = useLanguage();
  const t = heroText[language];
  const total = heroImages.length;
  const next = useCallback(() => setCurrent((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [isPlaying, next]);

  // keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "globalTotals"), (snapshot) => {
      console.log("Snapshot received");
      const totals = {};
      snapshot.forEach((doc) => {
        totals[doc.id] = doc.data().count || 0;
      });
      setGlobalTotals(totals);
    });
    return () => unsubscribe();
  }, []);

  return (
    <section
      className="desktop-scale relative w-full bg-[#FCF8F2] pt-20 lg:pt-15 pb-15 md:pb-24 lg:pb-15 overflow-hidden z-10"
      id="home"
    >
      {/* Ambient washes */}
      <div className="absolute top-10 -left-40 w-[560px] h-[560px] rounded-full bg-[#D4AF37]/15 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 -right-32 w-[460px] h-[460px] rounded-full bg-[#722013]/15 blur-[110px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-[#E86A33]/8 blur-[100px] pointer-events-none -z-10" />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full">
        <div className="
          grid lg:grid-cols-[0.85fr_1.15fr]
          gap-8 xl:gap-14
          items-center
          min-h-[calc(100vh-110px)]
        ">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            {/* TITLE */}
            <motion.div variants={fadeUp} className="mb-6 text-center lg:text-left">
              <div className="flex items-start justify-center lg:justify-start gap-2">
                <p className="font-serif font-black text-[#2a0b06] text-3xl leading-none">
                  {t.title}
                  {language === "en" && <sup className="text-sm text-[#722013] ml-0.5">st</sup>}
                </p>
              </div>
              <h1 className="mt-2 font-serif font-bold text-[#2a0b06] tracking-tight leading-[0.88] text-2xl lg:text-[4.2rem] xl:text-[4.8rem]">
                {t.chaturmasya}
                <span className="block italic font-light text-[#722013]">
                  {t.vratotsava}
                </span>
                <span className="block mt-2 text-4xl lg:text-5xl">
                  — {t.year}
                </span>
              </h1>
            </motion.div>

            {/* CREATIVE REDESIGNED CARD */}
            <motion.div
              variants={fadeUp}
              className="relative w-full max-w-[440px] mx-auto lg:mx-0 mb-8 mt-4"
            >
              {/* Floating ambient glow behind the card */}
              <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-[#D4AF37]/25 to-[#722013]/15 blur-xl opacity-80" />

              <div className="relative flex flex-col overflow-hidden rounded-[1.75rem] border border-[#E8DCC4]/70 bg-white/85 p-1.5 shadow-2xl shadow-[#722013]/5 backdrop-blur-xl">
                <div className="rounded-[1.5rem] border border-[#E8DCC4]/40 bg-gradient-to-b from-[#FCF8F2]/50 to-white p-6 sm:p-7">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-7">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span className="font-serif text-[11px] font-bold uppercase tracking-[0.2em] text-[#722013]">
                        Sacred Sankalpa
                      </span>
                    </div>
                    {/* Pulsing Live Indicator */}
                    <div className="flex items-center gap-2 rounded-full bg-[#D4AF37]/10 px-3 py-1.5 border border-[#D4AF37]/20">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D4AF37] opacity-75"></span>
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#D4AF37]"></span>
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#2a0b06]">Live</span>
                    </div>
                  </div>

                  {/* Counters Section */}
                  <div className="grid grid-cols-2 gap-4 divide-x divide-[#E8DCC4]/60 mb-8">
                    {/* First Count */}
                    <div className="flex flex-col pr-4">
                      <span className="text-3xl sm:text-[2.5rem] font-serif font-black text-[#2a0b06] tracking-tight mb-2 tabular-nums">
                        <AnimatedCount value={globalTotals["devale-ashirvadani"] || 1800} />
                      </span>
                      <span className="font-bold text-[#722013] text-[10px] sm:text-xs">
                        ದೇವಾಲೆ ಆಶೀರ್ವಾದನಿ
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">
                        Dēvāle āśīrvādani
                      </span>
                    </div>

                    {/* Second Count */}
                    <div className="flex flex-col pl-4">
                      <span className="text-3xl sm:text-[2.5rem] font-serif font-black text-[#2a0b06] tracking-tight mb-2 tabular-nums">
                        <AnimatedCount value={globalTotals["gayatri-japa"] || 0} />
                      </span>
                      <span className="font-bold text-[#722013] text-[10px] sm:text-xs">
                        ಗಾಯತ್ರಿ ಜಪ
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">
                        Gayatri Japa
                      </span>
                    </div>
                  </div>

                  {/* Elegant Navigation Button */}
                  <button
                    onClick={() => navigate("/counter")}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[1.25rem] bg-[#2a0b06] px-6 py-4 transition-all duration-300 hover:bg-[#1a0704] hover:shadow-lg hover:shadow-[#2a0b06]/20 active:scale-[0.98]"
                  >
                    <span className="relative z-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[#FCF8F2]">
                      Offer Your Japa
                    </span>
                    <ArrowRight className="relative z-10 h-4 w-4 text-[#D4AF37] transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Meta */}
            <motion.div
              variants={fadeUp}
              className="mt-1 pt-2 border-t border-[#E8DCC4] grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-center lg:text-left"
            >
              {[
                [t.duration, t.durationValue],
                [t.venue, t.venueValue],
                [t.yearLabel, t.yearValue],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    {label}
                  </p>
                  <p className="mt-1 font-serif font-bold text-xs text-[#2a0b06]">
                    {value}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* =====================================================
              RIGHT SIDE
          ===================================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="order-1 lg:order-2 flex flex-col items-center min-w-0"
          >
            {/* SHLOKA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mb-4 px-4 text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="w-10 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
                <span className="text-[#D4AF37] text-xs">ॐ</span>
                <span className="w-10 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
              </div>
              <p className="text-xs font-serif font-bold text-[#722013] mb-1">
                श्री ज्ञानेश्वरी श्लोकम्
              </p>
              <p className="font-serif text-[#722013] text-sm lg:text-base leading-[1.6] font-medium">
                ॐ ज्ञानिनां मुक्तिदात्रिया ज्ञानदा साधकस्य सा ।
                <br />
                ज्ञानेश्वरी च नः पातु योगिध्येया सरस्वती ॥
              </p>
            </motion.div>

            {/* IMAGE CAROUSEL */}
            <div className="relative w-full max-w-[650px]">
              {/* Corner decorations */}
              <div className="hidden md:block absolute -top-3 -left-3 z-20 w-7 h-7 border-l-2 border-t-2 border-[#D4AF37]" />
              <div className="hidden md:block absolute -top-3 -right-3 z-20 w-7 h-7 border-r-2 border-t-2 border-[#D4AF37]" />
              
              {/* IMAGE FRAME */}
              <div className="group relative w-full h-[400px] sm:h-[470px] lg:h-[min(62vh,560px)] xl:h-[min(65vh,600px)] rounded-[2rem] overflow-hidden shadow-2xl shadow-[#722013]/20 ring-1 ring-[#E8DCC4]">
                <AnimatePresence mode="wait">
                  <img
                    src={heroImages[current].src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2a0b06]/75 via-transparent to-transparent" />
                
                {/* Play */}
                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  className="absolute top-4 left-4 z-10 h-9 w-9 grid place-items-center rounded-full bg-black/30 backdrop-blur-md border border-white/15 text-white"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                
                {/* Index */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/15 rounded-full px-3 py-1.5">
                  <span className="font-serif text-white text-xs font-bold">
                    {String(current + 1).padStart(2, "0")}
                  </span>
                  <span className="w-4 h-px bg-[#D4AF37]" />
                  <span className="font-serif text-[#D4AF37] text-xs">
                    {String(total).padStart(2, "0")}
                  </span>
                </div>
                
                {/* Navigation */}
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 grid place-items-center rounded-full bg-black/25 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 grid place-items-center rounded-full bg-black/25 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* CAPTION */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-max max-w-[88%]">
                  <div className="bg-black/40 backdrop-blur-xl border border-white/15 rounded-xl px-4 py-2">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={current}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="font-serif italic text-white text-xs lg:text-sm text-center leading-snug"
                      >
                        {heroImages[current].caption}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              
              {/* DOTS */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {heroImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === current
                        ? "w-7 h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#722013]"
                        : "w-1.5 h-1.5 bg-[#E8DCC4] hover:bg-[#D4AF37]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}