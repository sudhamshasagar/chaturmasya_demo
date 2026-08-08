import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, ArrowUpRight } from "lucide-react";
import { Link as ScrollLink } from "react-scroll";
import { useLanguage } from "../context/LanguageContext";

const headerText = {
  en: {
    home: "Home",
    schedule: "Schedule",
    blogs: "Blogs",
    feedback: "Feedback",
    contact: "Contact",
    bookSeva: "Book Seva",
    bookSevaNow: "Book Pada Pooje",
    committee: "Committee", 
    samaja: "Daivajna Brahmana Samaja",
    vratotsava: "Chaturmasya Vratotsava",
  },

  kn: {
    home: "ಮುಖಪುಟ",
    schedule: "ಕಾರ್ಯಕ್ರಮಗಳು",
    events: "ಸಾಂಸ್ಕೃತಿಕ ವಿಭಾಗ",
    blogs: "ಲೇಖನಗಳು",
    contact: "ಸಂಪರ್ಕಿಸಿ",
    bookSeva: "ಸೇವೆ ಬುಕ್ಕಿಂಗ್",
    bookSevaNow: "ಸೇವೆ ಬುಕ್ಕಿಂಗ್",
    samaja: "ದೈವಜ್ಞ ಬ್ರಾಹ್ಮಣ ಸಮಾಜ",
    vratotsava: "ಚಾತುರ್ಮಾಸ್ಯ ವ್ರತೋತ್ಸವ",
  },
};



export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [active, setActive] = useState("top");

  const { language } = useLanguage();

  const t = headerText[language];

  const navItems = [
  { name: t.home, href: "top", type: "scroll" },
  { name: t.schedule, href: "schedule", type: "scroll" },
  { name: t.blogs, href: "blogs", type: "scroll" },
  { name: t.feedback, href: "feedback", type: "scroll" },
  { name: t.contact, href: "contact", type: "scroll" },
  { name: t.committee, href: "/committee", type: "route" },
];
  
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

 const NavItem = ({ item, onClick }) => {
  const isActive = active === item.href;

  const base =
    "relative px-4 py-2 text-[12px] font-semibold tracking-[0.16em] uppercase cursor-pointer transition-colors duration-300";

  const color = isActive
    ? "text-[#FCF8F2]"
    : "text-[#2a0b06] hover:text-[#722013]";

  const content = (
    <>
      {isActive && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 -z-0 rounded-full bg-gradient-to-r from-[#722013] to-[#4a150c] shadow-[0_6px_18px_-8px_rgba(114,32,19,0.7)]"
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 32,
          }}
        />
      )}

      <span className="relative z-10">{item.name}</span>
    </>
  );

  if (item.type === "scroll") {
    return (
      <ScrollLink
        to={item.href}
        smooth={true}
        duration={350}
        offset={-70}
        spy={true}
        hashSpy={true}
        onSetActive={(id) => setActive(id)}
        className={`${base} ${color}`}
      >
        {content}
      </ScrollLink>
    );
  }

  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={`${base} ${color}`}
    >
      {content}
    </Link>
  );
};
  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        isScrolled
          ? "bg-[#FCF8F2]/90 backdrop-blur-xl shadow-[0_8px_30px_-15px_rgba(42,11,6,0.3)]"
          : "bg-[#FCF8F2]"
      }`}
    >
      {/* Gold hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-70" />

      <div
        className={`mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 transition-all duration-500 ${
          isScrolled ? "h-14" : "h-[72px]"
        }`}
      >
        {/* LEFT — Logo mark + wordmark */}
        <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex min-w-0 items-center gap-3">
          <div className="min-w-0 leading-tight">
            <h1 className="truncate font-serif text-[13px] sm:text-[15px] font-bold tracking-wide text-[#2a0b06]">
              {t.samaja}
              <sup className="ml-0.5 text-[8px]">®</sup>
            </h1>
            <p className="truncate text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.28em] text-[#722013]">
              {t.vratotsava}
            </p>
          </div>
        </Link>

        {/* CENTER — Pill nav (desktop) */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full border border-[#E8DCC4] bg-white/60 px-2 py-1.5 backdrop-blur-md shadow-inner">
          {navItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* RIGHT — CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          <Link
            to="/mantrakshate"
            className="group hidden md:inline-flex items-center gap-2 rounded-full border border-[#722013] bg-white pl-5 pr-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#722013] shadow-sm hover:bg-[#722013] hover:text-[#F7E7B4] transition-all duration-300"
          >
            Mantrakshate
            {t.requestMantrakshata}
          </Link>
          <Link
            to="/book-seva"
            className="group hidden md:inline-flex items-center text-center gap-2 rounded-full bg-[#2a0b06] pl-5 pr-2 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F7E7B4] shadow-[0_8px_20px_-10px_rgba(42,11,6,0.7)] hover:bg-[#722013] transition-all duration-300"
          >
            {t.bookSeva}
          </Link>

          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E8DCC4] bg-white/70 text-[#722013] hover:bg-[#E8DCC4]/60 transition-colors lg:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-x-0 top-full bottom-0 bg-[#2a0b06]/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full border-t border-[#D4AF37]/30 bg-[#FCF8F2] shadow-2xl lg:hidden"
            >
              <nav className="flex flex-col px-5 py-4">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-[#E8DCC4]/70 last:border-b-0"
                  >
                    {item.type === "scroll" ? (
                      <ScrollLink
                        to={item.href}
                        smooth={true}
                        duration={350}
                        offset={-70}
                        spy={true}
                        hashSpy={true}
                        onSetActive={(id) => setActive(id)}
                        onClick={() => setIsMenuOpen(false)}
                        className="group flex items-center justify-between py-3.5 font-serif text-base font-bold text-[#2a0b06] hover:text-[#722013] hover:pl-2 transition-all duration-300 cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-[#D4AF37]">
                            0{i + 1}
                          </span>
                          {item.name}
                        </span>

                        <ArrowUpRight className="h-4 w-4 text-[#722013] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </ScrollLink>

                    ) : (
                      <Link
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="group flex items-center justify-between py-3.5 font-serif text-base font-bold text-[#2a0b06] hover:text-[#722013] hover:pl-2 transition-all duration-300"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-[#D4AF37]">
                            0{i + 1}
                          </span>
                          {item.name}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-[#722013] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </Link>
                    )}
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-5 mb-3"
                >
                  <Link
                    to="/mantrakshate"
                    onClick={() => setIsMenuOpen(false)}
                    className="mt-3 mb-5 flex w-full items-center justify-center gap-2 rounded-full border border-[#722013] bg-white py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-[#722013] hover:bg-[#722013] hover:text-[#F7E7B4] transition-all duration-300"
                  >
                    🌸 Get Mantrakshate {t.requestMantrakshata}
                  </Link>
                  <Link
                    to="/book-seva"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2a0b06] py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-[#F7E7B4] shadow-md hover:bg-[#722013] transition-all duration-300"
                  >
                    <Sparkles className="h-4 w-4 text-[#D4AF37]" /> {t.bookSevaNow}
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
