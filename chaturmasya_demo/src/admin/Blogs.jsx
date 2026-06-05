import { useState, useRef } from "react";
import { Link } from "react-router-dom";

const Blogs = () => {
  const fileInputRef = useRef(null);
  
  // State
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
  });

  const [blogs, setBlogs] = useState([
    {
      id: 1,
      title: "Day 1 Chaturmasya Update",
      description: "Pujya Sri Swamiji inaugurated the Chaturmasya celebrations with special pooja and pravachana. Hundreds of devotees gathered for the auspicious beginning.",
      image: "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800",
      date: "June 4, 2026",
      isVisible: true,
    },
    {
      id: 2,
      title: "Significance of Tulasi Archane",
      description: "Understanding the spiritual benefits and tradition behind the sacred Tulasi Archane performed during the Chaturmasya Vrata.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
      date: "June 3, 2026",
      isVisible: true,
    },
    {
      id: 3,
      title: "Old Announcement: Venue Prep",
      description: "Preparations are in full swing for the upcoming Chaturmasya.",
      image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800",
      date: "May 20, 2026",
      isVisible: false,
    },
  ]);

  // Derived State
  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(search.toLowerCase())
  );

  // Handlers
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a local preview URL for the selected image
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image: imageUrl });
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", image: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (blog) => {
    setFormData({ title: blog.title, description: blog.description, image: blog.image });
    setEditingId(blog.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this dispatch?")) {
      setBlogs(blogs.filter((b) => b.id !== id));
    }
  };

  const handleToggleVisibility = (id) => {
    setBlogs(blogs.map((b) => 
      b.id === id ? { ...b, isVisible: !b.isVisible } : b
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.image) {
      alert("Please fill all fields and upload an image.");
      return;
    }

    if (editingId) {
      // Update existing
      setBlogs(blogs.map((b) => 
        b.id === editingId ? { ...b, ...formData } : b
      ));
    } else {
      // Add new
      const newBlog = {
        id: Date.now(),
        ...formData,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        isVisible: true,
      };
      setBlogs([newBlog, ...blogs]);
    }
    resetForm();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      
      {/* Breadcrumb */}
      <nav className="flex text-stone-500 text-sm font-bold uppercase tracking-wider mb-6">
        <Link to="/admin" className="hover:text-orange-700 transition">Admin</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-900">Blogs & Media</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b-2 border-stone-800 pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900 uppercase tracking-tight">
            News & Updates
          </h1>
          <p className="text-stone-500 font-serif italic mt-1 text-lg">
            Manage public announcements, articles, and daily updates.
          </p>
        </div>
        
        <button 
          onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all ${
            isFormOpen 
              ? "bg-stone-200 text-stone-700 hover:bg-stone-300" 
              : "bg-orange-600 text-white hover:bg-orange-700"
          }`}
        >
          {isFormOpen ? (
            <><span>✕</span> Close Editor</>
          ) : (
            <><span>✍️</span> Compose Blog</>
          )}
        </button>
      </div>

      {/* Slide-down Editor Form */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden mb-8 animate-fade-in">
          <div className="bg-stone-900 px-6 py-4 border-b border-stone-800">
            <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
              {editingId ? "Edit Dispatch" : "New Dispatch"}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Image Upload Area */}
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Cover Image</label>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className={`aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative ${
                    formData.image ? "border-transparent bg-stone-100" : "border-stone-300 bg-stone-50 hover:border-orange-500 hover:bg-orange-50"
                  }`}
                >
                  {formData.image ? (
                    <>
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <span className="text-3xl text-stone-400 block mb-2">📸</span>
                      <span className="text-sm font-bold text-stone-600">Click to upload</span>
                      <span className="text-xs text-stone-400 block mt-1">JPG, PNG, WEBP</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* Text Content Area */}
              <div className="md:col-span-2 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Headline</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter an engaging headline..."
                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-serif text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Article Body</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Write your update here..."
                    rows="5"
                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl font-bold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition-colors"
              >
                {editingId ? "Save Changes" : "Publish Dispatch"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      {!isFormOpen && (
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-stone-200 mb-8 flex items-center focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
          <div className="pl-4 pr-2 text-stone-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input
            type="text"
            placeholder="Search dispatches by headline..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent p-3 text-stone-900 outline-none font-medium placeholder:text-stone-400"
          />
        </div>
      )}

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <div 
              key={blog.id} 
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-all duration-300 ${
                blog.isVisible ? "border-stone-200 hover:shadow-md" : "border-stone-300 opacity-75 grayscale-[20%]"
              }`}
            >
              {/* Image & Status Badge */}
              <div className="relative aspect-video bg-stone-100">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wider border ${
                    blog.isVisible 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : "bg-stone-200 text-stone-600 border-stone-300"
                  }`}>
                    {blog.isVisible ? "● Published" : "○ Hidden"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{blog.date}</p>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2 line-clamp-2">{blog.title}</h3>
                <p className="text-stone-600 text-sm line-clamp-3 mb-4 flex-1">{blog.description}</p>
                
                {/* Actions */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-100">
                  <button 
                    onClick={() => handleToggleVisibility(blog.id)}
                    className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                      blog.isVisible 
                        ? "text-stone-500 hover:bg-stone-100 hover:text-stone-900" 
                        : "text-orange-600 hover:bg-orange-50 bg-orange-50/50 border border-orange-100"
                    }`}
                  >
                    {blog.isVisible ? (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a9.953 9.953 0 013.29-1.56m0 0A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg> Hide</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> Show</>
                    )}
                  </button>
                  <button 
                    onClick={() => handleEdit(blog)}
                    className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(blog.id)}
                    className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-stone-200 text-center shadow-sm">
            <div className="text-4xl mb-3">📰</div>
            <h3 className="text-lg font-bold text-stone-900">No dispatches found</h3>
            <p className="text-stone-500 text-sm mt-1">Try a different search term or create a new dispatch.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Blogs;