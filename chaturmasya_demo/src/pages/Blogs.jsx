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
  Send,
  ArrowRight,
  Search,
  X,
  Share2,
  Copy,
  Check,
  Heart,
  MessageSquare,
  Volume2,
  Pause,
  Square,
  Sparkles,
  Feather,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

/* ============================================================
   CONFIG & HELPERS
============================================================ */
const PHASES = [
  { id: "before", shortLabel: "Before", label: "Before Chaturmasya" },
  { id: "during", shortLabel: "Journal", label: "During Chaturmasya" },
  { id: "legacy", shortLabel: "Legacy", label: "Legacy" },
];

const PAGE_SIZE = 6;

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
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatCommentDate = (ts) => {
  if (!ts?.toDate) return "";
  try {
    return ts.toDate().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return ""; }
};

const stripHtml = (html) => {
  if (!html) return "";
  if (typeof window === "undefined") return html.replace(/<[^>]+>/g, " ");
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

/* ============================================================
   READ ALOUD HOOK
============================================================ */
const useReadAloud = () => {
  const [state, setState] = useState("idle");
  const utteranceRef = useRef(null);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setState("idle");
  }, [supported]);

  const speak = useCallback((text) => {
    if (!supported || !text?.trim()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1; u.lang = "en-IN";
    u.onend = () => setState("idle");
    u.onerror = () => setState("idle");
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
    setState("playing");
  }, [supported]);

  const pauseResume = useCallback(() => {
    if (!supported) return;
    if (state === "playing") {
      window.speechSynthesis.pause();
      setState("paused");
    } else if (state === "paused") {
      window.speechSynthesis.resume();
      setState("playing");
    }
  }, [state, supported]);

  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);

  return { state, speak, pauseResume, stop, supported };
};

/* ============================================================
   MEDIA COMPONENTS & SHARE MENU
============================================================ */
const VideoPlayer = ({ url, title }) => {
  if (!url) return null;
  const yt = getYouTubeEmbedUrl(url);
  if (yt) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-stone-900 shadow-sm border border-stone-200 my-6">
        <iframe src={yt} title={title || "video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
      </div>
    );
  }
  return (
    <video src={url} controls className="w-full max-h-[420px] rounded-2xl bg-stone-900 shadow-sm border border-stone-200 my-6">
      Your browser does not support video playback.
    </video>
  );
};

const ShareMenu = ({ blog }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}#blog-${blog.id}` : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: blog.title, text: blog.description, url: shareUrl }); } catch {}
    } else { copy(); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 z-50 w-48 bg-white border border-stone-200 rounded-2xl shadow-xl p-1.5"
    >
      <button onClick={copy} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-sm text-stone-700 transition-colors">
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
        <span className="font-medium">{copied ? "Copied Link!" : "Copy Link"}</span>
      </button>
      {typeof navigator !== "undefined" && navigator.share && (
        <button onClick={nativeShare} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-sm text-stone-700 transition-colors">
          <Share2 className="w-4 h-4 text-stone-500" />
          <span className="font-medium">Share to app...</span>
        </button>
      )}
    </motion.div>
  );
};

