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
import CBookingUser from "./CulturalProgram";
import CulturalStatusTracker from "./CulturalStatusTracker";
import Footer from "./Footer";
import LiveDarshanSection from "./LiveDarshan";
import Schedule from "./Schedule"; 

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
    category: "",
    otherCategory: "",
    groupName: "",
    address: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
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
    const category = culturalForm.category;

const finalCategory =
  category === "Others"
    ? culturalForm.otherCategory.trim()
    : category;

    if (!name) {
      alert("Please enter your full name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(contact)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!category) {
  alert("Please select a program category.");
  return;
}

if (category === "Others" && !finalCategory) {
  alert("Please enter the program category.");
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
      category: "",
      otherCategory: "",
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

const CHATURMASYA_START_DATE = new Date("2026-07-29T00:00:00+05:30");

const calculateTimeLeft = () => {
  const difference =
    CHATURMASYA_START_DATE.getTime() - new Date().getTime();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      hasStarted: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    hasStarted: false,
  };
};

const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

useEffect(() => {
  const countdownTimer = setInterval(() => {
    setTimeLeft(calculateTimeLeft());
  }, 1000);

  return () => clearInterval(countdownTimer);
}, []);

  return (
    <div className="min-h-screen bg-[#FCF8F2] font-sans text-gray-900 selection:bg-[#722013] selection:text-[#FCF8F2] overflow-x-hidden">
      
      {/* Decorative Background Elements (Temple Geometry) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] mix-blend-multiply"></div>
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#f8e5cc] to-transparent opacity-40 blur-3xl -z-10"></div>

      {/* --- TOP ADMIN BAR --- */}
      <div id="top" className="bg-[#FAF6F0] text-[#722013] py-2 px-6 text-[10px] tracking-[0.2em] uppercase font-bold flex justify-between items-center z-50 relative border-b border-[#E8DCC4]">
        <span className="flex items-center gap-2 opacity-80">
          {/* <span className="w-1.5 h-1.5 bg-[#E86A33] rounded-full"></span>  */}
           Jai Jnaneshwari
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
              <h1 className="text-xl font-bold text-[#2a0b06] font-serif tracking-wide">Daivajna Brahmana Samaja<sup className="text-[8px] mx-0.5">®</sup>, Sagara</h1>
              <p className="text-[9px] text-[#722013] font-bold uppercase tracking-[0.2em] mt-1">Chaturmasya Vratotsava</p>
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
            {/* ==================== RIGHT: COUNTDOWN + IMAGE ==================== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="lg:col-span-7 order-1 lg:order-2 relative"
      >
        {/* ==================== COUNTDOWN ==================== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-[620px] mx-auto mb-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl border border-[#E8DCC4] rounded-2xl px-4 sm:px-6 py-4 shadow-lg shadow-[#722013]/5">

            {/* Label */}
            <div className="shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#E86A33] opacity-60 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E86A33]" />
                </span>

                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#722013]">
                  Chaturmasya Begins In
                </p>
              </div>

              <p className="font-serif text-xs text-gray-500">
                29 July 2026
              </p>
            </div>

            {/* Countdown Numbers */}
            {!timeLeft.hasStarted ? (
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">

                {[
                  { value: timeLeft.days, label: "Days" },
                  { value: timeLeft.hours, label: "Hrs" },
                  { value: timeLeft.minutes, label: "Mins" },
                  { value: timeLeft.seconds, label: "Secs" },
                ].map((item, index) => (
                  <React.Fragment key={item.label}>

                    <div className="min-w-[48px] sm:min-w-[58px] text-center">
                      <p className="font-serif font-bold text-xl sm:text-2xl text-[#2a0b06] tabular-nums leading-none">
                        {String(item.value).padStart(2, "0")}
                      </p>

                      <p className="mt-1.5 text-[8px] sm:text-[9px] uppercase tracking-[0.16em] font-bold text-gray-400">
                        {item.label}
                      </p>
                    </div>

                    {index < 3 && (
                      <span className="font-serif text-lg text-[#D4AF37] -mt-4">
                        :
                      </span>
                    )}

                  </React.Fragment>
                ))}

              </div>
            ) : (
              <div className="flex items-center gap-2 bg-[#722013]/5 border border-[#722013]/10 px-4 py-2 rounded-xl">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />

                <p className="font-serif font-bold text-sm text-[#722013]">
                  Chaturmasya Vratothsava Has Commenced
                </p>
              </div>
            )}

          </div>
        </motion.div>
        {/* ==================== JNANESHWARI SHLOKA ==================== */}
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.9, delay: 0.5 }}
  className="max-w-[620px] mx-auto mb-6 px-4"
>
  <div className="text-center">

    {/* Small ornamental divider */}
    <div className="flex items-center justify-center gap-3 mb-3">
      <span className="w-10 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />

      <span className="text-[#D4AF37] text-sm">
        ॐ
      </span>

      <span className="w-10 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
    </div>

    {/* Title */}
    <p className="text-sm sm:text-base font-serif font-bold tracking-normal text-[#722013] mb-3">
      श्री ज्ञानेश्वरी श्लोकम्
    </p>
    {/* Shloka */}
    <p className="
      font-serif
      text-[#722013]
      text-base
      sm:text-lg
      md:text-xl
      leading-[1.9]
      font-medium
      max-w-[580px]
      mx-auto
    ">
      ॐ ज्ञानिनां मुक्तिदात्रिया ज्ञानदा साधकस्य सा ।
      <br className="hidden sm:block" />
      ज्ञानेश्वरी च नः पातु योगिध्येया सरस्वती ॥
    </p>

  </div>
</motion.div>

{/* ==================== EXISTING IMAGE ==================== */}
<div className="relative"></div>
        {/* ==================== EXISTING IMAGE ==================== */}
        <div className="relative">
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
        {/* --- 2. DAILY SCHEDULE (Calendar & Live Highlight) --- */}
        <Schedule/>
        <CBookingUser
          culturalDates={culturalDates}
          getRemainingSlots={getRemainingSlots}

          selectedDateId={selectedDateId}
          setSelectedDateId={setSelectedDateId}

          selectedDateData={selectedDateData}
          selectedDateRemainingSlots={selectedDateRemainingSlots}

          culturalForm={culturalForm}
          setCulturalForm={setCulturalForm}

          bookingType={bookingType}
          setBookingType={setBookingType}

          groupCount={groupCount}
          setGroupCount={setGroupCount}

          isSubmittingCultural={isSubmittingCultural}

          handleCulturalSubmit={handleCulturalSubmit}
        />
        <CulturalStatusTracker
          statusSearch={statusSearch}
          setStatusSearch={setStatusSearch}

          statusResults={statusResults}
          setStatusResults={setStatusResults}

          isCheckingStatus={isCheckingStatus}

          statusSearched={statusSearched}
          setStatusSearched={setStatusSearched}

          statusError={statusError}
          setStatusError={setStatusError}

          handleCheckCulturalStatus={handleCheckCulturalStatus}

          formatCulturalTime={formatCulturalTime}
          formatCulturalTimestamp={formatCulturalTimestamp}
          getDurationLabel={getDurationLabel}
        />
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
      <Footer/>

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