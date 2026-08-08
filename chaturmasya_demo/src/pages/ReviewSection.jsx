import { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { Star, MessageCircle, Pencil, Quote, Send } from "lucide-react";
import { motion } from "framer-motion";
import { db } from "../firebase/firebase";

export default function ReviewSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [form, setForm] = useState({
    name: "",
    review: "",
    rating: 5,
  });

  const [commentTexts, setCommentTexts] = useState({});

  useEffect(() => {
    const q = query(
      collection(db, "reviews"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReviews(list);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const stats = useMemo(() => {
    if (!reviews.length) {
      return {
        average: 0,
        total: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let total = 0;

    reviews.forEach((r) => {
      breakdown[r.rating]++;
      total += r.rating;
    });

    return {
      average: (total / reviews.length).toFixed(1),
      total: reviews.length,
      breakdown,
    };
  }, [reviews]);

  const renderStars = (count, size = 16) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        className={
          i < count
            ? "fill-[#D4AF37] text-[#D4AF37]"
            : "fill-gray-100 text-gray-200"
        }
      />
    ));

  const submitReview = async () => {
    if (!form.name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!form.review.trim()) {
      alert("Please write your review");
      return;
    }

    try {
      if (editingReview) {
        await updateDoc(doc(db, "reviews", editingReview.id), {
          name: form.name,
          review: form.review,
          rating: form.rating,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "reviews"), {
          name: form.name,
          review: form.review,
          rating: form.rating,
          comments: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setShowModal(false);
      setEditingReview(null);
      setForm({ name: "", review: "", rating: 5 });
    } catch (e) {
      console.error(e);
    }
  };

  const addComment = async (reviewId) => {
    const text = commentTexts[reviewId];
    if (!text?.trim()) return;

    await updateDoc(doc(db, "reviews", reviewId), {
      comments: arrayUnion({
        name: "Anonymous",
        comment: text,
        createdAt: new Date(),
      }),
    });

    setCommentTexts((prev) => ({ ...prev, [reviewId]: "" }));
  };

  return (
    <section id="feedback" className="py-20 bg-[#FFFDF8] relative overflow-hidden">
      {/* Decorative background elements matching light elegant theme */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl md:text-5xl text-[#5A3418]">
            Devotee Experiences
          </h2>
          <div className="mt-4 flex items-center justify-center gap-4 w-full max-w-sm mx-auto">
            <div className="h-px bg-gradient-to-r from-transparent to-[#D4AF37]/50 flex-1" />
            <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]/20" />
            <div className="h-px bg-gradient-to-l from-transparent to-[#D4AF37]/50 flex-1" />
          </div>
        </motion.div>

        {/* Master Card Container for small/medium/large screens */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#D4AF37]/20 overflow-hidden">
          <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#D4AF37]/10">
            
            {/* Left Column: Stats & Actions */}
            <div className="lg:col-span-4 p-8 md:p-10 bg-gradient-to-b from-white to-[#FFFDF8]/50 flex flex-col">
              <h3 className="font-serif text-2xl text-[#5A3418] mb-8">
                Overall Rating
              </h3>

              <div className="flex items-end gap-4 mb-10">
                <span className="text-7xl font-serif text-[#D4AF37] leading-none">
                  {stats.average}
                </span>
                <div className="pb-2">
                  <div className="flex gap-1 mb-1">
                    {renderStars(Math.round(stats.average), 20)}
                  </div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                    {stats.total} Reviews
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const percent =
                    stats.total === 0
                      ? 0
                      : (stats.breakdown[rating] / stats.total) * 100;

                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="w-3 text-sm font-medium text-gray-500">
                        {rating}
                      </span>
                      <Star
                        size={14}
                        className="fill-[#D4AF37] text-[#D4AF37]"
                      />
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#D4AF37] h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-8 text-right text-gray-400">
                        {stats.breakdown[rating]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="mt-auto w-full py-4 rounded-xl bg-[#5A3418] text-[#FFFDF8] font-medium tracking-wide hover:bg-[#4A2A12] hover:shadow-lg hover:shadow-[#5A3418]/20 transition-all duration-300"
              >
                Share Your Experience
              </button>
            </div>

            {/* Right Column: Scrollable Reviews List */}
            <div className="lg:col-span-8 bg-white relative">
              {loading ? (
                <div className="h-[600px] flex items-center justify-center text-gray-400 font-medium">
                  Loading Reviews...
                </div>
              ) : reviews.length === 0 ? (
                <div className="h-[600px] flex flex-col items-center justify-center p-10 text-center">
                  <div className="w-20 h-20 bg-[#FFFDF8] rounded-full border border-[#D4AF37]/20 flex items-center justify-center mb-6">
                    <MessageCircle size={32} className="text-[#D4AF37]/50" />
                  </div>
                  <h3 className="font-serif text-2xl text-[#5A3418] mb-2">
                    No Reviews Yet
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    Be the first devotee to share your spiritual experience with the community.
                  </p>
                </div>
              ) : (
                <div className="h-[600px] overflow-y-auto p-8 md:p-10 space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {reviews.map((review, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      key={review.id}
                      className="group relative"
                    >
                      <Quote className="absolute -top-2 -left-3 w-8 h-8 text-[#D4AF37]/10 rotate-180" />
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-serif font-semibold text-lg text-[#5A3418]">
                            {review.name}
                          </h3>
                          <div className="flex gap-0.5 mt-1">
                            {renderStars(review.rating, 14)}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                            {review.createdAt?.toDate?.().toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}
                          </span>
                          <button
                            onClick={() => {
                              setEditingReview(review);
                              setForm({
                                name: review.name,
                                review: review.review,
                                rating: review.rating,
                              });
                              setShowModal(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-[#FFFDF8] rounded-full text-[#D4AF37]"
                            title="Edit Review"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 leading-relaxed text-[15px] mb-6">
                        {review.review}
                      </p>

                      {/* Comments Section inside Review */}
                      <div className="pl-4 border-l-2 border-[#D4AF37]/20 space-y-4">
                        {review.comments?.map((c, i) => (
                          <div key={i} className="bg-[#FFFDF8] rounded-xl p-4 border border-[#D4AF37]/10">
                            <p className="font-serif text-sm font-semibold text-[#5A3418]">
                              {c.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                              {c.comment}
                            </p>
                          </div>
                        ))}

                        <div className="flex items-center gap-2 mt-2">
                          <input
                            value={commentTexts[review.id] || ""}
                            placeholder="Add a reply..."
                            onChange={(e) =>
                              setCommentTexts({
                                ...commentTexts,
                                [review.id]: e.target.value,
                              })
                            }
                            className="flex-1 bg-gray-50 border-transparent focus:bg-white focus:border-[#D4AF37]/40 focus:ring-0 text-sm rounded-lg px-4 py-2.5 transition-all outline-none"
                          />
                          <button
                            onClick={() => addComment(review.id)}
                            disabled={!commentTexts[review.id]?.trim()}
                            className="p-2.5 bg-[#FFFDF8] border border-[#D4AF37]/30 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-[#FFFDF8] disabled:hover:text-[#D4AF37]"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="w-full h-px bg-gray-100 mt-8" />
                    </motion.div>
                  ))}
                  
                  {/* Subtle end of list indicator */}
                  <div className="text-center py-4">
                    <Star className="w-4 h-4 mx-auto text-gray-200" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Write/Edit Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#110603]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-[#D4AF37]/20"
          >
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl text-[#5A3418]">
                {editingReview ? "Edit Your Review" : "Share Your Experience"}
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Your words inspire and guide the community.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#D4AF37]/50 focus:ring-4 focus:ring-[#D4AF37]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Your Review
                </label>
                <textarea
                  rows="4"
                  placeholder="Share your spiritual journey..."
                  value={form.review}
                  onChange={(e) => setForm({ ...form, review: e.target.value })}
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#D4AF37]/50 focus:ring-4 focus:ring-[#D4AF37]/10 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={32}
                      onClick={() => setForm({ ...form, rating: star })}
                      className={`cursor-pointer transition-colors ${
                        form.rating >= star
                          ? "fill-[#D4AF37] text-[#D4AF37]"
                          : "fill-gray-100 text-gray-200 hover:text-[#D4AF37]/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-10">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingReview(null);
                }}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="flex-1 py-3 rounded-xl bg-[#5A3418] text-[#FFFDF8] font-medium hover:bg-[#4A2A12] shadow-lg shadow-[#5A3418]/20 transition-all"
              >
                {editingReview ? "Update" : "Publish"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}