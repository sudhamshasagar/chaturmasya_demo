import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
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
  SlidersHorizontal,
  X,
  Share2,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Mail,
} from "lucide-react";

/* ============================================================
   CONFIG
============================================================ */
const PHASES = [
  {
    id: "before",
    label: "Before Chaturmasya",
    shortLabel: "Before",
    description:
      "Discover the spiritual significance, sacred traditions and history surrounding Chaturmasya.",
  },
  {
    id: "during",
    label: "During Chaturmasya",
    shortLabel: "Daily Journal",
    description:
      "Follow the sacred journey through daily highlights, pravachanas, sevas and devotee experiences.",
  },
  {
    id: "legacy",
    label: "Legacy",
    shortLabel: "Legacy",
    description:
      "Preserving the memories, milestones and lasting legacy of the 42nd Chaturmasya.",
  },
];

const PAGE_SIZE = 12;
const ZOOM_MIN = 0.85;
const ZOOM_MAX = 1.6;
const ZOOM_STEP = 0.1;

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
    day: "numeric", month: "long", year: "numeric",
  });
};

const formatCommentDate = (ts) => {
  if (!ts?.toDate) return "";
  try {
    return ts.toDate().toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
};

const monthKey = (d) => {
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const monthLabel = (key) => {
  if (!key) return "";
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

/* ============================================================
   MEDIA
============================================================ */
const VideoPlayer = ({ url, title }) => {
  if (!url) return null;
  const yt = getYouTubeEmbedUrl(url);
  if (yt) {
    return (
      <div className="relative w-full aspect-video rounded-2xl md:rounded-3xl overflow-hidden bg-black">
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
    <video src={url} controls className="w-full max-h-[650px] rounded-2xl md:rounded-3xl bg-black">
      Your browser does not support video playback.
    </video>
  );
};

const ArticleImage = ({ src, alt }) => {
  if (!src) return null;
  return (
    <div className="w-full flex justify-center">
      <img
        src={src}
        alt={alt || ""}
        loading="lazy"
        className="block w-auto max-w-full h-auto max-h-[700px] object-contain rounded-2xl md:rounded-3xl"
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
  const shareText = blog.description || shareTitle;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        onClose?.();
      } catch {}
    }
  };

  const items = [
    { label: "Twitter", icon: MessageCircleCheck, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}` },
    { label: "Facebook", icon: MessageCircleCheck, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { label: "LinkedIn", icon: MessageCircleCheck, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { label: "Email", icon: Mail, href: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}` },
  ];

  return ( 
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 z-[9999] w-64 bg-white border border-[#E8DCC4] rounded-2xl shadow-xl p-2 pointer-events-auto"
    >
      <button
        type="button"
        onClick={copy}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FAF6F0] text-sm text-[#2a0b06]"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[#722013]" />}
        <span className="font-medium">{copied ? "Link copied!" : "Copy link"}</span>
      </button>
      {typeof navigator !== "undefined" && navigator.share && (
        <button
          type="button"
          onClick={nativeShare}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FAF6F0] text-sm text-[#2a0b06]"
        >
          <Share2 className="w-4 h-4 text-[#722013]" />
          <span className="font-medium">Share via…</span>
        </button>
      )}
      <div className="h-px bg-[#E8DCC4] my-1" />
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FAF6F0] text-sm text-[#2a0b06]"
        >
          <it.icon className="w-4 h-4 text-[#722013]" />
          <span className="font-medium">{it.label}</span>
        </a>
      ))}
    </motion.div>
  );
};

