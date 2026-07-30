import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { heroText } from "../translation/heroText";
import JapaModal from "../components/JapaModal";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
// ---- animation presets ----
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

// ---- carousel data ----
const heroImages = [
  { src: "/h1.jpeg",  caption: "Peace is not the absence of trouble, but the presence of divinity." },
  { src: "/h2.jpeg", caption: "Devotion is the lamp that lights every inner path." },
  { src: "/h3.jpeg", caption: "The vow of silence is the loudest prayer of all." },
  { src: "/h4.jpeg", caption: "Where the mind rests, the divine appears." },
  { src: "/h5.jpeg", caption: "Every chant is a step toward the eternal." },
  { src: "/hero9.jpeg", caption: "Wisdom flows where the heart is humble." },
];

export default function ChaturmasyaHero() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    hasStarted: false,
  });
  const [showJapaModal, setShowJapaModal] = useState(false);
  const [globalTotals, setGlobalTotals] = useState({});

  useEffect(() => {
    // July 29, 2026 at 10:00 AM IST
    const targetDate = new Date("2026-07-29T10:00:00+05:30");

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          hasStarted: true,
        });

        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),

        hours: Math.floor(
          (difference / (1000 * 60 * 60)) % 24
        ),

        minutes: Math.floor(
          (difference / (1000 * 60)) % 60
        ),

        seconds: Math.floor(
          (difference / 1000) % 60
        ),

        hasStarted: false,
      });
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);
  
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
  const unsubscribe = onSnapshot(
    collection(db, "globalTotals"),
    (snapshot) => {
      const totals = {};

      snapshot.forEach((doc) => {
        totals[doc.id] = doc.data().count || 0;
      });

      setGlobalTotals(totals);
    }
  );

  return () => unsubscribe();
}, []);

  return (
    <section
      className="desktop-scale relative w-full bg-[#FCF8F2] pt-20 lg:pt-25 pb-15 md:pb-24 lg:pb-15 overflow-hidden z-10"
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
            <motion.div
              variants={fadeUp}
              className="mb-6 text-center lg:text-left"
            >
              <div className="flex items-start justify-center lg:justify-start gap-2">
                <p className="
                  font-serif
                  font-black
                  text-[#2a0b06]
                  text-3xl
                  leading-none
                ">
                  {t.title}
                  {language === "en" && (
                    <sup
                      className="
                        text-sm
                        text-[#722013]
                        ml-0.5
                      "
                    >
                      st
                    </sup>
                  )}
                </p>
              </div>
              <h1 className="
                mt-2
                font-serif
                font-bold
                text-[#2a0b06]
                tracking-tight
                leading-[0.88]
                text-5xl
                lg:text-[4.2rem]
                xl:text-[4.8rem]
              ">
                {t.chaturmasya}
                <span className="
                  block
                  italic
                  font-light
                  text-[#722013]
                ">
                  {t.vratotsava}
                </span>

                <span className="
                  block
                  mt-2
                  text-4xl
                  lg:text-5xl
                ">
                  — {t.year}
                </span>
              </h1>
            </motion.div>
            <motion.div
  variants={fadeUp}
  className="relative max-w-[420px] w-full mx-auto lg:mx-0 mb-6 group"
>
  <div className="
    relative overflow-hidden rounded-[1.5rem]
    bg-white/80 backdrop-blur-md
    border border-white/60
    shadow-[0_8px_30px_rgb(114,32,19,0.06)]
    p-1.5
  ">
    {/* Inner colored card area */}
    <div className="
      relative rounded-[1.2rem]
      bg-gradient-to-br from-[#FFFBF0] via-white to-[#FFFBF0]
      border border-[#D4AF37]/15
      p-4 sm:p-5
    ">
      
      {/* Header & Live Badge - Modern inline layout */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[15px] sm:text-base font-extrabold text-[#722013] uppercase tracking-wide">
          Sankalpa Tracker
        </h3>
        
        {/* Sleek Live Indicator */}
        <div className="flex items-center gap-1.5 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
          </span>
          <span className="text-[9px] font-bold tracking-widest text-red-600 uppercase">
            Live
          </span>
        </div>
      </div>

      {/* Side-by-Side Counters instead of a list */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        
        {/* Counter 1 */}
        <div className="
          relative flex flex-col items-center justify-center text-center
          p-4 rounded-2xl bg-gradient-to-b from-white to-[#fffaf0]
          border border-[#D4AF37]/20 shadow-sm
        ">
          <p className="text-3xl font-black text-[#722013] tracking-tighter mb-1">
            {globalTotals["devale-ashirvadani"] || 1800}
          </p>
          <div className="h-[1px] w-8 bg-[#D4AF37]/30 mb-2"></div>
          <p className="font-bold text-[#722013] text-[11px] sm:text-xs">
            ದೇವಾಲೆ ಆಶೀರ್ವಾದನಿ
          </p>
          <p className="text-[9px] text-[#722013]/50 font-medium mt-0.5">
            Dēvāle āśīrvādani
          </p>
        </div>

        {/* Counter 2 */}
        <div className="
          relative flex flex-col items-center justify-center text-center
          p-4 rounded-2xl bg-gradient-to-b from-white to-[#fffaf0]
          border border-[#D4AF37]/20 shadow-sm
        ">
          <p className="text-3xl font-black text-[#722013] tracking-tighter mb-1">
           {globalTotals["gayatri-japa"] || 0}
          </p>
          <div className="h-[1px] w-8 bg-[#D4AF37]/30 mb-2"></div>
          <p className="font-bold text-[#722013] text-[11px] sm:text-xs">
            ಗಾಯತ್ರಿ ಜಪ
          </p>
          <p className="text-[9px] text-[#722013]/50 font-medium mt-0.5">
            Gayatri Japa
          </p>
        </div>

      </div>

      {/* Pill-shaped CTA */}
      <button
        onClick={() => setShowJapaModal(true)}
        className="
          w-full flex items-center justify-center gap-2 
          rounded-full bg-[#722013] hover:bg-[#5d1a0f]
          text-white py-3 px-4 font-bold text-sm
          shadow-md shadow-[#722013]/20 
          transition-all duration-300 active:scale-[0.98]
        "
      >
        <svg className="w-4 h-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Offer Your Japa</span>
      </button>

    </div>
  </div>
</motion.div>
            {/* Invocation */}
            {/* Meta */}
            <motion.div
              variants={fadeUp}
              className="
                mt-6
                pt-4
                border-t
                border-[#E8DCC4]
                grid
                grid-cols-3
                gap-4
                max-w-md
                mx-auto
                lg:mx-0
                text-center
                lg:text-left
              "
            >

              {[
                  [t.duration, t.durationValue],
                  [t.venue, t.venueValue],
                  [t.yearLabel, t.yearValue]
                ].map(([label, value]) => (

                <div key={label}>

                  <p className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-gray-400
                  ">
                    {label}
                  </p>


                  <p className="
                    mt-1
                    font-serif
                    font-bold
                    text-xs
                    text-[#2a0b06]
                  ">
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
            initial={{
              opacity: 0,
              scale: 0.97
            }}

            animate={{
              opacity: 1,
              scale: 1
            }}

            transition={{
              duration: 1
            }}

            className="
              order-1
              lg:order-2

              flex
              flex-col
              items-center

              min-w-0
            "
          >


            {/* SHLOKA */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10
              }}

              animate={{
                opacity: 1,
                y: 0
              }}

              transition={{
                duration: 0.8,
                delay: 0.35
              }}

              className="
                mb-4
                px-4
                text-center
              "
            >

              <div className="
                flex
                items-center
                justify-center
                gap-3
                mb-2
              ">

                <span className="
                  w-10
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  to-[#D4AF37]
                " />


                <span className="
                  text-[#D4AF37]
                  text-xs
                ">
                  ॐ
                </span>


                <span className="
                  w-10
                  h-px
                  bg-gradient-to-l
                  from-transparent
                  to-[#D4AF37]
                " />

              </div>


              <p className="
                text-xs
                font-serif
                font-bold
                text-[#722013]
                mb-1
              ">
                श्री ज्ञानेश्वरी श्लोकम्
              </p>


              <p className="
                font-serif
                text-[#722013]

                text-sm
                lg:text-base

                leading-[1.6]

                font-medium
              ">
                ॐ ज्ञानिनां मुक्तिदात्रिया ज्ञानदा साधकस्य सा ।
                <br />

                ज्ञानेश्वरी च नः पातु योगिध्येया सरस्वती ॥
              </p>

            </motion.div>



            {/* IMAGE CAROUSEL */}
            <div className="
              relative
              w-full
              max-w-[650px]
            ">
              {/* Corner decorations */}
              <div className="
                hidden md:block

                absolute
                -top-3
                -left-3

                z-20

                w-7
                h-7

                border-l-2
                border-t-2

                border-[#D4AF37]
              " />


              <div className="
                hidden md:block

                absolute
                -top-3
                -right-3

                z-20

                w-7
                h-7

                border-r-2
                border-t-2

                border-[#D4AF37]
              " />



              {/* IMAGE FRAME */}

              <div className="
                group
                relative

                w-full

                h-[400px]
                sm:h-[470px]

                lg:h-[min(62vh,560px)]

                xl:h-[min(65vh,600px)]

                rounded-[2rem]

                overflow-hidden

                shadow-2xl
                shadow-[#722013]/20

                ring-1
                ring-[#E8DCC4]
              ">


                <AnimatePresence mode="wait">

                  <motion.img
                    key={current}

                    initial={{
                      opacity: 0,
                      scale: 1.06
                    }}

                    animate={{
                      opacity: 1,
                      scale: 1
                    }}

                    exit={{
                      opacity: 0,
                      scale: 1.02
                    }}

                    transition={{
                      duration: 1.1
                    }}
                    src={heroImages[current].src}
                    alt={`Chaturmasya Vratothsava ${current + 1}`}
                    className="
                      absolute
                      inset-0
                      w-full
                      h-full
                      object-cover
                    "
                  />

                </AnimatePresence>
                {/* Gradient */}
                <div className="
                  absolute
                  inset-0

                  bg-gradient-to-t

                  from-[#2a0b06]/75
                  via-transparent
                  to-transparent
                " />

                {/* Play */}

                <button
                  onClick={() =>
                    setIsPlaying((p) => !p)
                  }

                  className="
                    absolute
                    top-4
                    left-4

                    z-10

                    h-9
                    w-9

                    grid
                    place-items-center

                    rounded-full

                    bg-black/30

                    backdrop-blur-md

                    border
                    border-white/15

                    text-white
                  "
                >

                  {isPlaying

                    ? <Pause className="w-4 h-4" />

                    : <Play className="w-4 h-4" />

                  }

                </button>



                {/* Index */}

                <div className="
                  absolute
                  top-4
                  right-4

                  z-10

                  flex
                  items-center
                  gap-2

                  bg-black/30

                  backdrop-blur-md

                  border
                  border-white/15

                  rounded-full

                  px-3
                  py-1.5
                ">

                  <span className="
                    font-serif
                    text-white
                    text-xs
                    font-bold
                  ">
                    {String(current + 1).padStart(2, "0")}
                  </span>


                  <span className="
                    w-4
                    h-px
                    bg-[#D4AF37]
                  " />


                  <span className="
                    font-serif
                    text-[#D4AF37]
                    text-xs
                  ">
                    {String(total).padStart(2, "0")}
                  </span>

                </div>



                {/* Navigation */}

                <button
                  onClick={prev}

                  className="
                    absolute
                    left-3
                    top-1/2

                    -translate-y-1/2

                    z-10

                    h-10
                    w-10

                    grid
                    place-items-center

                    rounded-full

                    bg-black/25

                    backdrop-blur-md

                    border
                    border-white/20

                    text-white

                    opacity-0
                    group-hover:opacity-100

                    transition
                  "
                >

                  <ChevronLeft className="w-5 h-5" />

                </button>



                <button
                  onClick={next}

                  className="
                    absolute
                    right-3
                    top-1/2

                    -translate-y-1/2

                    z-10

                    h-10
                    w-10

                    grid
                    place-items-center

                    rounded-full

                    bg-black/25

                    backdrop-blur-md

                    border
                    border-white/20

                    text-white

                    opacity-0
                    group-hover:opacity-100

                    transition
                  "
                >

                  <ChevronRight className="w-5 h-5" />

                </button>



                {/* CAPTION */}

                <div className="
                  absolute
                  bottom-4

                  left-1/2
                  -translate-x-1/2

                  z-10

                  w-max
                  max-w-[88%]
                ">

                  <div className="
                    bg-black/40

                    backdrop-blur-xl

                    border
                    border-white/15

                    rounded-xl

                    px-4
                    py-2
                  ">

                    <AnimatePresence mode="wait">

                      <motion.p
                        key={current}

                        initial={{
                          opacity: 0,
                          y: 5
                        }}

                        animate={{
                          opacity: 1,
                          y: 0
                        }}

                        exit={{
                          opacity: 0,
                          y: -5
                        }}

                        className="
                          font-serif
                          italic

                          text-white

                          text-xs
                          lg:text-sm

                          text-center

                          leading-snug
                        "
                      >

                        {heroImages[current].caption}

                      </motion.p>

                    </AnimatePresence>

                  </div>

                </div>

              </div>



              {/* DOTS */}

              <div className="
                flex
                items-center
                justify-center

                gap-2

                mt-3
              ">

                {heroImages.map((_, i) => (

                  <button
                    key={i}

                    onClick={() =>
                      setCurrent(i)
                    }

                    className={`
                      rounded-full

                      transition-all
                      duration-300

                      ${
                        i === current

                          ? "w-7 h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#722013]"

                          : "w-1.5 h-1.5 bg-[#E8DCC4] hover:bg-[#D4AF37]"
                      }
                    `}
                  />

                ))}

              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <JapaModal
    open={showJapaModal}
    onClose={() => setShowJapaModal(false)}
/>
    </section>
  );
}
