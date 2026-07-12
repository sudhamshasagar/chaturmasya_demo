import { motion } from "framer-motion";
import { Radio, Users, Sparkles, Maximize2, Volume2 } from "lucide-react";

export default function LiveDarshanSection() {
  return (
    <section id="live-darshan" className="scroll-mt-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative bg-[#1A0B08] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border border-[#3A1B14]"
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#722013]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        {/* Slim top bar — replaces the big text column */}
        <div className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/5 bg-black/20 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shrink-0">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                <span className="relative rounded-full w-1.5 h-1.5 bg-red-500" />
              </span>
              Live
            </span>
            <div className="min-w-0 hidden sm:block">
              <p className="text-[#FAF6F0] text-sm font-semibold truncate font-serif">
                Daily Pravachana Darshana
              </p>
              <p className="text-[10px] text-[#D8C3BD]/60 truncate">
                Pujya Sri Swamiji · Vedanta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] shrink-0">
            <div className="flex items-center gap-1.5 text-[#D8C3BD]/80">
              <Users size={12} className="text-[#D4AF37]" />
              <span className="font-semibold text-[#FAF6F0]">1,204</span>
              <span className="hidden sm:inline text-[#D8C3BD]/50">watching</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-[#D8C3BD]/80">
              <Sparkles size={12} className="text-[#D4AF37]" />
              <span>Vedanta</span>
            </div>
          </div>
        </div>

        {/* HERO VIDEO — maximum space */}
        <div className="relative z-10 p-2 sm:p-4">
          <div className="relative group">
            {/* Golden aura */}
            <div className="absolute -inset-[2px] bg-gradient-to-r from-[#D4AF37] via-[#722013] to-[#D4AF37] rounded-[1.25rem] sm:rounded-3xl opacity-40 group-hover:opacity-70 blur-md transition duration-700" />

            <div className="relative aspect-video w-full rounded-[1.25rem] sm:rounded-3xl overflow-hidden bg-black border border-white/10 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)]">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/DeI-ZPx3u8M?si=76F2OWrPTalYT5Wz&start=25"
                title="Live Pravachana Darshana"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />

              {/* Floating title chip — mobile only, since top bar hides title on small screens */}
              <div className="sm:hidden pointer-events-none absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                <div className="bg-black/60 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10">
                  <p className="text-[#FAF6F0] text-xs font-serif font-semibold leading-tight">
                    Daily Pravachana
                  </p>
                  <p className="text-[9px] text-[#D8C3BD]/70">Sri Swamiji · Vedanta</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slim footer — subtle description + actions */}
        <div className="relative z-10 flex items-center justify-between gap-4 px-4 sm:px-6 pb-4 sm:pb-5 pt-1">
          <p className="text-[11px] sm:text-xs text-[#D8C3BD]/60 leading-snug max-w-xl">
            Streaming live from the mutt premises — join Pujya Sri Swamiji's discourse from anywhere.
          </p>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#D8C3BD] transition" aria-label="Volume">
              <Volume2 size={14} />
            </button>
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#D8C3BD] transition" aria-label="Fullscreen">
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
