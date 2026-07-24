import { FaInstagram, FaYoutube, FaFacebook } from "react-icons/fa";
import { Sun, ChevronRight, Phone, Mail, MapPin, Heart } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase/firebase";
import { useEffect, useState } from "react";

export default function Footer() {
  const [visitorCount, setVisitorCount] = useState(null);

  useEffect(() => {
    const visitorRef = doc(db, "siteStats", "visitors");
    const VISIT_KEY = "chaturmasya_visit_session";

    const registerVisit = async () => {
      try {
        const alreadyCounted = sessionStorage.getItem(VISIT_KEY);

        if (!alreadyCounted) {
          const registerWebsiteVisit = httpsCallable(
            functions,
            "registerWebsiteVisit"
          );

          await registerWebsiteVisit();

          sessionStorage.setItem(VISIT_KEY, "true");
        }
      } catch (error) {
        console.error("Error registering website visit:", error);
      }
    };

    registerVisit();

    const unsubscribe = onSnapshot(
      visitorRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setVisitorCount(snapshot.data()?.totalVisits || 0);
        } else {
          setVisitorCount(0);
        }
      },
      (error) => {
        console.error("Error loading visitor count:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Book Seva", href: "/book-seva" },
    { name: "Virtual Seva", href: "/virtual-pada-puja" },
    { name: "Cultural Events", href: "/cultural" },
  ];

  const socials = [
    {
      Icon: FaInstagram,
      href: "https://instagram.com/chaturmasyasagara2026",
      label: "Instagram",
    },
    {
      Icon: FaYoutube,
      href: "https://youtube.com/@chaturmasyasagara2026?si=le6GD49Uu9Cpw2FT",
      label: "YouTube",
    },
    {
      Icon: FaFacebook,
      href: "https://facebook.com/chaturmasyasagara2026",
      label: "Facebook",
    },
  ];

  return (
    <footer
      id="contact"
      className="relative bg-[#110603] text-[#E8DCC4] overflow-hidden pt-16 pb-8 border-t-4 border-[#D4AF37]"
    >
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#E86A33]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* =========================================
            TOP BANNER: SANSKRIT BLESSING
        ========================================= */}
        <div className="text-center mb-16 md:mb-24 flex flex-col items-center">
          <p className="font-serif text-3xl md:text-5xl lg:text-6xl text-[#D4AF37] opacity-90 tracking-wide">
            ॥ सर्वे भवन्तु सुखिनः ॥
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 w-full max-w-md">
            <div className="h-px bg-gradient-to-r from-transparent to-[#D4AF37]/50 flex-1" />
            <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#E8DCC4]/60 font-bold">
              Sarveh Bhavantu Sukhinaha
            </p>
            <div className="h-px bg-gradient-to-l from-transparent to-[#D4AF37]/50 flex-1" />
          </div>
        </div>

        {/* =========================================
            MAIN ARCHITECTURAL GRID
        ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* 1. Brand & About (Spans 4 cols on Desktop) */}
          <div className="lg:col-span-4 flex flex-col lg:pr-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full border border-[#D4AF37] bg-[#D4AF37]/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <Sun className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h2 className="font-serif text-3xl text-white tracking-wide">
                Karki Mutt
              </h2>
            </div>
            <p className="text-sm leading-loose text-[#E8DCC4]/70 mb-8 font-serif italic">
              The official digital platform connecting devotees worldwide to the
              sacred traditions, rituals, and teachings during the holy
              Chaturmasya period.
            </p>
            <div className="flex items-center gap-4 mt-auto">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full border border-[#E8DCC4]/20 flex items-center justify-center text-[#E8DCC4]/80 hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-[#110603] transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* 2. Quick Links (Spans 2 cols on Desktop) */}
          <div className="lg:col-span-2">
            <h3 className="font-serif text-lg text-white mb-6 uppercase tracking-widest text-[13px]">
              Discover
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-[#E8DCC4]/70 hover:text-[#D4AF37] transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Contact Info (Spans 3 cols on Desktop) */}
          <div className="lg:col-span-3">
            <h3 className="font-serif text-lg text-white mb-6 uppercase tracking-widest text-[13px]">
              Connect
            </h3>
            <ul className="space-y-5 text-sm text-[#E8DCC4]/75">
              <li className="flex items-start gap-4 group">
                <div className="mt-0.5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#D4AF37]/50 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                </div>
                <span className="leading-relaxed font-serif">
                  Daivajna Brahmana Sabha Bhavana<br />
                  Sagara, Karnataka
                </span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#D4AF37]/50 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                </div>
                <a href="tel:+919448519501" className="hover:text-[#D4AF37] transition-colors font-serif">
                  +91 94485 19501
                </a>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#D4AF37]/50 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                </div>
                <a href="mailto:chaturmasyasagara@gmail.com" className="hover:text-[#D4AF37] transition-colors font-serif truncate">
                  chaturmasyasagara@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* 4. Map Container (Spans 3 cols on Desktop) */}
          <div className="lg:col-span-3">
            <h3 className="font-serif text-lg text-white mb-6 uppercase tracking-widest text-[13px] hidden lg:block">
              Location
            </h3>
            <div className="w-full h-[200px] lg:h-full min-h-[180px] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-lg relative group">
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4AF37]/50 transition-colors rounded-2xl pointer-events-none z-10" />
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3868.6564901614256!2d75.02673107433876!3d14.156281787801893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbb8b003b45f2c9%3A0xa4853c01c6c4484b!2sDaivajna%20Brahmana%20Sabha%20Bhavana%2C%20Sagar!5e0!3m2!1sen!2sin!4v1784288886532!5m2!1sen!2sin"
                className="w-full h-full grayscale-[30%] contrast-125 opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Daivajna Brahmana Sabha Bhavana, Sagar"
              />
            </div>
          </div>

        </div>

        {/* =========================================
            BOTTOM BAR (Credits & Stats)
        ========================================= */}
        <div className="pt-8 border-t border-[#E8DCC4]/10 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] uppercase tracking-widest text-[#E8DCC4]/50 font-bold">
          
          <p>© 2026 Karki Mutt. All rights reserved.</p>

          {/* Visitor Counter */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full shadow-inner">
            <span>Devotees Visited</span>
            <div className="w-1 h-1 rounded-full bg-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs">
              {visitorCount !== null
                ? visitorCount.toLocaleString("en-IN")
                : "Loading..."}
            </span>
          </div>

          <p className="flex items-center gap-1.5">
            Crafted with <Heart className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" /> by
            <a
              href="https://elv8.works"
              target="_blank"
              rel="noreferrer"
              className="text-[#D4AF37] hover:text-white transition-colors"
            >
              elv8.works
            </a>
          </p>

        </div>
      </div>
    </footer>
  );
}