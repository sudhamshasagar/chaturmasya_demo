import React from "react";
import { motion } from "framer-motion";
import { 
  CalendarDays, 
  MapPin, 
  Download, 
  Phone, 
  QrCode, 
  Sparkles, 
  BookOpen, 
  Music, 
  Flame, 
  Flower2, 
  Sun,
  Users,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

// --- Framer Motion Variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function InvitationSection() {
  // --- Data Arrays ---
  const highlights = [
    { id: 1, title: "Pravachanas", icon: BookOpen, desc: "Daily spiritual discourses" },
    { id: 2, title: "Daily Poojas", icon: Flame, desc: "Sacred rituals & archana" },
    { id: 3, title: "Annadana", icon: Flower2, desc: "Maha prasada distribution" },
    { id: 4, title: "Bhajans", icon: Music, desc: "Evening devotional singing" },
  ];

  const specialEvents = [
    { id: 1, date: "July 4, 2026", title: "Vyasa Pooja & Sankalpa", desc: "The grand inauguration and holy vow of Chaturmasya.", isImportant: true },
    { id: 2, date: "August 15, 2026", title: "Sri Krishna Janmashtami", desc: "Midnight pooja, arghya pradana, and special bhajans.", isImportant: false },
    { id: 3, date: "September 6, 2026", title: "Ganesh Chaturthi", desc: "Special homa and pooja dedicated to Lord Ganesha.", isImportant: false },
    { id: 4, date: "October 12, 2026", title: "Seemollanghana", desc: "The concluding ceremony and Swamiji's departure.", isImportant: true },
  ];

  const sevaList = [
    { id: 1, name: "Sarva Seva", price: "₹10,000", desc: "Includes all major poojas and one day Annadana sponsor." },
    { id: 2, name: "Maha Annadana", price: "₹5,000", desc: "Sponsor the afternoon meals for devotees." },
    { id: 3, name: "Phala Panchamruta", price: "₹2,500", desc: "Sacred bathing of the deity with five nectars." },
    { id: 4, name: "Laksha Tulasi Archana", price: "₹1,000", desc: "Offering of sacred Tulasi leaves with Sahasranama." },
  ];

  const dailyPrograms = [
    { id: 1, phase: "Morning", time: "06:00 AM - 09:00 AM", activities: ["Suprabhata", "Nirmalya Visarjane", "Panchamruta Abhisheka"] },
    { id: 2, phase: "Afternoon", time: "11:30 AM - 01:30 PM", activities: ["Mahapooja", "Pravachana", "Teertha Prasada (Annadana)"] },
    { id: 3, phase: "Evening", time: "05:00 PM - 07:00 PM", activities: ["Veda Parayana", "Cultural Programs", "Special Discourses"] },
    { id: 4, phase: "Night", time: "07:30 PM - 09:00 PM", activities: ["Sandhya Vandana", "Maha Mangalarati", "Ashtavadana Seva"] },
  ];

  const committee = [
    { id: 1, name: "Sri Ramachandra Bhat", role: "President" },
    { id: 2, name: "Sri Narayana Sharma", role: "Secretary" },
    { id: 3, name: "Sri Venkatesh Rao", role: "Treasurer" },
    { id: 4, name: "Sri Krishna Prasad", role: "Chief Coordinator" },
  ];

  const contacts = [
    { id: 1, name: "Swagatha Samithi", role: "General Inquiries", phone: "+91 98765 43210" },
    { id: 2, name: "Seva Booking Desk", role: "Poojas & Donations", phone: "+91 98765 43211" },
    { id: 3, name: "Accommodation", role: "Devotee Stay", phone: "+91 98765 43212" },
  ];

  return (
    <section id="invitation" className="max-w-7xl mx-auto px-6 py-24 space-y-32">
      
      {/* --- SECTION HEADER --- */}
      <div className="text-center max-w-3xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2a0b06] font-serif mb-4">Chaturmasya 2026 Invitation</h2>
          <p className="text-gray-600 font-medium text-lg leading-relaxed">
            Participate in the sacred Chaturmasya celebrations and experience four months of devotion, seva, pravachanas, and spiritual transformation.
          </p>
        </motion.div>
      </div>

      {/* --- INVITATION OVERVIEW CARD --- */}
      <motion.div 
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
        className="relative bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-[#722013]/10 border border-[#E8DCC4] overflow-hidden text-center max-w-4xl mx-auto"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-[#D4AF37] via-[#722013] to-[#D4AF37]"></div>
        <div className="absolute -top-12 -left-12 opacity-5"><Sun className="w-64 h-64" /></div>
        <div className="absolute -bottom-12 -right-12 opacity-5"><Sun className="w-64 h-64" /></div>

        <div className="relative z-10 flex flex-col items-center">
          <Flower2 className="w-10 h-10 text-[#D4AF37] mb-6" />
          <p className="text-sm font-bold text-[#722013] uppercase tracking-[0.3em] mb-4">With the divine blessings of Lord Sri Hari</p>
          <h3 className="text-4xl md:text-5xl font-serif font-bold text-[#2a0b06] mb-6 leading-tight">
            Sri Karki Mutt<br/>Chaturmasya Vrata
          </h3>
          
          <div className="flex items-center gap-4 my-6 opacity-70">
            <div className="w-16 h-[1px] bg-[#722013]"></div>
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <div className="w-16 h-[1px] bg-[#722013]"></div>
          </div>

          <h4 className="text-2xl font-serif text-[#722013] font-bold mb-8">
            H.H. Sri Swamiji
          </h4>

          <div className="grid sm:grid-cols-2 gap-8 w-full max-w-2xl bg-[#FAF6F0] p-8 rounded-3xl border border-[#E8DCC4]/50">
            <div className="flex flex-col items-center gap-2">
              <CalendarDays className="w-6 h-6 text-[#D4AF37]" />
              <p className="font-bold text-gray-900">July 4 - Oct 12, 2026</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Shravana to Ashwayuja</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MapPin className="w-6 h-6 text-[#D4AF37]" />
              <p className="font-bold text-gray-900">Sri Karki Mutt Premises</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Sagara, Karnataka</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- INVITATION HIGHLIGHTS --- */}
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {highlights.map((item) => (
          <motion.div key={item.id} variants={fadeUp} className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8DCC4]/50 hover:shadow-xl hover:shadow-[#722013]/5 hover:-translate-y-1 transition-all duration-300 text-center group">
            <div className="mb-4 bg-[#FAF6F0] w-14 h-14 mx-auto rounded-full text-[#722013] group-hover:bg-[#722013] group-hover:text-[#D4AF37] flex items-center justify-center transition-colors duration-500">
              <item.icon className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 font-serif mb-1 group-hover:text-[#722013] transition-colors">{item.title}</h4>
            <p className="text-gray-500 text-xs font-medium">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* --- SPECIAL EVENTS TIMELINE --- */}
      <div className="space-y-12">
        <div className="text-center border-b border-[#E8DCC4] pb-6">
          <h3 className="text-3xl font-bold text-[#2a0b06] font-serif mb-2">Special Events</h3>
          <p className="text-gray-600 font-medium">Key milestones during the Chaturmasya period.</p>
        </div>
        
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialEvents.map((event) => (
            <motion.div key={event.id} variants={fadeUp} className={`relative bg-white p-6 rounded-[2rem] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${event.isImportant ? 'border border-[#D4AF37] ring-1 ring-[#D4AF37]/30' : 'border border-[#E8DCC4]/50'}`}>
              {event.isImportant && (
                <div className="absolute -top-3 left-6 bg-[#D4AF37] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  Grand Event
                </div>
              )}
              <span className="text-xs font-bold text-[#722013] uppercase tracking-widest block mb-2 mt-2">{event.date}</span>
              <h4 className="text-xl font-bold font-serif text-[#2a0b06] mb-3">{event.title}</h4>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">{event.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* --- DAILY IMPORTANT PROGRAMS --- */}
      <div className="space-y-12">
        <div className="text-center border-b border-[#E8DCC4] pb-6">
          <h3 className="text-3xl font-bold text-[#2a0b06] font-serif mb-2">Daily Schedule</h3>
          <p className="text-gray-600 font-medium">The routine followed every day during the vow.</p>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dailyPrograms.map((prog) => (
            <motion.div key={prog.id} variants={fadeUp} className="bg-[#FAF6F0] rounded-[2rem] p-6 border border-[#E8DCC4] shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#E8DCC4]">
                <h4 className="text-lg font-bold font-serif text-[#722013]">{prog.phase}</h4>
                <span className="text-[10px] font-bold bg-white text-[#D4AF37] px-2 py-1 rounded border border-[#E8DCC4] uppercase tracking-wider">{prog.time.split('-')[0].trim()}</span>
              </div>
              <ul className="space-y-3">
                {prog.activities.map((act, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-medium text-gray-700">
                    <ChevronRight className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" /> {act}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* --- SEVA PRICE LIST --- */}
      <div className="space-y-12 bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-[#E8DCC4]/50">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-[#2a0b06] font-serif mb-2">Seva Offerings</h3>
          <p className="text-gray-600 font-medium">Contribute to the divine cause and seek blessings.</p>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sevaList.map((seva) => (
            <motion.div key={seva.id} variants={fadeUp} className="bg-[#FCF8F2] p-6 rounded-3xl border border-[#E8DCC4]/60 hover:border-[#D4AF37] hover:shadow-lg hover:shadow-[#D4AF37]/10 transition-all duration-300 flex flex-col group">
              <h4 className="text-lg font-bold font-serif text-[#2a0b06] mb-1 group-hover:text-[#722013] transition-colors">{seva.name}</h4>
              <p className="text-2xl font-bold text-[#D4AF37] mb-4">{seva.price}</p>
              <p className="text-xs text-gray-600 font-medium leading-relaxed flex-grow mb-6">{seva.desc}</p>
              <Link to="/book-seva" className="w-full text-center bg-white border border-[#E8DCC4] text-[#722013] py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#722013] hover:text-white hover:border-[#722013] transition-all">
                Book Seva
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* --- ORGANIZING COMMITTEE & CONTACTS --- */}
      <div className="grid lg:grid-cols-12 gap-12">
        {/* Committee */}
        <div className="lg:col-span-7 space-y-8">
          <h3 className="text-2xl font-bold text-[#2a0b06] font-serif border-b border-[#E8DCC4] pb-4">Organizing Committee</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {committee.map((member) => (
              <div key={member.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#E8DCC4]/50 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#D4AF37] border border-[#E8DCC4]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">{member.name}</h5>
                  <p className="text-[10px] text-[#722013] font-bold uppercase tracking-widest">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contacts */}
        <div className="lg:col-span-5 space-y-8">
          <h3 className="text-2xl font-bold text-[#2a0b06] font-serif border-b border-[#E8DCC4] pb-4">Important Contacts</h3>
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E8DCC4]/50 shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">{contact.name}</h5>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{contact.role}</p>
                  <p className="text-sm font-medium text-[#722013]">{contact.phone}</p>
                </div>
                <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="w-10 h-10 rounded-full bg-[#FAF6F0] text-[#722013] hover:bg-[#722013] hover:text-[#D4AF37] flex items-center justify-center transition-colors border border-[#E8DCC4]">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- QR CODES --- */}
      <div className="flex flex-col sm:flex-row justify-center gap-6 md:gap-12 pt-8">
        {[
          { title: "Official Website", desc: "Scan to visit portal", id: "web" },
          { title: "Donation Portal", desc: "Scan for Seva contributions", id: "donate" }
        ].map((qr) => (
          <div key={qr.id} className="bg-white p-6 rounded-3xl border border-[#E8DCC4]/50 shadow-sm flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
            <div className="w-32 h-32 bg-[#FAF6F0] rounded-2xl flex items-center justify-center mb-4 border border-[#E8DCC4]">
              <QrCode className="w-12 h-12 text-[#D4AF37]" />
            </div>
            <h5 className="font-bold text-[#2a0b06] font-serif">{qr.title}</h5>
            <p className="text-xs text-gray-500 font-medium">{qr.desc}</p>
          </div>
        ))}
      </div>

      {/* --- DOWNLOAD INVITATION CTA --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
        className="bg-gradient-to-br from-[#2a0b06] to-[#4a150c] rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10">
          <BookOpen className="w-12 h-12 text-[#D4AF37] mx-auto mb-6" />
          <h3 className="text-3xl md:text-5xl font-bold font-serif text-[#FAF6F0] mb-4">Download Official Invitation</h3>
          <p className="text-[#D8C3BD] font-medium mb-10 max-w-xl mx-auto">
            Read the complete Chaturmasya 2026 invitation booklet containing detailed schedules, sankalpa information, and messages from the Swamiji.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-gradient-to-r from-[#D4AF37] to-[#b5952f] text-white px-8 py-4 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:scale-105 transition-all duration-300 flex justify-center items-center gap-2">
              <Download className="w-5 h-5" /> Kannada PDF
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold text-sm hover:scale-105 transition-all duration-300 flex justify-center items-center gap-2">
              <Download className="w-5 h-5 text-[#D4AF37]" /> English PDF
            </button>
          </div>
        </div>
      </motion.div>

      {/* --- BOTTOM CTA (Pre-Footer) --- */}
      <div className="text-center pt-16 border-t border-[#E8DCC4]">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2a0b06] font-serif mb-8">Become a part of this sacred Chaturmasya.</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/book-seva" className="bg-gradient-to-r from-[#D4AF37] to-[#b5952f] text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105 transition-all duration-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Book Seva
          </Link>
          <Link to="/virtual-pada-puja" className="bg-[#722013] text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-[#5a190f] shadow-lg shadow-[#722013]/20 hover:scale-105 transition-all duration-300 flex items-center gap-2">
            <Flower2 className="w-5 h-5" /> Virtual Pada Puja
          </Link>
          <button className="bg-white border border-[#E8DCC4] text-[#722013] px-8 py-3.5 rounded-full font-semibold text-sm hover:border-[#722013] hover:scale-105 transition-all duration-300 flex items-center gap-2">
            <Download className="w-5 h-5" /> Get Invitation
          </button>
        </div>
      </div>

    </section>
  );
}