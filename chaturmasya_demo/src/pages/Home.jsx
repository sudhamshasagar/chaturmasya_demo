import React, { useState, useEffect,useRef } from "react";
import { Link } from "react-router-dom";
import {db} from "../firebase/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, 
  Sparkles, 
  BookHeart,
  ChevronLeft,
  Filter,
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  PlayCircle, 
  Sun, 
  Users, 
  CloudSun,
  X,
  ChevronRight,
  Menu
} from "lucide-react";
import InvitationSection from "./InvitationSection";

// --- Framer Motion Variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const Home = () => {
  // --- 1. Data Models (Preserved exactly as requested) ---
  // --- Blog & Updates State ---
  // --- Blog, Filters & Carousel State ---
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [activeFilter, setActiveFilter] = useState({ type: 'all', value: 'all' });
  const carouselRef = useRef(null);

  const blogs = [
    {
      id: 1,
      title: "Day 1 Chaturmasya Update",
      description: "Pujya Sri Swamiji inaugurated the Chaturmasya celebrations with special pooja and pravachana.",
      content: "The holy period of Chaturmasya commenced today with tremendous spiritual fervor. Devotees from across the globe gathered to witness the sacred Sankalpa. \n\nPujya Sri Swamiji performed the initial poojas at the break of dawn, invoking the blessings of Lord Sri Hari. Following the pooja, a profound Pravachana was delivered, highlighting the significance of Vrata (vow) and inner purification during these four sacred months. \n\nThe atmosphere was filled with divine Vedic chants, setting a serene and spiritually uplifting tone for the journey ahead. All devotees are encouraged to participate in the daily online Parayana.",
      image: "https://images.pexels.com/photos/8230166/pexels-photo-8230166.jpeg",
      date: "July 1, 2026",
      readTime: "3 min read",
      day: 1,
      week: 1,
      month: "July"
    },
    {
      id: 2,
      title: "Special Laksha Tulasi Archane",
      description: "Understanding the spiritual benefits and tradition behind the sacred Tulasi Archane.",
      content: "Tulasi is exceptionally dear to Lord Sri Hari. Offering a single Tulasi leaf with ultimate devotion brings immense spiritual merit. Today, the mutt witnessed the grand Laksha Tulasi Archane, where one lakh sacred leaves were offered at the lotus feet of the deity.\n\nThis tradition dates back centuries and is known to cleanse the mind and bring peace to the surroundings. Devotees participating virtually chanted the Vishnu Sahasranama along with the live stream.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
      date: "July 2, 2026",
      readTime: "2 min read",
      day: 2,
      week: 1,
      month: "July"
    },
    {
      id: 3,
      title: "Annadana Seva Begins",
      description: "Devotees are invited to participate in the grand Annadana Seva throughout Chaturmasya.",
      content: "Anna Daanam Maha Daanam — the offering of food is considered the highest form of charity in our tradition. During Chaturmasya, thousands of visiting devotees, scholars, and students are served prasada daily.\n\nWe invite devotees globally to contribute to this noble cause. By participating in the Annadana Seva, you become an integral part of the daily spiritual functioning of the mutt, receiving the boundless grace of the divine.",
      image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800",
      date: "July 8, 2026",
      readTime: "2 min read",
      day: 8,
      week: 2,
      month: "July"
    },
  ];

  // Logic to filter blogs and auto-select the correct one to expand
  const filteredBlogs = blogs.filter(blog => {
    if (activeFilter.type === 'all') return true;
    return blog[activeFilter.type].toString() === activeFilter.value.toString();
  });

  // Always show a blog in the expanded reader. If the currently selected one is filtered out, default to the first available.
  const displayBlog = (selectedBlog && filteredBlogs.some(b => b.id === selectedBlog.id)) 
    ? selectedBlog 
    : (filteredBlogs[0] || null);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleFilterChange = (type, value) => {
    if (value === "") setActiveFilter({ type: 'all', value: 'all' });
    else setActiveFilter({ type, value });
  };

  const dailySchedule = [
    { id: 1, timePre: "06:00", timePost: "AM", title: "Suprabhata Seva", status: "past" },
    { id: 2, timePre: "08:00", timePost: "AM", title: "Sri Rama Devara Pooja", status: "past" },
    { id: 3, timePre: "10:00", timePost: "AM", title: "Pravachana", status: "past" },
    { id: 4, timePre: "12:30", timePost: "PM", title: "Mahamangalarati & Teertha Prasada", status: "ongoing" },
    { id: 5, timePre: "05:00", timePost: "PM", title: "Veda Parayana", status: "future" },
    { id: 6, timePre: "07:00", timePost: "PM", title: "Bhajane & Sandhya Vandana", status: "future" },
  ];

  const heroSlides = [
    {
      id: 1,
      tag: "A SACRED VOW. A TIMELESS TRANSFORMATION.",
      title: "41st\n Chaturmasya Vratothsava - 2026\nDeepen Sadhana.\nDiscover Yourself.",
      desc: "Welcome to the official digital portal. Participate in daily rituals, book sevas, and seek blessings from anywhere in the world.",
      img: "/hero.jpeg"
    },
  ];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
 // --- Cultural Booking Form State ---
  const MAX_BOOKINGS_PER_DAY = 3;
  const [selectedDateId, setSelectedDateId] = useState("");
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [culturalForm, setCulturalForm] = useState({
    name: "",
    contact: "",
  });
  const [bookingType, setBookingType] = useState("solo");
  const [groupCount, setGroupCount] = useState(2);
  const [isSubmittingCultural, setIsSubmittingCultural] = useState(false);
  // ------------------------------------------------------------
  // Generate every booking date from July 29 to September 26
  // ------------------------------------------------------------

  const generateCulturalDates = () => {
    const startDate = new Date(2026, 6, 29);
    const endDate = new Date(2026, 8, 26);

    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");

      const dateId = `${year}-${month}-${day}`;

      dates.push({
        id: dateId,

        dayNumber: currentDate.getDate(),

        monthShort: currentDate.toLocaleDateString("en-US", {
          month: "short",
        }),

        monthLong: currentDate.toLocaleDateString("en-US", {
          month: "long",
        }),

        weekday: currentDate.toLocaleDateString("en-US", {
          weekday: "short",
        }),

        fullDate: currentDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const culturalDates = generateCulturalDates();

  // ------------------------------------------------------------
  // Listen to approved bookings
  // ------------------------------------------------------------

  useEffect(() => {
    const culturalRequestsRef = collection(db, "culturalRequests");

    const unsubscribe = onSnapshot(
      culturalRequestsRef,

      (snapshot) => {
        const bookings = snapshot.docs.map((bookingDoc) => ({
          id: bookingDoc.id,
          ...bookingDoc.data(),
        }));

        setApprovedBookings(
          bookings.filter(
            (booking) =>
              booking.status?.toLowerCase() === "approved"
          )
        );
      },

      (error) => {
        console.error(
          "Unable to load Cultural Seva availability:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  // ------------------------------------------------------------
  // Availability helpers
  // ------------------------------------------------------------

  const getApprovedBookingCount = (dateId) => {
    return approvedBookings.filter(
      (booking) => booking.date === dateId
    ).length;
  };

  const getRemainingSlots = (dateId) => {
    return Math.max(
      0,
      MAX_BOOKINGS_PER_DAY - getApprovedBookingCount(dateId)
    );
  };

  const selectedDateData = culturalDates.find(
    (date) => date.id === selectedDateId
  );

  const selectedDateRemainingSlots = selectedDateId
    ? getRemainingSlots(selectedDateId)
    : null;

  // ------------------------------------------------------------
  // Submit booking request
  // ------------------------------------------------------------

  const handleCulturalSubmit = async (e) => {
    e.preventDefault();

    const name = culturalForm.name.trim();
    const contact = culturalForm.contact.trim();

    if (!name) {
      alert("Please enter your full name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(contact)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!selectedDateId) {
      alert("Please select an available date.");
      return;
    }

    if (getRemainingSlots(selectedDateId) <= 0) {
      alert(
        "All Cultural Seva booking slots for this date are already booked."
      );
      return;
    }

    if (
      bookingType === "group" &&
      (!groupCount || Number(groupCount) < 2)
    ) {
      alert("Please enter a valid number of group members.");
      return;
    }

  const uniqueId = `KMCP${Date.now()
    .toString()
    .slice(-7)}`;

  try {
    setIsSubmittingCultural(true);

    await addDoc(collection(db, "culturalRequests"), {
      bookingId: uniqueId,

      name,

      contact,

      date: selectedDateId,

      participationType: bookingType,

      participantCount:
        bookingType === "group"
          ? Number(groupCount)
          : 1,

      status: "pending",

      createdAt: serverTimestamp(),
    });

    alert(
      `Request Submitted Successfully!\n\nReference ID: ${uniqueId}\n\nYour Cultural Seva request has been sent to the administration for review.\n\nYour program will be booked only after Admin approval.`
    );

    setCulturalForm({
      name: "",
      contact: "",
    });

    setBookingType("solo");
    setGroupCount(2);
    setSelectedDateId("");
  } catch (error) {
    console.error(
      "Cultural booking submission failed:",
      error
    );

    alert(
      "Unable to submit your request. Please try again."
    );
  } finally {
    setIsSubmittingCultural(false);
  }
};
  // --- 2. State & Effects ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [formData, setFormData] = useState({ name: "", contact: "" });
  const [isScrolled, setIsScrolled] = useState(false);
  const [statusSearch, setStatusSearch] = useState("");
  const [statusResults, setStatusResults] = useState([]);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusSearched, setStatusSearched] = useState(false);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
  if (!isScrolled) setIsMenuOpen(false);
}, [isScrolled]);

  // --- 3. Handlers ---
  const openModal = (slot) => {
    setActiveSlot(slot);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveSlot(null);
    setFormData({ name: "", contact: "" });
  };

  // --- Find the currently ongoing event for the highlight card ---
  const ongoingEvent = dailySchedule.find(item => item.status === 'ongoing') 
    || dailySchedule.find(item => item.status === 'future') 
    || dailySchedule[dailySchedule.length - 1];

  const formatCulturalTimestamp = (timestamp) => {
  if (!timestamp?.toDate) return "Not available";

  return timestamp.toDate().toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatCulturalTime = (time) => {
  if (!time) return "Not allocated";

  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getDurationLabel = (duration) => {
  const value = Number(duration);

  if (value === 60) return "1 Hour";
  if (value === 45) return "45 Minutes";
  if (value === 30) return "30 Minutes";

  return duration ? `${duration} Minutes` : "Not allocated";
};

const handleCheckCulturalStatus = async (e) => {
  e.preventDefault();

  const searchValue = statusSearch.trim();

  setStatusResults([]);
  setStatusError("");
  setStatusSearched(false);

  if (!searchValue) {
    setStatusError(
      "Please enter your Cultural Seva Booking ID or mobile number."
    );
    return;
  }

  try {
    setIsCheckingStatus(true);

    const requestsRef = collection(db, "culturalRequests");

    let statusQuery;

    /*
      Booking IDs generated by your current application
      begin with KMCP.

      Otherwise, treat a 10-digit value as a mobile number.
    */

    if (/^KMCP\d+$/i.test(searchValue)) {
      statusQuery = query(
        requestsRef,
        where("bookingId", "==", searchValue.toUpperCase())
      );
    } else if (/^[6-9]\d{9}$/.test(searchValue)) {
      statusQuery = query(
        requestsRef,
        where("contact", "==", searchValue)
      );
    } else {
      setStatusError(
        "Enter a valid Booking ID or 10-digit mobile number."
      );

      return;
    }

    const snapshot = await getDocs(statusQuery);

    const results = snapshot.docs.map((requestDoc) => ({
      id: requestDoc.id,
      ...requestDoc.data(),
    }));

    results.sort((a, b) => {
      const firstTime =
        a.createdAt?.toMillis?.() || 0;

      const secondTime =
        b.createdAt?.toMillis?.() || 0;

      return secondTime - firstTime;
    });

    setStatusResults(results);
    setStatusSearched(true);

  } catch (error) {
    console.error(
      "Failed to check Cultural Seva status:",
      error
    );

    setStatusError(
      "Unable to check the booking status. Please try again."
    );
  } finally {
    setIsCheckingStatus(false);
  }
};

  return (
    <div className="min-h-screen bg-[#FCF8F2] font-sans text-gray-900 selection:bg-[#722013] selection:text-[#FCF8F2] overflow-x-hidden">
      
      {/* Decorative Background Elements (Temple Geometry) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] mix-blend-multiply"></div>
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#f8e5cc] to-transparent opacity-40 blur-3xl -z-10"></div>

      {/* --- TOP ADMIN BAR --- */}
      <div id="top" className="bg-[#FAF6F0] text-[#722013] py-2 px-6 text-[10px] tracking-[0.2em] uppercase font-bold flex justify-between items-center z-50 relative border-b border-[#E8DCC4]">
        <span className="flex items-center gap-2 opacity-80">
          <span className="w-1.5 h-1.5 bg-[#E86A33] rounded-full"></span> 
          Auspicious Day: Ekadashi
        </span>
        <Link to="/admin" className="flex items-center gap-2 hover:text-[#E86A33] transition-colors">
          <Users className="w-3.5 h-3.5" />
          Admin Portal
        </Link>
      </div>

      {/* --- PREMIUM FLOATING HEADER --- */}
      <header className={`fixed left-1/2 -translate-x-1/2 w-[100%]  z-50 transition-all duration-500 ${isScrolled ? 'top-6' : 'top-10'}`}>
        
        {/* Main Navbar Container */}
        <div className={`relative flex justify-between items-center px-6 py-4 transition-all duration-500 z-20 ${
          isScrolled && !isMenuOpen 
            ? 'bg-transparent pointer-events-none border-transparent' // Transparent wrapper when scrolled
            : ''
        }`}>
          
          {/* Logo (Fades out when scrolled, unless menu is open) */}
          <div className={`flex items-center gap-3 cursor-pointer group transition-all duration-500 pointer-events-auto ${
            isScrolled && !isMenuOpen ? 'opacity-0 -translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'
          }`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#722013] to-[#4a150c] flex items-center justify-center text-[#D4AF37] shadow-md group-hover:rotate-12 transition-transform duration-500">
              <Sun className="w-5 h-5" />
            </div>
            <div className="leading-none">
              <h1 className="text-xl font-bold text-[#2a0b06] font-serif tracking-wide">Karki Mutt</h1>
              <p className="text-[9px] text-[#722013] font-bold uppercase tracking-[0.2em] mt-1">Chaturmasya 2026</p>
            </div>
          </div>
          
          {/* Expanded Desktop Nav (Hidden when scrolled OR on mobile) */}
          <div className={`items-center gap-8 pointer-events-auto ${isScrolled ? 'hidden' : 'hidden lg:flex'}`}>
            <nav className="flex items-center gap-8 text-sm font-medium text-gray-700">
              {['Home', 'Schedule', 'Live Darshan', 'Cultural Events'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="relative group overflow-hidden">
                  <span className="group-hover:text-[#722013] transition-colors duration-300">{item}</span>
                  <span className="absolute left-0 bottom-0 w-full h-[1px] bg-[#722013] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
                </a>
              ))}
            </nav>

            <Link to="/book-seva" className="bg-gradient-to-r from-[#D4AF37] to-[#b5952f] text-white px-7 py-2.5 rounded-full font-semibold text-sm hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Book Seva
            </Link>
          </div>

          {/* Hamburger Menu Icon (Visible when scrolled OR on mobile) */}
          <div className={`items-center justify-end pointer-events-auto ${isScrolled ? 'flex' : 'flex lg:hidden'}`}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className={`p-3 rounded-full transition-all duration-500 border ${
                isScrolled && !isMenuOpen 
                  ? 'bg-white/90 backdrop-blur-md shadow-xl border-white/60 text-[#722013] hover:scale-110' // Floating button style
                  : 'bg-[#FAF6F0] border-[#E8DCC4]/50 text-[#722013] hover:bg-[#E8DCC4]' // Standard button inside pill
              }`}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Collapsed Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border border-[#E8DCC4] rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              <nav className="flex flex-col p-4">
                {['Home', 'Schedule', 'Live Darshan', 'Cultural Events'].map((item) => (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="px-6 py-4 text-base font-bold text-gray-800 hover:text-[#722013] hover:bg-[#FAF6F0] rounded-2xl transition-colors"
                  >
                    {item}
                  </a>
                ))}
                <div className="px-4 pt-4 pb-2 border-t border-[#E8DCC4] mt-2">
                  <Link 
                    to="/book-seva" 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#b5952f] text-white px-7 py-4 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 flex justify-center items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" /> Book Seva
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- CINEMATIC HERO SECTION --- */}
      <section className="relative w-full pt-20 pb-6 md:pt-28 md:pb-24 z-10 overflow-hidden flex items-centre">
  {/* Soft ambient wash */}
  <div className="absolute top-16 -left-32 w-[520px] h-[520px] rounded-full bg-[#D4AF37]/10 blur-[120px] pointer-events-none -z-10" />
  <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-[#722013]/10 blur-[100px] pointer-events-none -z-10" />

  <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full">
   <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">  

      {/* ==================== LEFT: TEXT ==================== */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="lg:col-span-5 order-2 lg:order-1"
      >
        {/* Credit line — top left of title */}
        <motion.div variants={fadeUp} className="mb-5 flex items-center gap-3">
          <span className="w-8 h-[1px] bg-[#D4AF37]" />
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.28em] text-[#722013]">
            Daivajna Brahman Samaja<sup className="text-[8px] mx-0.5">®</sup> Sagara
          </p>
        </motion.div>

        {/* Live tag */}
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-[#E8DCC4] px-3.5 py-1.5 rounded-full shadow-sm mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E86A33] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E86A33]" />
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold text-[#722013] tracking-[0.2em] uppercase">
            Commencing 29 July 2026
          </span>
        </motion.div>

        {/* Ordinal + main title */}
        <motion.div variants={fadeUp} className="mb-6">
          <p className="font-serif italic text-[#c2410c] text-3xl sm:text-4xl mb-1 leading-none">
            <span className="tabular-nums font-black not-italic text-[#2a0b06]">41</span>
            <sup className="text-lg font-bold not-italic text-[#722013] ml-0.5">st</sup>
          </p>
          <h1 className="font-serif font-bold text-[#2a0b06] leading-[0.95] tracking-tight text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem]">
            Chaturmasya
            <span className="block italic font-light text-[#722013]">
              Vratothsava
            </span>
            <span className="block text-[#2a0b06] tabular-nums">
              — 2026
            </span>
          </h1>
        </motion.div>

        {/* Sanskrit invocation */}
        <motion.div variants={fadeUp} className="mb-6 pl-4 border-l-2 border-[#D4AF37]">
          <p className="font-serif italic text-[#722013] text-base sm:text-lg leading-snug">
            Jai Jnaneshwari
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.22em] font-bold mt-1">
            The Sacred Months
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="text-[15px] sm:text-base text-gray-600 max-w-md leading-relaxed"
        >
          <p className="text-xs font-serif italic text-[#722013] leading-relaxed">
              May the sacred vow of Chaturmasya bring inner light to every devotee.
            </p>
            <p className="text-[9px] font-bold text-stone-900 uppercase tracking-widest mt-3">— Pujya Sri Swamiji</p>
        </motion.p>

        {/* CTAs */}
        {/* <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-8">
          <a
            href="#live-darshan"
            className="group inline-flex items-center gap-2 bg-[#2a0b06] text-white px-7 py-3.5 rounded-full font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#722013] transition-all shadow-xl shadow-[#722013]/20"
          >
            <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Watch Live Darshana
          </a>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#E8DCC4] text-[#722013] px-7 py-3.5 rounded-full font-bold text-xs uppercase tracking-[0.15em] hover:border-[#722013] hover:bg-white transition-all"
          >
            Explore Programs
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div> */}

        {/* Ornamental footer meta */}
        <motion.div
          variants={fadeUp}
          className="mt-10 pt-6 border-t border-[#E8DCC4] grid grid-cols-3 gap-4 max-w-md"
        >
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-1">Duration</p>
            <p className="font-serif font-bold text-sm text-[#2a0b06]">60 Days</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-1">Venue</p>
            <p className="font-serif font-bold text-sm text-[#2a0b06]">Sagara</p>
          </div>
        </motion.div>
      </motion.div>

      {/* ==================== RIGHT: IMAGE ==================== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="lg:col-span-7 order-1 lg:order-2 relative"
      >
        {/* Editorial frame with folio marks */}
        <div className="relative">

          {/* Corner folio marks (top-left) */}
          <div className="hidden md:block absolute -top-4 -left-4 z-20">
            <div className="w-8 h-8 border-l-2 border-t-2 border-[#D4AF37]" />
          </div>
          <div className="hidden md:block absolute -bottom-4 -right-4 z-20">
            <div className="w-8 h-8 border-r-2 border-b-2 border-[#D4AF37]" />
          </div>

          {/* Main image container — taller & richer */}
          <div
  className="
    relative
    w-full
    max-w-[620px]
    mx-auto
    h-[420px]
    sm:h-[500px]
    md:h-[560px]
    lg:h-[min(68vh,620px)]
    xl:h-[min(72vh,660px)]
    rounded-[2rem]
    lg:rounded-[2.5rem]
    overflow-hidden
    shadow-2xl
    shadow-[#722013]/20
  "
>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                src={heroSlides[currentSlide].img}
                alt="Chaturmasya Vratothsava"
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Layered gradients for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2a0b06]/70 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#722013]/20" />
            {/* Bottom overlay — sacred quote & meta */}
            <div className="absolute inset-x-5 bottom-5 md:inset-x-8 md:bottom-8">
              <div className="bg-black/30 backdrop-blur-xl border border-white/15 rounded-2xl p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <span className="font-serif text-4xl text-[#D4AF37] leading-none mt-1">"</span>
                  <div className="min-w-0">
                    <p className="font-serif italic text-white text-sm md:text-base leading-snug">
                      Peace is not the absence of trouble, but the presence of divinity.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="w-6 h-[1px] bg-[#D4AF37]" />
                      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
                        Śloka of the Day
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
</section>


      {/* --- QUICK ACTIONS (Premium Feature Cards) --- */}
      <section className="max-w-7xl mx-auto px-6 relative z-20 -mt-15 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Book Pada Pooja", desc: "Reserve sacred rituals digitally.", icon: Sparkles, link: "/book-seva" },
            { title: "Virtual Pada Pooja", desc: "Submit details for participation.", icon: BookHeart, link: "/virtual-pada-puja" },
            { title: "Cultural Events", desc: "View & book mutt activities.", icon: CalendarDays, href: "#cultural" },
            { title: "Daily Schedule", desc: "Timings for all rituals.", icon: Clock, href: "#schedule" }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              {item.link ? (
                <Link to={item.link} className="group block bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-[#722013]/5 border border-[#E8DCC4]/50 transition-all duration-500 h-full relative overflow-hidden">
                  <CardContent item={item} />
                </Link>
              ) : (
                <a href={item.href} className="group block bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-[#722013]/5 border border-[#E8DCC4]/50 transition-all duration-500 h-full relative overflow-hidden">
                  <CardContent item={item} />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </section>
      <InvitationSection />

      <main className="max-w-7xl mx-auto px-6 space-y-40 mb-32">

        {/* --- 1. LIVE PRAVACHANA (Immersive Dark Section) --- */}
        <section id="live-darshan" className="scroll-mt-32">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#1A0B08] rounded-[3rem] overflow-hidden shadow-2xl relative border border-[#3A1B14]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#722013]/10 to-transparent"></div>
            <div className="grid lg:grid-cols-12 relative z-10 p-8 md:p-12 gap-12 items-center">
              
              <div className="lg:col-span-5 text-white space-y-6">
                <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  Live Broadcast
                </div>
                <h2 className="text-4xl md:text-5xl font-bold font-serif leading-tight text-[#FAF6F0]">Daily Pravachana <br/>Darshana</h2>
                <p className="text-[#D8C3BD] text-base leading-relaxed font-light">
                  Join Pujya Sri Swamiji's discourse directly from the mutt premises. Experience the divine vibrations and spiritual teachings from wherever you are.
                </p>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-[#D4AF37]">1,204</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Devotees Watching</span>
                  </div>
                  <div className="h-10 w-[1px] bg-white/10"></div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-[#D4AF37]">Vedanta</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Today's Topic</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] to-[#722013] rounded-3xl blur opacity-20"></div>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl relative border border-white/10">
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/DeI-ZPx3u8M?si=76F2OWrPTalYT5Wz&amp;start=25" 
                    title="YouTube Live Stream" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
        {/* --- 2. DAILY SCHEDULE (Calendar & Live Highlight) --- */}
        <section id="schedule" className="max-w-7xl mx-auto scroll-mt-32">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-[#E8DCC4] pb-6">
            <div>
              <h2 className="text-4xl font-bold text-[#2a0b06] font-serif mb-3">Today's Rituals</h2>
              <p className="text-gray-600 font-medium">Sacred timings observed in IST (Indian Standard Time)</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Vertical Timeline */}
            <div className="lg:col-span-7 relative">
              {/* Subtle connecting line */}
              <div className="absolute top-8 bottom-8 left-[31px] w-[2px] bg-gradient-to-b from-transparent via-[#E8DCC4] to-transparent"></div>

              <div className="space-y-4 relative z-10">
                {dailySchedule.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative flex items-center p-4 rounded-[2rem] transition-all duration-500 ${
                      item.status === 'ongoing' 
                        ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E8DCC4]/60 scale-[1.02]' 
                        : 'hover:bg-white/40 border border-transparent'
                    }`}
                  >
                    {/* Time Icon / Node */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-500 shadow-sm ${
                      item.status === 'ongoing' 
                        ? 'bg-gradient-to-br from-[#722013] to-[#4a150c] text-[#D4AF37] shadow-lg shadow-[#722013]/20' 
                        : item.status === 'past'
                          ? 'bg-[#E8DCC4]/30 text-gray-400 border border-[#E8DCC4]'
                          : 'bg-[#FAF6F0] text-[#722013] border border-[#E8DCC4]'
                    }`}>
                      {item.status === 'ongoing' ? (
                        <div className="relative">
                           <Clock className="w-6 h-6" />
                           <span className="absolute top-0 right-0 w-2 h-2 bg-[#E86A33] rounded-full animate-ping"></span>
                        </div>
                      ) : (
                        <Clock className="w-6 h-6 opacity-70" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="ml-6 flex-grow">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-[11px] font-bold tracking-widest uppercase ${item.status === 'ongoing' ? 'text-[#E86A33]' : 'text-gray-500'}`}>
                          {item.timePre} {item.timePost}
                        </p>
                        {item.status === 'past' && <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Completed</span>}
                      </div>
                      <h4 className={`text-xl font-serif font-bold transition-colors ${
                        item.status === 'past' ? 'text-gray-400 line-through decoration-gray-300/50' : 'text-[#2a0b06]'
                      }`}>
                        {item.title}
                      </h4>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column: Sticky "Happening Now" Card */}
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-[#2a0b06] to-[#4a150c] rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-[#722013]/50 text-white"
              >
                {/* Decorative Background Pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform translate-x-8 -translate-y-8">
                  <Sun className="w-64 h-64" />
                </div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                      {ongoingEvent.status === 'ongoing' ? 'Happening Now' : 'Up Next'}
                    </div>
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-center">
                      <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider mb-0.5">Time</p>
                      <p className="text-sm font-bold">{ongoingEvent.timePre} {ongoingEvent.timePost}</p>
                    </div>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#FAF6F0] mb-4 leading-tight">
                    {ongoingEvent.title}
                  </h3>

                  <p className="text-[#D8C3BD] text-sm leading-relaxed mb-10 font-medium">
                    {ongoingEvent.status === 'ongoing' 
                      ? "Devotees are currently participating in this sacred ritual. May the divine presence bring peace and spiritual awakening to all." 
                      : "The next sacred activity will commence shortly. Devotees are requested to prepare for participation."}
                  </p>

                  <div className="space-y-4">
                    <a href="#live-darshan" className="w-full bg-gradient-to-r from-[#D4AF37] to-[#b5952f] text-white py-4 rounded-2xl font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300 flex justify-center items-center gap-2 group">
                      <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                      {ongoingEvent.status === 'ongoing' ? 'Join Live Stream' : 'Watch Live Darshan'}
                    </a>
                    
                    <Link to="/book-seva" className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white py-4 rounded-2xl font-bold text-sm transition-all duration-300 flex justify-center items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Book Seva for Tomorrow
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </section>

        {/* --- 3. CULTURAL ACTIVITIES (Inline Calendar Form) --- */}
       <section
          id="cultural"
          className="scroll-mt-32 max-w-7xl mx-auto"
        >
          {/* ========================================================
              SECTION HEADER
          ======================================================== */}
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-[#722013]/5 border border-[#722013]/10 px-4 py-2 rounded-full mb-5">

              <span className="relative flex h-2 w-2">

                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E86A33] opacity-75" />

                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E86A33]" />

              </span>

              <span className="text-[10px] md:text-xs font-bold text-[#722013] uppercase tracking-[0.18em]">

                Bookings Open

              </span>

            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-[#2a0b06] font-serif mb-4">

              Cultural Seva Booking

            </h2>

            <p className="text-gray-600 leading-relaxed">

              Offer music, bhajans, dance, Harikatha, discourse, or
              another cultural program during Chaturmasya.

            </p>

            <p className="text-sm font-bold text-[#722013] mt-4">

              July 29 — September 26, 2026

              <span className="mx-2 text-[#D4AF37]">•</span>

              Maximum 3 approved programs per day

            </p>

          </div>


          {/* ========================================================
              ADMIN APPROVAL NOTICE
          ======================================================== */}

          <div className="max-w-5xl mx-auto mb-8">

            <div className="bg-[#FFF8E8] border border-[#E8D3A5] rounded-2xl p-5 md:p-6 flex gap-4">

              <div className="w-10 h-10 shrink-0 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">

                <Clock className="w-5 h-5 text-[#9A7625]" />

              </div>

              <div>

                <h3 className="font-bold text-[#2a0b06] mb-1">

                  Admin approval is required

                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">

                  Submitting this form does not confirm your Cultural
                  Seva booking. Your request will be reviewed by the
                  administration. Your program will be considered booked
                  only after Admin approval and confirmation.

                </p>

              </div>

            </div>

          </div>


          {/* ========================================================
              MAIN BOOKING CARD
          ======================================================== */}

          <form
            onSubmit={handleCulturalSubmit}
            className="bg-white rounded-[2rem] md:rounded-[3rem]
                      shadow-[0_20px_60px_rgba(42,11,6,0.06)]
                      border border-[#E8DCC4]/60
                      overflow-hidden"
          >

            <div className="grid lg:grid-cols-12">


              {/* ====================================================
                  CALENDAR
              ==================================================== */}

              <div className="lg:col-span-7 p-5 sm:p-8 md:p-10 lg:p-12">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

                  <div>

                    <p className="text-[10px] font-bold text-[#722013] uppercase tracking-[0.2em] mb-2">

                      Select Date

                    </p>

                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#2a0b06]">

                      Choose an available day

                    </h3>

                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500">

                    <div className="flex items-center gap-1.5">

                      <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />

                      Available

                    </div>

                    <div className="flex items-center gap-1.5">

                      <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />

                      Full

                    </div>

                  </div>

                </div>


                {/* DATE GRID */}

                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2 md:gap-3">

                  {culturalDates.map((date) => {

                    const remainingSlots = getRemainingSlots(date.id);

                    const isFullyBooked = remainingSlots === 0;

                    const isSelected =
                      selectedDateId === date.id;

                    return (

                      <button
                        key={date.id}
                        type="button"
                        disabled={isFullyBooked}
                        onClick={() => setSelectedDateId(date.id)}
                        className={`
                          relative min-h-[88px] md:min-h-[100px]
                          rounded-2xl border
                          flex flex-col items-center justify-center
                          transition-all duration-300

                          ${
                            isSelected

                              ? "bg-[#2a0b06] text-white border-[#2a0b06] shadow-xl scale-[1.03]"

                              : isFullyBooked

                                ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"

                                : "bg-[#FCF8F2] text-[#2a0b06] border-[#E8DCC4] hover:border-[#722013] hover:bg-white hover:shadow-md"
                          }
                        `}
                      >

                        <span
                          className={`text-[9px] uppercase tracking-wider font-bold mb-1 ${
                            isSelected
                              ? "text-[#D4AF37]"
                              : "text-gray-400"
                          }`}
                        >

                          {date.weekday}

                        </span>

                        <span className="text-xl md:text-2xl font-serif font-bold leading-none">

                          {date.dayNumber}

                        </span>

                        <span
                          className={`text-[9px] uppercase tracking-wider mt-1 ${
                            isSelected
                              ? "text-white/60"
                              : "text-gray-400"
                          }`}
                        >

                          {date.monthShort}

                        </span>


                        {/* AVAILABILITY */}

                        <span
                          className={`
                            mt-2 text-[8px] md:text-[9px]
                            px-2 py-1 rounded-full font-bold

                            ${
                              isSelected

                                ? "bg-white/10 text-[#D4AF37]"

                                : isFullyBooked

                                  ? "bg-gray-200 text-gray-400"

                                  : remainingSlots === 1

                                    ? "bg-orange-100 text-orange-700"

                                    : "bg-[#D4AF37]/10 text-[#8A6B1F]"
                            }
                          `}
                        >

                          {isFullyBooked
                            ? "Fully Booked"
                            : `${remainingSlots} ${
                                remainingSlots === 1
                                  ? "slot"
                                  : "slots"
                              } left`}

                        </span>

                      </button>

                    );

                  })}

                </div>

              </div>


              {/* ====================================================
                  BOOKING FORM
              ==================================================== */}

              <div className="lg:col-span-5 bg-[#FAF6F0] border-t lg:border-t-0 lg:border-l border-[#E8DCC4] p-5 sm:p-8 md:p-10 lg:p-12">

                <p className="text-[10px] font-bold text-[#722013] uppercase tracking-[0.2em] mb-2">

                  Devotee Information

                </p>

                <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#2a0b06] mb-8">

                  Request Cultural Seva

                </h3>


                <div className="space-y-5">


                  {/* NAME */}

                  <div>

                    <label className="block text-xs font-bold text-gray-600 mb-2">

                      Full Name

                    </label>

                    <input
                      type="text"
                      required
                      value={culturalForm.name}
                      onChange={(e) =>
                        setCulturalForm({
                          ...culturalForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter your full name"
                      className="w-full bg-white border border-[#E8DCC4]
                                rounded-2xl px-5 py-4 outline-none
                                focus:ring-2 focus:ring-[#D4AF37]/30
                                focus:border-[#D4AF37]
                                transition"
                    />

                  </div>


                  {/* MOBILE */}

                  <div>

                    <label className="block text-xs font-bold text-gray-600 mb-2">

                      Mobile Number

                    </label>

                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      maxLength={10}
                      value={culturalForm.contact}
                      onChange={(e) =>
                        setCulturalForm({
                          ...culturalForm,
                          contact: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="10-digit mobile number"
                      className="w-full bg-white border border-[#E8DCC4]
                                rounded-2xl px-5 py-4 outline-none
                                focus:ring-2 focus:ring-[#D4AF37]/30
                                focus:border-[#D4AF37]
                                transition"
                    />

                  </div>


                  {/* SOLO / GROUP */}

                  <div>

                    <label className="block text-xs font-bold text-gray-600 mb-2">

                      Participation Type

                    </label>

                    <div className="grid grid-cols-2 gap-2 bg-white border border-[#E8DCC4] p-1.5 rounded-2xl">

                      <button
                        type="button"
                        onClick={() => {
                          setBookingType("solo");
                          setGroupCount(2);
                        }}
                        className={`py-3.5 rounded-xl text-sm font-bold transition-all ${
                          bookingType === "solo"
                            ? "bg-[#2a0b06] text-white shadow-md"
                            : "text-gray-500 hover:bg-[#FAF6F0]"
                        }`}
                      >

                        Solo

                      </button>

                      <button
                        type="button"
                        onClick={() => setBookingType("group")}
                        className={`py-3.5 rounded-xl text-sm font-bold transition-all ${
                          bookingType === "group"
                            ? "bg-[#2a0b06] text-white shadow-md"
                            : "text-gray-500 hover:bg-[#FAF6F0]"
                        }`}
                      >

                        Group

                      </button>

                    </div>

                  </div>


                  {/* GROUP COUNT */}

                  <AnimatePresence>

                    {bookingType === "group" && (

                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >

                        <label className="block text-xs font-bold text-gray-600 mb-2">

                          Number of Participants

                        </label>

                        <input
                          type="number"
                          min="2"
                          required
                          value={groupCount}
                          onChange={(e) =>
                            setGroupCount(e.target.value)
                          }
                          className="w-full bg-white border border-[#E8DCC4]
                                    rounded-2xl px-5 py-4 outline-none
                                    focus:ring-2 focus:ring-[#D4AF37]/30
                                    focus:border-[#D4AF37]"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* SELECTED DATE SUMMARY */}
                  {selectedDateData ? (
                    <div className="bg-white border border-[#D4AF37]/40 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-1">
                            Selected Date
                          </p>
                          <p className="font-serif font-bold text-lg text-[#2a0b06]">
                            {selectedDateData.fullDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-[#722013]">
                            {selectedDateRemainingSlots}
                          </p>
                          <p className="text-[9px] uppercase tracking-wider text-gray-400">
                            Slots Left
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-[#D4AF37] rounded-2xl p-5 text-center">
                      <CalendarDays className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
                      <p className="text-xs font-medium text-gray-500">
                        Select an available date from the calendar.
                      </p>
                    </div>
                  )}
                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={
                      !selectedDateId ||
                      isSubmittingCultural
                    }
                    className={`
                      w-full py-4 rounded-2xl font-bold
                      flex items-center justify-center gap-2
                      transition-all duration-300

                      ${
                        selectedDateId &&
                        !isSubmittingCultural

                          ? "bg-[#2a0b06] text-white hover:bg-[#722013] shadow-lg"

                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                    {isSubmittingCultural
                      ? "Submitting Request..."
                      : "Submit Request"}

                    {!isSubmittingCultural && (
                      <ArrowRight className="w-4 h-4" />
                    )}

                  </button>


                  <p className="text-[11px] text-gray-500 leading-relaxed text-center">

                    Your request remains pending until reviewed and approved by the administration.

                  </p>
                </div>
              </div>
            </div>
          </form>
          <div className="max-w-5xl mx-auto mt-10 md:mt-14">

  <div
    className="
      bg-gradient-to-br
      from-[#2a0b06]
      to-[#4a150c]
      rounded-[2rem]
      md:rounded-[3rem]
      overflow-hidden
      shadow-2xl
      border
      border-[#722013]/40
      relative
    "
  >

    {/* DECORATION */}

    <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

    <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-12">

      {/* HEADER */}

      <div className="max-w-2xl mb-8">

        <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.22em] mb-3">
          Track Your Request
        </p>

        <h3 className="text-3xl md:text-4xl font-serif font-bold text-white">
          Check Cultural Program Status
        </h3>

        <p className="text-sm md:text-base text-[#D8C3BD] leading-relaxed mt-3">
          Enter your Booking ID or registered mobile number to
          check the latest status of your Cultural Seva request.
        </p>

      </div>


      {/* SEARCH FORM */}

      <form
        onSubmit={handleCheckCulturalStatus}
        className="
          bg-white/10
          backdrop-blur-md
          border
          border-white/10
          rounded-2xl
          p-4
          md:p-5
        "
      >

        <div className="flex flex-col sm:flex-row gap-3">

          <input
            type="text"
            value={statusSearch}
            onChange={(e) => {
              setStatusSearch(e.target.value);
              setStatusError("");
              setStatusSearched(false);
              setStatusResults([]);
            }}
            placeholder="Booking ID or Mobile Number"
            className="
              flex-1
              min-w-0
              bg-white
              text-[#2a0b06]
              border
              border-white
              rounded-xl
              px-5
              py-4
              outline-none
              focus:ring-2
              focus:ring-[#D4AF37]
            "
          />

          <button
            type="submit"
            disabled={isCheckingStatus}
            className="
              sm:w-auto
              bg-gradient-to-r
              from-[#D4AF37]
              to-[#b5952f]
              text-white
              px-7
              py-4
              rounded-xl
              font-bold
              whitespace-nowrap
              hover:shadow-lg
              disabled:opacity-60
              disabled:cursor-not-allowed
              transition
            "
          >
            {isCheckingStatus
              ? "Checking..."
              : "Check Status"}
          </button>
        </div>
      </form>
                {/* ERROR */}
                {statusError && (
                  <div className="mt-5 bg-red-500/10 border border-red-400/30 rounded-2xl p-4">

                    <p className="text-sm font-medium text-red-200">
                      {statusError}
                    </p>

                  </div>

                )}


                {/* NO RESULTS */}

                {statusSearched &&
                  !isCheckingStatus &&
                  statusResults.length === 0 && (

                    <div className="mt-6 bg-white/10 border border-white/10 rounded-2xl p-6 text-center">

                      <p className="font-bold text-white">
                        No Cultural Seva request found.
                      </p>

                      <p className="text-sm text-[#D8C3BD] mt-2">
                        Please verify the Booking ID or registered mobile number.
                      </p>

                    </div>

                )}


                {/* RESULTS */}

                {statusResults.length > 0 && (

                  <div className="mt-8 space-y-5">

                    {statusResults.map((booking) => {

                      const status =
                        booking.status?.toLowerCase() || "pending";

                      const isApproved = status === "approved";

                      const isRejected = status === "rejected";

                      return (

                        <div
                          key={booking.id}
                          className="
                            bg-[#FCF8F2]
                            rounded-2xl
                            md:rounded-3xl
                            p-5
                            md:p-7
                            shadow-xl
                          "
                        >

                          {/* RESULT HEADER */}

                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#E8DCC4]">

                            <div>

                              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
                                Booking ID
                              </p>

                              <p className="font-black text-[#2a0b06] mt-1 break-all">
                                {booking.bookingId}
                              </p>

                            </div>


                            <span
                              className={`
                                self-start
                                px-4
                                py-2
                                rounded-full
                                text-xs
                                font-black
                                uppercase
                                tracking-wider

                                ${
                                  isApproved

                                    ? "bg-green-100 text-green-700"

                                    : isRejected

                                      ? "bg-red-100 text-red-700"

                                      : "bg-orange-100 text-orange-700"
                                }
                              `}
                            >

                              {isApproved
                                ? "Approved"
                                : isRejected
                                  ? "Rejected"
                                  : "Pending Approval"}

                            </span>

                          </div>


                          {/* COMMON BOOKING DETAILS */}

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 py-6">

                            <div>

                              <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
                                Devotee
                              </p>

                              <p className="font-bold text-[#2a0b06] mt-1">
                                {booking.name}
                              </p>

                            </div>


                            <div>

                              <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
                                Requested Date
                              </p>

                              <p className="font-bold text-[#2a0b06] mt-1">
                                {booking.date}
                              </p>

                            </div>


                            <div>

                              <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
                                Participation
                              </p>

                              <p className="font-bold capitalize text-[#2a0b06] mt-1">
                                {booking.participationType || "Solo"}
                              </p>

                            </div>


                            <div>

                              <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
                                Participants
                              </p>

                              <p className="font-bold text-[#2a0b06] mt-1">
                                {booking.participantCount || 1}
                              </p>

                            </div>

                          </div>


                          {/* PENDING STATUS */}

                          {!isApproved && !isRejected && (

                            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">

                              <p className="font-bold text-orange-800">
                                Your request is awaiting Admin approval.
                              </p>

                              <p className="text-sm text-orange-700/80 mt-2 leading-relaxed">
                                The requested date is not confirmed yet.
                                The administration will allocate the program time
                                and duration before approving your request.
                              </p>

                            </div>

                          )}


                          {/* APPROVED STATUS */}

                          {isApproved && (

                            <div>

                              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 md:p-6">

                                <div className="flex items-center justify-between gap-4 mb-5">

                                  <div>

                                    <p className="text-[9px] uppercase tracking-wider font-bold text-green-600">
                                      Confirmed Program Slot
                                    </p>

                                    <p className="text-xl md:text-2xl font-serif font-bold text-green-900 mt-1">

                                      {formatCulturalTime(
                                        booking.startTime
                                      )}

                                      {" — "}

                                      {formatCulturalTime(
                                        booking.endTime
                                      )}

                                    </p>

                                  </div>

                                </div>


                                <div className="grid sm:grid-cols-2 gap-4">

                                  <div className="bg-white rounded-xl p-4 border border-green-100">

                                    <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
                                      Duration
                                    </p>

                                    <p className="font-black text-[#2a0b06] mt-1">
                                      {getDurationLabel(
                                        booking.durationMinutes
                                      )}
                                    </p>

                                  </div>


                                  <div className="bg-white rounded-xl p-4 border border-green-100">

                                    <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
                                      Approved On
                                    </p>

                                    <p className="font-black text-[#2a0b06] mt-1">
                                      {formatCulturalTimestamp(
                                        booking.approvedAt
                                      )}
                                    </p>

                                  </div>

                                </div>

                              </div>

                            </div>

                          )}


                          {/* REJECTED STATUS */}

                          {isRejected && (

                            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 md:p-6">

                              <p className="text-[9px] uppercase tracking-wider font-bold text-red-600">
                                Request Status
                              </p>

                              <p className="text-xl font-serif font-bold text-red-900 mt-1">
                                Cultural Seva Request Rejected
                              </p>


                              <div className="mt-5 bg-white rounded-xl p-4 border border-red-100">

                                <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
                                  Reason for Rejection
                                </p>

                                <p className="text-sm font-medium text-gray-700 mt-2 leading-relaxed">
                                  {booking.rejectionReason ||
                                    "No rejection reason was provided."}
                                </p>

                              </div>


                              <p className="text-xs text-red-700 mt-4">
                                Rejected on:{" "}
                                <span className="font-bold">
                                  {formatCulturalTimestamp(
                                    booking.rejectedAt
                                  )}
                                </span>
                              </p>

                            </div>

                          )}

                        </div>

                      );

                    })}

                  </div>

                )}

              </div>

            </div>

          </div>
        </section>
        {/* --- 4. LATEST UPDATES (Carousel Top + Expanded Reader Bottom) --- */}
        <section id="updates" className="scroll-mt-32">
          
          {/* Header & Elegant Filter Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-6 border-b border-[#E8DCC4] pb-6">
            <div>
              <h2 className="text-4xl font-bold text-[#2a0b06] font-serif mb-3">Mutt Chronicles</h2>
              <p className="text-gray-600 font-medium">Browse the sacred journals by day, week, or month.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-[#E8DCC4]/50">
              <div className="pl-3 pr-2 py-2 text-[#D4AF37]">
                <Filter className="w-4 h-4" />
              </div>
              
              <button 
                onClick={() => handleFilterChange('all', 'all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${activeFilter.type === 'all' ? 'bg-[#722013] text-white' : 'text-gray-500 hover:bg-[#FAF6F0]'}`}
              >
                All
              </button>

              <select 
                onChange={(e) => handleFilterChange('month', e.target.value)}
                value={activeFilter.type === 'month' ? activeFilter.value : ""}
                className={`appearance-none outline-none px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors border-r border-[#E8DCC4] ${activeFilter.type === 'month' ? 'bg-[#FAF6F0] text-[#722013]' : 'text-gray-500 bg-transparent hover:bg-gray-50'}`}
              >
                <option value="">Month</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
              </select>

              <select 
                onChange={(e) => handleFilterChange('week', e.target.value)}
                value={activeFilter.type === 'week' ? activeFilter.value : ""}
                className={`appearance-none outline-none px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors border-r border-[#E8DCC4] ${activeFilter.type === 'week' ? 'bg-[#FAF6F0] text-[#722013]' : 'text-gray-500 bg-transparent hover:bg-gray-50'}`}
              >
                <option value="">Week</option>
                {[...Array(9)].map((_, i) => (
                  <option key={i} value={i + 1}>Week {i + 1}</option>
                ))}
              </select>

              <select 
                onChange={(e) => handleFilterChange('day', e.target.value)}
                value={activeFilter.type === 'day' ? activeFilter.value : ""}
                className={`appearance-none outline-none px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${activeFilter.type === 'day' ? 'bg-[#FAF6F0] text-[#722013]' : 'text-gray-500 bg-transparent hover:bg-gray-50'}`}
              >
                <option value="">Specific Day</option>
                {[...Array(60)].map((_, i) => (
                  <option key={i} value={i + 1}>Day {i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Top Section: Horizontal Carousel */}
          <div className="relative mb-12 group">
            {/* Carousel Navigation Buttons */}
            <button 
              onClick={() => scrollCarousel('left')}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-md border border-[#E8DCC4] shadow-lg text-[#722013] p-3 rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-[#FAF6F0] transition-all duration-300 hidden md:flex"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scrollCarousel('right')}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-md border border-[#E8DCC4] shadow-lg text-[#722013] p-3 rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-[#FAF6F0] transition-all duration-300 hidden md:flex"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Scrollable Container */}
            <div 
              ref={carouselRef}
              className="flex align-center gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6 pt-2 px-2"
            >
              {filteredBlogs.length === 0 ? (
                <div className="w-full py-12 text-center text-gray-400 font-medium bg-white rounded-3xl border border-dashed border-[#E8DCC4]">
                  No chronicles found for this filter.
                </div>
              ) : (
                filteredBlogs.map((blog) => {
                  const isSelected = displayBlog?.id === blog.id;
                  return (
                    <button
                      key={blog.id}
                      onClick={() => setSelectedBlog(blog)}
                      className={`min-w-[300px] w-[300px] md:min-w-[340px] md:w-[340px] text-left shrink-0 snap-start rounded-[2rem] p-4 transition-all duration-300 flex flex-col bg-white border ${
                        isSelected 
                          ? 'border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10 ring-1 ring-[#D4AF37] scale-[1.02]' 
                          : 'border-[#E8DCC4]/50 hover:border-[#722013]/30 hover:shadow-xl hover:shadow-[#722013]/5'
                      }`}
                    >
                      <div className="w-full h-40 rounded-2xl overflow-hidden mb-4 relative">
                        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-bold text-[#722013] uppercase tracking-widest shadow-sm">
                          Day {blog.day}
                        </div>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                          {blog.date}
                        </span>
                      </div>
                      <h4 className={`text-lg font-bold font-serif line-clamp-1 mb-2 ${isSelected ? 'text-[#722013]' : 'text-[#2a0b06]'}`}>
                        {blog.title}
                      </h4>
                      <p className="text-gray-500 text-xs line-clamp-2 font-medium leading-relaxed">
                        {blog.description}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Section: Expanded Reader */}
          <AnimatePresence mode="wait">
            {displayBlog && (
              <motion.div
                key={displayBlog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className=" mx-auto bg-white rounded-[1rem] p-8 md:p-12 shadow-2xl shadow-[#722013]/5 border border-[#E8DCC4]/60 relative overflow-hidden"
              >
                {/* Background flourish */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FAF6F0] to-transparent rounded-bl-full -z-10 opacity-50"></div>

                {/* Article Header */}
                <div className="text-center mb-10">
                  <div className="flex justify-center items-center gap-3 mb-6">
                    <span className="bg-[#FAF6F0] border border-[#E8DCC4] px-4 py-1.5 rounded-full text-[10px] font-bold text-[#722013] uppercase tracking-widest shadow-sm">
                      {displayBlog.date} • Day {displayBlog.day}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {displayBlog.readTime}
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-bold font-serif text-[#2a0b06] leading-tight max-w-2xl mx-auto">
                    {displayBlog.title}
                  </h3>
                </div>

                {/* Expanded Hero Image */}
                <div className="w-full h-[300px] md:h-[450px] rounded-[2rem] overflow-hidden mb-12 shadow-sm">
                  <img src={displayBlog.image} alt={displayBlog.title} className="w-full h-full object-cover" />
                </div>

                {/* Content Body */}
                <div className="prose prose-lg font-sans text-gray-600 leading-loose space-y-6 mx-auto">
                  {displayBlog.content.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                {/* Elegant Footer */}
                <div className="border-t border-[#E8DCC4] pt-8 mt-12 flex justify-center items-center gap-3">
                  <div className="w-12 h-[1px] bg-[#D4AF37]"></div>
                  <Sun className="w-5 h-5 text-[#D4AF37]" />
                  <p className="text-sm font-serif italic text-[#722013] font-bold tracking-wider">Jai Jnaneshwari</p>
                  <div className="w-12 h-[1px] bg-[#D4AF37]"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </section>

      </main>

      {/* --- PREMIUM FOOTER --- */}
      <footer className="bg-gradient-to-b from-[#3a0f08] to-[#1a0402] text-white mt-32 rounded-t-[3rem] relative overflow-hidden">
        {/* Abstract Temple Silhouette / Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl opacity-5 pointer-events-none">
          <svg viewBox="0 0 1000 300" fill="currentColor"><path d="M500 0L600 100H400L500 0Z M300 300L400 150H200L300 300Z M700 300L800 150H600L700 300Z"/></svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 grid md:grid-cols-12 gap-12 relative z-10">
          
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <Sun className="w-8 h-8 text-[#D4AF37]" />
              <h2 className="text-3xl font-bold font-serif text-[#FAF6F0] tracking-wide">Karki Mutt</h2>
            </div>
            <p className="text-[#D8C3BD] text-sm leading-relaxed max-w-sm mb-8 font-light">
              The official digital platform connecting devotees worldwide to the sacred traditions, rituals, and teachings during the holy Chaturmasya period.
            </p>
            <div className="flex gap-4">
              {/* Social Placeholders */}
              {[1, 2, 3].map(i => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-300">
                  <div className="w-4 h-4 bg-white/80 rounded-sm"></div>
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-[11px] font-bold mb-6 uppercase tracking-[0.2em] text-[#D4AF37]">Quick Links</h3>
            <ul className="space-y-4 text-sm text-[#D8C3BD] font-medium">
              {['Home', 'Book Seva', 'Live Darshana', 'Daily Schedule'].map(link => (
                <li key={link}>
                  <a href={`#${link.toLowerCase().replace(' ', '-')}`} className="hover:text-white flex items-center gap-2 group transition-colors">
                    <ChevronRight className="w-3 h-3 text-[#722013] group-hover:text-[#D4AF37] transition-colors" /> {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-[11px] font-bold mb-6 uppercase tracking-[0.2em] text-[#D4AF37]">Contact Ashram</h3>
            <ul className="space-y-5 text-sm text-[#D8C3BD]">
              <li className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span className="mt-0.5">+91 XXXXX XXXXX</span>
              </li>
              <li className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span className="mt-0.5">info@chaturmasya.org</span>
              </li>
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span className="mt-0.5 leading-relaxed">Sagara, Karnataka<br/>India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/40 relative z-10">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#D8C3BD]">
            <p>&copy; 2026 Karki Mutt. All rights reserved.</p>
            <p className="font-serif italic text-[#D4AF37] text-sm my-4 md:my-0 tracking-wide">Sarveh Bhavantu Sukhinaha</p>
            <div className="flex items-center gap-2">
              <span>Crafted with devotion by</span>
              <a href="https://elv8.works" target="_blank" rel="noreferrer" className="text-white font-bold hover:text-[#D4AF37] transition flex items-center gap-1.5">
                elv8.works
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* --- CULTURAL BOOKING MODAL (Glassmorphism) --- */}
      <AnimatePresence>
        {isModalOpen && activeSlot && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md px-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#FCF8F2] rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-white"
            >
              <div className="bg-white px-8 py-6 border-b border-[#E8DCC4] flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-bold text-2xl text-[#2a0b06]">Request Slot</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">Admin will verify and confirm via SMS.</p>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full p-2 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCulturalSubmit} className="p-8 space-y-6">
                <div className="bg-[#FAF6F0] p-5 rounded-2xl border border-[#E8DCC4] flex justify-between items-center shadow-inner">
                  <div>
                    <div className="font-bold text-[#722013] text-lg font-serif">{activeSlot.title}</div>
                    <div className="text-gray-500 text-xs mt-1 font-medium">{activeSlot.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Time Slot</div>
                    <div className="font-bold text-gray-800 text-sm">{activeSlot.time.split('-')[0]}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none text-sm transition bg-white shadow-sm font-medium"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Contact Number</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none text-sm transition bg-white shadow-sm font-medium"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-[#722013] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#5a190f] transition-all duration-300 shadow-lg shadow-[#722013]/20 flex justify-center items-center gap-2"
                  >
                    Submit Request <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper component for Quick Action Cards
const CardContent = ({ item }) => (
  <>
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FAF6F0] to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
    <div className="mb-6 bg-[#FAF6F0] p-4 rounded-2xl text-[#722013] inline-block group-hover:bg-[#722013] group-hover:text-[#D4AF37] transition-colors duration-500 shadow-inner">
      <item.icon className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif group-hover:text-[#722013] transition-colors">{item.title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed font-medium mb-4">{item.desc}</p>
    <div className="flex items-center gap-2 text-[#722013] text-xs font-bold uppercase tracking-wider opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
      Explore <ArrowRight className="w-3 h-3" />
    </div>
  </>
);

export default Home;  