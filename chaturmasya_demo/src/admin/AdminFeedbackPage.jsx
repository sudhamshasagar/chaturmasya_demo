import { useEffect, useState, useMemo } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Star, 
  MessageSquare,
  AlertTriangle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminFeedbackPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All"); // "All" | 5 | 4 | 3 | 2 | 1
  
  // Modals
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
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

  // Filtered Data
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch = 
        review.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        review.review?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRating = ratingFilter === "All" || review.rating === parseInt(ratingFilter);
      return matchesSearch && matchesRating;
    });
  }, [reviews, searchTerm, ratingFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Date", "Name", "Rating", "Review", "Replies Count"];
    
    const csvRows = filteredReviews.map(r => {
      const date = r.createdAt?.toDate?.().toLocaleDateString("en-IN") || "N/A";
      const name = `"${(r.name || "").replace(/"/g, '""')}"`;
      const rating = r.rating;
      const reviewText = `"${(r.review || "").replace(/"/g, '""')}"`;
      const replies = r.comments?.length || 0;
      
      return [date, name, rating, reviewText, replies].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Reviews_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete Action
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "reviews", id));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review.");
    }
  };

  const renderStars = (count) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < count ? "fill-[#D4AF37] text-[#D4AF37]" : "fill-gray-100 text-gray-200"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-[#5A3418] mb-2">
              Feedback Management
            </h1>
            <p className="text-gray-500 text-sm">
              View, moderate, and export devotee experiences.
            </p>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#D4AF37]/30 text-[#5A3418] rounded-xl hover:bg-[#D4AF37]/10 transition-colors shadow-sm text-sm font-medium"
          >
            <Download size={18} />
            Export to CSV
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#D4AF37]/20 flex flex-col md:flex-row gap-4 mb-8">
          
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or review text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#D4AF37]/50 focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all text-sm"
            />
          </div>

          {/* Rating Filter */}
          <div className="relative md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#D4AF37]/50 focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all text-sm appearance-none"
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium">Loading records...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow border border-[#D4AF37]/20">
            <Search size={40} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-serif text-xl text-[#5A3418]">No records found</h3>
            <p className="text-gray-500 mt-2 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            {/* DESKTOP VIEW: Table */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#D4AF37]/20 overflow-hidden">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Devotee</th>
                    <th className="px-6 py-4 font-medium">Rating</th>
                    <th className="px-6 py-4 font-medium w-1/3">Review</th>
                    <th className="px-6 py-4 font-medium">Replies</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence>
                    {filteredReviews.map((review) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={review.id}
                        className="hover:bg-[#FFFDF8] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                          {review.createdAt?.toDate?.().toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </td>
                        <td className="px-6 py-4 font-serif font-medium text-[#5A3418]">
                          {review.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStars(review.rating)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="line-clamp-2 text-gray-600 leading-relaxed">
                            {review.review}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <MessageSquare size={14} />
                            <span>{review.comments?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setDeleteConfirmId(review.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* MOBILE / TABLET VIEW: Cards */}
            <div className="grid lg:hidden gap-4">
              <AnimatePresence>
                {filteredReviews.map((review) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={review.id}
                    className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-[#D4AF37]/20 flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif font-medium text-[#5A3418] text-lg">
                          {review.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {review.createdAt?.toDate?.().toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => setDeleteConfirmId(review.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors -mr-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div>{renderStars(review.rating)}</div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {review.review}
                    </p>
                    
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-2 border-t border-gray-50">
                      <MessageSquare size={14} />
                      <span>{review.comments?.length || 0} replies from Admin</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#110603]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative"
            >
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-5 mx-auto border border-red-100">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              
              <h3 className="font-serif text-xl text-center text-[#5A3418] mb-2">
                Delete Review?
              </h3>
              <p className="text-center text-gray-500 text-sm mb-8">
                This action cannot be undone. The review and all its comments will be permanently removed.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}