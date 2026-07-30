import React, { useRef, useEffect, useState } from "react";
import { Volume2 } from "lucide-react";

export default function LiveBroadcast() {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [isLive, setIsLive] = useState(false);
  const playerRef = useRef(null);
  const youtubePlayerRef = useRef(null);

/* YouTube Player Initialization */
useEffect(() => {
  const initializePlayer = () => {
    if (!videoId) return;

    if (!window.YT || !window.YT.Player || !playerRef.current) return;

    // Destroy any existing player before creating a new one
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.destroy();
      youtubePlayerRef.current = null;
    }

    youtubePlayerRef.current = new window.YT.Player(playerRef.current, {
      videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        playsinline: 1,
        rel: 0,
        controls: 1,
        modestbranding: 1,
      },
      events: {
        onReady: (event) => {
          event.target.mute();
          event.target.setVolume(80);
          event.target.playVideo();
        },
      },
    });
  };

  if (window.YT && window.YT.Player) {
    initializePlayer();
  } else {
    if (!document.getElementById("youtube-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) previousCallback();
      initializePlayer();
    };
  }

  return () => {
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.destroy();
      youtubePlayerRef.current = null;
    }
  };
}, [videoId]);


  useEffect(() => {
  async function fetchLiveVideo() {
    try {
      const response = await fetch(
        "https://getlivevideo-7iltpxjlfa-uc.a.run.app"
      );

      const data = await response.json();

      if (data.live) {
        setVideoId(data.videoId);
      } else {
        setVideoId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  fetchLiveVideo();

  const interval = setInterval(fetchLiveVideo, 60000);

  return () => clearInterval(interval);
}, []);

  const handleJoinLive = () => {
    const player = youtubePlayerRef.current;
    if (!player) return;
    player.setVolume(80);
    player.unMute();
    player.playVideo();
  };

  if (loading) {
  return <div className="text-center py-20">Loading Live...</div>;
}

if (!videoId) {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold">
        🔴 No Live Stream Currently
      </h2>

      <p className="mt-2 text-gray-600">
        The live stream will appear automatically when the channel goes live.
      </p>
    </div>
  );
}

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 font-sans">
      <div className="mb-4">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
          Youtube Live
        </h2>
        <p className="text-sm font-medium text-stone-500 mt-1">
          Experience the daily rituals in real-time
        </p>
      </div>

      <section className="relative w-full aspect-video md:aspect-[21/9] max-h-[65vh] bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-stone-900/5 group">
        {/* YouTube Container */}
        <div ref={playerRef} className="absolute inset-0 w-full h-full" />
        
        {/* Top-Left Live Badge */}

        {/* Bottom-Right Unmute Action (Hover effect on desktop, always visible slightly on mobile) */}
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-10 opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform translate-y-2 md:group-hover:translate-y-0">
          <button
            onClick={handleJoinLive}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-5 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-xl hover:shadow-amber-500/20 hover:scale-105 active:scale-95"
          >
            <Volume2 className="w-4 h-4" /> Unmute Audio
          </button>
        </div>
      </section>
    </div>
  );
}