/* ============================================================
   COMMENTS (SEPARATE PANEL)
============================================================ */
const CommentsPanel = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!blogId) return;
    const q = query(
      collection(db, "blogs", blogId, "comments"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("Comments error:", err)
    );
    return () => unsub();
  }, [blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const n = name.trim();
    const m = message.trim();
    if (!n || !m) {
      setError("Please enter your name and a message.");
      return;
    }
    try {
      setSubmitting(true);
      await addDoc(collection(db, "blogs", blogId, "comments"), {
        name: n.slice(0, 60),
        message: m.slice(0, 1000),
        createdAt: serverTimestamp(),
      });
      setMessage("");
    } catch (err) {
      console.error(err);
      setError("Could not post your comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto mt-10 bg-white border border-[#E8DCC4] rounded-3xl p-5 sm:p-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircleCheck className="w-5 h-5 text-[#722013]" />
        <h4 className="font-serif font-bold text-xl text-[#2a0b06]">
          Devotee Reflections
          <span className="ml-2 text-sm text-gray-400 font-sans font-medium">
            ({comments.length})
          </span>
        </h4>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#FAF6F0] border border-[#E8DCC4] rounded-2xl p-4 sm:p-5 mb-8">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={60}
          className="w-full bg-white border border-[#E8DCC4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#722013] transition"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your reflection…"
          rows={3}
          maxLength={1000}
          className="mt-3 w-full bg-white border border-[#E8DCC4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#722013] transition resize-y"
        />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[10px] uppercase tracking-widest text-gray-400">
            {message.length}/1000
          </span>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-[#722013] hover:bg-[#5a180e] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full transition"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post
          </button>
        </div>
      </form>

      <ul className="space-y-4">
        {comments.length === 0 && (
          <li className="text-sm text-gray-500 text-center py-6">
            Be the first to share a reflection.
          </li>
        )}
        {comments.map((c) => (
          <li key={c.id} className="bg-white border border-[#E8DCC4]/70 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#722013]/10 text-[#722013] flex items-center justify-center font-bold shrink-0">
                {(c.name || "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-[#2a0b06] truncate">{c.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-gray-400">
                  {formatCommentDate(c.createdAt)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{c.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

/* ============================================================
   BLOG CARD
============================================================ */
const BlogCard = ({ blog, onOpen }) => {
  const date = formatBlogDate(blog);
  const cover =
    (blog.coverMedia?.type === "image" && blog.coverMedia?.url) ||
    blog.image || "";
  const isVideo = blog.coverMedia?.type === "video";

  return (
    <button
      type="button"
      onClick={() => onOpen(blog)}
      className="group text-left bg-white border border-[#E8DCC4]/70 hover:shadow-xl hover:border-[#722013]/30 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative bg-[#FAF6F0] overflow-hidden aspect-[16/10]">
        {cover ? (
          <img
            src={cover}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#722013]">
            {isVideo ? (
              <>
                <Play className="w-10 h-10 mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest">Video</span>
              </>
            ) : (
              <BookOpen className="w-10 h-10 text-[#D4AF37]/50" />
            )}
          </div>
        )}
        {blog.category && (
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[9px] font-bold text-[#722013] uppercase tracking-widest shadow-sm">
            {blog.category}
          </span>
        )}
        {blog.day && (
          <span className="absolute top-3 right-3 bg-[#722013]/95 px-3 py-1 rounded-full text-[9px] font-bold text-white uppercase tracking-widest">
            Day {blog.day}
          </span>
        )}
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0">
        {date && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-2">
            <Calendar className="w-3 h-3 shrink-0" />
            <span className="truncate">{date}</span>
          </span>
        )}
        <h4 className="font-serif font-bold text-[#2a0b06] leading-snug mb-2 text-base sm:text-lg line-clamp-2">
          {blog.title}
        </h4>
        {blog.description && (
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed line-clamp-3">
            {blog.description}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#722013] group-hover:gap-2.5 transition-all">
          Read <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
};

/* ============================================================
   ARTICLE PAGE (a single "page" in the reader)
============================================================ */
const ArticlePage = ({ blog, section, isCover, activePhase }) => {
  const date = formatBlogDate(blog);
  const coverImage =
    blog.coverMedia?.type === "image" ? blog.coverMedia?.url : blog.image || "";

  if (isCover) {
    return (
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8 md:mb-10">
          <div className="flex flex-wrap justify-center items-center gap-3 mb-5">
            {blog.category && (
              <span className="bg-[#FAF6F0] border border-[#E8DCC4] px-4 py-1.5 rounded-full text-[10px] font-bold text-[#722013] uppercase tracking-widest">
                {blog.category}
              </span>
            )}
            {activePhase === "during" && blog.day && (
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">
                Day {blog.day}
              </span>
            )}
            {date && (
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {date}
              </span>
            )}
          </div>
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold font-serif text-[#2a0b06] leading-tight">
            {blog.title}
          </h3>
          {blog.description && (
            <p className="max-w-2xl mx-auto mt-5 text-gray-500 text-base md:text-lg leading-relaxed italic font-serif">
              {blog.description}
            </p>
          )}
        </header>

        {coverImage ? (
          <ArticleImage src={coverImage} alt={blog.title} />
        ) : blog.coverMedia?.type === "video" && blog.coverMedia?.url ? (
          <VideoPlayer url={blog.coverMedia.url} title={blog.title} />
        ) : null}
      </div>
    );
  }

  // Section page
  return (
    <div className="max-w-3xl mx-auto">
      {section.heading && (
        <div className="mb-5">
          <h4 className="text-xl md:text-3xl font-serif font-bold text-[#2a0b06] leading-tight">
            {section.heading}
          </h4>
          <div className="w-14 h-[2px] bg-[#D4AF37] mt-3" />
        </div>
      )}

      {(section.content || section.description) && (
        <div
          className="blog-rich-content"
          dangerouslySetInnerHTML={{
            __html: section.content || section.description || "",
          }}
        />
      )}

      {section.images?.length > 0 && (
        <div
          className={`mt-7 grid gap-5 ${
            section.images.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {section.images.map((img, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-2xl md:rounded-3xl overflow-hidden bg-[#FAF6F0]"
            >
              <img
                src={img}
                alt={`${section.heading || blog.title} ${i + 1}`}
                loading="lazy"
                className="block w-auto max-w-full h-auto max-h-[650px] object-contain"
              />
            </div>
          ))}
        </div>
      )}

      {section.video && (
        <div className="mt-7">
          <VideoPlayer url={section.video} title={section.heading || blog.title} />
        </div>
      )}
    </div>
  );
};

/* ============================================================
   READER (fullscreen page-wise, editorial)
============================================================ */
const BlogReader = ({ blog, onClose, activePhase }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [direction, setDirection] = useState(1);

  // Build pages: cover + one per meaningful section (+ fallback content page)
  const pages = useMemo(() => {
    const list = [{ kind: "cover" }];
    const validSections = (blog?.sections || []).filter(
      (s) => s.heading || s.content || s.description || s.images?.length || s.video
    );
    validSections.forEach((s, i) => list.push({ kind: "section", section: s, i }));
    if (!validSections.length && blog?.content) {
      list.push({
        kind: "section",
        section: { content: blog.content.split("\n\n").filter(Boolean).map((p) => `<p>${p}</p>`).join("") },
        i: 0,
      });
    }
    return list;
  }, [blog]);

  const totalPages = pages.length;

  useEffect(() => {
    setPageIndex(0);
    setZoom(1);
  }, [blog?.id]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setPageIndex((p) => Math.max(0, p - 1));
  }, []);
  const goNext = useCallback(() => {
    setDirection(1);
    setPageIndex((p) => Math.min(totalPages - 1, p + 1));
  }, [totalPages]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape") onClose();
      else if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setZoom(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, onClose]);

  const current = pages[pageIndex];

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
  const zoomReset = () => setZoom(1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] bg-[#fdfcf8] flex flex-col"
    >
      {/* TOP BAR */}
      <div className="relative z-[100] flex items-center justify-between gap-3 bg-white/95 backdrop-blur border-b border-[#E8DCC4] px-4 sm:px-6 py-3 shrink-0 overflow-visible">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#722013] truncate">
            {blog.category || "Chronicle"}
          </span>
          <span className="hidden sm:inline text-gray-300 mx-1">•</span>
          <span className="hidden sm:inline text-[11px] text-gray-500 truncate max-w-[40vw]">
            {blog.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom */}
          <div className="hidden sm:flex items-center gap-1 bg-[#FAF6F0] border border-[#E8DCC4] rounded-full px-1 py-1">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= ZOOM_MIN}
              className="p-1.5 rounded-full hover:bg-white text-[#722013] disabled:opacity-40"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={zoomReset}
              className="px-2 text-[10px] font-bold text-[#722013] min-w-[3ch]"
              aria-label="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= ZOOM_MAX}
              className="p-1.5 rounded-full hover:bg-white text-[#722013] disabled:opacity-40"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile zoom compact */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= ZOOM_MIN}
              className="p-2 rounded-full bg-[#FAF6F0] border border-[#E8DCC4] text-[#722013] disabled:opacity-40"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= ZOOM_MAX}
              className="p-2 rounded-full bg-[#FAF6F0] border border-[#E8DCC4] text-[#722013] disabled:opacity-40"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {zoom !== 1 && (
            <button
              type="button"
              onClick={zoomReset}
              className="hidden md:inline-flex items-center gap-1 p-2 rounded-full bg-[#FAF6F0] border border-[#E8DCC4] text-[#722013]"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Share */}
          <div className="relative z-[110]">
            <button
              type="button"
              onClick={() => setShowShare((s) => !s)}
              className="p-2 rounded-full bg-[#FAF6F0] border border-[#E8DCC4] text-[#722013] hover:bg-white"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
           <AnimatePresence>
            {showShare && (
              <ShareMenu
                blog={blog}
                onClose={() => setShowShare(false)}
              />
            )}
          </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-[#722013] hover:bg-[#5a180e] text-white"
            aria-label="Close reader"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PAGE AREA */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {/* Desktop side arrows */}
        <button
          type="button"
          onClick={goPrev}
          disabled={pageIndex === 0}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-12 h-12 rounded-full bg-white border border-[#E8DCC4] text-[#722013] shadow-md hover:bg-[#FAF6F0] disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={pageIndex >= totalPages - 1}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-12 h-12 rounded-full bg-white border border-[#E8DCC4] text-[#722013] shadow-md hover:bg-[#FAF6F0] disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="h-full overflow-y-auto overscroll-contain hide-scrollbar">
          <div
            className="px-4 sm:px-8 md:px-16 py-8 md:py-12 origin-top"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              transition: "transform 0.2s ease",
            }}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={pageIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                {current && (
                  <ArticlePage
                    blog={blog}
                    section={current.section}
                    isCover={current.kind === "cover"}
                    activePhase={activePhase}
                  />
                )}

                {pageIndex === totalPages - 1 && (
                  <div className="max-w-3xl mx-auto border-t border-[#E8DCC4] pt-8 mt-14 flex justify-center items-center gap-3">
                    <div className="w-8 sm:w-12 h-px bg-[#D4AF37]" />
                    <Sun className="w-5 h-5 text-[#D4AF37] shrink-0" />
                    <p className="text-sm font-serif italic text-[#722013] font-bold tracking-wider text-center">
                      {blog.footer || "Jai Jnaneshwari"}
                    </p>
                    <div className="w-8 sm:w-12 h-px bg-[#D4AF37]" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* PAGER FOOTER */}
      <div className="shrink-0 border-t border-[#E8DCC4] bg-white/95 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={pageIndex === 0}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-[#FAF6F0] border border-[#E8DCC4] text-[#722013] text-[11px] sm:text-xs font-bold uppercase tracking-widest disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden sm:flex items-center gap-1.5">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setDirection(i > pageIndex ? 1 : -1); setPageIndex(i); }}
                aria-label={`Go to page ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === pageIndex ? "w-6 bg-[#722013]" : "w-1.5 bg-[#E8DCC4] hover:bg-[#D4AF37]"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
            Page {pageIndex + 1} / {totalPages}
          </span>
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={pageIndex >= totalPages - 1}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-[#722013] hover:bg-[#5a180e] text-white text-[11px] sm:text-xs font-bold uppercase tracking-widest disabled:opacity-40"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

/* ============================================================
   PAGINATION (list)
============================================================ */
const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  pages.push(1);
  if (page > 3) pages.push("...");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
  if (page < totalPages - 2) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="p-2 rounded-full border border-[#E8DCC4] bg-white text-[#722013] disabled:opacity-40"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((item, index) =>
        item === "..." ? (
          <span key={`dots-${index}`} className="px-2 text-gray-400">...</span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`min-w-9 h-9 px-3 rounded-full text-xs font-bold ${
              item === page
                ? "bg-[#722013] text-white"
                : "bg-white border border-[#E8DCC4] text-gray-600"
            }`}
          >
            {item}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="p-2 rounded-full border border-[#E8DCC4] bg-white text-[#722013] disabled:opacity-40"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

/* ============================================================
   MAIN
============================================================ */
const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [activePhase, setActivePhase] = useState("before");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openBlog, setOpenBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const gridRef = useRef(null);
  const commentsRef = useRef(null);

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
  // Open a specific blog when visiting a shared URL
// Example: #blog-DsUIE2pwSbeucfRUt7Ab
useEffect(() => {
  if (blogs.length === 0) return;

  const openBlogFromUrl = () => {
    const hash = window.location.hash;

    if (!hash.startsWith("#blog-")) return;

    const blogId = hash.replace("#blog-", "");

    const matchedBlog = blogs.find(
      (blog) => blog.id === blogId
    );

    if (matchedBlog) {
      if (matchedBlog.phase) {
        setActivePhase(matchedBlog.phase);
      }

      setOpenBlog(matchedBlog);
    }
  };

  openBlogFromUrl();

  window.addEventListener("hashchange", openBlogFromUrl);

  return () => {
    window.removeEventListener("hashchange", openBlogFromUrl);
  };
}, [blogs]);

  const phaseBlogs = useMemo(
    () => blogs.filter((b) => b.phase === activePhase),
    [blogs, activePhase]
  );

  const categories = useMemo(
    () => [...new Set(phaseBlogs.map((b) => b.category).filter(Boolean))],
    [phaseBlogs]
  );

  const months = useMemo(() => {
    const s = new Set();
    phaseBlogs.forEach((b) => {
      const d = getBlogDate(b);
      if (d) s.add(monthKey(d));
    });
    return [...s].sort().reverse();
  }, [phaseBlogs]);

  const filteredBlogs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return phaseBlogs.filter((b) => {
      if (activeCategory !== "all" && b.category !== activeCategory) return false;
      const d = getBlogDate(b);
      if (monthFilter !== "all" && (!d || monthKey(d) !== monthFilter)) return false;
      if (search) {
        const hay = [b.title, b.description, b.category, b.day ? `day ${b.day}` : ""]
          .filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [phaseBlogs, activeCategory, searchTerm, monthFilter]);

  useEffect(() => {
    setPage(1);
    setOpenBlog(null);
  }, [activePhase, activeCategory, searchTerm, monthFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const paginated = filteredBlogs.slice(pageStart, pageStart + PAGE_SIZE);

  const activePhaseData = PHASES.find((p) => p.id === activePhase);

  const handlePhaseChange = (phaseId) => {
    setActivePhase(phaseId);
    setActiveCategory("all");
    setSearchTerm("");
    setMonthFilter("all");
    setPage(1);
    setOpenBlog(null);
  };

  const handleOpen = (blog) => {
  setOpenBlog(blog);

  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}#blog-${blog.id}`
  );
};
 const handleClose = () => {
  setOpenBlog(null);

  // Remove #blog-ID from URL
  window.history.replaceState(
    null,
    "",
    window.location.pathname
  );

  setTimeout(() => {
    commentsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 150);
};

  return (
    <section id="updates" className="scroll-mt-32 px-4 sm:px-6 lg:px-8 py-16 bg-[#fdfcf8]">
      {/* Editorial rich-text styles */}
      <style>{`
        #updates .blog-rich-content {
          color: #3f3a34;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.05rem;
          line-height: 1.9;
          word-break: break-word;
        }
        #updates .blog-rich-content p {
          display: block;
          margin: 0 0 1.25rem 0;
        }
        #updates .blog-rich-content p:empty { min-height: 1.25rem; }
        #updates .blog-rich-content h1,
        #updates .blog-rich-content h2,
        #updates .blog-rich-content h3,
        #updates .blog-rich-content h4 {
          font-family: Georgia, serif;
          color: #2a0b06;
          font-weight: 700;
          line-height: 1.3;
          margin: 2rem 0 1rem;
        }
        #updates .blog-rich-content h1 { font-size: 2rem; }
        #updates .blog-rich-content h2 { font-size: 1.75rem; }
        #updates .blog-rich-content h3 { font-size: 1.4rem; }
        #updates .blog-rich-content ul {
          display: block !important;
          list-style-type: disc !important;
          list-style-position: outside !important;
          padding-left: 2rem !important;
          margin: 1.25rem 0 !important;
        }
        #updates .blog-rich-content ol {
          display: block !important;
          list-style-type: decimal !important;
          list-style-position: outside !important;
          padding-left: 2rem !important;
          margin: 1.25rem 0 !important;
        }
        #updates .blog-rich-content li {
          display: list-item !important;
          margin-bottom: 0.65rem !important;
          padding-left: 0.3rem;
        }
        #updates .blog-rich-content li p { display: inline; margin: 0; }
        #updates .blog-rich-content ul ul { list-style-type: circle !important; margin-top: 0.5rem !important; }
        #updates .blog-rich-content ul ul ul { list-style-type: square !important; }
        #updates .blog-rich-content ol ol { list-style-type: lower-alpha !important; margin-top: 0.5rem !important; }
        #updates .blog-rich-content strong, #updates .blog-rich-content b { font-weight: 700; color: #2a0b06; }
        #updates .blog-rich-content em, #updates .blog-rich-content i { font-style: italic; }
        #updates .blog-rich-content u { text-decoration: underline; }
        #updates .blog-rich-content blockquote {
          margin: 1.75rem 0;
          padding: 1rem 1.5rem;
          border-left: 4px solid #D4AF37;
          background: #FAF6F0;
          color: #722013;
          font-style: italic;
          border-radius: 0 0.75rem 0.75rem 0;
        }
        #updates .blog-rich-content a {
          color: #722013;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        #updates .blog-rich-content hr {
          margin: 2rem 0;
          border: 0;
          border-top: 1px solid #E8DCC4;
        }
        #updates .blog-rich-content img {
          max-width: 100%;
          height: auto;
          border-radius: 1rem;
          margin: 1.25rem auto;
          display: block;
        }
        @media (min-width: 640px) {
          #updates .blog-rich-content { font-size: 1.125rem; }
        }
      `}</style>

      {/* HEADER */}
      <div className="max-w-6xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#722013] bg-[#FAF6F0] border border-[#E8DCC4] px-4 py-1.5 rounded-full mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          Mutt Chronicles
        </div>
        <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#2a0b06] leading-tight">
          Sacred Stories &amp; Updates
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-gray-500 text-sm sm:text-base leading-relaxed">
          Follow the sacred journey of Chaturmasya through stories, updates and reflections.
        </p>
      </div>

      {/* PHASE TABS */}
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
        {PHASES.map((phase) => (
          <button
            key={phase.id}
            type="button"
            onClick={() => handlePhaseChange(phase.id)}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest transition ${
              activePhase === phase.id
                ? "bg-[#722013] text-white shadow-lg"
                : "bg-white border border-[#E8DCC4] text-gray-600 hover:text-[#722013]"
            }`}
          >
            {phase.shortLabel}
          </button>
        ))}
      </div>

      {/* PHASE DESCRIPTION */}
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#2a0b06]">
          {activePhaseData?.label}
        </h3>
        <p className="mt-2 text-sm text-gray-500">{activePhaseData?.description}</p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chronicles..."
              className="w-full bg-white border border-[#E8DCC4] rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#722013] transition"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className={`px-4 rounded-2xl border transition ${
              showFilters
                ? "bg-[#722013] text-white border-[#722013]"
                : "bg-white border-[#E8DCC4] text-[#722013]"
            }`}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="border border-[#E8DCC4] rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[#722013]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="border border-[#E8DCC4] rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[#722013]"
                >
                  <option value="all">All Months</option>
                  {months.map((m) => (
                    <option key={m} value={m}>{monthLabel(m)}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* GRID */}
      <div ref={gridRef} className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#722013]" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-[#D4AF37]/50 mx-auto mb-3" />
            <h4 className="font-serif font-bold text-lg text-[#2a0b06]">No chronicles found</h4>
            <p className="text-sm text-gray-500 mt-1">Published chronicles will appear here.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {paginated.map((blog) => (
                <BlogCard key={blog.id} blog={blog} onOpen={handleOpen} />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={(newPage) => {
                setPage(newPage);
                setOpenBlog(null);
                gridRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </>
        )}
      </div>

      {/* SEPARATE COMMENTS SECTION (below list, always reflects latest admin updates via onSnapshot in Reader; here shown for the last opened blog if any) */}
      <div ref={commentsRef} className="max-w-6xl mx-auto">
        {openBlog === null && filteredBlogs[0] && (
          <div className="mt-16">
            <div className="text-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#722013]">
                Latest Discussion
              </span>
              <h3 className="mt-2 font-serif font-bold text-xl sm:text-2xl text-[#2a0b06]">
                Reflections on “{filteredBlogs[0].title}”
              </h3>
            </div>
            <CommentsPanel blogId={filteredBlogs[0].id} />
          </div>
        )}
      </div>

      {/* FULLSCREEN READER */}
      <AnimatePresence>
        {openBlog && (
          <BlogReader
            key={openBlog.id}
            blog={openBlog}
            onClose={handleClose}
            activePhase={activePhase}
          />
        )}
      </AnimatePresence>

      {/* IN-READER COMMENTS (separate scroll, dedicated section below reader when closed) */}
      {openBlog && (
        <div className="fixed bottom-0 left-0 right-0 z-[55] pointer-events-none" aria-hidden />
      )}
    </section>
  );
};

export default BlogSection;
