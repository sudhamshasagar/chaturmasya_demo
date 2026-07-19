import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

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
  { src: "/hero.jpeg",  caption: "Peace is not the absence of trouble, but the presence of divinity." },
  { src: "/hero2.jpeg", caption: "Devotion is the lamp that lights every inner path." },
  // { src: "/hero3.jpeg", caption: "The vow of silence is the loudest prayer of all." },
  { src: "/hero4.jpeg", caption: "Where the mind rests, the divine appears." },
  { src: "/hero5.jpeg", caption: "Every chant is a step toward the eternal." },
  { src: "/hero6.jpeg", caption: "Surrender is the shortest road to grace." },
  // { src: "/hero7.jpeg", caption: "The sacred blooms wherever awareness dwells." },
  { src: "/hero8.jpeg", caption: "In service, the seeker meets the sought." },
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

  return (
    <section className="desktop-scale relative w-full pt-20 lg:pt-40 pb-15 md:pb-24 lg:pb-15 overflow-hidden z-10">
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
            className="order-2 lg:order-1"
          >
            {/* TITLE */}
            <motion.div
              variants={fadeUp}
              className="mb-6"
            >
              <div className="flex items-start gap-2">
                <p className="
                  font-serif
                  font-black
                  text-[#2a0b06]
                  text-3xl
                  leading-none
                ">
                  41
                  <sup className="
                    text-sm
                    text-[#722013]
                    ml-0.5
                  ">
                    st
                  </sup>
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
                Chaturmasya
                <span className="
                  block
                  italic
                  font-light
                  text-[#722013]
                ">
                  Vratothsava
                </span>

                <span className="
                  block
                  mt-2
                  text-4xl
                  lg:text-5xl
                ">
                  — 2026
                </span>
              </h1>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="
                relative
                max-w-[500px]
                mb-6
              "
            >

              <div className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-[#D4AF37]/30
                bg-gradient-to-br
                from-white/90
                via-[#fffaf0]/85
                to-[#f5e6cf]/70
                shadow-[0_15px_45px_rgba(114,32,19,0.08)]
                px-5
                py-4
              ">
                {/* Glow */}
                <div className="
                  absolute
                  -top-20
                  -right-20
                  w-44
                  h-44
                  rounded-full
                  bg-[#D4AF37]/10
                  blur-3xl
                " />
                {!timeLeft.hasStarted ? (
                  <>
                    {/* Countdown header */}
                    <div className="
                      relative
                      flex
                      items-center
                      justify-between
                      gap-4
                      mb-4
                    ">
                      <div>
                        <div className="
                          flex
                          items-center
                          gap-2
                        ">
                          <span className="relative flex h-2 w-2">
                            <span className="
                              absolute
                              inline-flex
                              h-full
                              w-full
                              rounded-full
                              bg-[#E86A33]
                              opacity-60
                              animate-ping
                            " />
                            <span className="
                              relative
                              inline-flex
                              h-2
                              w-2
                              rounded-full
                              bg-[#E86A33]
                            " />

                          </span>
                          <p className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.22em]
                            text-[#722013]
                          ">
                            Sacred Beginning In
                          </p>
                        </div>
                        <p className="
                          mt-1
                          font-serif
                          italic
                          text-[11px]
                          text-gray-500
                        ">
                          Chaturmasya Vratothsava
                        </p>
                      </div>
                      {/* Date */}
                      <div className="
                        shrink-0
                        border
                        border-[#D4AF37]/30
                        bg-white/60
                        rounded-full
                        px-3
                        py-1.5
                      ">
                        <p className="
                          font-serif
                          font-bold
                          text-[10px]
                          text-[#722013]
                        ">
                          29 JUL · 10 AM
                        </p>
                      </div>
                    </div>
                    {/* Countdown values */}
                    <div className="
                      relative
                      grid
                      grid-cols-4
                      divide-x
                      divide-[#D4AF37]/20
                    ">

                      {[
                        {
                          value: timeLeft.days,
                          label: "Days"
                        },

                        {
                          value: timeLeft.hours,
                          label: "Hours"
                        },

                        {
                          value: timeLeft.minutes,
                          label: "Minutes"
                        },

                        {
                          value: timeLeft.seconds,
                          label: "Seconds"
                        }

                      ].map((item) => (

                        <div
                          key={item.label}
                          className="text-center px-2"
                        >

                          <motion.p
                            key={item.value}

                            initial={{
                              opacity: 0.5,
                              y: -3
                            }}

                            animate={{
                              opacity: 1,
                              y: 0
                            }}

                            className="
                              font-serif
                              font-bold

                              text-2xl
                              sm:text-3xl

                              text-[#2a0b06]

                              tabular-nums

                              leading-none
                            "
                          >

                            {String(item.value).padStart(2, "0")}
                          </motion.p>
                          <p className="
                            mt-2

                            text-[7px]
                            sm:text-[8px]

                            uppercase

                            tracking-[0.16em]

                            font-bold

                            text-[#722013]/45
                          ">
                            {item.label}
                          </p>

                        </div>
                      ))}
                    </div>
                    {/* Bottom quote */}

                    <div className="
                      relative
                      flex
                      items-center
                      gap-3
                      mt-4
                    ">

                      <span className="
                        flex-1
                        h-px

                        bg-gradient-to-r
                        from-transparent
                        to-[#D4AF37]/40
                      " />


                      <p className="
                        font-serif
                        italic

                        text-[9px]

                        text-[#722013]/55

                        whitespace-nowrap
                      ">
                        Awaiting the sacred vow
                      </p>
                      <span className="
                        flex-1
                        h-px

                        bg-gradient-to-l
                        from-transparent
                        to-[#D4AF37]/40
                      " />
                    </div>
                  </>
                ) : (
                  <div className="
                    flex
                    items-center
                    gap-3
                    py-3
                  ">

                    <Sparkles className="
                      w-5
                      h-5
                      text-[#D4AF37]
                    " />
                    <div>
                      <p className="
                        text-[8px]
                        uppercase
                        tracking-[0.22em]
                        font-bold
                        text-[#722013]/50
                      ">
                        Sacred Observance
                      </p>
                      <p className="
                        font-serif
                        font-bold
                        text-[#722013]
                      ">
                        Chaturmasya Vratothsava Has Commenced
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            {/* Invocation */}
            <motion.div
              variants={fadeUp}
              className="
                mb-4
                pl-4
                border-l-2
                border-[#D4AF37]
              "
            >

              <p className="
                font-serif
                italic
                text-[#722013]
                text-sm
              ">
                Jai Jnaneshwari
              </p>

              <p className="
                mt-1
                text-[8px]
                uppercase
                tracking-[0.22em]
                font-bold
                text-gray-400
              ">
                The Sacred Months
              </p>
            </motion.div>
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
              "
            >

              {[
                ["Duration", "60 Days"],
                ["Venue", "Sagara"],
                ["Year", "2026"]

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
    </section>
  );
}
