import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export default function YouTubePlayer({ videoId, autoplay = true, muted = true }) {
  const playerContainer = useRef(null);
  const playerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    setReady(false);

    const createPlayer = () => {
      if (!window.YT?.Player || !playerContainer.current) return;

      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player(playerContainer.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          mute: muted ? 1 : 0,
          playsinline: 1,
          rel: 0,
          controls: 1,
          modestbranding: 1,
       },
        events: {
          onReady: (event) => {
            muted ? event.target.mute() : event.target.unMute();
            event.target.setVolume(80);
            if (autoplay) event.target.playVideo();
            setReady(true);
          },
        },
      });
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      if (!document.getElementById("youtube-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      const old = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        old?.();
        createPlayer();
      };
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, autoplay, muted]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-white/10">
      <div className="relative aspect-video w-full">
        <div ref={playerContainer} className="absolute inset-0 h-full w-full" />
        {!ready && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-stone-950">
            <Loader2 size={26} className="animate-spin text-amber-400" />
          </div>
        )}
      </div>
    </div>
  );
}