/* ============================================================
   GLOBAL COMMENTS TICKER
============================================================ */
const GlobalComments = () => {
  const [comments, setComments] = useState([]);
  useEffect(() => {
    const q = query(collectionGroup(db, "comments"), orderBy("createdAt", "desc"), limit(10));
    const unsub = onSnapshot(q, (snap) => setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  if (comments.length === 0) return null;

  return (
    <div className="w-full border-t border-stone-200 bg-white px-4 md:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-stone-900" />
          <span className="text-xs font-bold uppercase tracking-widest text-stone-900">Community Voices</span>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2">
          {comments.map((c) => (
            <div key={c.id} className="snap-start shrink-0 w-[280px] md:w-[320px] bg-stone-50 border border-stone-200/60 rounded-2xl p-4 transition-all hover:bg-stone-100">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-sm text-stone-900 truncate">{c.name}</p>
                <span className="text-[10px] uppercase tracking-wider text-stone-500">{formatCommentDate(c.createdAt)}</span>
              </div>
              <p className="text-sm text-stone-600 line-clamp-2 italic font-serif leading-relaxed mb-3">"{c.message}"</p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-900 truncate">
                <BookOpen className="w-3 h-3 text-stone-400" /> {c.blogTitle || "Chronicle"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   COMMENT INPUT & READ ALOUD
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
      await addDoc(collection(db, "blogs", blogId, "comments"), { name: name.trim().slice(0, 60), message: message.trim().slice(0, 1000), blogTitle, createdAt: serverTimestamp() });
      setMessage(""); setName(""); setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-stone-50 border border-stone-200 rounded-3xl p-6 md:p-8 mt-12 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Feather className="w-5 h-5 text-stone-900" />
        <h4 className="font-serif font-bold text-xl text-stone-900">Leave a Reflection</h4>
      </div>
      {success ? (
        <div className="text-sm font-bold text-emerald-700 flex items-center gap-2 py-4 bg-emerald-50 rounded-2xl px-4 border border-emerald-200"><Check className="w-5 h-5" /> Reflection shared successfully!</div>
      ) : (
        <>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" maxLength={60} className="w-full bg-white border border-stone-200 py-3.5 px-4 mb-4 text-sm outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all rounded-2xl" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your reflection..." rows={4} maxLength={1000} className="w-full bg-white border border-stone-200 p-4 text-sm outline-none resize-none rounded-2xl focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all" />
          <div className="flex items-center justify-between mt-4">
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">{message.length}/1000</span>
            <button type="submit" disabled={submitting || !name || !message} className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all shadow-md active:scale-95">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post
            </button>
          </div>
        </>
      )}
    </form>
  );
};

const ReadAloudControl = ({ text }) => {
  const { state, speak, pauseResume, stop, supported } = useReadAloud();
  if (!supported) return null;
  if (state === "idle") {
    return (
      <button onClick={() => speak(text)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-950 transition-colors shadow-sm">
        <Volume2 className="w-4 h-4" />
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-2xl border border-stone-900 bg-stone-100 shadow-sm">
      <button onClick={pauseResume} className="p-1.5 text-stone-900 hover:bg-stone-200 rounded-xl">{state === "playing" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
      <button onClick={stop} className="p-1.5 text-stone-900 hover:bg-stone-200 rounded-xl"><Square className="w-4 h-4" /></button>
      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-900 px-2">{state === "playing" ? "Reading" : "Paused"}</span>
    </div>
  );
};

/* ============================================================
   RESPONSIVE READING POP-UP MODAL (Clean, Scrollable Reader)
============================================================ */
const BlogPopup = ({ blog, onClose }) => {
  const [showShare, setShowShare] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likes || 0);

  useEffect(() => { if (typeof window !== "undefined") setLiked(localStorage.getItem(`liked_${blog.id}`) === "true"); }, [blog.id]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]); 

  const handleLike = async () => {
    if (liked) return;
    setLiked(true); setLikesCount((prev) => prev + 1); localStorage.setItem(`liked_${blog.id}`, "true");
    try { await updateDoc(doc(db, "blogs", blog.id), { likes: increment(1) }); } catch (err) { console.error(err); }
  };

  const coverImage = blog.coverMedia?.type === "image" ? blog.coverMedia?.url : blog.image || "";

  const fullArticleText = useMemo(() => {
    let text = `${blog.title}. ${blog.description || ""} `;
    (blog.sections || []).forEach(s => {
      if (s.heading) text += `${s.heading}. `;
      if (s.content) text += `${stripHtml(s.content)} `;
      if (s.description) text += `${stripHtml(s.description)} `;
    });
    if (!blog.sections?.length && blog.content) text += `${stripHtml(blog.content)} `;
    return text;
  }, [blog]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-stone-900/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6 lg:p-8" onClick={onClose}>
      <motion.div 
        onClick={(e) => e.stopPropagation()} 
        initial={{ y: "100%", opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: "100%", opacity: 0 }} 
        transition={{ type: "spring", damping: 28, stiffness: 300 }} 
        className="w-full max-w-3xl bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[92vh] md:h-[88vh] border border-stone-200"
      >
        
        {/* Sticky Header with Actions */}
        <div className="shrink-0 h-16 md:h-20 px-6 md:px-8 flex items-center justify-between gap-3 border-b border-stone-100 bg-white/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-900 truncate max-w-[200px] sm:max-w-xs">
            <BookOpen className="w-4 h-4 text-amber-600 shrink-0" /> <span className="truncate">{blog.category || "Chronicle"}</span>
          </div>
          <div className="flex items-center gap-2">
            <ReadAloudControl text={fullArticleText} />
            <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border transition-colors shadow-sm ${liked ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"}`}>
              <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} /> <span className="text-xs font-bold">{likesCount}</span>
            </button>
            <div className="relative">
              <button onClick={() => setShowShare((s) => !s)} className="p-2.5 rounded-2xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors shadow-sm"><Share2 className="w-4 h-4" /></button>
              <AnimatePresence>{showShare && <ShareMenu blog={blog} />}</AnimatePresence>
            </div>
            <button onClick={onClose} className="p-2.5 rounded-2xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors ml-1"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Scrollable Article Body - Clean readability focused view across all screen sizes */}
        <div className="flex-1 overflow-y-auto hide-scrollbar bg-white p-6 md:p-12">
          
          {/* Header Info */}
          <div className="mb-8">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
              <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatBlogDate(blog)}</div>
              {blog.day && <><span className="w-1.5 h-1.5 rounded-full bg-stone-300" /><span>Day {blog.day}</span></>}
            </div>
            <h1 className="font-serif font-bold text-3xl md:text-4xl lg:text-5xl leading-tight text-stone-900 mb-6">{blog.title}</h1>
            {blog.description && <p className="text-stone-600 text-lg md:text-xl leading-relaxed font-serif italic border-l-4 border-amber-600 pl-4 py-1">"{blog.description}"</p>}
          </div>

          {/* Full uncropped cover image */}
          {coverImage && (
            <div className="relative w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 mb-10 flex items-center justify-center p-2">
              <img src={coverImage} alt={blog.title} className="w-full max-h-[450px] object-contain rounded-xl" />
            </div>
          )}

          {blog.coverMedia?.type === "video" && blog.coverMedia?.url && (
            <div className="mb-10"><VideoPlayer url={blog.coverMedia.url} title={blog.title} /></div>
          )}

          {/* Structured Sections */}
          {(blog.sections || []).length > 0 ? (
            blog.sections.map((section, idx) => (
              <div key={idx} className="mb-10">
                {section.heading && (
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-4">{section.heading}</h2>
                )}
                {(section.content || section.description) && (
                  <div className="blog-rich-content text-stone-700 text-base md:text-lg leading-relaxed font-serif space-y-4" dangerouslySetInnerHTML={{ __html: section.content || section.description || "" }} />
                )}
                {section.images?.length > 0 && (
                  <div className={`mt-6 grid gap-4 ${section.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                    {section.images.map((img, i) => <img key={i} src={img} alt="content" className="w-full rounded-2xl border border-stone-200 shadow-sm object-cover aspect-video" />)}
                  </div>
                )}
                {section.video && <div className="mt-6"><VideoPlayer url={section.video} /></div>}
              </div>
            ))
          ) : (
            blog.content && <div className="blog-rich-content text-stone-700 text-base md:text-lg leading-relaxed font-serif space-y-4 mb-10" dangerouslySetInnerHTML={{ __html: blog.content.split("\n\n").filter(Boolean).map((p) => `<p>${p}</p>`).join("") }} />
          )}

          <div className="w-full h-px bg-stone-200 my-10" />
          <CommentInput blogId={blog.id} blogTitle={blog.title} />
        </div>

      </motion.div>
    </motion.div>
  );
};

/* ============================================================
   BLOG CARD (List View)
============================================================ */
const BlogCard = ({ blog, onOpen }) => {
  const cover = (blog.coverMedia?.type === "image" && blog.coverMedia?.url) || blog.image || "";
  const isVideo = blog.coverMedia?.type === "video";
  const [liked, setLiked] = useState(false);
  useEffect(() => { if (typeof window !== "undefined") setLiked(localStorage.getItem(`liked_${blog.id}`) === "true"); }, [blog.id]);

  return (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      onClick={() => onOpen(blog)}
      className="group text-left bg-white rounded-3xl overflow-hidden flex flex-col border border-stone-200 shadow-sm hover:shadow-xl transition-all w-full h-full relative"
    >
      <div className="relative w-full h-[220px] bg-stone-100 overflow-hidden">
        {cover ? (
          <img src={cover} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
            {isVideo ? <Play className="w-12 h-12 text-stone-300" /> : <BookOpen className="w-12 h-12 text-stone-300" />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        <div className="absolute top-4 left-4 flex gap-2">
          {blog.category && <span className="bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-bold text-stone-900 uppercase tracking-widest shadow-sm rounded-xl">{blog.category}</span>}
        </div>
        
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold text-stone-900 shadow-sm rounded-xl flex items-center gap-1.5">
          <Heart className={`w-3 h-3 ${liked ? "fill-red-500 text-red-500" : "text-stone-500"}`} /> {blog.likes || 0}
        </div>

        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1 bg-white">
        <h4 className="font-serif font-bold text-stone-900 text-lg md:text-xl leading-snug mb-3 line-clamp-2">
          {blog.title}
        </h4>
        <p className="text-stone-500 text-sm leading-relaxed font-serif italic mb-6 line-clamp-2">
          {blog.description}
        </p>
        <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3" />{formatBlogDate(blog)}</span>
          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-900 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Read <ArrowRight className="w-3 h-3" /></div>
        </div>
      </div>
    </motion.button>
  );
};

/* ============================================================
   MAIN SECTION
============================================================ */
const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [activePhase, setActivePhase] = useState("before");
  const [searchTerm, setSearchTerm] = useState("");
  const [openBlog, setOpenBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "blogs"), where("published", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (getBlogDate(b)?.getTime() || 0) - (getBlogDate(a)?.getTime() || 0));
      setBlogs(list); setLoading(false);
    }, (err) => { console.error("Blogs error:", err); setLoading(false); });
    return () => unsub();
  }, []);

  useEffect(() => { setPage(0); }, [activePhase, searchTerm]);

  const filteredBlogs = useMemo(() => {
    const phaseBlogs = blogs.filter((b) => b.phase === activePhase);
    const search = searchTerm.trim().toLowerCase();
    if (!search) return phaseBlogs;
    return phaseBlogs.filter((b) => [b.title, b.description, b.category].filter(Boolean).join(" ").toLowerCase().includes(search));
  }, [blogs, activePhase, searchTerm]);

  // Handle Pagination to avoid excessive scrolling
  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE));
  const paginatedBlogs = useMemo(() => filteredBlogs.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE), [filteredBlogs, page]);

  return (
    <section className="min-h-screen w-full flex flex-col bg-stone-50 text-stone-900 font-sans" id="blogs">
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .blog-rich-content p { margin-bottom: 1.25rem; }
        .blog-rich-content h1, .blog-rich-content h2, .blog-rich-content h3 { color: #111; font-weight: 700; margin: 2rem 0 1rem; line-height: 1.3; font-family: inherit; }
        .blog-rich-content h2 { font-size: 1.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; } 
        .blog-rich-content h3 { font-size: 1.25rem; }
        .blog-rich-content ul, .blog-rich-content ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
        .blog-rich-content li { margin-bottom: 0.5rem; }
        .blog-rich-content blockquote { padding: 1.25rem; border-left: 4px solid #111; background: #f9fafb; color: #555; font-style: italic; margin: 1.5rem 0; border-radius: 0 1rem 1rem 0; }
        .blog-rich-content a { color: #111; text-decoration: underline; text-underline-offset: 4px; font-weight: 500; }
      `}</style>

      {/* HEADER */}
      <header className="shrink-0 px-4 md:px-8 lg:px-12 pt-6 pb-4 bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-serif font-bold text-xl md:text-3xl text-stone-900 tracking-tight">Spirtual Articles</h1>
            </div>
            <p className="text-xs md:text-sm text-stone-500 font-medium">Reflections and recordings across the sacred months.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 md:items-center">
            {/* Phase Segmented Control */}
            <div className="flex p-1 bg-stone-100 rounded-2xl overflow-x-auto hide-scrollbar w-max">
              {PHASES.map((phase) => (
                <button key={phase.id} onClick={() => setActivePhase(phase.id)} className={`relative px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors rounded-xl z-10 ${activePhase === phase.id ? "text-stone-900" : "text-stone-500 hover:text-stone-700"}`}>
                  {activePhase === phase.id && <motion.div layoutId="phasePill" className="absolute inset-0 bg-white rounded-xl shadow-sm border border-stone-200/50 -z-10" transition={{ type: "spring", bounce: 0, duration: 0.4 }} />}
                  {phase.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search library..." className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-stone-900 focus:bg-white transition-all shadow-inner" />
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT GRID */}
      <main className="flex-1 w-full px-4 md:px-8 lg:px-12 py-8 md:py-12 max-w-7xl mx-auto flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-stone-900 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Loading library…</p>
          </div>
        ) : paginatedBlogs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-24 bg-white border border-stone-200 rounded-3xl shadow-sm">
            <BookOpen className="w-16 h-16 text-stone-300 mb-4" />
            <p className="font-serif font-bold text-2xl text-stone-900">No chronicles found.</p>
            <p className="text-sm text-stone-500 mt-2">Adjust your search or select a different phase.</p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {paginatedBlogs.map((b) => (
                <div key={b.id} className="col-span-1">
                  <BlogCard blog={b} onOpen={setOpenBlog} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-between border-t border-stone-200 pt-8">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-700 text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-stone-50 transition-colors shadow-sm">
                  <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Prev</span>
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i)} className={`h-2 rounded-full transition-all ${i === page ? "w-8 bg-stone-900" : "w-2 bg-stone-300 hover:bg-stone-400"}`} aria-label={`Page ${i + 1}`} />
                  ))}
                </div>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-900 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-stone-800 transition-colors shadow-sm">
                  <span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* GLOBAL COMMENTS TICKER */}
      <div className="shrink-0">
        <GlobalComments />
      </div>

      {/* READING MODAL */}
      <AnimatePresence>
        {openBlog && <BlogPopup blog={openBlog} onClose={() => setOpenBlog(null)} />}
      </AnimatePresence>
    </section>
  );
};

export default BlogSection;