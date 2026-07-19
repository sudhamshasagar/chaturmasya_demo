import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  collectionGroup,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Loader2,
  Play,
  Sun,
  MessageCircleCheck,
  Send,
  Calendar,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Copy,
  Check,
  Heart,
  MessageSquare,
} from "lucide-react";

/* ============================================================
   CONFIG
============================================================ */
const PHASES = [
  { id: "before", shortLabel: "Before", label: "Before Chaturmasya" },
  { id: "during", shortLabel: "Journal", label: "During Chaturmasya" },
  { id: "legacy", shortLabel: "Legacy", label: "Legacy" },
];

/* ============================================================
   HELPERS
============================================================ */
const getYouTubeEmbedUrl = (url) => {
  if (!url) return "";
  try {
    const p = new URL(url);
    if (p.hostname.includes("youtube.com")) {
      const v = p.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (p.pathname.includes("/embed/")) return url;
      if (p.pathname.includes("/shorts/")) {
        const id = p.pathname.split("/shorts/")[1]?.split("/")[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    }
    if (p.hostname.includes("youtu.be")) {
      const id = p.pathname.replace("/", "").split("?")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return "";
  } catch {
    return "";
  }
};

const getBlogDate = (blog) => {
  const ts = blog?.createdAt || blog?.updatedAt;
  if (ts?.toDate) {
    try { return ts.toDate(); } catch { return null; }
  }
  if (blog?.date) {
    const d = new Date(blog.date);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

const formatBlogDate = (blog) => {
  if (blog?.date) return blog.date;
  const d = getBlogDate(blog);
  if (!d) return "";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const formatCommentDate = (ts) => {
  if (!ts?.toDate) return "";
  try {
    return ts.toDate().toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return ""; }
};

/* ============================================================
   MEDIA COMPONENTS
============================================================ */
const VideoPlayer = ({ url, title }) => {
  if (!url) return null;
  const yt = getYouTubeEmbedUrl(url);
  if (yt) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-md border border-[#E8DCC4]">
        <iframe
          src={yt}
          title={title || "video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }
  return (
    <video src={url} controls className="w-full max-h-[400px] rounded-xl bg-black shadow-md border border-[#E8DCC4]">
      Your browser does not support video playback.
    </video>
  );
};

const ArticleImage = ({ src, alt }) => {
  if (!src) return null;
  return (
    <div className="w-full flex justify-center my-6">
      <img
        src={src}
        alt={alt || ""}
        loading="lazy"
        className="block w-auto max-w-full h-auto max-h-[50vh] object-contain rounded-xl shadow-sm border border-[#E8DCC4]"
      />
    </div>
  );
};

/* ============================================================
   SHARE MENU
============================================================ */
const ShareMenu = ({ blog, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}#blog-${blog.id}`
    : "";
  const shareTitle = blog.title || "Mutt Chronicles";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return ( 
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-full mt-2 z-[9999] w-48 bg-white border border-[#E8DCC4] rounded-xl shadow-xl p-2 pointer-events-auto"
    >
      <button
        type="button"
        onClick={copy}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#FAF6F0] text-sm text-[#2a0b06] transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[#722013]" />}
        <span className="font-bold">{copied ? "Copied!" : "Copy Link"}</span>
      </button>
    </motion.div>
  );
};

/* ============================================================
   GLOBAL COMMENTS BAR (Bottom of screen)
============================================================ */
const GlobalComments = () => {
  const [comments, setComments] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Fetch global comments using collectionGroup
    const q = query(
      collectionGroup(db, "comments"),
      orderBy("createdAt", "desc"),
      limit(15)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error("Global Comments error:", err)
    );
    return () => unsub();
  }, []);

  if (comments.length === 0) return null;

  return (
    <div className="w-full h-[140px] shrink-0 border-t border-[#E8DCC4] bg-white flex flex-col justify-center px-4 md:px-8">
      <div className="flex items-center gap-2 mb-3 px-2">
        <MessageSquare className="w-4 h-4 text-[#722013]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#722013]">
          Recent Devotee Reflections
        </span>
      </div>
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory items-center pb-2"
      >
        {comments.map((c) => (
          <div 
            key={c.id} 
            className="snap-start shrink-0 w-[280px] md:w-[320px] bg-[#FAF6F0] border border-[#E8DCC4] rounded-xl p-3 shadow-sm flex flex-col justify-between h-[80px]"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-bold text-xs text-[#2a0b06] truncate">{c.name}</p>
              <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] shrink-0">
                {formatCommentDate(c.createdAt)}
              </span>
            </div>
            <p className="text-xs text-[#5a5046] line-clamp-1 italic font-serif mb-1">"{c.message}"</p>
            <p className="text-[9px] font-bold uppercase text-[#722013] truncate">
              On: {c.blogTitle || "Chronicle"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   COMMENT INPUT FOR MODAL
============================================================ */
const CommentInput = ({ blogId, blogTitle }) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    try {
      setSubmitting(true);
      await addDoc(collection(db, "blogs", blogId, "comments"), {
        name: name.trim().slice(0, 60),
        message: message.trim().slice(0, 1000),
        blogTitle: blogTitle,
        createdAt: serverTimestamp(),
      });
      setMessage("");
      setName("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#FAF6F0] border border-[#E8DCC4] rounded-xl p-4 shadow-sm mt-8 mb-8">
      <h4 className="font-serif font-bold text-lg text-[#2a0b06] mb-3">Share a Reflection</h4>
      {success ? (
        <div className="text-sm font-bold text-green-700 flex items-center gap-2 py-4">
          <Check className="w-5 h-5" /> Reflection shared successfully!
        </div>
      ) : (
        <>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            maxLength={60}
            className="w-full bg-white border border-[#E8DCC4] pb-2 pt-2 px-3 mb-3 text-sm outline-none focus:border-[#722013] transition-colors rounded-lg"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message..."
            rows={2}
            maxLength={1000}
            className="w-full bg-white border border-[#E8DCC4] p-3 text-sm outline-none resize-none rounded-lg focus:border-[#722013]"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-bold">
              {message.length}/1000
            </span>
            <button
              type="submit"
              disabled={submitting || !name || !message}
              className="inline-flex items-center gap-2 bg-[#722013] hover:bg-[#5a180e] disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-sm"
            >
              {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Submit
            </button>
          </div>
        </>
      )}
    </form>
  );
};

/* ============================================================
   POPUP MODAL (Split Screen: Left Fixed, Right Paginated)
============================================================ */
const BlogPopup = ({ blog, onClose, activePhase }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likes || 0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLiked(localStorage.getItem(`liked_${blog.id}`) === "true");
    }
  }, [blog.id]);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikesCount((prev) => prev + 1);
    localStorage.setItem(`liked_${blog.id}`, "true");
    try {
      const ref = doc(db, "blogs", blog.id);
      await updateDoc(ref, { likes: increment(1) });
    } catch (err) {
      console.error("Like error", err);
    }
  };

  // Build Pages specifically for the Right Side
  const pages = useMemo(() => {
    const list = [{ kind: "intro" }];
    const validSections = (blog?.sections || []).filter(
      (s) => s.heading || s.content || s.description || s.images?.length || s.video
    );
    validSections.forEach((s) => list.push({ kind: "section", section: s }));
    if (!validSections.length && blog?.content) {
      list.push({
        kind: "section",
        section: { content: blog.content.split("\n\n").filter(Boolean).map((p) => `<p>${p}</p>`).join("") },
      });
    }
    return list;
  }, [blog]);

  const totalPages = pages.length;
  const goPrev = () => setPageIndex((p) => Math.max(0, p - 1));
  const goNext = () => setPageIndex((p) => Math.min(totalPages - 1, p + 1));

  const coverImage = blog.coverMedia?.type === "image" ? blog.coverMedia?.url : blog.image || "";
  const current = pages[pageIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 md:p-6 lg:p-12"
    >
      {/* Modal Container */}
      <motion.div
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full h-full max-w-[1200px] bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-[#E8DCC4]"
      >
        {/* LEFT SIDE (Fixed Info) / TOP SIDE on Mobile */}
        <div className="relative w-full md:w-[40%] h-[30vh] md:h-full shrink-0 bg-[#FAF6F0] flex flex-col border-b md:border-b-0 md:border-r border-[#E8DCC4]">
          {coverImage ? (
            <div className="absolute inset-0 z-0">
              <img src={coverImage} alt={blog.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a0b06]/90 via-[#2a0b06]/40 to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#FDFBF7]">
              <BookOpen className="w-20 h-20 text-[#D4AF37]/30" />
            </div>
          )}

          {/* Mobile Close Button Overlay */}
          <button onClick={onClose} className="md:hidden absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white">
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 mt-auto p-6 md:p-10 text-white flex flex-col justify-end h-full">
            {blog.category && (
              <span className="w-max bg-[#D4AF37] text-[#2a0b06] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 shadow-sm">
                {blog.category}
              </span>
            )}
            
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-white/80 mt-2">
              <span>{formatBlogDate(blog)}</span>
              {blog.day && <span>Day {blog.day}</span>}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Paginated Content) / BOTTOM SIDE on Mobile */}
        <div className="flex-1 flex flex-col bg-[#FDFBF7] relative h-[70vh] md:h-full">
          {/* Header Actions (Desktop) */}
          <div className="shrink-0 h-16 border-b border-[#E8DCC4] px-4 md:px-8 flex items-center justify-end gap-3 bg-white">
            <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${liked ? "bg-[#722013]/10 border-[#722013] text-[#722013]" : "bg-white border-[#E8DCC4] text-[#5a5046] hover:bg-[#FAF6F0]"}`}>
              <Heart className={`w-4 h-4 ${liked ? "fill-[#722013]" : ""}`} />
              <span className="text-xs font-bold">{likesCount}</span>
            </button>
            <div className="relative">
              <button onClick={() => setShowShare(!showShare)} className="p-2 rounded-lg border border-[#E8DCC4] bg-white text-[#5a5046] hover:bg-[#FAF6F0] transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <AnimatePresence>{showShare && <ShareMenu blog={blog} onClose={() => setShowShare(false)} />}</AnimatePresence>
            </div>
            <button onClick={onClose} className="hidden md:flex p-2 rounded-lg bg-[#722013] text-white hover:bg-[#5a180e] transition-colors ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content Viewport */}
          <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 hide-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={pageIndex}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl mx-auto w-full"
              >
                {current.kind === "intro" ? (
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-[#2a0b06] mb-4">Introduction</h3>
                    <div className="w-12 h-[2px] bg-[#D4AF37] mb-6" />
                    {blog.description && (
                      <p className="text-[#5a5046] text-lg leading-relaxed font-serif italic mb-8">
                        "{blog.description}"
                      </p>
                    )}
                    {blog.coverMedia?.type === "video" && blog.coverMedia?.url && (
                      <VideoPlayer url={blog.coverMedia.url} title={blog.title} />
                    )}
                  </div>
                ) : (
                  <div>
                    {current.section.heading && (
                      <div className="mb-6">
                        <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#2a0b06] mb-4">
                          {current.section.heading}
                        </h3>
                        <div className="w-12 h-[2px] bg-[#D4AF37]" />
                      </div>
                    )}
                    {(current.section.content || current.section.description) && (
                      <div
                        className="blog-rich-content"
                        dangerouslySetInnerHTML={{ __html: current.section.content || current.section.description || "" }}
                      />
                    )}
                    {current.section.images?.length > 0 && (
                      <div className={`mt-8 grid gap-4 ${current.section.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                        {current.section.images.map((img, i) => (
                          <img key={i} src={img} alt="content" className="w-full rounded-xl border border-[#E8DCC4] shadow-sm" />
                        ))}
                      </div>
                    )}
                    {current.section.video && (
                      <div className="mt-8">
                        <VideoPlayer url={current.section.video} />
                      </div>
                    )}
                  </div>
                )}
                
                {/* Show Comment input on the last page of content */}
                {pageIndex === totalPages - 1 && (
                  <CommentInput blogId={blog.id} blogTitle={blog.title} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Side Footer (Pagination) */}
          <div className="shrink-0 h-16 border-t border-[#E8DCC4] bg-white px-4 md:px-8 flex items-center justify-between">
            <button onClick={goPrev} disabled={pageIndex === 0} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FAF6F0] border border-[#E8DCC4] text-[#722013] text-xs font-bold uppercase tracking-widest disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {pageIndex + 1} / {totalPages}
            </span>
            <button onClick={goNext} disabled={pageIndex === totalPages - 1} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FAF6F0] border border-[#E8DCC4] text-[#722013] text-xs font-bold uppercase tracking-widest disabled:opacity-30">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ============================================================
   CAROUSEL CARD
============================================================ */
const BlogCard = ({ blog, onOpen }) => {
  const cover = (blog.coverMedia?.type === "image" && blog.coverMedia?.url) || blog.image || "";
  const isVideo = blog.coverMedia?.type === "video";
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLiked(localStorage.getItem(`liked_${blog.id}`) === "true");
    }
  }, [blog.id]);

  return (
    <motion.button
      type="button"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      onClick={() => onOpen(blog)}
      className="group text-left bg-white rounded-2xl overflow-hidden flex flex-col h-full w-[280px] md:w-[320px] shrink-0 border border-[#E8DCC4] shadow-sm hover:shadow-xl transition-shadow"
    >
      <div className="relative bg-[#FAF6F0] h-[180px] w-full border-b border-[#E8DCC4]">
        {cover ? (
          <img src={cover} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#2a0b06]">
            {isVideo ? <Play className="w-10 h-10 mb-2 opacity-50" /> : <BookOpen className="w-10 h-10 opacity-30" />}
          </div>
        )}
        {blog.category && (
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 text-[9px] font-bold text-[#722013] uppercase tracking-widest shadow-sm rounded-md">
            {blog.category}
          </span>
        )}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2 py-1 text-[10px] font-bold text-[#722013] shadow-sm rounded-md flex items-center gap-1">
          <Heart className={`w-3 h-3 ${liked ? "fill-[#722013]" : ""}`} /> {blog.likes || 0}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 bg-white">
        <h4 className="font-serif font-bold text-[#2a0b06] leading-snug mb-2 text-lg line-clamp-2">
          {blog.title}
        </h4>
        <p className="text-[#5a5046] text-xs leading-relaxed line-clamp-2 font-serif italic mb-4">
          {blog.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#E8DCC4]/50">
           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
             {formatBlogDate(blog)}
           </span>
           <div className="w-6 h-6 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#722013] group-hover:bg-[#722013] group-hover:text-white transition-colors">
              <ArrowRight className="w-3 h-3" />
           </div>
        </div>
      </div>
    </motion.button>
  );
};

/* ============================================================
   MAIN PAGE (Single screen height layout)
============================================================ */
const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [activePhase, setActivePhase] = useState("before");
  const [searchTerm, setSearchTerm] = useState("");
  const [openBlog, setOpenBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "blogs"), where("published", "==", true));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => {
          const da = getBlogDate(a)?.getTime() || 0;
          const db_ = getBlogDate(b)?.getTime() || 0;
          return db_ - da;
        });
        setBlogs(list);
        setLoading(false);
      },
      (err) => {
        console.error("Blogs error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const filteredBlogs = useMemo(() => {
    const phaseBlogs = blogs.filter((b) => b.phase === activePhase);
    const search = searchTerm.trim().toLowerCase();
    if (!search) return phaseBlogs;
    return phaseBlogs.filter((b) => {
      const hay = [b.title, b.description, b.category].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(search);
    });
  }, [blogs, activePhase, searchTerm]);

  return (
    <section className="h-screen w-full flex flex-col bg-[#FDFBF7] overflow-hidden text-[#2a0b06]">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .blog-rich-content { font-family: Georgia, serif; font-size: 1.05rem; line-height: 1.8; color: #3f3a34; }
        .blog-rich-content p { margin-bottom: 1.25rem; }
        .blog-rich-content h1, .blog-rich-content h2, .blog-rich-content h3 { color: #2a0b06; font-weight: 700; margin: 2rem 0 1rem; line-height: 1.3; }
        .blog-rich-content h2 { font-size: 1.5rem; }
        .blog-rich-content h3 { font-size: 1.25rem; }
        .blog-rich-content ul { list-style: disc inside; margin-bottom: 1.25rem; }
        .blog-rich-content ol { list-style: decimal inside; margin-bottom: 1.25rem; }
        .blog-rich-content blockquote { padding: 1rem; border-left: 3px solid #D4AF37; background: #FAF6F0; color: #722013; font-style: italic; margin-bottom: 1.25rem; }
        .blog-rich-content a { color: #722013; text-decoration: underline; }
      `}</style>

      {/* HEADER: Fix height, no vertical scroll */}
      <header className="shrink-0 h-[20%] min-h-[140px] px-6 md:px-12 flex flex-col justify-center border-b border-[#E8DCC4] bg-white">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-2">
              <BookOpen className="w-4 h-4 text-[#722013]" />
              Sacred Archives
            </div>
            <h1 className="font-serif font-bold text-3xl md:text-5xl text-[#2a0b06]">
              Chaturmasya Chronicles
            </h1>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full bg-[#FAF6F0] border border-[#E8DCC4] rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#722013]"
              />
            </div>
          </div>
        </div>

        {/* Phase Tabs */}
        <div className="flex items-center gap-4 mt-6 overflow-x-auto hide-scrollbar">
          {PHASES.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id)}
              className={`pb-2 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${
                activePhase === phase.id
                  ? "border-[#722013] text-[#722013]"
                  : "border-transparent text-gray-400 hover:text-[#2a0b06]"
              }`}
            >
              {phase.label}
            </button>
          ))}
        </div>
      </header>

      {/* CAROUSEL AREA: Flex-1 takes remaining space between header and footer */}
      <div className="flex-1 w-full flex items-center bg-[#FDFBF7] relative overflow-hidden">
        {loading ? (
          <div className="w-full flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#722013]" />
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="w-full text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-serif font-bold text-lg text-gray-500">No chronicles found.</p>
          </div>
        ) : (
          <div className="w-full flex gap-6 px-6 md:px-12 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-8">
            {filteredBlogs.map((blog) => (
              <div key={blog.id} className="snap-start h-full max-h-[380px]">
                 <BlogCard blog={blog} onOpen={setOpenBlog} />
              </div>
            ))}
            <div className="shrink-0 w-6 md:w-12 h-full" /> {/* Padding at end */}
          </div>
        )}
      </div>

      {/* GLOBAL COMMENTS AREA: Fixed height bottom bar */}
      <GlobalComments />

      {/* MODAL */}
      <AnimatePresence>
        {openBlog && (
          <BlogPopup blog={openBlog} onClose={() => setOpenBlog(null)} activePhase={activePhase} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default BlogSection;