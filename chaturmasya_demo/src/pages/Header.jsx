import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Sparkles, CalendarHeart } from 'lucide-react';

// Split navigation for the symmetrical desktop layout
const leftNavItems = [
  { name: 'Home', href: '/' },
  { name: 'Schedule', href: '#schedule' },
];
const rightNavItems = [
  { name: 'Live Darshan', href: '#live-darshan' },
  { name: 'Events', href: '#cultural-events' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-[#FAF6F0]/95 backdrop-blur-md shadow-md border-b border-[#D4AF37]/40 h-16' 
          : 'bg-gradient-to-b from-black/10 to-transparent h-24'
      }`}
    >
      {/* Desktop Symmetrical Layout */}
      <div className="hidden lg:grid grid-cols-3 items-center w-full max-w-7xl mx-auto h-full px-8">
        
        {/* Left Navigation */}
        <nav className="flex items-center justify-start gap-8">
          {leftNavItems.map((item) => (
            <Link
                key={item.name}
                to={item.href}
                className="relative group flex items-center gap-2 py-3"
                >
                {/* Decorative diamond */}
                <span className="
                    w-1.5 h-1.5
                    rotate-45
                    bg-[#D4AF37]
                    opacity-0
                    scale-0
                    group-hover:opacity-100
                    group-hover:scale-100
                    transition-all
                    duration-300
                " />

                <span
                    className={`
                    relative
                    text-[13px]
                    font-bold
                    tracking-[0.12em]
                    uppercase
                    transition-all
                    duration-300
                    ${
                        isScrolled
                        ? "text-[#4a150c]"
                        : "text-[#2a0b06]"
                    }
                    group-hover:text-[#8B2A18]
                    `}
                >
                    {item.name}

                    {/* Elegant underline */}
                    <span
                    className="
                        absolute
                        -bottom-2
                        left-1/2
                        w-0
                        h-[1.5px]
                        bg-gradient-to-r
                        from-transparent
                        via-[#D4AF37]
                        to-transparent
                        -translate-x-1/2
                        group-hover:w-full
                        transition-all
                        duration-500
                    "
                    />
                </span>
                </Link>
          ))}
        </nav>

        {/* Center Logo */}
        <Link 
          to="/" 
          className="flex flex-col items-center justify-center cursor-pointer group"
        >
          <div className={`rounded-full bg-gradient-to-br from-[#722013] to-[#2a0b06] flex items-center justify-center text-[#D4AF37] shadow-lg group-hover:rotate-12 transition-all duration-500 z-10 ${
            isScrolled ? 'w-10 h-10 -mb-2 shadow-none' : 'w-12 h-12 mb-1'
          }`}>
            <Sun className={isScrolled ? 'w-5 h-5' : 'w-6 h-6'} />
          </div>
          
          {/* Text hides on scroll for a cleaner top bar, focusing only on the emblem */}
          <div className={`text-center transition-all duration-500 overflow-hidden ${
            isScrolled ? 'opacity-0 h-0' : 'opacity-100 h-auto'
          }`}>
            <h1 className="text-sm font-bold text-[#2a0b06] font-serif tracking-widest whitespace-nowrap">
              Daivajna Brahmana Samaja<sup className="text-[8px] mx-0.5">®</sup>
            </h1>
            <p className="text-[9px] text-[#722013] font-bold uppercase tracking-[0.25em] mt-0.5">
              Chaturmasya Vratotsava
            </p>
          </div>
        </Link>

        {/* Right Navigation & CTA */}
        <div className="flex items-center justify-end gap-8">
          <nav className="flex gap-8">
            {rightNavItems.map((item) => (
              <Link key={item.name} to={item.href} className="relative group py-2">
                <span className={`text-sm font-semibold tracking-wide uppercase transition-colors duration-300 ${
                  isScrolled ? 'text-[#4a150c] group-hover:text-[#722013]' : 'text-gray-800 group-hover:text-[#722013]'
                }`}>
                  {item.name}
                </span>
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#D4AF37] scale-x-0 origin-center group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              </Link>
            ))}
          </nav>
          
          <Link 
            to="/book-seva" 
            className="flex items-center gap-2 bg-[#722013] text-[#D4AF37] border border-[#D4AF37]/50 px-5 py-2 rounded-none font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#4a150c] hover:border-[#D4AF37] transition-all duration-300"
          >
            <Sparkles className="w-3.5 h-3.5" /> Book Seva
          </Link>
        </div>
      </div>

      {/* Mobile & Tablet Header */}
      <div
        className={`lg:hidden flex items-center justify-between w-full h-full px-4 ${
            !isScrolled ? "pt-3" : ""
        }`}
      >
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="p-2 text-[#722013] hover:bg-[#E8DCC4]/50 rounded-full transition-colors"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#722013] to-[#4a150c] flex items-center justify-center text-[#D4AF37] shadow-sm">
            <Sun className="w-4 h-4" />
          </div>
          <div className="leading-none">
            <h1 className="text-xs font-bold text-[#2a0b06] font-serif">Daivajna Samaja</h1>
          </div>
        </Link>

        {/* Mobile quick CTA */}
        <Link to="/book-seva" className="p-2 text-[#722013] hover:bg-[#E8DCC4]/50 rounded-full transition-colors">
          <CalendarHeart className="w-6 h-6" />
        </Link>
      </div>

      {/* Mobile Fullscreen Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute top-full left-0 right-0 bg-[#FAF6F0] border-t border-[#D4AF37]/30 shadow-2xl overflow-hidden lg:hidden flex flex-col"
          >
            <nav className="flex flex-col p-6 gap-2">
              {[...leftNavItems, ...rightNavItems].map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center border-b border-[#D4AF37]/20 py-4 text-lg font-serif font-bold text-[#4a150c] hover:text-[#722013] hover:pl-4 transition-all duration-300"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <Link 
                  to="/book-seva" 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full bg-[#722013] text-[#D4AF37] border border-[#D4AF37] py-4 font-bold text-sm uppercase tracking-widest shadow-md hover:bg-[#4a150c] transition-all duration-300 flex justify-center items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" /> Book Seva Now
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}