import React, { useState, useEffect } from "react";
import {
  checkUser,
  createUser,
  saveRecord,
  getSummary,
  getHistory,
  getJapaTypes,
} from "../services/japaService";

export default function JapaSeva({ onClose, isModal = false }) {
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [count, setCount] = useState("");
  const [summary, setSummary] = useState({});
  const [history, setHistory] = useState([]);
  const [japaTypes, setJapaTypes] = useState([]);

  useEffect(() => {
    const loadJapaTypes = async () => {
      try {
        const data = await getJapaTypes();
        setJapaTypes(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadJapaTypes();
  }, []);

  const loadUserData = async (mobile) => {
    const s = await getSummary(mobile);
    const h = await getHistory(mobile);

    setSummary(s);
    setHistory(h);
  };

  const handleContinue = async () => {
    if (mobile.length !== 10) {
      alert("Please enter a valid 10 digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      const existingUser = await checkUser(mobile);
      if (existingUser) {
        setUser(existingUser);
        await loadUserData(existingUser.mobile);
        setIsNewUser(false);
      } else {
        setIsNewUser(true);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
    setLoading(false);
  };

  const handleCreateUser = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }
    setLoading(true);
    try {
      await createUser({ name, mobile });
      const newUser = { name, mobile };
      setUser(newUser);
      await loadUserData(newUser.mobile);
      setIsNewUser(false);
    } catch (err) {
      console.error(err);
      alert("Unable to create user.");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedType) {
      alert("Please select Japa/Shloka");
      return;
    }
    if (!count || Number(count) <= 0) {
      alert("Please enter valid count");
      return;
    }
    setLoading(true);
    try {
      await saveRecord({
        name: user.name,
        mobile: user.mobile,
        type: selectedType,
        date: selectedDate,
        count,
      });
      setCount("");
      await loadUserData(user.mobile);
      alert("Seva Offered Successfully 🙏✨");
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      alert("Unable to save.");
    }
    setLoading(false);
  };

  return (
    <div className={`relative bg-gradient-to-b from-[#FFFBF0] to-[#f9f3e3] font-sans text-gray-800 ${isModal ? 'p-4 sm:p-6 rounded-b-2xl' : 'min-h-screen py-10 px-4 sm:px-6 lg:px-8'}`}>
      
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#722013]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        
        {/* Page Header (Hidden in Modal) */}
        {!isModal && (
          <div className="text-center mb-10 shrink-0">
            <span className="inline-block px-4 py-1 mb-3 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#722013] text-xs font-bold tracking-widest uppercase">
              Divine Offering
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-[#722013] tracking-tight">
              Japa & Shloka Seva
            </h1>
            <p className="text-[#722013]/70 mt-3 text-sm sm:text-base font-medium max-w-lg mx-auto">
              Every single chant resonates in the cosmos. Offer your daily devotion and be part of the grand Sankalpa.
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-6"></div>
          </div>
        )}

        {/* Authentication Section */}
        {!user && (
          <div className="max-w-md mx-auto w-full bg-white/80 backdrop-blur-md rounded-[2rem] shadow-[0_8px_30px_rgb(114,32,19,0.08)] border border-[#D4AF37]/30 overflow-hidden mt-4">
            <div className="bg-gradient-to-br from-[#722013] to-[#8f2a18] p-8 text-center relative overflow-hidden">
              <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <h2 className="text-2xl font-bold text-white relative z-10">
                {isNewUser ? "Begin Your Journey" : "Enter Devotee Details"}
              </h2>
              <p className="text-white/80 text-sm mt-2 relative z-10">
                Join the collective spiritual sankalpa
              </p>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#722013] uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-[#FFFBF0] border border-[#D4AF37]/40 rounded-xl p-4 text-[#722013] font-medium focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all placeholder:text-[#722013]/30"
                  disabled={isNewUser}
                />
              </div>

              {!isNewUser ? (
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#722013] to-[#8f2a18] hover:from-[#5d1a0f] hover:to-[#722013] text-white font-bold rounded-xl p-4 shadow-lg shadow-[#722013]/20 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <span className="animate-pulse">Verifying...</span>
                  ) : (
                    <>Continue <span className="text-xl">📿</span></>
                  )}
                </button>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-[#722013] uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FFFBF0] border border-[#D4AF37]/40 rounded-xl p-4 text-[#722013] font-medium focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all placeholder:text-[#722013]/30"
                    />
                  </div>

                  <button
                    onClick={handleCreateUser}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#b38f20] hover:from-[#b38f20] hover:to-[#917215] text-white font-bold rounded-xl p-4 shadow-lg shadow-[#D4AF37]/30 transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    {loading ? "Registering..." : "Create Profile & Continue"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Dashboard Section */}
        {user && (
          <div className="space-y-6">
            
            {/* Welcome Banner */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-[#D4AF37]/30 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <h2 className="text-2xl font-black text-[#722013]">
                  Namaskara, {user.name} 🙏
                </h2>
                <p className="text-sm text-[#722013]/70 mt-1 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Mobile Number ({user.mobile})
                </p>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-1">Inspiration</p>
                <p className="text-sm text-[#722013] italic">"Consistency in devotion transforms the soul."</p>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Offering Form */}
              <div className="lg:col-span-5 sticky top-6">
                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(114,32,19,0.06)] border border-[#D4AF37]/20 p-6 sm:p-8">
                  
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#D4AF37]/15">
                    <div className="w-10 h-10 rounded-full bg-[#FFFBF0] flex items-center justify-center text-[#722013] border border-[#D4AF37]/30 text-xl">✨</div>
                    <h3 className="text-xl font-bold text-[#722013]">
                      Offer New Seva
                    </h3>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-[#722013] uppercase tracking-wider mb-2">
                        Select Japa / Shloka
                      </label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full bg-[#FFFBF0] border border-[#D4AF37]/30 rounded-xl p-3.5 text-[#722013] font-medium focus:ring-2 focus:ring-[#D4AF37] outline-none"
                      >
                        <option value="">-- Choose your chanting --</option>
                        {japaTypes.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nameKannada}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#722013] uppercase tracking-wider mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full bg-[#FFFBF0] border border-[#D4AF37]/30 rounded-xl p-3.5 text-[#722013] font-medium focus:ring-2 focus:ring-[#D4AF37] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#722013] uppercase tracking-wider mb-2">
                          Total Count
                        </label>
                        <input
                        type="number"
                        className="no-spinner w-full bg-[#FFFBF0] border border-[#D4AF37]/30 rounded-xl p-3.5 text-[#722013] font-black focus:ring-2 focus:ring-[#D4AF37] outline-none placeholder:text-[#722013]/20 placeholder:font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="w-full group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#722013] to-[#8f2a18] text-white py-4 font-bold text-lg shadow-lg shadow-[#722013]/30 transition-all duration-300 active:scale-[0.98] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                      <span className="relative z-10">{loading ? "Offering..." : "Submit Seva"}</span>
                      <span className="relative z-10 text-xl group-hover:scale-125 transition-transform">🌸</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Stats & History */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Spiritual Treasure (Summary) */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-[#D4AF37]/20 p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-[#722013]">Your Spiritual Treasure</h3>
                      <p className="text-xs text-[#722013]/60 mt-1">Total lifetime offerings</p>
                    </div>
                    <div className="bg-[#FFFBF0] border border-[#D4AF37]/30 rounded-full px-3 py-1 text-xs font-bold text-[#D4AF37] uppercase tracking-wide">
                      Summary
                    </div>
                  </div>
                  
                  <div className="max-h-[220px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {Object.keys(summary).length === 0 ? (
                      <div className="py-10 text-center text-[#722013]/40 border-2 border-dashed border-[#D4AF37]/20 rounded-xl">
                        <span className="text-3xl mb-2 block">📿</span>
                        <p className="font-medium">No seva recorded yet.<br/>Start your journey today.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(summary).map(([type, total]) => (
                          <div
                            key={type}
                            className="relative overflow-hidden flex flex-col justify-center bg-gradient-to-br from-[#FFFBF0] to-white p-4 rounded-xl border border-[#D4AF37]/20 transition-all hover:border-[#D4AF37]/50"
                          >
                            <span className="text-sm font-bold text-[#722013] mb-2 z-10">
                              {japaTypes.find((j) => j.id === type)?.nameKannada || type}
                            </span>
                            <span className="text-3xl font-black text-[#D4AF37] z-10 tracking-tight">
                              {total.toLocaleString()}
                            </span>
                            {/* Decorative background number */}
                            <span className="absolute -right-2 -bottom-4 text-6xl font-black text-[#D4AF37]/5 select-none pointer-events-none">
                              {total}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Offering History */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-[#D4AF37]/20 p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-[#722013]">Recent Offerings</h3>
                      <p className="text-xs text-[#722013]/60 mt-1">Your daily devotion log</p>
                    </div>
                  </div>

                  <div className="max-h-[280px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {history.length === 0 ? (
                      <div className="py-8 text-center text-[#722013]/40">
                        <p className="font-medium">Your timeline is empty.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {history.map((item) => (
                          <div 
                            key={item.id} 
                            className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-xl hover:bg-[#FFFBF0]/50 transition-colors shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center justify-center bg-[#FFFBF0] border border-[#D4AF37]/20 rounded-lg w-12 h-12 text-[#722013]">
                                <span className="text-[10px] font-bold uppercase leading-none">{new Date(item.date).toLocaleDateString('en-GB', { month: 'short' })}</span>
                                <span className="text-lg font-black leading-tight">{new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit' })}</span>
                              </div>
                              <div>
                                <p className="font-bold text-[#722013] text-sm sm:text-base">
                                  {japaTypes.find((j) => j.id === item.type)?.nameKannada || item.type}
                                </p>
                                <p className="text-xs text-[#722013]/50">Completed</p>
                              </div>
                            </div>
                            <div className="text-right bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                              <span className="font-black text-green-700 text-lg tracking-tight">+{item.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}