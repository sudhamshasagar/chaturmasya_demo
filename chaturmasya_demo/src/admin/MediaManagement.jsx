import { useEffect, useMemo, useState } from "react";
import {
  doc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  Radio,
  Save,
  Plus,
  Pencil,
  Trash2,
  X,
  PlayCircle,
  Eye,
  EyeOff,
  Film,
  Loader2,
  Link2,
  Tv,
} from "lucide-react";

const GOLD = "#D4AF37";

function extractVideoId(url = "") {
  const regExp =
    /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|live\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : "";
}

const thumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

const EMPTY_FORM = {
  day: "",
  title: "",
  speaker: "",
  youtubeUrl: "",
  published: true,
};

/* ---------- small UI atoms ---------- */

const Field = ({ label, hint, children }) => (
  <div className="min-w-0">
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
    </div>
    {children}
  </div>
);

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#D4AF37] focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/15";

const Badge = ({ ok }) => (
  <span
    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
      ok
        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
        : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
    }`}
  >
    {ok ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
    {ok ? "Published" : "Draft"}
  </span>
);

const Stat = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#D4AF37]/12 text-[#B9932C]">
      <Icon className="h-4.5 w-4.5" />
    </span>
    <div className="min-w-0">
      <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="text-lg font-black leading-tight text-slate-900 tabular-nums">
        {value}
      </p>
    </div>
  </div>
);

/* ---------- page ---------- */

export default function MediaManagement() {
  const [liveUrl, setLiveUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "livestream"), (snap) => {
      if (snap.exists()) setLiveUrl(snap.data().youtubeUrl || "");
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "kathopadeshaVideos"),
      (snapshot) => {
        const data = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => a.day - b.day);
        setVideos(data);
      }
    );
    return unsubscribe;
  }, []);

  const stats = useMemo(() => {
    const published = videos.filter((v) => v.published).length;
    return {
      total: videos.length,
      published,
      drafts: videos.length - published,
      latestDay: videos.length ? Math.max(...videos.map((v) => Number(v.day) || 0)) : 0,
    };
  }, [videos]);

  const liveId = extractVideoId(liveUrl);
  const formId = extractVideoId(form.youtubeUrl);

  async function updateLive() {
    if (!liveUrl.trim()) return alert("Please enter YouTube URL");
    if (!liveId) return alert("Invalid YouTube URL");

    setLoading(true);
    await setDoc(
      doc(db, "settings", "livestream"),
      { youtubeUrl: liveUrl, videoId: liveId, updatedAt: serverTimestamp() },
      { merge: true }
    );
    setLoading(false);
    alert("Live stream updated.");
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function editVideo(video) {
    setEditingId(video.id);
    setForm({
      day: video.day ?? "",
      title: video.title ?? "",
      speaker: video.speaker ?? "",
      youtubeUrl: video.youtubeUrl ?? "",
      published: !!video.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeVideo(id) {
    if (!window.confirm("Delete this video?")) return;
    await deleteDoc(doc(db, "kathopadeshaVideos", id));
    if (editingId === id) resetForm();
  }

  async function saveVideo() {
    if (!form.day || !String(form.title).trim()) {
      return alert("Day and Title are required");
    }
    if (!formId) return alert("Invalid YouTube URL");

    setSaving(true);
    const payload = {
      day: Number(form.day),
      title: form.title.trim(),
      speaker: form.speaker.trim(),
      youtubeUrl: form.youtubeUrl.trim(),
      videoId: formId,
      published: !!form.published,
      updatedAt: serverTimestamp(),
    };

    if (editingId) {
      await updateDoc(doc(db, "kathopadeshaVideos", editingId), payload);
    } else {
      await addDoc(collection(db, "kathopadeshaVideos"), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }
    setSaving(false);
    resetForm();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #B9932C)` }}
            >
              <Film className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-black tracking-tight text-slate-900 sm:text-lg">
                Media Management
              </h1>
              <p className="truncate text-[11px] text-slate-500 sm:text-xs">
                Livestream &amp; Kathopadesha library
              </p>
            </div>
          </div>
          {liveId && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-600 ring-1 ring-red-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
              </span>
              LIVE SET
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={Film} label="Total videos" value={stats.total} />
          <Stat icon={Eye} label="Published" value={stats.published} />
          <Stat icon={EyeOff} label="Drafts" value={stats.drafts} />
          <Stat icon={PlayCircle} label="Latest day" value={stats.latestDay || "—"} />
        </section>

        {/* Live stream */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-r from-red-50 to-white px-5 py-4">
            <Radio className="h-4.5 w-4.5 shrink-0 text-red-600" />
            <h2 className="truncate text-sm font-black uppercase tracking-wider text-slate-800">
              Live Stream
            </h2>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:p-6">
            <div className="min-w-0 space-y-4">
              <Field label="YouTube URL" hint={liveId ? "Valid link" : "Paste a live link"}>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className={`${inputClass} pl-9`}
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://youtube.com/live/..."
                  />
                </div>
              </Field>

              <button
                onClick={updateLive}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60 sm:w-auto"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? "Saving..." : "Update Live"}
              </button>
            </div>

            <div className="min-w-0">
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {liveId ? (
                  <>
                    <img
                      src={thumb(liveId)}
                      alt="Live stream thumbnail"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute inset-0 grid place-items-center bg-black/25">
                      <PlayCircle className="h-10 w-10 text-white/90" />
                    </span>
                  </>
                ) : (
                  <div className="grid h-full place-items-center gap-2 text-slate-400">
                    <Tv className="h-8 w-8" />
                    <p className="text-xs font-medium">Preview appears here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Add / edit video */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-[#D4AF37]/10 to-white px-5 py-4">
            <h2 className="truncate text-sm font-black uppercase tracking-wider text-slate-800">
              {editingId ? "Edit Video" : "Add Kathopadesha Video"}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-200"
              >
                <X className="h-3 w-3" /> Cancel edit
              </button>
            )}
          </div>

          <div className="space-y-5 p-5 lg:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Day">
                <input
                  type="number"
                  name="day"
                  value={form.day}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="1"
                />
              </Field>
              <Field label="Speaker">
                <input
                  type="text"
                  name="speaker"
                  value={form.speaker}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Name"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Title">
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Discourse title"
                  />
                </Field>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
              <div className="min-w-0 space-y-4">
                <Field label="YouTube URL" hint={formId ? "Valid link" : ""}>
                  <div className="relative">
                    <Tv className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="youtubeUrl"
                      value={form.youtubeUrl}
                      onChange={handleChange}
                      className={`${inputClass} pl-9`}
                      placeholder="https://youtu.be/..."
                    />
                  </div>
                </Field>

                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-800">Published</span>
                    <span className="block text-[11px] text-slate-500">
                      Visible to devotees on the site
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    name="published"
                    checked={form.published}
                    onChange={handleChange}
                    className="h-5 w-5 shrink-0 accent-[#D4AF37]"
                  />
                </label>

                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <button
                    onClick={saveVideo}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg, ${GOLD}, #B9932C)` }}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingId ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {saving ? "Saving..." : editingId ? "Save changes" : "Add video"}
                  </button>
                  <button
                    onClick={resetForm}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="min-w-0">
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  {formId ? (
                    <img
                      src={thumb(formId)}
                      alt="Video thumbnail"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full place-items-center gap-2 text-slate-400">
                      <Film className="h-7 w-7" />
                      <p className="text-xs font-medium">Thumbnail preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Existing videos */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-100 px-5 py-4">
            <h2 className="truncate text-sm font-black uppercase tracking-wider text-slate-800">
              Existing Videos
            </h2>
            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 tabular-nums">
              {videos.length}
            </span>
          </div>

          {videos.length === 0 ? (
            <div className="grid place-items-center gap-2 px-5 py-14 text-center">
              <Film className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No videos added yet</p>
              <p className="text-xs text-slate-400">Add your first Kathopadesha video above.</p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <ul className="divide-y divide-slate-100 lg:hidden">
                {videos.map((video) => (
                  <li key={video.id} className="p-4">
                    <div className="flex gap-3">
                      <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        {video.videoId && (
                          <img
                            src={thumb(video.videoId)}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 rounded-md bg-[#D4AF37]/15 px-2 py-0.5 text-[11px] font-black text-[#B9932C]">
                            Day {video.day}
                          </span>
                          <Badge ok={!!video.published} />
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm font-bold text-slate-800">
                          {video.title}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {video.speaker || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => editVideo(video)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => removeVideo(video.id)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-[11px] uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3 font-bold">Video</th>
                      <th className="px-5 py-3 font-bold">Day</th>
                      <th className="px-5 py-3 font-bold">Speaker</th>
                      <th className="px-5 py-3 font-bold">Status</th>
                      <th className="px-5 py-3 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {videos.map((video) => (
                      <tr key={video.id} className="transition hover:bg-slate-50/70">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                              {video.videoId && (
                                <img
                                  src={thumb(video.videoId)}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              )}
                            </div>
                            <span className="line-clamp-2 max-w-xs font-semibold text-slate-800">
                              {video.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-bold text-[#B9932C] tabular-nums">
                          Day {video.day}
                        </td>
                        <td className="px-5 py-3 text-slate-600">{video.speaker || "—"}</td>
                        <td className="px-5 py-3">
                          <Badge ok={!!video.published} />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => editVideo(video)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => removeVideo(video.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
