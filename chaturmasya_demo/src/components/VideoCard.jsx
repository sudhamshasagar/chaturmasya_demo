import { Play, User2, CalendarDays } from "lucide-react";

export default function VideoCard({ video, onSelect, active }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(video)}
      aria-current={active ? "true" : undefined}
      className={`group relative flex shrink-0 snap-start overflow-hidden rounded-2xl border text-left
        w-[78vw] xs:w-[70vw] sm:w-[300px] lg:w-full
        flex-col sm:flex-row
        bg-white transition-all duration-300
        focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2
        ${active
          ? "border-amber-400 bg-amber-50/60 shadow-[0_1px_0_0_rgba(217,119,6,.25),0_8px_24px_-12px_rgba(217,119,6,.45)]"
          : "border-stone-200 hover:border-amber-300 hover:shadow-md"}`}
    >
      {/* Active rail */}
      <span
        className={`absolute left-0 top-0 h-full w-1 transition-opacity ${
          active ? "bg-amber-500 opacity-100" : "opacity-0"
        }`}
      />

      {/* Thumbnail */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-stone-100 sm:w-36 sm:aspect-auto sm:h-auto lg:w-40">
        <img
          src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
          alt={video.title || "Session thumbnail"}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent transition-colors group-hover:from-black/60" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/90 opacity-0 shadow-md backdrop-blur transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 scale-90">
            <Play size={15} className="translate-x-[1px] fill-amber-600 text-amber-600" />
          </span>
        </span>

        {active && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-amber-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Playing
          </span>
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1 p-3 sm:py-3 sm:pl-3.5 sm:pr-4">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-600">
            <CalendarDays size={11} /> Day {video.day ?? "—"}
          </span>
          {video.duration && (
            <span className="text-[10px] font-semibold text-stone-400">{video.duration}</span>
          )}
        </div>

        <h3
          className={`line-clamp-2 text-sm font-bold leading-snug transition-colors ${
            active ? "text-amber-800" : "text-stone-800 group-hover:text-amber-700"
          }`}
        >
          {video.title || "Untitled session"}
        </h3>

        {video.speaker && (
          <p className="mt-1.5 flex min-w-0 items-center gap-1 text-xs text-stone-500">
            <User2 size={12} className="shrink-0" />
            <span className="truncate">{video.speaker}</span>
          </p>
        )}
      </div>
    </button>
  );
}
