import { useEffect, useMemo, useRef, useState } from "react";
import { collection, query, onSnapshot, getDocs } from "firebase/firestore";
import { Search, SearchX, X, ChevronLeft, ChevronRight, Library } from "lucide-react";
import { db } from "../firebase/firebase";
import VideoCard from "./VideoCard";

const PAGE_SIZE = 12;

function CardSkeleton() {
  return (
    <div className="flex w-[78vw] shrink-0 animate-pulse flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white sm:w-[300px] sm:flex-row lg:w-full">
      <div className="aspect-video w-full bg-stone-200 sm:h-24 sm:w-36 sm:aspect-auto lg:w-40" />
      <div className="flex-1 space-y-2 p-3">
        <div className="h-3 w-16 rounded bg-stone-200" />
        <div className="h-3.5 w-4/5 rounded bg-stone-200" />
        <div className="h-3 w-2/5 rounded bg-stone-200" />
      </div>
    </div>
  );
}

export default function VideoLibrary({ selectedVideo, onSelectVideo }) {
  const [videos, setVideos] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "kathopadeshaVideos"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setVideos(list);
        if (snapshot.docs.length) setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Error:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  async function loadMore() {
    if (!lastDoc) return;
    setLoadingMore(true);
    try {
      const snapshot = await getDocs(query(collection(db, "kathopadeshaVideos")));
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setVideos((prev) => {
        const ids = new Set(prev.map((v) => v.id));
        return [...prev, ...list.filter((v) => !ids.has(v.id))];
      });
      if (snapshot.docs.length) setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  }

  // Gentle auto-advance on mobile carousel
  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth >= 1024) return;
    const el = scrollRef.current;
    if (!el) return;
    let paused = false;
    const pause = () => (paused = true);
    const resume = () => (paused = false);
    el.addEventListener("pointerdown", pause);
    el.addEventListener("pointerup", resume);
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);

    const interval = setInterval(() => {
      if (paused) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 12) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: el.clientWidth * 0.85, behavior: "smooth" });
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("pointerup", resume);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, [videos]);

  const nudge = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const filteredVideos = useMemo(() => {
    if (!search.trim()) return videos;
    const term = search.toLowerCase();
    return videos.filter(
      (v) =>
        (v.title || "").toLowerCase().includes(term) ||
        (v.speaker || "").toLowerCase().includes(term) ||
        String(v.day ?? "").includes(term)
    );
  }, [videos, search]);

  return (
    <section className="flex h-full max-h-[calc(100vh-140px)] flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white">
      {/* Header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-stone-200/80 bg-white/70 px-4 py-4 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <Library size={17} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-stone-900 sm:text-lg">Previous Sessions</h2>
            <p className="truncate text-xs text-stone-500">Kathopadesha archive</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-stone-900/90 px-3 py-1 text-[11px] font-bold text-white">
          {filteredVideos.length} {filteredVideos.length === 1 ? "video" : "videos"}
        </span>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden p-4 sm:p-5">
        {/* Search */}
        <div className="relative mb-5">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            inputMode="search"
            placeholder="Search title, speaker or day…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-11 pr-10 text-sm text-stone-800 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/60"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden lg:flex-col">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white px-6 py-14 text-center">
            <SearchX size={42} className="mb-3 text-stone-300" />
            <p className="font-semibold text-stone-700">No sessions found</p>
            <p className="mt-1 text-sm text-stone-500">Try a different title, speaker or day.</p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-4 rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-amber-600"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="relative flex-1 overflow-hidden">
            {/* Mobile arrows */}
            <div className="mb-3 flex items-center justify-end gap-2 lg:hidden">
              <button
                onClick={() => nudge(-1)}
                aria-label="Previous"
                className="grid h-8 w-8 place-items-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-sm active:scale-95"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => nudge(1)}
                aria-label="Next"
                className="grid h-8 w-8 place-items-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-sm active:scale-95"
              >
                <ChevronRight size={16} />
              </button>
            </div>

           <div
  ref={scrollRef}
  className="
    h-full
    flex
    snap-x
    snap-mandatory
    gap-4
    overflow-x-auto
    pb-2

    lg:flex-col
    lg:overflow-y-auto
    lg:overflow-x-hidden
    lg:snap-none

    [-ms-overflow-style:none]
    [scrollbar-width:none]
    [&::-webkit-scrollbar]:hidden
  "
>
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  active={selectedVideo?.videoId === video.videoId}
                  onSelect={onSelectVideo}
                />
              ))}

              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="shrink-0 self-stretch rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60 lg:w-full"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              )}
            </div>

            {/* Fade edge on mobile */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent lg:hidden" />
          </div>
        )}
      </div>
    </section>
  );
}
