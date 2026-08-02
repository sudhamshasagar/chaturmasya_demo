import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image,
  Video,
  Search,
  Calendar,
  Loader2,
  ChevronRight,
  PlayCircle,
  X,
} from "lucide-react";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const hideScrollbar =
  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

export default function Gallery() {
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("photos");

  const [albums, setAlbums] = useState([]);

  const [galleryItems, setGalleryItems] = useState([]);

  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubAlbums = onSnapshot(
      query(collection(db, "albums"), orderBy("date", "desc")),
      (snapshot) => {
        setAlbums(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
        setLoading(false);
      }
    );

    const unsubItems = onSnapshot(
      query(collection(db, "galleryItems")),
      (snapshot) => {
        setGalleryItems(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      }
    );

    return () => {
      unsubAlbums();
      unsubItems();
    };
  }, []);

  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      const matchesTab =
        tab === "photos"
          ? album.type === "photo"
          : album.type === "video";

      const matchesSearch = album.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [albums, tab, search]);

  const albumItems = useMemo(() => {
    if (!selectedAlbum) return [];

    return galleryItems.filter(
      (item) => item.albumId === selectedAlbum.id
    );
  }, [galleryItems, selectedAlbum]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-stone-50 ${hideScrollbar}`}>

      {/* Hero */}

      <section className="relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-r from-amber-100 via-white to-stone-100" />

        <div className="relative max-w-7xl mx-auto px-6 py-16">

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-serif font-bold text-stone-900"
          >
            Moments
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .2 }}
            className="mt-5 text-stone-600 text-lg max-w-3xl leading-relaxed"
          >
            Relive the divine memories of Chaturmasya —
            discourses, cultural programmes,
            devotional gatherings,
            group photographs,
            memorable celebrations
            and every beautiful moment.
          </motion.p>

        </div>

      </section>

      {/* Search */}

      <section className="max-w-7xl mx-auto px-6 mt-8">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-3.5 text-stone-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search albums..."
            className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-amber-500"
          />

        </div>

      </section>

      {/* Tabs */}

      <section className="max-w-7xl mx-auto px-6 mt-8">

        <div className="inline-flex rounded-full bg-white border border-stone-200 shadow-sm p-1">

          <button
            onClick={() => setTab("photos")}
            className={`px-6 py-2 rounded-full font-semibold transition flex items-center gap-2 ${
              tab === "photos"
                ? "bg-amber-600 text-white"
                : "text-stone-600"
            }`}
          >
            <Image size={18} />
            Photos
          </button>

          <button
            onClick={() => setTab("videos")}
            className={`px-6 py-2 rounded-full font-semibold transition flex items-center gap-2 ${
              tab === "videos"
                ? "bg-amber-600 text-white"
                : "text-stone-600"
            }`}
          >
            <Video size={18} />
            Videos
          </button>

        </div>

      </section>

      {/* Album Grid */}

      <section className="max-w-7xl mx-auto px-6 py-10">

        <AnimatePresence mode="wait">

          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .3 }}
            className="grid md:grid-cols-2 xl:grid-cols-3 gap-8"
          >

            {/* PART 2 STARTS HERE */}
{filteredAlbums.length === 0 ? (
  <div className="col-span-full">

    <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center">

      <Image
        size={60}
        className="mx-auto text-stone-300 mb-4"
      />

      <h2 className="text-2xl font-bold text-stone-900">
        No Albums Found
      </h2>

      <p className="mt-3 text-stone-500">
        There are no {tab} albums matching your search.
      </p>

    </div>

  </div>
) : (

  filteredAlbums.map((album) => {

    const count = galleryItems.filter(
      (item) => item.albumId === album.id
    ).length;

    return (

      <motion.div
        key={album.id}
        whileHover={{
          y: -8,
          transition: { duration: .25 }
        }}
        onClick={() => setSelectedAlbum(album)}
        className="group bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300"
      >

        {/* Cover */}

        <div className="relative h-72 overflow-hidden">

          {album.coverImage ? (

            <img
              src={album.coverImage}
              alt={album.title}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
            />

          ) : (

            <div className="w-full h-full bg-stone-200 flex items-center justify-center">

              {album.type === "photo" ? (

                <Image
                  size={60}
                  className="text-stone-400"
                />

              ) : (

                <PlayCircle
                  size={60}
                  className="text-stone-400"
                />

              )}

            </div>

          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full px-3 py-1 text-xs font-bold">

            {count} {album.type === "photo" ? "Photos" : "Videos"}

          </div>

          <div className="absolute bottom-5 left-5 right-5">

            <h2 className="text-white text-2xl font-bold drop-shadow">

              {album.title}

            </h2>

          </div>

        </div>

        {/* Content */}

        <div className="p-6">

          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider">

            <Calendar size={14} />

            {album.date
              ? new Date(album.date).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )
              : ""}

          </div>

          <p className="mt-4 text-stone-600 leading-relaxed line-clamp-3">

            {album.description}

          </p>

          <div className="mt-6 flex items-center justify-between">

            <span className="font-semibold text-stone-700">

              Explore Album

            </span>

            <ChevronRight
              className="text-amber-600 group-hover:translate-x-1 transition"
            />

          </div>

        </div>

      </motion.div>

    );

  })

)}

          </motion.div>

        </AnimatePresence>

      </section>

      {/* Album Modal Starts Here */}

      <AnimatePresence>

        {selectedAlbum && (
          <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
>

  <motion.div
    initial={{ scale: .95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: .95, opacity: 0 }}
    transition={{ duration: .25 }}
    className="bg-white rounded-3xl w-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col"
  >

    {/* Header */}

    <div className="flex items-center justify-between px-6 py-5 border-b">

      <div>

        <h2 className="text-2xl font-bold text-stone-900">
          {selectedAlbum.title}
        </h2>

        <p className="text-stone-500 mt-1">
          {selectedAlbum.description}
        </p>

      </div>

      <button
        onClick={() => setSelectedAlbum(null)}
        className="w-11 h-11 rounded-full hover:bg-stone-100 flex items-center justify-center"
      >
        <X size={22} />
      </button>

    </div>

    {/* Content */}

    <div
      className={`flex-1 overflow-y-auto p-6 ${hideScrollbar}`}
    >

      {selectedAlbum.type === "photo" ? (

        <div className="columns-2 md:columns-3 xl:columns-4 gap-4 space-y-4">

          {albumItems.map((photo) => (

            <motion.img
              key={photo.id}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: .25 }}
              src={photo.imageUrl}
              alt={photo.caption || ""}
              onClick={() => setSelectedImage(photo)}
              className="rounded-2xl w-full cursor-pointer shadow hover:shadow-xl break-inside-avoid"
            />

          ))}

        </div>

      ) : (

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {albumItems.map((video) => (

            <motion.div
              key={video.id}
              whileHover={{ y: -5 }}
              className="overflow-hidden rounded-2xl bg-stone-100 shadow"
            >

              <iframe
                title={video.title}
                src={video.youtubeUrl.replace(
                  "watch?v=",
                  "embed/"
                )}
                className="w-full aspect-video"
                allowFullScreen
              />

              <div className="p-5">

                <h3 className="font-bold text-lg">

                  {video.title}

                </h3>

                <p className="mt-2 text-sm text-stone-500">

                  {video.caption}

                </p>

              </div>

            </motion.div>

          ))}

        </div>

      )}

    </div>

  </motion.div>

</motion.div>

)}

</AnimatePresence>

{/* Fullscreen Image Viewer */}

<AnimatePresence>

{selectedImage && (

<motion.div

initial={{opacity:0}}

animate={{opacity:1}}

exit={{opacity:0}}

className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-6"

onClick={()=>setSelectedImage(null)}

>

<motion.img

initial={{scale:.9}}

animate={{scale:1}}

exit={{scale:.9}}

src={selectedImage.imageUrl}

alt=""

className="max-w-full max-h-full rounded-2xl shadow-2xl"

/>

<button

onClick={()=>setSelectedImage(null)}

className="absolute top-6 right-6 bg-white rounded-full p-3"

>

<X/>

</button>

</motion.div>

)}

</AnimatePresence>
</div>
);
}