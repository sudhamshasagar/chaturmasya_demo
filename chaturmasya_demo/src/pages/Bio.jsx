import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Sun, BookOpen, Crown, Heart, Image as ImageIcon, 
  X, ChevronLeft, ChevronRight, Share2, MessageSquare, Send, MoreHorizontal, ArrowRight
} from "lucide-react";

/* ============================================================
   DATA: GURUS & THEIR JOURNEYS
============================================================ */
const GURUS = [
  {
    id: "sachhidanand",
    name: "Sri Sri Sachhidanand Jnaneshwar Bharati Mahaswami",
    shortName: "Sri Sri Sachhidanand Jnaneshwar Bharati Mahaswami",
    title: "Present Peethadhipati",
    dp: "/i66.png",
    epilogue: {
      text1: "Irrespective of caste, all can visit the Math and seek blessings. Whosoever receives a blessing from Sri feels a strange, uncommon divine experience.",
      text2: "\"He is the eternal strength of Divine light descended in human form. Under his heavenly guidance, Sri Math and the community will prosper.\""
    },
    chapters: [
      {
        id: "birth",
        year: "1977 - 1984",
        short: "Divine Spark",
        title: "The Divine Spark",
        content: (
          <div className="space-y-4 text-sm md:text-base text-stone-700 font-serif leading-relaxed">
            <p>
              In 1977, a great soul destined to lead the Daivajna Brahmin community took birth in Karki. Born to Vedmurthy Ramachandra Mahableshwar Bhat and Smt. Tarabai, the child was named <strong>Ramesh</strong> without much pomp or glory.
            </p>
            <p>
              Shining with brilliance from birth, elders predicted a great future. While other children played, he was deeply involved in meditation, constantly chanting the Gayatri mantra, and assisting his father in religious activities—silently preparing for his monumental destiny.
            </p>
          </div>
        ),
      },
      {
        id: "sanyas",
        year: "1985 - 1986",
        short: "Sanyas",
        title: "Sacred Calling & Sanyas",
        content: (
          <div className="space-y-4 text-sm md:text-base text-stone-700 font-serif leading-relaxed">
            <p>
              At just 8 years old, his inner strength was recognized, and he was selected as the future Swamiji of the first Daivajna Brahmin Math. On June 27, 1985, his thread ceremony was held at the Darbar Hall in Udupi, blessed by Sri Pejavar Mathadhish with the Sri Krishna mantropadesh.
            </p>
            <p>
              In April 1986, he received Sanyas Deeksha from Srimad Jagadguru Madabhinvoddandh Nrasinh Bharati Swamiji of the Hampi Virupaksha Vidyaranya Peetha, and was reverently named <strong>Sri Sri Sacchidanand Jnaneshwar Swami</strong>.
            </p>
          </div>
        ),
      },
      {
        id: "education",
        year: "1986 - 1994",
        short: "Wisdom",
        title: "Pursuit of Wisdom",
        content: (
          <div className="space-y-4 text-sm md:text-base text-stone-700 font-serif leading-relaxed">
            <p>
              To master the Vedas and Upanishads, Sri Swamiji joined the Sri Madjagadguru Sri Shankaracharya Sanskrit Pathashala in Dharwad. Under Brahmarshi Balachandra Shastriji, his incomparable intelligence astonished scholars.
            </p>
            <blockquote className="border-l-4 border-amber-600 pl-4 py-2 my-4 text-stone-900 italic font-medium bg-amber-50 rounded-r-lg">
              "We have given education to many Peethadhipatis. But it is rare to see a student like Sri Sri Sacchidanand Jnaneshawr Swamiji who is extraordinary. We are very proud of him."
            </blockquote>
            <p>
              He continued advanced studies under Vidvan Narayan Shastri Bacchan before returning to Durvapur to assume Math responsibilities.
            </p>
          </div>
        ),
      },
      {
        id: "ascension",
        year: "1998 - Present",
        short: "Pattabhishek",
        title: "Pattabhishek & Unification",
        content: (
          <div className="space-y-4 text-sm md:text-base text-stone-700 font-serif leading-relaxed">
            <p>
              May 18, 1998, marked a historic day as Sri Sri Bharati Theerth Mahaswamiji of Shrangeri Dakshinmnay Sharada Peeth performed the Pattabhishek ceremony, incarnating him as <strong>Sri Sri Sacchidanand Jnaneshwar Bharati Mahaswami</strong>.
            </p>
            <p>
              He has traveled extensively across Goa, Kerala, Maharashtra, and Tamil Nadu, uniting the Daivajna Brahmin community. Fluent in Sanskrit, Kannada, Konkani, Marathi, Hindi, and English, his majestic appearance and humble words draw thousands of devotees everywhere.
            </p>
          </div>
        ),
      }
    ],
    album: [
      { id: 101, title: "Divine Darshan", img: "/i11.jpg" },
      { id: 102, title: "Guiding Devotees", img: "/i22.jpg" },
      { id: 103, title: "Morning Rituals", img: "/i33.jpg" },
      { id: 104, title: "Community Address", img: "/i44.jpg" },
      { id: 105, title: "Special Puja", img: "/i55.jpg" },
    ]
  },
  // {
  //   id: "previous_swamiji",
  //   name: "Sri Sri Second Swamiji (Placeholder)",
  //   shortName: "Senior Swamiji",
  //   title: "Previous Peethadhipati",
  //   dp: "https://images.unsplash.com/photo-1544257121-a47738b812ac?auto=format&fit=crop&q=80&w=300&h=300", // Replace with Swamiji DP
  //   epilogue: {
  //     text1: "A beacon of infinite compassion, his grace laid the foundation for the flourishing of the Math and its devotees.",
  //     text2: "\"His ascetic life and profound penance continue to illuminate our path like an eternal flame.\""
  //   },
  //   chapters: [
  //     {
  //       id: "early_life_2",
  //       year: "Early Years",
  //       short: "Beginnings",
  //       title: "The Auspicious Beginning",
  //       icon: <Sun className="w-4 h-4" />,
  //       content: (
  //         <div className="space-y-4 text-sm md:text-base text-stone-700 font-serif leading-relaxed">
  //           <p>[Replace with actual biography text for the second Swamiji. This tab is ready for your production data.]</p>
  //           <p>His early years were marked by an extraordinary inclination towards spirituality, distancing himself from worldly attachments to seek the ultimate truth.</p>
  //         </div>
  //       ),
  //     },
  //     {
  //       id: "sanyas_2",
  //       year: "Ascetic Era",
  //       short: "Renunciation",
  //       title: "Embracing Renunciation",
  //       icon: <Sparkles className="w-4 h-4" />,
  //       content: (
  //         <div className="space-y-4 text-sm md:text-base text-stone-700 font-serif leading-relaxed">
  //           <p>[Replace with actual text]. He embraced Sanyas Deeksha, dedicating his entire existence to the welfare of humanity and the preservation of Sanatan Dharma.</p>
  //         </div>
  //       ),
  //     }
  //   ],
  //   album: [
  //     { id: 201, title: "Historical Archival Photo", likes: 540, imgSig: 70 },
  //     { id: 202, title: "Addressing devotees", likes: 320, imgSig: 80 },
  //     { id: 203, title: "Vintage rituals", likes: 410, imgSig: 90 },
  //     { id: 204, title: "Old Math Sanctum", likes: 215, imgSig: 100 },
  //     { id: 205, title: "Pilgrimage journey", likes: 388, imgSig: 110 },
  //     { id: 206, title: "Blessing the crowd", likes: 490, imgSig: 120 },
  //   ]
  // }
];

