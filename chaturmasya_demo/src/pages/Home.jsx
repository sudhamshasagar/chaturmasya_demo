import { Link } from "react-router-dom";

const Home = () => {
  const blogs = [
    {
      id: 1,
      title: "Day 1 Chaturmasya Update",
      description:
        "Pujya Sri Swamiji inaugurated the Chaturmasya celebrations with special pooja and pravachana.",
      image:
        "https://images.pexels.com/photos/8230166/pexels-photo-8230166.jpeg",
      date: "June 4, 2026",
    },
    {
      id: 2,
      title: "Special Tulasi Archane",
      description:
        "Understanding the spiritual benefits and tradition behind the sacred Tulasi Archane.",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
      date: "June 3, 2026",
    },
    {
      id: 3,
      title: "Annadana Seva Begins",
      description:
        "Devotees are invited to participate in the grand Annadana Seva throughout Chaturmasya.",
      image:
        "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800",
      date: "June 2, 2026",
    },
  ];

  // Note: In a real app, you can dynamically calculate the 'status' based on new Date()
  // Mocked here to show the 12:30 PM event as "ongoing" based on current time (1:30 PM).
  const dailySchedule = [
    { id: 1, time: "06:00 AM", title: "Suprabhata Seva", status: "past" },
    { id: 2, time: "08:00 AM", title: "Sri Rama Devara Pooja", status: "past" },
    { id: 3, time: "10:00 AM", title: "Pravachana", status: "past" },
    { id: 4, time: "12:30 PM", title: "Mahamangalarati & Teertha Prasada", status: "ongoing" },
    { id: 5, time: "05:00 PM", title: "Veda Parayana", status: "future" },
    { id: 6, time: "07:00 PM", title: "Bhajane & Sandhya Vandana", status: "future" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* 1. Top Admin Bar */}
      <div id="top" className="bg-orange-950 text-orange-100 py-2 px-4 text-sm flex justify-between items-center">
        <span className="opacity-80">Om Sri Hari</span>
        <Link to="/admin" className="font-semibold flex items-center gap-2 hover:text-white transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          Admin Portal
        </Link>
      </div>

      {/* 2. Hero Section */}
      <header id="home" className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Karki Mutt <span className="text-orange-600">Chaturmasya 2026</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Welcome to the official digital portal for the sacred Chaturmasya Vrata. Participate in daily rituals, book sevas, and seek blessings from anywhere in the world.
          </p>
        </div>
      </header>

      {/* 3. Announcements Banner */}
      <section id="announcements" className="bg-amber-100 border-y border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse shrink-0">LIVE</span>
          <p className="text-orange-900 font-medium text-sm md:text-base truncate">
            Tomorrow: Special Laksha Tulasi Archane at 10:00 AM. Devotees are requested to assemble early.
          </p>
        </div>
      </section>

      {/* Main Content Wrapper */}
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-12">

        {/* 4. Core Actions (Book Seva) */}
        <section id="seva" className="grid md:grid-cols-2 gap-6">
          <Link
            to="/book-seva"
            className="group relative bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition duration-300 overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                🪔 Book Seva Online
              </h2>
              <p className="text-orange-100 text-lg">Reserve your offering instantly and receive e-receipts.</p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white opacity-10 rounded-full group-hover:scale-110 transition duration-500"></div>
          </Link>

          <Link
            to="/virtual-pada-puja"
            className="group relative bg-white text-gray-900 rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3 text-orange-600">
                🙏 Virtual Pada Pooja
              </h2>
              <p className="text-gray-600 text-lg">Submit your family details and participate remotely.</p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-orange-50 rounded-full group-hover:scale-110 transition duration-500"></div>
          </Link>
        </section>

        {/* 5. Live Stream & Schedule Grid */}
        <section className="grid lg:grid-cols-3 gap-8">
          
          {/* Live Stream (Spans 2 columns on desktop) */}
          <div id="live" className="lg:col-span-2 bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                Live Pravachana
              </h2>
            </div>
            <div className="p-4 flex-grow">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
                <iframe width="800" height="515" 
                src="https://www.youtube.com/embed/DeI-ZPx3u8M?si=76F2OWrPTalYT5Wz&amp;start=25" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" 
                allowfullscreen></iframe>
              </div>
              <p className="mt-4 text-gray-600 font-medium px-2">
                Join Pujya Sri Swamiji's daily discourse live from the mutt premises.
              </p>
            </div>
          </div>

          {/* Daily Schedule (List Format) */}
          <div id="schedule" className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-orange-50/50">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                📅 Today's Schedule
              </h2>
            </div>
            <div className="p-6 flex-grow overflow-y-auto">
              <div className="flex flex-col gap-3">
                {dailySchedule.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                      item.status === 'ongoing' 
                        ? 'bg-orange-50 border-orange-400 shadow-sm' 
                        : item.status === 'past' 
                          ? 'bg-gray-50/50 border-transparent opacity-60' 
                          : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <div className={`font-bold whitespace-nowrap ${
                        item.status === 'ongoing' ? 'text-orange-700' : 'text-gray-900'
                      }`}>
                        {item.time}
                      </div>
                      <div className={`font-medium ${
                        item.status === 'ongoing' ? 'text-orange-900' : item.status === 'past' ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {item.title}
                      </div>
                    </div>
                    
                    {/* Ongoing Badge */}
                    {item.status === 'ongoing' && (
                      <div className="flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0 ml-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                        <span className="hidden sm:inline">Ongoing</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. Updates & Blogs */}
        <section id="blogs">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-bold text-gray-900">📰 Latest Updates</h2>
            <button className="text-orange-600 font-semibold hover:text-orange-700 hidden sm:block">View All →</button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col">
                <div className="relative h-52">
                  <img src="" alt={blog.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800">
                    {blog.date}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{blog.title}</h3>
                  <p className="text-gray-600 mb-6 flex-grow">{blog.description}</p>
                  <button className="text-orange-600 font-bold self-start hover:text-orange-800 transition flex items-center gap-1">
                    Read More <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 7. Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-300 mt-12 rounded-t-[3rem] mx-2 md:mx-4">
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Karki Mutt</h2>
            <p className="text-gray-400 max-w-sm">
              The official portal for Chaturmasya 2026. Join us in devotion, service, and spiritual awakening.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2"><span>📞</span> +91 XXXXX XXXXX</li>
              <li className="flex items-center gap-2"><span>📧</span> info@chaturmasya.org</li>
              <li className="flex items-start gap-2"><span>📍</span> Karki Mutt Chaturmasya Venue,<br/>Sagara, Karnataka</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:text-orange-400 transition">Home</a></li>
              <li><Link to="/book-seva" className="hover:text-orange-400 transition">Book Seva</Link></li>
              <li><a href="#live" className="hover:text-orange-400 transition">Live Darshana</a></li>
              <li><a href="#schedule" className="hover:text-orange-400 transition">Daily Schedule</a></li>
            </ul>
          </div>
        </div>

        {/* Developer Attribution by elv8.works */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm">
            <p>&copy; 2026 Karki Mutt. All rights reserved.</p>
            
            <div className="mt-4 md:mt-0 flex items-center gap-2 text-gray-400">
              <span>Crafted with devotion by</span>
              <a 
                href="https://elv8.works" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 text-white hover:text-orange-400 transition font-bold bg-gray-800 px-3 py-1.5 rounded-full"
              >
                {/* Replace src with elv8.works actual logo URL */}
                <img 
                  src="https://via.placeholder.com/24" 
                  alt="elv8.works" 
                  className="h-5 w-5 rounded object-cover"
                />
                elv8.works
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <Link
        to="/book-seva"
        className="fixed bottom-6 right-6 z-50 bg-orange-600 text-white px-6 py-4 rounded-full shadow-2xl font-bold flex items-center gap-2 hover:bg-orange-700 hover:scale-105 transition-all duration-300"
      >
        <span className="text-xl">🪔</span> <span className="hidden sm:inline">Book Seva</span>
      </Link>
    </div>
  );
};

export default Home;