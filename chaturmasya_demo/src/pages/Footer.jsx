import { FaInstagram, FaYoutube, FaFacebook } from "react-icons/fa";
import { Sun, ChevronRight, Phone, Mail, MapPin, Heart } from "lucide-react";
import {
  doc,
  onSnapshot,
  setDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useEffect, useState } from "react";

export default function Footer() {
  const [visitorCount, setVisitorCount] = useState(null);

  useEffect(() => {
  const visitorRef = doc(db, "siteStats", "visitors");
  const VISITOR_KEY = "chaturmasya_visitor_counted";

  const registerUniqueVisitor = async () => {
    try {
      const alreadyCounted = localStorage.getItem(VISITOR_KEY);

      // Count this browser only once
      if (!alreadyCounted) {
        await setDoc(
          visitorRef,
          {
            totalVisits: increment(1),
            lastVisitAt: serverTimestamp(),
          },
          { merge: true }
        );

        localStorage.setItem(VISITOR_KEY, "true");
      }
    } catch (error) {
      console.error("Error registering website visitor:", error);
    }
  };

  registerUniqueVisitor();

  // Keep the displayed total updated
  const unsubscribe = onSnapshot(
    visitorRef,
    (snapshot) => {
      if (snapshot.exists()) {
        setVisitorCount(snapshot.data().totalVisits || 0);
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
    { name: "Book Seva", href: "/seva" },
    { name: "Live Darshana", href: "/live" },
    { name: "Daily Schedule", href: "/schedule" },
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
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#3a1a0a] via-[#2a1208] to-[#1a0a04] text-white">
      {/* Decorative top border */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      {/* Decorative sun watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#D4AF37]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-[#D4AF37]/5 blur-3xl"
      />

      {/* Main grid */}
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:py-20">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10">
              <Sun className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <h2 className="font-serif text-2xl tracking-wide text-[#F5E6C8]">
              Karki Mutt
            </h2>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-white/70">
            The official digital platform connecting devotees worldwide to the
            sacred traditions, rituals, and teachings during the holy
            Chaturmasya period.
          </p>

          <div className="mt-6 flex items-center gap-3">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#2a1208]"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-serif text-lg text-[#F5E6C8]">Quick Links</h3>
          <span className="mt-2 block h-px w-10 bg-[#D4AF37]" />
          <ul className="mt-5 space-y-3">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="group inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-[#D4AF37]"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-[#D4AF37] transition-transform group-hover:translate-x-0.5" />
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-serif text-lg text-[#F5E6C8]">Contact Us</h3>
          <span className="mt-2 block h-px w-10 bg-[#D4AF37]" />
          <ul className="mt-5 space-y-4 text-sm text-white/75">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
              <span className="min-w-0">
                Daivajna Brahmana Sabha Bhavana
                <br />
                Sagara, Karnataka
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-[#D4AF37]" />
              <a
                href="tel:+919448519501"
                className="hover:text-[#D4AF37] transition-colors"
              >
                +91 94485 19501
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-[#D4AF37]" />
              <a
                href="mailto:info@chaturmasya.org"
                className="truncate hover:text-[#D4AF37] transition-colors"
              >
                chaturmasyasagara@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Map */}
        <div>
          <h3 className="font-serif text-lg text-[#F5E6C8]">Visit</h3>
          <span className="mt-2 block h-px w-10 bg-[#D4AF37]" />
          <a
            href="https://maps.google.com/?q=Karki+Mutt+Udupi"
            target="_blank"
            rel="noreferrer"
            className="group mt-5 block overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:border-[#D4AF37]/50"
          >
            <div className="h-32 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3868.6564901614256!2d75.02673107433876!3d14.156281787801893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbb8b003b45f2c9%3A0xa4853c01c6c4484b!2sDaivajna%20Brahmana%20Sabha%20Bhavana%2C%20Sagar!5e0!3m2!1sen!2sin!4v1784288886532!5m2!1sen!2sin"
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Daivajna Brahmana Sabha Bhavana, Sagar"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs uppercase tracking-wider text-white/70">
                Open in Maps
              </span>
              <ChevronRight className="h-4 w-4 text-[#D4AF37] transition-transform group-hover:translate-x-1" />
            </div>
          </a>
        </div>
      </div>

      {/* Sanskrit blessing */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center sm:px-8">
          <p className="font-serif text-base italic text-[#D4AF37] sm:text-lg">
            ॥ सर्वे भवन्तु सुखिनः ॥
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/50">
            Sarveh Bhavantu Sukhinaha
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10 bg-black/30">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-6 py-5 text-center text-xs text-white/60 sm:px-8 md:grid-cols-3 md:text-left">
          <p className="min-w-0">
            © 2026 Karki Mutt. All rights reserved.
          </p>

          {visitorCount !== null && (
            <p className="md:text-center">
              Website Visits{" "}
              <span className="ml-1 rounded-full bg-[#D4AF37]/15 px-2 py-0.5 font-semibold text-[#D4AF37]">
                {visitorCount.toLocaleString("en-IN")}
              </span>
            </p>
          )}

          <p className="inline-flex items-center justify-center gap-1.5 md:justify-end">
            Crafted with <Heart className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" /> by
            <a
              href="https://elv8.works"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#D4AF37] hover:underline"
            >
              elv8.works
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
