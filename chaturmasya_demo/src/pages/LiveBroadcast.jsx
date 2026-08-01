import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { Radio, ArrowLeft, Sparkles, Mic2, CalendarDays } from "lucide-react";
import { db } from "../firebase/firebase";
import YouTubePlayer from "../components/YouTubePlayer";
import VideoLibrary from "../components/VideoLibrary";

export default function LiveBroadcast() {
  const [loading, setLoading] = useState(true);
  const [liveVideoId, setLiveVideoId] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [watchingLive, setWatchingLive] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "livestream"), (snap) => {
      setLiveVideoId(snap.exists() ? snap.data().videoId || null : null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const currentVideoId = watchingLive && liveVideoId ? liveVideoId : selectedVideo?.videoId;

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-10">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-stone-200" />
        <div className="mt-6 flex flex-col gap-8 lg:flex-row">
          <div className="aspect-video w-full animate-pulse rounded-3xl bg-stone-200 lg:w-[64%]" />
          <div className="h-72 w-full animate-pulse rounded-3xl bg-stone-200 lg:w-[36%]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
      {/* Page header */}
      <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:mb-8 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700">
            <Sparkles size={12} /> Chaturmasya
          </p>
          <h1 className="truncate text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
            Live Broadcast
          </h1>
          <p className="mt-1 text-sm text-stone-500 sm:text-base">
            Daily rituals, live — plus the full Kathopadesha archive.
          </p>
        </div>

        <span
          className={`shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${
            liveVideoId ? "bg-red-600 text-white" : "bg-stone-200 text-stone-600"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${liveVideoId ? "animate-pulse bg-white" : "bg-stone-500"}`} />
          {liveVideoId ? "On air" : "Offline"}
        </span>
      </header>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[64%_36%] lg:items-start lg:gap-8">
        {/* Player */}
        <div className="min-w-0">
          <div className="relative rounded-3xl bg-stone-900 p-1.5 shadow-xl ring-1 ring-stone-900/10 sm:p-2">
            {watchingLive && liveVideoId && (
              <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
                <Radio size={13} className="animate-pulse" /> Live now
              </div>
            )}

            {!watchingLive && liveVideoId && (
              <button
                onClick={() => {
                  setWatchingLive(true);
                  setSelectedVideo(null);
                }}
                className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-amber-600 active:scale-95 sm:text-sm"
              >
                <ArrowLeft size={15} /> Return to live
              </button>
            )}

            {currentVideoId ? (
              <YouTubePlayer videoId={currentVideoId} autoplay muted={watchingLive} />
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-stone-800 to-stone-950 px-6 text-center text-stone-400">
                <Radio size={38} className="mb-3 opacity-50" />
                <p className="text-base font-semibold text-stone-200 sm:text-lg">No live broadcast right now</p>
                <p className="mt-1 text-sm">Pick a session from the archive to start watching.</p>
              </div>
            )}
          </div>

          {/* Now playing meta */}
          {!watchingLive && selectedVideo && (
            <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                  <CalendarDays size={11} /> Day {selectedVideo.day ?? "—"}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                  Now playing
                </span>
              </div>
              <h2 className="mt-2 text-lg font-bold leading-snug text-stone-900 sm:text-xl">
                {selectedVideo.title}
              </h2>
              {selectedVideo.speaker && (
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-stone-500">
                  <Mic2 size={13} /> {selectedVideo.speaker}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Library */}
        <aside className="min-w-0 lg:sticky lg:top-6 lg:h-[calc(100vh-120px)]">
          <VideoLibrary
            selectedVideo={selectedVideo}
            onSelectVideo={(video) => {
              setSelectedVideo(video);
              setWatchingLive(false);
            }}
          />
        </aside>
      </div>
    </div>
  );
}
