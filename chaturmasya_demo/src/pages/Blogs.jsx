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
  ChevronLeft,
  ChevronRight,
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
  Quote,
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
  const [state, setState] = useState("idle"); // idle | playing | paused
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
    u.rate = 0.95;
    u.pitch = 1;
    u.lang = "en-IN";
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
   MEDIA COMPONENTS
============================================================ */
const VideoPlayer = ({ url, title }) => {
  if (!url) return null;
  const yt = getYouTubeEmbedUrl(url);
  if (yt) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg ring-1 ring-[#E8DCC4]">
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
    <video src={url} controls className="w-full max-h-[420px] rounded-2xl bg-black shadow-lg ring-1 ring-[#E8DCC4]">
      Your browser does not support video playback.
    </video>
  );
};

/* ============================================================
   SHARE MENU
============================================================ */
const ShareMenu = ({ blog }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}#blog-${blog.id}`
    : "";

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
        await navigator.share({ title: blog.title, text: blog.description, url: shareUrl });
      } catch {}
    } else {
      copy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className="absolute right-0 top-full mt-2 z-[9999] w-52 bg-white border border-[#E8DCC4] rounded-2xl shadow-2xl p-2"
    >
      <button
        type="button"
        onClick={copy}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FAF6F0] text-sm text-[#2a0b06] transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[#722013]" />}
        <span className="font-bold">{copied ? "Copied!" : "Copy Link"}</span>
      </button>
      {typeof navigator !== "undefined" && navigator.share && (
        <button
          type="button"
          onClick={nativeShare}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FAF6F0] text-sm text-[#2a0b06] transition-colors"
        >
          <Share2 className="w-4 h-4 text-[#722013]" />
          <span className="font-bold">Share…</span>
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
    const q = query(
      collectionGroup(db, "comments"),
      orderBy("createdAt", "desc"),
      limit(15)
    );
    const unsub = onSnapshot(
      q,
      (snap) => setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("Global Comments error:", err)
    );
    return () => unsub();
  }, []);

  if (comments.length === 0) return null;

  return (
    <div className="w-full shrink-0 border-t border-[#E8DCC4] bg-gradient-to-r from-[#FDFBF7] via-white to-[#FDFBF7] px-4 md:px-8 py-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-[#722013]/10 flex items-center justify-center">
          <MessageSquare className="w-3 h-3 text-[#722013]" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#722013]">
          Recent Devotee Reflections
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF37]/40 to-transparent" />
      </div>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-1">
        {comments.map((c) => (
          <div
            key={c.id}
            className="snap-start shrink-0 w-[260px] md:w-[300px] bg-white border border-[#E8DCC4] rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <p className="font-bold text-xs text-[#2a0b06] truncate">{c.name}</p>
              <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] shrink-0">
                {formatCommentDate(c.createdAt)}
              </span>
            </div>
            <p className="text-xs text-[#5a5046] line-clamp-1 italic font-serif mb-1.5">"{c.message}"</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#722013] truncate">
              On: {c.blogTitle || "Chronicle"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   COMMENT INPUT
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
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#FAF6F0] to-white border border-[#E8DCC4] rounded-2xl p-5 shadow-sm mt-10 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Feather className="w-4 h-4 text-[#722013]" />
        <h4 className="font-serif font-bold text-lg text-[#2a0b06]">Share a Reflection</h4>
      </div>
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
            className="w-full bg-white border border-[#E8DCC4] py-2.5 px-3 mb-3 text-sm outline-none focus:border-[#722013] transition-colors rounded-xl"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message..."
            rows={3}
            maxLength={1000}
            className="w-full bg-white border border-[#E8DCC4] p-3 text-sm outline-none resize-none rounded-xl focus:border-[#722013]"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-bold">
              {message.length}/1000
            </span>
            <button
              type="submit"
              disabled={submitting || !name || !message}
              className="inline-flex items-center gap-2 bg-[#722013] hover:bg-[#5a180e] disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-sm"
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
   READ ALOUD CONTROL
============================================================ */
const ReadAloudControl = ({ text }) => {
  const { state, speak, pauseResume, stop, supported } = useReadAloud();
  if (!supported) return null;

  if (state === "idle") {
    return (
      <button
        type="button"
        onClick={() => speak(text)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8DCC4] bg-white text-[#5a5046] hover:bg-[#FAF6F0] hover:text-[#722013] transition-colors"
        title="Read aloud"
      >
        <Volume2 className="w-4 h-4" />
        <span className="text-xs font-bold hidden sm:inline">Listen</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-[#722013] bg-[#722013]/5">
      <button type="button" onClick={pauseResume} className="p-1 text-[#722013] hover:bg-[#722013]/10 rounded" title={state === "playing" ? "Pause" : "Resume"}>
        {state === "playing" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </button>
      <button type="button" onClick={stop} className="p-1 text-[#722013] hover:bg-[#722013]/10 rounded" title="Stop">
        <Square className="w-3.5 h-3.5" />
      </button>
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#722013] pr-1 hidden sm:inline">
        {state === "playing" ? "Reading" : "Paused"}
      </span>
    </div>
  );
};

/* ============================================================
   POPUP MODAL
============================================================ */
const BlogPopup = ({ blog, onClose }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likes || 0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLiked(localStorage.getItem(`liked_${blog.id}`) === "true");
    }
  }, [blog.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setPageIndex((p) => Math.max(0, p - 1));
      if (e.key === "ArrowRight") setPageIndex((p) => Math.min(pages.length - 1, p + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line
  }, []);

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

  const currentReadText = useMemo(() => {
    if (!current) return "";
    if (current.kind === "intro") {
      return `${blog.title}. ${blog.description || ""}`;
    }
    const s = current.section || {};
    return `${s.heading || ""}. ${stripHtml(s.content || s.description || "")}`;
  }, [current, blog]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#2a0b06]/60 backdrop-blur-md flex items-center justify-center p-2 md:p-6 lg:p-10"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 30, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 30, scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        className="w-full h-full max-w-[1280px] max-h-[900px] bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-[#E8DCC4]"
      >
        {/* LEFT / TOP */}
        <div className="relative w-full md:w-[42%] h-[32vh] md:h-full shrink-0 bg-[#FAF6F0] flex flex-col border-b md:border-b-0 md:border-r border-[#E8DCC4]">
          {coverImage ? (
            <div className="absolute inset-0 z-0">
              <img src={coverImage} alt={blog.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a0b06]/95 via-[#2a0b06]/50 to-[#2a0b06]/10" />
            </div>
          ) : (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-[#FAF6F0] to-[#F0E6D2]">
              <BookOpen className="w-24 h-24 text-[#D4AF37]/40" />
            </div>
          )}

          <button onClick={onClose} className="md:hidden absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30">
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 mt-auto p-6 md:p-10 text-white flex flex-col justify-end h-full">
            {blog.category && (
              <span className="w-max bg-[#D4AF37] text-[#2a0b06] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-3 shadow-md">
                {blog.category}
              </span>
            )}
            <h2 className="font-serif font-bold text-2xl md:text-4xl leading-tight mb-3 drop-shadow-sm">
              {blog.title}
            </h2>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/85">
              <span>{formatBlogDate(blog)}</span>
              {blog.day && <><span className="opacity-50">•</span><span>Day {blog.day}</span></>}
            </div>
          </div>
        </div>

        {/* RIGHT / BOTTOM */}
        <div className="flex-1 flex flex-col bg-[#FDFBF7] relative min-h-0 h-[68vh] md:h-full">
          {/* Header actions */}
          <div className="shrink-0 h-16 border-b border-[#E8DCC4] px-4 md:px-8 flex items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#722013]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              Chronicle
            </div>
            <div className="flex items-center gap-2">
              <ReadAloudControl text={currentReadText} />
              <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${liked ? "bg-[#722013]/10 border-[#722013] text-[#722013]" : "bg-white border-[#E8DCC4] text-[#5a5046] hover:bg-[#FAF6F0]"}`}>
                <Heart className={`w-4 h-4 ${liked ? "fill-[#722013]" : ""}`} />
                <span className="text-xs font-bold">{likesCount}</span>
              </button>
              <div className="relative">
                <button onClick={() => setShowShare((s) => !s)} className="p-2 rounded-lg border border-[#E8DCC4] bg-white text-[#5a5046] hover:bg-[#FAF6F0] transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <AnimatePresence>{showShare && <ShareMenu blog={blog} />}</AnimatePresence>
              </div>
              <button onClick={onClose} className="hidden md:flex p-2 rounded-lg bg-[#722013] text-white hover:bg-[#5a180e] transition-colors ml-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="shrink-0 h-1 bg-[#FAF6F0]">
            <motion.div
              className="h-full bg-gradient-to-r from-[#722013] to-[#D4AF37]"
              initial={false}
              animate={{ width: `${((pageIndex + 1) / totalPages) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 md:px-14 py-8 hide-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={pageIndex}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
                className="max-w-2xl mx-auto w-full"
              >
                {current.kind === "intro" ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Quote className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#722013]">Introduction</span>
                    </div>
                    <h3 className="font-serif text-3xl md:text-4xl font-bold text-[#2a0b06] mb-4 leading-tight">
                      {blog.title}
                    </h3>
                    <div className="w-16 h-[3px] bg-gradient-to-r from-[#722013] to-[#D4AF37] mb-6 rounded-full" />
                    {blog.description && (
                      <p className="text-[#5a5046] text-lg md:text-xl leading-relaxed font-serif italic mb-8">
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
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#722013]">
                            Chapter {pageIndex}
                          </span>
                          <div className="flex-1 h-px bg-[#E8DCC4]" />
                        </div>
                        <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#2a0b06] mb-4 leading-tight">
                          {current.section.heading}
                        </h3>
                        <div className="w-12 h-[3px] bg-gradient-to-r from-[#722013] to-[#D4AF37] rounded-full" />
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
                          <img key={i} src={img} alt="content" className="w-full rounded-2xl border border-[#E8DCC4] shadow-sm" />
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

                {pageIndex === totalPages - 1 && (
                  <CommentInput blogId={blog.id} blogTitle={blog.title} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div className="shrink-0 h-16 border-t border-[#E8DCC4] bg-white px-4 md:px-8 flex items-center justify-between gap-3">
            <button onClick={goPrev} disabled={pageIndex === 0} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DCC4] text-[#722013] text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-[#F0E6D2] transition-colors">
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <div className="flex items-center gap-1.5">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPageIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === pageIndex ? "w-6 bg-[#722013]" : "w-1.5 bg-[#E8DCC4] hover:bg-[#D4AF37]"}`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
            <button onClick={goNext} disabled={pageIndex === totalPages - 1} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#722013] hover:bg-[#5a180e] text-white text-xs font-bold uppercase tracking-widest disabled:opacity-30 transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ============================================================
   BLOG CARD (mobile/tablet: paginated grid card; desktop: masonry-ish)
============================================================ */
const BlogCard = ({ blog, onOpen, featured = false }) => {
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
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      onClick={() => onOpen(blog)}
      className={`group text-left bg-white rounded-2xl overflow-hidden flex flex-col border border-[#E8DCC4] shadow-sm hover:shadow-2xl hover:border-[#D4AF37] transition-all w-full h-full ${featured ? "md:col-span-2 md:row-span-2" : ""}`}
    >
      <div className={`relative bg-[#FAF6F0] w-full border-b border-[#E8DCC4] ${featured ? "h-[240px] md:h-[320px]" : "h-[180px]"}`}>
        {cover ? (
          <img src={cover} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FAF6F0] to-[#F0E6D2]">
            {isVideo ? <Play className="w-12 h-12 text-[#722013]/40" /> : <BookOpen className="w-12 h-12 text-[#D4AF37]/50" />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a0b06]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {blog.category && (
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 text-[9px] font-bold text-[#722013] uppercase tracking-[0.15em] shadow-sm rounded-md">
            {blog.category}
          </span>
        )}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2 py-1 text-[10px] font-bold text-[#722013] shadow-sm rounded-md flex items-center gap-1">
          <Heart className={`w-3 h-3 ${liked ? "fill-[#722013]" : ""}`} /> {blog.likes || 0}
        </div>
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-[#722013] fill-[#722013] ml-0.5" />
            </div>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 bg-white">
        <h4 className={`font-serif font-bold text-[#2a0b06] leading-snug mb-2 line-clamp-2 ${featured ? "text-xl md:text-2xl" : "text-lg"}`}>
          {blog.title}
        </h4>
        <p className={`text-[#5a5046] leading-relaxed font-serif italic mb-4 ${featured ? "text-sm line-clamp-3" : "text-xs line-clamp-2"}`}>
          {blog.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#E8DCC4]/60">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            {formatBlogDate(blog)}
          </span>
          <div className="flex items-center gap-1.5 text-[#722013] text-[10px] font-bold uppercase tracking-widest">
            Read
            <div className="w-6 h-6 rounded-full bg-[#FAF6F0] flex items-center justify-center group-hover:bg-[#722013] group-hover:text-white transition-colors">
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

/* ============================================================
   MAIN
============================================================ */
const PAGE_SIZE_MOBILE = 4;

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [activePhase, setActivePhase] = useState("before");
  const [searchTerm, setSearchTerm] = useState("");
  const [openBlog, setOpenBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

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

  useEffect(() => { setPage(0); }, [activePhase, searchTerm]);

  const filteredBlogs = useMemo(() => {
    const phaseBlogs = blogs.filter((b) => b.phase === activePhase);
    const search = searchTerm.trim().toLowerCase();
    if (!search) return phaseBlogs;
    return phaseBlogs.filter((b) => {
      const hay = [b.title, b.description, b.category].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(search);
    });
  }, [blogs, activePhase, searchTerm]);

  // Mobile/tablet pagination
  const totalPagesMobile = Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE_MOBILE));
  const paginatedMobile = useMemo(
    () => filteredBlogs.slice(page * PAGE_SIZE_MOBILE, page * PAGE_SIZE_MOBILE + PAGE_SIZE_MOBILE),
    [filteredBlogs, page]
  );

  const featured = filteredBlogs[0];
  const rest = filteredBlogs.slice(1);

  return (
    <section className="min-h-screen w-full flex flex-col bg-[#FDFBF7] text-[#2a0b06]">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .blog-rich-content { font-family: Georgia, 'Times New Roman', serif; font-size: 1.05rem; line-height: 1.85; color: #3f3a34; }
        .blog-rich-content p { margin-bottom: 1.25rem; }
        .blog-rich-content p:first-of-type::first-letter {
          font-size: 3.5rem; float: left; line-height: 1; padding: 0.25rem 0.6rem 0 0;
          font-family: Georgia, serif; color: #722013; font-weight: 700;
        }
        .blog-rich-content h1, .blog-rich-content h2, .blog-rich-content h3 { color: #2a0b06; font-weight: 700; margin: 2rem 0 1rem; line-height: 1.3; font-family: Georgia, serif; }
        .blog-rich-content h2 { font-size: 1.5rem; }
        .blog-rich-content h3 { font-size: 1.25rem; }
        .blog-rich-content ul { list-style: disc inside; margin-bottom: 1.25rem; }
        .blog-rich-content ol { list-style: decimal inside; margin-bottom: 1.25rem; }
        .blog-rich-content blockquote { padding: 1rem 1.25rem; border-left: 4px solid #D4AF37; background: #FAF6F0; color: #722013; font-style: italic; margin: 1.5rem 0; border-radius: 0 12px 12px 0; }
        .blog-rich-content a { color: #722013; text-decoration: underline; text-decoration-color: #D4AF37; }
        .blog-rich-content img { border-radius: 12px; margin: 1.5rem 0; border: 1px solid #E8DCC4; }
      `}</style>

      {/* HEADER */}
      <header className="shrink-0 px-4 md:px-8 lg:px-12 pt-4 pb-3 border-b border-[#E8DCC4] bg-white relative overflow-hidden flex flex-col gap-4">
  {/* decorative (scaled down) */}
  <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
  <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-[#722013]/10 blur-3xl pointer-events-none" />

  {/* Title & Search Area */}
  <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 mb-0.5">
        <h1 className="font-serif font-bold text-xl md:text-2xl text-[#2a0b06] leading-none">
          Chaturmasya <span className="italic text-[#722013]">Articles</span>
        </h1>
        <div className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#722013] bg-[#722013]/5 px-2 py-0.5 rounded-full">
          <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
          Archives
        </div>
      </div>
      <p className="text-[11px] md:text-xs text-[#5a5046] font-serif italic truncate max-w-md">
        Reflections, rituals, and remembrances across the sacred four months.
      </p>
    </div>

    <div className="relative w-full sm:w-52 md:w-60 shrink-0">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#722013]/60" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search chronicles..."
        className="w-full bg-[#FAF6F0] border border-[#E8DCC4] rounded-md pl-8 pr-3 py-1.5 text-xs outline-none focus:border-[#722013] focus:bg-white transition-all shadow-sm"
      />
    </div>
  </div>

  {/* Phase Tabs */}
  <div className="relative flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-lg w-max max-w-full overflow-x-auto hide-scrollbar">
    {PHASES.map((phase) => (
      <button
        key={phase.id}
        onClick={() => setActivePhase(phase.id)}
        className={`relative px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] whitespace-nowrap transition-colors rounded-md ${
          activePhase === phase.id ? "text-white" : "text-[#5a5046] hover:text-[#2a0b06]"
        }`}
      >
        {activePhase === phase.id && (
          <motion.div
            layoutId="phasePill"
            className="absolute inset-0 bg-[#722013] rounded-md shadow-sm"
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          />
        )}
        <span className="relative z-10">{phase.label}</span>
      </button>
    ))}
  </div>
</header>

      {/* CONTENT */}
      <div className="flex-1 w-full px-4 md:px-8 lg:px-12 py-8 md:py-12">
        {loading ? (
          <div className="w-full flex flex-col items-center gap-3 py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#722013]" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#722013]">Loading chronicles…</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="w-full text-center py-24">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-serif font-bold text-xl text-gray-500">No chronicles found.</p>
            <p className="text-sm text-gray-400 mt-1">Try a different phase or search term.</p>
          </div>
        ) : (
          <>
            {/* LG+: editorial grid (featured + masonry) */}
            <div className="hidden lg:grid grid-cols-4 auto-rows-[220px] gap-6">
              {featured && (
                <div className="col-span-2 row-span-2">
                  <BlogCard blog={featured} onOpen={setOpenBlog} featured />
                </div>
              )}
              {rest.map((b) => (
                <div key={b.id} className="col-span-1 row-span-2">
                  <BlogCard blog={b} onOpen={setOpenBlog} />
                </div>
              ))}
            </div>

            {/* MD+: two column simple grid — hidden here, we let lg handle. */}

            {/* SM/MD: paginated grid */}
            <div className="lg:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {paginatedMobile.map((b) => (
                  <BlogCard key={b.id} blog={b} onOpen={setOpenBlog} />
                ))}
              </div>

              {totalPagesMobile > 1 && (
                <div className="flex items-center justify-between mt-8 gap-3">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E8DCC4] text-[#722013] text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-[#FAF6F0] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPagesMobile }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`h-2 rounded-full transition-all ${i === page ? "w-8 bg-[#722013]" : "w-2 bg-[#E8DCC4]"}`}
                        aria-label={`Page ${i + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPagesMobile - 1, p + 1))}
                    disabled={page >= totalPagesMobile - 1}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#722013] text-white text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-[#5a180e] transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* GLOBAL COMMENTS */}
      <GlobalComments />

      {/* MODAL */}
      <AnimatePresence>
        {openBlog && <BlogPopup blog={openBlog} onClose={() => setOpenBlog(null)} />}
      </AnimatePresence>
    </section>
  );
};

export default BlogSection;
