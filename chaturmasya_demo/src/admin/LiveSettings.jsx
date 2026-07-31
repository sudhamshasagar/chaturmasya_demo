import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function LiveSettings() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const snap = await getDoc(doc(db, "settings", "livestream"));

    if (snap.exists()) {
      setYoutubeUrl(snap.data().youtubeUrl || "");
    }

    setLoading(false);
  }

  function getVideoId(url) {
    const regExp =
      /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11}).*/;

    const match = url.match(regExp);

    return match ? match[1] : null;
  }

  async function saveLink() {
    const videoId = getVideoId(youtubeUrl);

    if (!videoId) {
      alert("Invalid YouTube URL");
      return;
    }

    await setDoc(
      doc(db, "settings", "livestream"),
      {
        youtubeUrl,
        videoId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    alert("Saved Successfully");
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-8">

      <h1 className="text-2xl font-bold mb-6">
        Live Stream Settings
      </h1>

      <input
        type="text"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        placeholder="Paste YouTube Link"
        className="border w-full p-3 rounded"
      />

      <button
        onClick={saveLink}
        className="bg-red-600 text-white px-6 py-3 rounded mt-5"
      >
        Save
      </button>

    </div>
  );
}