/* ============================================================
   ALBUM POST MODAL COMPONENT
============================================================ */
const AlbumPostModal = ({ album, initialIndex, onClose, guruName, guruDp }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");

  const post = album[currentIndex];
  const imageUrl = post.img;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrentIndex((prev) => Math.min(prev + 1, album.length - 1));
      if (e.key === "ArrowLeft") setCurrentIndex((prev) => Math.max(prev - 1, 0));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, album.length]);

  useEffect(() => {
    setLiked(false);
    setCommentText("");
  }, [currentIndex]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[100] bg-stone-900/90 backdrop-blur-sm flex items-center justify-center p-0 md:p-6 lg:p-12"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative max-w-6xl max-h-[90vh] flex items-center justify-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/40 backdrop-blur text-white rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {currentIndex > 0 && (
          <button
            onClick={() => setCurrentIndex((i) => i - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 rounded-full text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <img
          src={imageUrl}
          alt={post.title}
          className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl"
        />

        {currentIndex < album.length - 1 && (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 rounded-full text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};


/* ============================================================
   MAIN COMPONENT: COMPACT PROFILE DASHBOARD
============================================================ */
export default function Biographies() {
  const [activeGuruIndex, setActiveGuruIndex] = useState(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [openImageIndex, setOpenImageIndex] = useState(null);

  // Reset chapter when guru changes
  useEffect(() => { setActiveChapterIndex(0); }, [activeGuruIndex]);

  const currentGuru = GURUS[activeGuruIndex];
  const currentChapter = currentGuru.chapters[activeChapterIndex];

  return (
    <div className="w-full bg-stone-50 font-sans text-stone-900 py-12 md:py-20 my-8 md:my-12 flex flex-col items-center selection:bg-amber-100 selection:text-amber-900">
      
      <div className="max-w-6xl w-full px-4 md:px-8 flex flex-col items-center">
        
        {/* --- MASTER GURU TOGGLE --- */}
        <div className="flex flex-wrap justify-center gap-2 bg-stone-200/50 p-2 rounded-3xl w-full mb-8">
          {GURUS.map((guru, idx) => {
            const isActive = activeGuruIndex === idx;
            return (
              <button
                key={guru.id}
                onClick={() => setActiveGuruIndex(idx)}
                className={`relative w-full sm:w-auto px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                  isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="masterTab" 
                    className="absolute inset-0 bg-white rounded-full shadow-sm border border-stone-200/50"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{guru.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* --- MAIN SPLIT DASHBOARD --- */}
        <div className="w-full bg-white border border-stone-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col lg:flex-row relative">
          
          {/* LEFT: PROFILE & BIOGRAPHY (Internal scroll limits height) */}
          <div className="w-full lg:w-[60%] flex flex-col border-b lg:border-b-0 lg:border-r border-stone-100 relative">
            
            {/* Background Banner for DP */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-stone-200/60 to-amber-100/40 z-0" />

            {/* Profile Header (DP + Name) */}
            <div className="pt-12 px-6 md:px-8 pb-4 relative z-10 border-b border-stone-100 bg-white/50 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 md:gap-6">
                
                {/* DP / Profile Picture */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-stone-100">
                    <img src={currentGuru.dp} alt={currentGuru.shortName} className="w-full h-full object-contain bg-stone-100"/>
                  </div>
                  <div className="absolute bottom-1 right-1 bg-amber-600 rounded-full p-1.5 border-2 border-white shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Name & Title */}
                <div className="pb-1 sm:pb-3">
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 leading-tight">
                    {currentGuru.name.split("Bharati")[0]}
                    <span className="italic text-amber-700">{currentGuru.name.split("Bharati")[1] ? `Bharati${currentGuru.name.split("Bharati")[1]}` : ""}</span>
                  </h1>
                  <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mt-1">
                    {currentGuru.title}
                  </p>
                </div>
              </div>

              {/* Chapter Tabs */}
              <div className="grid grid-cols-2 lg:flex gap-2 mt-6">
                {currentGuru.chapters.map((chapter, idx) => {
                  const isActive = activeChapterIndex === idx;
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => setActiveChapterIndex(idx)}
                      className={`w-full lg:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${
                        isActive ? "bg-stone-900 text-white shadow-md" : "bg-stone-100/80 text-stone-500 hover:bg-stone-200"
                      }`}
                    >
                      {chapter.icon}
                      {chapter.short}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Biography Content Area */}
            <div className="flex-1 overflow-y-auto hide-scrollbar p-6 md:p-8 bg-white min-h-[300px] lg:h-[350px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentChapter.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest bg-amber-50 border border-amber-100 px-2 py-1 rounded">
                      {currentChapter.year}
                    </span>
                    <div className="h-px flex-1 bg-stone-100" />
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900 mb-4">
                    {currentChapter.title}
                  </h3>
                  {currentChapter.content}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: EPILOGUE & MICRO-GALLERY */}
          <div className="w-full lg:w-[40%] flex flex-col bg-stone-50/50">
            
            {/* Epilogue Block */}
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-center border-b border-stone-100">
              <Heart className="w-6 h-6 text-amber-600 mb-4" />
              <p className="text-stone-800 text-sm md:text-base font-serif leading-relaxed mb-4">
                {currentGuru.epilogue.text1}
              </p>
              <p className="text-stone-500 text-sm font-serif italic border-l-2 border-amber-300 pl-3">
                {currentGuru.epilogue.text2}
              </p>
            </div>

            {/* Micro Gallery (Dense Grid) */}
            <div className="p-6 md:p-8 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-700" /> Gallery
                </h3>
                <button 
                  onClick={() => setOpenImageIndex(0)}
                  className="text-[10px] font-bold text-stone-500 hover:text-stone-900 uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* 3x2 Grid perfectly fits 6 images without taking up much vertical space */}
              <div className="grid grid-cols-3 gap-2">
                {currentGuru.album.slice(0, 6).map((post, idx) => (
                  <button 
                    key={post.id} 
                    onClick={() => setOpenImageIndex(idx)}
                    className="group relative w-full aspect-square bg-stone-100 rounded-lg overflow-hidden cursor-pointer"
                  >
                    <img 
                      src={post.img}
                      alt={`Album ${post.id}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <ImageIcon className="w-4 h-4 text-white drop-shadow" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ALBUM POST MODAL */}
      <AnimatePresence>
        {openImageIndex !== null && (
          <AlbumPostModal 
            album={currentGuru.album}
            guruName={currentGuru.shortName}
            guruDp={currentGuru.dp}
            initialIndex={openImageIndex} 
            onClose={() => setOpenImageIndex(null)} 
          />
        )}
      </AnimatePresence>

      <style>{`
        /* Internal thin scrollbar for elegant content scrolling */
        .hide-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .hide-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .hide-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .hide-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}