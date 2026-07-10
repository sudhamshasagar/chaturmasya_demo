import { FaInstagram, FaYoutube, FaFacebook } from "react-icons/fa";
import { Sun, ChevronRight, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#3a0f08] to-[#1a0402] text-white mt-32 rounded-t-[3rem] relative overflow-hidden">
      {/* Decorative Silhouette */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl opacity-5 pointer-events-none">
        <svg viewBox="0 0 1000 300" fill="currentColor"><path d="M500 0L600 100H400L500 0Z M300 300L400 150H200L300 300Z M700 300L800 150H600L700 300Z"/></svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 grid md:grid-cols-12 gap-12 relative z-10">
        
        {/* Brand Section */}
        <div className="md:col-span-5">
          <div className="flex items-center gap-3 mb-6">
            <Sun className="w-8 h-8 text-[#D4AF37]" />
            <h2 className="text-3xl font-bold font-serif text-[#FAF6F0] tracking-wide">Karki Mutt</h2>
          </div>
          <p className="text-[#D8C3BD] text-sm leading-relaxed max-w-sm mb-8 font-light">
            The official digital platform connecting devotees worldwide to the sacred traditions, rituals, and teachings during the holy Chaturmasya period.
          </p>
          
          {/* Social Links */}
          <div className="flex gap-4">
            <a href="https://www.instagram.com/chaturmasya_sagara" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-300">
              <FaInstagram className="text-white text-lg" />
            </a>
            <a href="https://youtube.com/@chaturmasyasagara2026?si=le6GD49Uu9Cpw2FT" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-300">
              <FaYoutube className="text-white text-lg" />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61590712144590&mibextid=rS40aB7S9Ucbxw6v" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-300">
              <FaFacebook className="text-white text-lg" />
            </a>
          </div>
        </div>

        {/* Links */}
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

        {/* Contact */}
        <div className="md:col-span-4">
            <h3 className="text-[11px] font-bold mb-6 uppercase tracking-[0.2em] text-[#D4AF37]">Contact us</h3>
            
            {/* Map Preview Card */}
            <a 
                href="https://maps.app.goo.gl/zxphQvwBucSDnCmG8" 
                target="_blank" 
                rel="noreferrer"
                className="block mb-6 group relative overflow-hidden rounded-xl border border-white/10 hover:border-[#D4AF37] transition-all duration-300"
            >
                <div className="h-32 bg-slate-800 flex items-center justify-center relative">
                {/* Replace this div with an <img> tag if you have a screenshot */}
                <MapPin className="w-8 h-8 text-[#D4AF37] opacity-50" />
                <span className="absolute bottom-2 right-2 text-[10px] bg-black/50 px-2 py-1 rounded text-white uppercase tracking-widest">View Map</span>
                </div>
            </a>

            {/* Contact Details */}
            <ul className="space-y-5 text-sm text-[#D8C3BD]">
                <li className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <a href="tel:+919448519501" className="hover:text-white transition-colors">+91 94485 19501</a>
                </li>
                <li className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span>info@chaturmasya.org</span>
                </li>
            </ul>
            </div>
        </div>    
      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/40 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#D8C3BD]">
          <p>© 2026 Karki Mutt. All rights reserved.</p>
          <p className="font-serif italic text-[#D4AF37] text-sm my-4 md:my-0 tracking-wide">Sarveh Bhavantu Sukhinaha</p>
          <div className="flex items-center gap-2">
            <span>Crafted by</span>
            <a href="https://elv8.works" target="_blank" rel="noreferrer" className="text-white font-bold hover:text-[#D4AF37] transition">elv8.works</a>
          </div>
        </div>
      </div>
    </footer>
  );
}