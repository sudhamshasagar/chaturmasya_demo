import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, 
  Sparkles, 
  BookHeart, 
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
  ChevronRight
} from "lucide-react";

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
  const blogs = [
    {
      id: 1,
      title: "Day 1 Chaturmasya Update",
      description: "Pujya Sri Swamiji inaugurated the Chaturmasya celebrations with special pooja and pravachana.",
      image: "https://images.pexels.com/photos/8230166/pexels-photo-8230166.jpeg",
      date: "June 4, 2026",
    },
    {
      id: 2,
      title: "Special Tulasi Archane",
      description: "Understanding the spiritual benefits and tradition behind the sacred Tulasi Archane.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
      date: "June 3, 2026",
    },
    {
      id: 3,
      title: "Annadana Seva Begins",
      description: "Devotees are invited to participate in the grand Annadana Seva throughout Chaturmasya.",
      image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800",
      date: "June 2, 2026",
    },
  ];

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
      title: "Chaturmasya.\nDeepen Sadhana.\nDiscover Yourself.",
      desc: "Welcome to the official digital portal. Participate in daily rituals, book sevas, and seek blessings from anywhere in the world.",
      img: "https://images.unsplash.com/photo-1555581938-1649219e9336?w=1200&q=80"
    },
    {
      id: 2,
      tag: "JOIN THE SPIRITUAL JOURNEY.",
      title: "Experience the\nDivine Presence.",
      desc: "Immerse yourself in spiritual discipline, study, and seva under the guidance of our revered Acharyas.",
      img: "https://images.unsplash.com/photo-1604068545802-9a3b6805b5aa?w=1200&q=80"
    }
  ];

  const [culturalSlots, setCulturalSlots] = useState([
    { id: 1, date: "July 15, 2026", time: "04:00 PM - 05:30 PM", title: "Classical Bhajan", status: "open" },
    { id: 2, date: "July 16, 2026", time: "05:00 PM - 06:30 PM", title: "Veda Parayana Reading", status: "blocked" },
    { id: 3, date: "July 18, 2026", time: "04:00 PM - 05:30 PM", title: "Satsanga Assembly", status: "open" },
    { id: 4, date: "July 20, 2026", time: "06:00 PM - 07:30 PM", title: "Youth Spiritual Discourse", status: "open" },
  ]);

  // --- 2. State & Effects ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [formData, setFormData] = useState({ name: "", contact: "" });
  const [isScrolled, setIsScrolled] = useState(false);

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

  const handleBookingRequest = (e) => {
    e.preventDefault();
    setCulturalSlots(culturalSlots.map(slot => 
      slot.id === activeSlot.id ? { ...slot, status: "requested" } : slot
    ));
    alert(`Request Sent!\nThank you, ${formData.name}. Admin will review and confirm your slot at ${formData.contact}.`);
    closeModal();
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
      <header className={`fixed top-10 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-500 ${isScrolled ? 'top-4' : ''}`}>
        <div className={`flex justify-between items-center px-6 py-4 rounded-full transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg border border-white/40' : 'bg-transparent'}`}>
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#722013] to-[#4a150c] flex items-center justify-center text-[#D4AF37] shadow-md group-hover:rotate-12 transition-transform duration-500">
              <Sun className="w-5 h-5" />
            </div>
            <div className="leading-none">
              <h1 className="text-xl font-bold text-[#2a0b06] font-serif tracking-wide">Karki Mutt</h1>
              <p className="text-[9px] text-[#722013] font-bold uppercase tracking-[0.2em] mt-1">Chaturmasya 2026</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-700">
            {['Home', 'Schedule', 'Live Darshan', 'Cultural Events'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="relative group overflow-hidden">
                <span className="group-hover:text-[#722013] transition-colors duration-300">{item}</span>
                <span className="absolute left-0 bottom-0 w-full h-[1px] bg-[#722013] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/book-seva" className="hidden sm:flex bg-gradient-to-r from-[#D4AF37] to-[#b5952f] text-white px-7 py-2.5 rounded-full font-semibold text-sm hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 items-center gap-2">
              <Sparkles className="w-4 h-4" /> Book Seva
            </Link>
          </div>
        </div>
      </header>

      {/* --- CINEMATIC HERO SECTION --- */}
      <section className="relative w-full min-h-[90vh] flex items-center pt-24 pb-12 z-10">
        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Content */}
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="lg:col-span-6 space-y-8"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm border border-[#E8DCC4] px-4 py-2 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#E86A33] animate-pulse"></span>
              <span className="text-[10px] font-bold text-[#722013] tracking-[0.2em] uppercase">Day 14 of Chaturmasya</span>
            </motion.div>
            
            <motion.h2 variants={fadeUp} className="text-5xl lg:text-7xl font-bold text-[#2a0b06] font-serif leading-[1.05] tracking-tight">
              {heroSlides[currentSlide].title.split('\n').map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </motion.h2>
            
            <motion.p variants={fadeUp} className="text-lg text-gray-600 max-w-md leading-relaxed font-medium">
              {heroSlides[currentSlide].desc}
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-wrap gap-5 pt-4">
              <a href="#live-darshan" className="bg-[#722013] text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-[#5a190f] transition shadow-xl shadow-[#722013]/20 flex items-center gap-2 group">
                <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> Watch Live
              </a>
              <Link to="/explore" className="bg-white border border-[#E8DCC4] text-[#722013] px-8 py-3.5 rounded-full font-semibold text-sm hover:border-[#722013] transition shadow-sm">
                Explore Programs
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Imagery & Floating Dashboard Cards */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="lg:col-span-6 relative h-[600px] w-full"
          >
            {/* Main Image */}
            <div className="absolute inset-4 md:inset-8 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  src={heroSlides[currentSlide].img} 
                  alt="Mutt Scenery" 
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            </div>

            {/* Floating Glassmorphism Cards */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-6 top-20 bg-white/80 backdrop-blur-xl border border-white p-4 rounded-2xl shadow-xl w-48"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#FCF8F2] rounded-lg text-[#E86A33]"><Sun className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tithi</p>
                  <p className="text-sm font-bold text-gray-900">Shukla Ekadashi</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-2 bottom-24 bg-white/80 backdrop-blur-xl border border-white p-4 rounded-2xl shadow-xl w-56"
            >
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quote of the Day</p>
              <p className="text-sm font-serif text-[#722013] italic leading-tight">"Peace is not the absence of trouble, but the presence of divinity."</p>
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute left-12 bottom-10 bg-[#722013]/90 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white"
            >
               <CloudSun className="w-8 h-8 text-[#D4AF37]" />
               <div>
                  <p className="text-xs font-medium opacity-80">Sagara Weather</p>
                  <p className="text-lg font-bold">26°C, Serene</p>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- QUICK ACTIONS (Premium Feature Cards) --- */}
      <section className="max-w-7xl mx-auto px-6 relative z-20 -mt-10 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Book Seva", desc: "Reserve sacred rituals digitally.", icon: Sparkles, link: "/book-seva" },
            { title: "Pada Pooja", desc: "Submit details for participation.", icon: BookHeart, link: "/virtual-pada-puja" },
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

        {/* --- 2. DAILY SCHEDULE (Premium Timeline) --- */}
        <section id="schedule" className="max-w-4xl mx-auto scroll-mt-32">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-[#2a0b06] font-serif mb-4"
            >
              Today's Rituals
            </motion.h2>
            <p className="text-gray-500 font-medium">Sacred timings observed in IST</p>
          </div>

          <div className="relative border-l-2 border-[#E8DCC4] ml-6 md:ml-12 space-y-12">
            {dailySchedule.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-10 md:pl-16 group"
              >
                {/* Timeline Node */}
                <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-[#FCF8F2] transition-colors duration-300 ${
                  item.status === 'ongoing' ? 'bg-[#E86A33] shadow-[0_0_10px_rgba(232,106,51,0.6)]' : 
                  item.status === 'past' ? 'bg-gray-300' : 'bg-[#D4AF37]'
                }`}></div>

                <div className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 ${
                  item.status === 'ongoing' ? 'border-[#E86A33]/30 shadow-md shadow-[#E86A33]/5 -translate-y-1' : 'border-[#E8DCC4]/50 hover:shadow-md hover:-translate-y-1'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className={`text-xl font-bold font-serif mb-1 ${item.status === 'ongoing' ? 'text-[#722013]' : 'text-gray-900'}`}>
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {item.status === 'past' ? 'Ritual Concluded' : item.status === 'future' ? 'Upcoming Ceremony' : 'Currently Resounding in the Mutt'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-[#FAF6F0] px-4 py-2 rounded-xl border border-[#E8DCC4]/50">
                      <Clock className={`w-4 h-4 ${item.status === 'ongoing' ? 'text-[#E86A33]' : 'text-gray-400'}`} />
                      <span className="text-xl font-bold text-gray-900 font-serif">{item.timePre}</span>
                      <span className="text-xs font-bold text-[#722013] tracking-widest">{item.timePost}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- 3. CULTURAL ACTIVITIES (Elegant Cards) --- */}
        <section id="cultural" className="scroll-mt-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-[#E8DCC4] pb-6">
            <div>
              <h2 className="text-4xl font-bold text-[#2a0b06] font-serif mb-3">Cultural Programs</h2>
              <p className="text-gray-600 font-medium">Immerse yourself in traditional arts and discourses.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {culturalSlots.map((slot, idx) => (
              <motion.div 
                key={slot.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8DCC4]/50 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group"
              >
                <div className={`absolute top-0 left-0 w-full h-1 ${slot.status === 'open' ? 'bg-[#D4AF37]' : slot.status === 'blocked' ? 'bg-red-400' : 'bg-blue-400'}`}></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-[#FAF6F0] p-2.5 rounded-xl">
                    <CalendarDays className="w-5 h-5 text-[#722013]" />
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full ${
                    slot.status === 'open' ? 'bg-[#D4AF37]/10 text-[#9e8022]' : 
                    slot.status === 'blocked' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {slot.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 font-serif mb-2 line-clamp-2">{slot.title}</h3>
                
                <div className="space-y-2 mt-auto mb-6 pt-4">
                  <p className="text-sm text-gray-600 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400"/> {slot.time}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400"/> {slot.date}</p>
                </div>

                {slot.status === 'open' ? (
                  <button 
                    onClick={() => openModal(slot)}
                    className="w-full bg-[#FAF6F0] text-[#722013] py-3 rounded-xl font-bold text-sm hover:bg-[#722013] hover:text-white transition-colors duration-300 flex justify-center items-center gap-2"
                  >
                    Request Booking <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button disabled className="w-full bg-gray-50 text-gray-400 py-3 rounded-xl font-bold text-sm cursor-not-allowed border border-gray-100">
                    Slot Unavailable
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- 4. LATEST UPDATES (Magazine Layout) --- */}
        <section id="updates">
           <div className="flex justify-between items-end mb-12 border-b border-[#E8DCC4] pb-6">
            <h2 className="text-4xl font-bold text-[#2a0b06] font-serif">Mutt Chronicles</h2>
            <button className="text-[#722013] font-bold text-sm hover:text-[#E86A33] hidden sm:flex items-center gap-2 transition-colors uppercase tracking-wider">
              View Journal <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Featured Article */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7 group cursor-pointer"
            >
              <div className="rounded-3xl overflow-hidden relative h-[400px] shadow-sm mb-6">
                <img src={blogs[0].image} alt={blogs[0].title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-[#722013] uppercase tracking-widest mb-3 inline-block">
                    {blogs[0].date}
                  </span>
                  <h3 className="text-3xl font-bold text-white font-serif leading-tight">{blogs[0].title}</h3>
                </div>
              </div>
              <p className="text-gray-600 text-base leading-relaxed px-2">{blogs[0].description}</p>
            </motion.div>

            {/* Smaller Articles */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              {blogs.slice(1).map((blog, idx) => (
                <motion.div 
                  key={blog.id} 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex gap-6 group cursor-pointer items-center"
                >
                  <div className="w-1/3 h-32 rounded-2xl overflow-hidden shadow-sm shrink-0">
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-1.5 block">
                      {blog.date}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 font-serif group-hover:text-[#722013] transition-colors leading-tight">
                      {blog.title}
                    </h3>
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{blog.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
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
              
              <form onSubmit={handleBookingRequest} className="p-8 space-y-6">
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