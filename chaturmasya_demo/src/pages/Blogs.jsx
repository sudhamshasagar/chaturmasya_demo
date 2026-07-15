import React, { useEffect, useMemo, useRef, useState } from "react";
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
  MessageCircle,
  Send,
  Calendar,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ChevronUp,
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

/* ============================================================
   HELPERS
============================================================ */

const getYouTubeEmbedUrl = (url) => {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (parsedUrl.pathname.includes("/embed/")) {
        return url;
      }

      if (parsedUrl.pathname.includes("/shorts/")) {
        const id = parsedUrl.pathname
          .split("/shorts/")[1]
          ?.split("/")[0];

        if (id) {
          return `https://www.youtube.com/embed/${id}`;
        }
      }
    }

    if (parsedUrl.hostname.includes("youtu.be")) {
      const id = parsedUrl.pathname
        .replace("/", "")
        .split("?")[0];

      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    return "";
  } catch {
    return "";
  }
};

const getBlogDate = (blog) => {
  const timestamp =
    blog?.createdAt || blog?.updatedAt;

  if (timestamp?.toDate) {
    try {
      return timestamp.toDate();
    } catch {
      return null;
    }
  }

  if (blog?.date) {
    const date = new Date(blog.date);

    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
};

const formatBlogDate = (blog) => {
  if (blog?.date) {
    return blog.date;
  }

  const date = getBlogDate(blog);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatCommentDate = (timestamp) => {
  if (!timestamp?.toDate) {
    return "";
  }

  try {
    return timestamp.toDate().toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const monthKey = (date) => {
  if (!date) {
    return "";
  }

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};

const monthLabel = (key) => {
  if (!key) {
    return "";
  }

  const [year, month] = key.split("-");

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

/* ============================================================
   VIDEO PLAYER
============================================================ */

const VideoPlayer = ({ url, title }) => {
  if (!url) {
    return null;
  }

  const youtubeUrl = getYouTubeEmbedUrl(url);

  if (youtubeUrl) {
    return (
      <div className="relative w-full aspect-video rounded-2xl md:rounded-3xl overflow-hidden bg-black shadow-sm">
        <iframe
          src={youtubeUrl}
          title={title || "Chronicle video"}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <video
      src={url}
      controls
      className="w-full max-h-[650px] rounded-2xl md:rounded-3xl bg-black"
    >
      Your browser does not support video playback.
    </video>
  );
};

/* ============================================================
   RESPONSIVE ARTICLE IMAGE
============================================================ */

const ArticleImage = ({ src, alt }) => {
  if (!src) {
    return null;
  }

  return (
    <div className="w-full flex justify-center">
      <img
        src={src}
        alt={alt || ""}
        loading="lazy"
        className="
          block
          w-auto
          max-w-full
          h-auto
          max-h-[700px]
          object-contain
          rounded-2xl
          md:rounded-3xl
        "
      />
    </div>
  );
};

/* ============================================================
   COMMENTS
============================================================ */

const CommentsPanel = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!blogId) {
      return;
    }

    const commentsQuery = query(
      collection(
        db,
        "blogs",
        blogId,
        "comments"
      ),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      commentsQuery,

      (snapshot) => {
        setComments(
          snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          }))
        );
      },

      (error) => {
        console.error(
          "Error loading comments:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [blogId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const finalName = name.trim();
    const finalMessage = message.trim();

    if (!finalName || !finalMessage) {
      setError(
        "Please enter your name and a message."
      );

      return;
    }

    try {
      setSubmitting(true);

      await addDoc(
        collection(
          db,
          "blogs",
          blogId,
          "comments"
        ),
        {
          name: finalName.slice(0, 60),

          message: finalMessage.slice(
            0,
            1000
          ),

          createdAt: serverTimestamp(),
        }
      );

      setMessage("");
    } catch (error) {
      console.error(error);

      setError(
        "Could not post your comment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-14 border-t border-[#E8DCC4] pt-10">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-[#722013]" />

        <h4 className="font-serif font-bold text-xl text-[#2a0b06]">
          Devotee Reflections

          <span className="ml-2 text-sm text-gray-400 font-sans font-medium">
            ({comments.length})
          </span>
        </h4>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#FAF6F0] border border-[#E8DCC4] rounded-2xl p-4 sm:p-5 mb-8"
      >
        <input
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Your name"
          maxLength={60}
          className="w-full bg-white border border-[#E8DCC4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#722013] transition"
        />

        <textarea
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          placeholder="Share your reflection…"
          rows={3}
          maxLength={1000}
          className="mt-3 w-full bg-white border border-[#E8DCC4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#722013] transition resize-y"
        />

        {error && (
          <p className="mt-2 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[10px] uppercase tracking-widest text-gray-400">
            {message.length}/1000
          </span>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-[#722013] hover:bg-[#5a180e] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full transition"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}

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

        {comments.map((comment) => (
          <li
            key={comment.id}
            className="bg-white border border-[#E8DCC4]/70 rounded-2xl p-4 sm:p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#722013]/10 text-[#722013] flex items-center justify-center font-bold shrink-0">
                {(comment.name || "?")
                  .slice(0, 1)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="font-bold text-sm text-[#2a0b06] truncate">
                  {comment.name}
                </p>

                <p className="text-[10px] uppercase tracking-widest text-gray-400">
                  {formatCommentDate(
                    comment.createdAt
                  )}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {comment.message}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ============================================================
   BLOG CARD
============================================================ */

const BlogCard = ({
  blog,
  onOpen,
  isActive,
}) => {
  const date = formatBlogDate(blog);

  const cover =
    (blog.coverMedia?.type === "image" &&
      blog.coverMedia?.url) ||
    blog.image ||
    "";

  const isVideo =
    blog.coverMedia?.type === "video";

  return (
    <button
      type="button"
      onClick={() => onOpen(blog)}
      className={`
        group
        text-left
        bg-white
        border
        rounded-3xl
        overflow-hidden
        transition-all
        duration-300
        flex
        flex-col
        h-full
        ${
          isActive
            ? "border-[#722013] shadow-xl ring-2 ring-[#722013]/20 -translate-y-0.5"
            : "border-[#E8DCC4]/70 hover:shadow-xl hover:border-[#722013]/30"
        }
      `}
    >
      {/* Keep cards uniform */}
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

                <span className="text-xs font-bold uppercase tracking-widest">
                  Video
                </span>
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

            <span className="truncate">
              {date}
            </span>
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
          {isActive ? "Reading" : "Read"}

          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
};

/* ============================================================
   BLOG READER
============================================================ */

const BlogReader = ({
  blog,
  onClose,
  activePhase,
  innerRef,
}) => {
  if (!blog) {
    return null;
  }

  const date = formatBlogDate(blog);

  const coverImage =
    blog.coverMedia?.type === "image"
      ? blog.coverMedia?.url
      : blog.image || "";

  return (
    <motion.article
      ref={innerRef}
      initial={{
        opacity: 0,
        y: -10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -10,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      className="relative bg-white border border-[#E8DCC4] rounded-[2rem] shadow-lg overflow-hidden mt-6 mb-2 scroll-mt-24"
    >
      {/* TOP BAR */}

      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-white/95 backdrop-blur border-b border-[#E8DCC4] px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-[#D4AF37] shrink-0" />

          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#722013] truncate">
            Now reading
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 bg-[#FAF6F0] hover:bg-[#722013] hover:text-white text-[#722013] text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 sm:px-4 py-2 rounded-full border border-[#E8DCC4] transition shrink-0"
        >
          <ChevronUp className="w-3.5 h-3.5" />

          Close
        </button>
      </div>

      <div className="p-5 sm:p-10 md:p-14">
        {/* ARTICLE HEADER */}

        <header className="text-center mb-8 md:mb-10">
          <div className="flex flex-wrap justify-center items-center gap-3 mb-5">
            {blog.category && (
              <span className="bg-[#FAF6F0] border border-[#E8DCC4] px-4 py-1.5 rounded-full text-[10px] font-bold text-[#722013] uppercase tracking-widest">
                {blog.category}
              </span>
            )}

            {activePhase === "during" &&
              blog.day && (
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
            <p className="max-w-2xl mx-auto mt-5 text-gray-500 text-base md:text-lg leading-relaxed">
              {blog.description}
            </p>
          )}
        </header>

        {/* COVER MEDIA */}

        {coverImage ? (
          <div className="mb-10">
            <ArticleImage
              src={coverImage}
              alt={blog.title}
            />
          </div>
        ) : blog.coverMedia?.type ===
            "video" &&
          blog.coverMedia?.url ? (
          <div className="mb-10">
            <VideoPlayer
              url={blog.coverMedia.url}
              title={blog.title}
            />
          </div>
        ) : null}

        {/* ARTICLE CONTENT */}

        <div className="max-w-3xl mx-auto space-y-14">
          {blog.sections
            ?.filter(
              (section) =>
                section.heading ||
                section.content ||
                section.description ||
                section.images?.length ||
                section.video
            )
            .map((section, index) => (
              <section
                key={
                  section.id || index
                }
              >
                {/* SECTION HEADING */}

                {section.heading && (
                  <div className="mb-5">
                    <h4 className="text-xl md:text-2xl font-serif font-bold text-[#2a0b06] leading-tight">
                      {section.heading}
                    </h4>

                    <div className="w-14 h-[2px] bg-[#D4AF37] mt-3" />
                  </div>
                )}

                {/* RICH TEXT FROM TIPTAP */}

                {(section.content ||
                  section.description) && (
                  <div
                    className="blog-rich-content"
                    dangerouslySetInnerHTML={{
                      __html:
                        section.content ||
                        section.description ||
                        "",
                    }}
                  />
                )}

                {/* SECTION IMAGES */}

                {section.images?.length >
                  0 && (
                  <div
                    className={`
                      mt-7
                      grid
                      gap-5

                      ${
                        section.images
                          .length === 1
                          ? "grid-cols-1"
                          : "grid-cols-1 md:grid-cols-2"
                      }
                    `}
                  >
                    {section.images.map(
                      (image, imageIndex) => (
                        <div
                          key={imageIndex}
                          className="
                            flex
                            items-center
                            justify-center
                            rounded-2xl
                            md:rounded-3xl
                            overflow-hidden
                            bg-[#FAF6F0]
                          "
                        >
                          <img
                            src={image}
                            alt={`${
                              section.heading ||
                              blog.title
                            } ${
                              imageIndex + 1
                            }`}
                            loading="lazy"
                            className="
                              block
                              w-auto
                              max-w-full
                              h-auto
                              max-h-[650px]
                              object-contain
                            "
                          />
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* SECTION VIDEO */}

                {section.video && (
                  <div className="mt-7">
                    <VideoPlayer
                      url={section.video}
                      title={
                        section.heading ||
                        blog.title
                      }
                    />
                  </div>
                )}
              </section>
            ))}

          {/* OLD BLOG FALLBACK */}

          {!blog.sections?.length &&
            blog.content && (
              <div className="blog-rich-content">
                {blog.content
                  .split("\n\n")
                  .filter(Boolean)
                  .map(
                    (
                      paragraph,
                      index
                    ) => (
                      <p key={index}>
                        {paragraph}
                      </p>
                    )
                  )}
              </div>
            )}
        </div>

        {/* FOOTER */}

        <div className="border-t border-[#E8DCC4] pt-8 mt-14 flex justify-center items-center gap-3">
          <div className="w-8 sm:w-12 h-px bg-[#D4AF37]" />

          <Sun className="w-5 h-5 text-[#D4AF37] shrink-0" />

          <p className="text-sm font-serif italic text-[#722013] font-bold tracking-wider text-center">
            {blog.footer ||
              "Jai Jnaneshwari"}
          </p>

          <div className="w-8 sm:w-12 h-px bg-[#D4AF37]" />
        </div>

        <CommentsPanel blogId={blog.id} />

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 bg-[#FAF6F0] hover:bg-[#722013] hover:text-white text-[#722013] text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full border border-[#E8DCC4] transition"
          >
            <ChevronUp className="w-4 h-4" />

            Back to chronicles
          </button>
        </div>
      </div>
    </motion.article>
  );
};

/* ============================================================
   PAGINATION
============================================================ */

const Pagination = ({
  page,
  totalPages,
  onChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = [];

  pages.push(1);

  if (page > 3) {
    pages.push("...");
  }

  for (
    let i = Math.max(2, page - 1);
    i <=
    Math.min(
      totalPages - 1,
      page + 1
    );
    i++
  ) {
    pages.push(i);
  }

  if (page < totalPages - 2) {
    pages.push("...");
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() =>
          onChange(
            Math.max(1, page - 1)
          )
        }
        disabled={page === 1}
        className="p-2 rounded-full border border-[#E8DCC4] bg-white text-[#722013] disabled:opacity-40"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((item, index) =>
        item === "..." ? (
          <span
            key={`dots-${index}`}
            className="px-2 text-gray-400"
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() =>
              onChange(item)
            }
            className={`
              min-w-9
              h-9
              px-3
              rounded-full
              text-xs
              font-bold

              ${
                item === page
                  ? "bg-[#722013] text-white"
                  : "bg-white border border-[#E8DCC4] text-gray-600"
              }
            `}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() =>
          onChange(
            Math.min(
              totalPages,
              page + 1
            )
          )
        }
        disabled={
          page === totalPages
        }
        className="p-2 rounded-full border border-[#E8DCC4] bg-white text-[#722013] disabled:opacity-40"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

/* ============================================================
   MAIN BLOG SECTION
============================================================ */

const BlogSection = () => {
  const [blogs, setBlogs] =
    useState([]);

  const [activePhase, setActivePhase] =
    useState("before");

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("all");

  const [openBlog, setOpenBlog] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [monthFilter, setMonthFilter] =
    useState("all");

  const [showFilters, setShowFilters] =
    useState(false);

  const [page, setPage] =
    useState(1);

  const gridRef = useRef(null);
  const readerRef = useRef(null);

  /* LOAD PUBLISHED BLOGS */

  useEffect(() => {
    const blogsQuery = query(
      collection(db, "blogs"),
      where("published", "==", true)
    );

    const unsubscribe = onSnapshot(
      blogsQuery,

      (snapshot) => {
        const list =
          snapshot.docs.map(
            (document) => ({
              id: document.id,
              ...document.data(),
            })
          );

        list.sort((a, b) => {
          const firstDate =
            getBlogDate(a)?.getTime() ||
            0;

          const secondDate =
            getBlogDate(b)?.getTime() ||
            0;

          return (
            secondDate -
            firstDate
          );
        });

        setBlogs(list);

        setLoading(false);
      },

      (error) => {
        console.error(
          "Error fetching blogs:",
          error
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* FILTER BY PHASE */

  const phaseBlogs = useMemo(
    () =>
      blogs.filter(
        (blog) =>
          blog.phase === activePhase
      ),
    [blogs, activePhase]
  );

  /* CATEGORIES */

  const categories = useMemo(
    () => [
      ...new Set(
        phaseBlogs
          .map(
            (blog) => blog.category
          )
          .filter(Boolean)
      ),
    ],
    [phaseBlogs]
  );

  /* MONTHS */

  const months = useMemo(() => {
    const monthSet =
      new Set();

    phaseBlogs.forEach(
      (blog) => {
        const date =
          getBlogDate(blog);

        if (date) {
          monthSet.add(
            monthKey(date)
          );
        }
      }
    );

    return [
      ...monthSet,
    ].sort().reverse();
  }, [phaseBlogs]);

  /* FILTER BLOGS */

  const filteredBlogs =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return phaseBlogs.filter(
        (blog) => {
          if (
            activeCategory !==
              "all" &&
            blog.category !==
              activeCategory
          ) {
            return false;
          }

          const date =
            getBlogDate(blog);

          if (
            monthFilter !==
              "all" &&
            (!date ||
              monthKey(date) !==
                monthFilter)
          ) {
            return false;
          }

          if (search) {
            const searchable =
              [
                blog.title,
                blog.description,
                blog.category,
                blog.day
                  ? `day ${blog.day}`
                  : "",
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            if (
              !searchable.includes(
                search
              )
            ) {
              return false;
            }
          }

          return true;
        }
      );
    }, [
      phaseBlogs,
      activeCategory,
      searchTerm,
      monthFilter,
    ]);

  useEffect(() => {
    setPage(1);
    setOpenBlog(null);
  }, [
    activePhase,
    activeCategory,
    searchTerm,
    monthFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredBlogs.length /
        PAGE_SIZE
    )
  );

  const pageStart =
    (page - 1) *
    PAGE_SIZE;

  const paginated =
    filteredBlogs.slice(
      pageStart,
      pageStart +
        PAGE_SIZE
    );

  const activePhaseData =
    PHASES.find(
      (phase) =>
        phase.id === activePhase
    );

  const handlePhaseChange = (
    phaseId
  ) => {
    setActivePhase(phaseId);

    setActiveCategory("all");

    setSearchTerm("");

    setMonthFilter("all");

    setPage(1);

    setOpenBlog(null);
  };

  const handleOpen = (
    blog
  ) => {
    if (
      openBlog?.id === blog.id
    ) {
      setOpenBlog(null);

      return;
    }

    setOpenBlog(blog);

    setTimeout(() => {
      readerRef.current?.scrollIntoView(
        {
          behavior: "smooth",
          block: "start",
        }
      );
    }, 100);
  };

  return (
    <section
      id="updates"
      className="scroll-mt-32 px-4 sm:px-6 lg:px-8"
    >
      {/* IMPORTANT:
          These styles render the HTML
          generated by Tiptap.
      */}

      <style>{`

        /* =====================================
           RICH TEXT CONTENT
        ===================================== */

        #updates .blog-rich-content {
          color: #4b5563;
          font-size: 1rem;
          line-height: 1.9;
          word-break: break-word;
        }

        #updates .blog-rich-content p {
          display: block;
          margin-top: 0;
          margin-bottom: 1.25rem;
        }

        #updates .blog-rich-content p:empty {
          min-height: 1.25rem;
        }

        #updates .blog-rich-content h1,
        #updates .blog-rich-content h2,
        #updates .blog-rich-content h3,
        #updates .blog-rich-content h4 {
          font-family: Georgia, serif;
          color: #2a0b06;
          font-weight: 700;
          line-height: 1.3;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        #updates .blog-rich-content h1 {
          font-size: 2rem;
        }

        #updates .blog-rich-content h2 {
          font-size: 1.75rem;
        }

        #updates .blog-rich-content h3 {
          font-size: 1.4rem;
        }

        /* BULLET LIST */

        #updates .blog-rich-content ul {
          display: block !important;
          list-style-type: disc !important;
          list-style-position: outside !important;
          padding-left: 2rem !important;
          margin-top: 1.25rem !important;
          margin-bottom: 1.25rem !important;
        }

        /* NUMBERED LIST */

        #updates .blog-rich-content ol {
          display: block !important;
          list-style-type: decimal !important;
          list-style-position: outside !important;
          padding-left: 2rem !important;
          margin-top: 1.25rem !important;
          margin-bottom: 1.25rem !important;
        }

        #updates .blog-rich-content li {
          display: list-item !important;
          margin-bottom: 0.65rem !important;
          padding-left: 0.3rem;
        }

        #updates .blog-rich-content li p {
          display: inline;
          margin: 0;
        }

        #updates .blog-rich-content ul ul {
          list-style-type: circle !important;
          margin-top: 0.5rem !important;
        }

        #updates .blog-rich-content ul ul ul {
          list-style-type: square !important;
        }

        #updates .blog-rich-content ol ol {
          list-style-type: lower-alpha !important;
          margin-top: 0.5rem !important;
        }

        /* TEXT FORMATTING */

        #updates .blog-rich-content strong {
          font-weight: 700;
          color: #2a0b06;
        }

        #updates .blog-rich-content b {
          font-weight: 700;
        }

        #updates .blog-rich-content em {
          font-style: italic;
        }

        #updates .blog-rich-content i {
          font-style: italic;
        }

        #updates .blog-rich-content u {
          text-decoration: underline;
        }

        /* BLOCKQUOTE */

        #updates .blog-rich-content blockquote {
          margin: 1.75rem 0;
          padding: 1rem 1.5rem;
          border-left: 4px solid #D4AF37;
          background: #FAF6F0;
          color: #722013;
          font-style: italic;
          border-radius: 0 0.75rem 0.75rem 0;
        }

        /* LINKS */

        #updates .blog-rich-content a {
          color: #722013;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* HORIZONTAL RULE */

        #updates .blog-rich-content hr {
          margin: 2rem 0;
          border: 0;
          border-top: 1px solid #E8DCC4;
        }

        /* Preserve inline Tiptap colors */

        #updates .blog-rich-content span {
          max-width: 100%;
        }

        @media (min-width: 640px) {

          #updates .blog-rich-content {
            font-size: 1.075rem;
          }

        }

      `}</style>

      {/* HEADER */}

      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 text-[#D4AF37] mb-3">
          <BookOpen className="w-5 h-5" />

          <span className="text-xs font-bold uppercase tracking-[0.25em]">
            Mutt Chronicles
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#2a0b06]">
          Sacred Stories & Updates
        </h2>

        <p className="mt-4 text-gray-500 leading-relaxed">
          Follow the sacred journey of
          Chaturmasya through stories,
          updates and reflections.
        </p>
      </div>

      {/* PHASE TABS */}

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {PHASES.map(
          (phase) => (
            <button
              key={phase.id}
              type="button"
              onClick={() =>
                handlePhaseChange(
                  phase.id
                )
              }
              className={`
                px-5
                py-2.5
                rounded-full
                text-xs
                sm:text-sm
                font-bold
                transition

                ${
                  activePhase ===
                  phase.id
                    ? "bg-[#722013] text-white shadow-lg"
                    : "bg-white border border-[#E8DCC4] text-gray-600 hover:text-[#722013]"
                }
              `}
            >
              {phase.shortLabel}
            </button>
          )
        )}
      </div>

      {/* PHASE DESCRIPTION */}

      <div className="text-center max-w-2xl mx-auto mb-8">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2a0b06]">
          {
            activePhaseData?.label
          }
        </h3>

        <p className="text-gray-500 text-sm mt-2 leading-relaxed">
          {
            activePhaseData?.description
          }
        </p>
      </div>

      {/* SEARCH + FILTER */}

      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search chronicles..."
              className="w-full bg-white border border-[#E8DCC4] rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#722013]"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                !showFilters
              )
            }
            className="px-4 rounded-2xl bg-white border border-[#E8DCC4] text-[#722013]"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="overflow-hidden"
            >
              <div className="grid sm:grid-cols-2 gap-4 mt-4 bg-white border border-[#E8DCC4] rounded-2xl p-4">
                <select
                  value={
                    activeCategory
                  }
                  onChange={(event) =>
                    setActiveCategory(
                      event.target
                        .value
                    )
                  }
                  className="border border-[#E8DCC4] rounded-xl px-4 py-3 text-sm bg-white"
                >
                  <option value="all">
                    All Categories
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={
                    monthFilter
                  }
                  onChange={(event) =>
                    setMonthFilter(
                      event.target
                        .value
                    )
                  }
                  className="border border-[#E8DCC4] rounded-xl px-4 py-3 text-sm bg-white"
                >
                  <option value="all">
                    All Months
                  </option>

                  {months.map(
                    (month) => (
                      <option
                        key={month}
                        value={month}
                      >
                        {monthLabel(
                          month
                        )}
                      </option>
                    )
                  )}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BLOG GRID */}

      <div ref={gridRef}>
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#722013] animate-spin" />
          </div>
        ) : paginated.length ===
          0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-[#D4AF37]/50 mx-auto mb-4" />

            <h3 className="font-serif text-xl font-bold text-[#2a0b06]">
              No chronicles found
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Published chronicles
              will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginated.map(
                (blog) => (
                  <BlogCard
                    key={blog.id}
                    blog={blog}
                    onOpen={
                      handleOpen
                    }
                    isActive={
                      openBlog?.id ===
                      blog.id
                    }
                  />
                )
              )}
            </div>

            <AnimatePresence mode="wait">
              {openBlog && (
                <BlogReader
                  key={openBlog.id}
                  blog={openBlog}
                  activePhase={
                    activePhase
                  }
                  onClose={() =>
                    setOpenBlog(
                      null
                    )
                  }
                  innerRef={
                    readerRef
                  }
                />
              )}
            </AnimatePresence>

            <Pagination
              page={page}
              totalPages={
                totalPages
              }
              onChange={(
                newPage
              ) => {
                setPage(
                  newPage
                );

                setOpenBlog(
                  null
                );

                gridRef.current?.scrollIntoView(
                  {
                    behavior:
                      "smooth",
                  }
                );
              }}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default BlogSection;