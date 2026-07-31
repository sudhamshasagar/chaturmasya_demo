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

  // Tab State: 'entry' or 'history'
  const [activeTab, setActiveTab] = useState("entry"); 

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
      
      // Auto-switch to history tab to show the new entry immediately
      setActiveTab("history");
      
    } catch (err) {
      console.error(err);
      alert("Unable to save.");
    }
    setLoading(false);
  };

  return (
    <div className={`flex flex-col w-full h-full bg-white text-slate-800 ${!isModal ? 'min-h-screen p-4 sm:p-8' : ''}`}>
      
      {/* Page Header (Hidden in Modal) */}
      {!isModal && !user && (
        <div className="text-center mb-10 shrink-0 mt-8 lg:mt-12">
          <h1 className="text-3xl lg:text-4xl font-semibold text-slate-800 tracking-wide">
            Japa & Shloka Seva
          </h1>
        </div>
      )}

      {/* Authentication Section */}
      {!user && (
        <div className="flex-1 flex items-center justify-center min-h-0 p-4">
          <div className="max-w-md w-full bg-[#FAFAFA] rounded-2xl border border-slate-200 p-8 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-slate-800">
                {isNewUser ? "Create Profile" : "Devotee Login"}
              </h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  disabled={isNewUser}
                  className="w-full bg-white border border-slate-200 rounded-lg p-3.5 text-slate-800 font-medium focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all disabled:opacity-50"
                />
              </div>

              {!isNewUser ? (
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg p-3.5 transition-colors disabled:opacity-70 flex justify-center items-center"
                >
                  {loading ? "Verifying..." : "Continue"}
                </button>
              ) : (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-3.5 text-slate-800 font-medium focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all"
                    />
                  </div>

                  <button
                    onClick={handleCreateUser}
                    disabled={loading}
                    className="w-full bg-[#D4AF37] hover:bg-[#c29e2e] text-white font-medium rounded-lg p-3.5 transition-colors disabled:opacity-70"
                  >
                    {loading ? "Registering..." : "Create & Continue"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Section */}
      {user && (
        <div className="flex flex-col h-full w-full">
          
          {/* Welcome Banner */}
          <div className="bg-[#FAFAFA] p-5 lg:px-8 shrink-0 flex justify-between items-center border-b border-slate-100">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Namaskara, {user.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wider">
                {user.mobile}
              </p>
            </div>
          </div>

          {/* Large Tab Navigation */}
          <div className="flex border-b border-slate-200 shrink-0 px-4 lg:px-8 bg-white">
            <button 
              onClick={() => setActiveTab("entry")}
              className={`flex-1 lg:flex-none lg:w-48 py-4 text-sm sm:text-base font-semibold text-center border-b-2 transition-colors ${
                activeTab === "entry" 
                  ? "border-[#D4AF37] text-[#D4AF37]" 
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              Entry Count
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`flex-1 lg:flex-none lg:w-48 py-4 text-sm sm:text-base font-semibold text-center border-b-2 transition-colors ${
                activeTab === "history" 
                  ? "border-[#D4AF37] text-[#D4AF37]" 
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              History
            </button>
          </div>

          {/* Scrollable Tab Content Container */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* --- TAB 1: ENTRY COUNT --- */}
            {activeTab === "entry" && (
              <div className="p-5 sm:p-8 lg:p-12 max-w-2xl mx-auto w-full animate-fade-in">
                <div className="space-y-6 lg:space-y-8">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Select Japa / Shloka
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full bg-[#FAFAFA] border border-slate-200 rounded-xl p-4 text-slate-800 font-medium focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-shadow"
                    >
                      <option value="">-- Choose offering --</option>
                      {japaTypes.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nameKannada}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-slate-200 rounded-xl p-4 text-slate-800 font-medium focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-shadow"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Total Count
                      </label>
                      <input
                        type="number"
                        value={count}
                        onChange={(e) => setCount(e.target.value)}
                        min="1"
                        placeholder="Enter count (e.g. 108)"
                        className="w-full bg-[#FAFAFA] border border-slate-200 rounded-xl p-4 text-slate-800 font-semibold focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-shadow"
                      />
                    </div>
                  </div>

                  <div className="pt-4 lg:pt-8">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="w-full bg-[#D4AF37] hover:bg-[#c29e2e] text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-70 text-lg shadow-sm"
                    >
                      {loading ? "Submitting..." : "Submit Offering"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 2: HISTORY --- */}
            {activeTab === "history" && (
              <div className="p-5 sm:p-8 lg:p-10 mx-auto w-full max-w-5xl animate-fade-in">
                
                {/* Overall Summary Section */}
                <div className="mb-10">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">
                    Overall Summary
                  </h3>
                  {Object.keys(summary).length === 0 ? (
                    <div className="bg-[#FAFAFA] rounded-xl p-6 text-center border border-slate-200 text-slate-400 text-sm">
                      No offerings recorded yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(summary).map(([type, total]) => (
                        <div
                          key={type}
                          className="bg-[#FAFAFA] p-5 rounded-xl border border-slate-200 flex flex-col gap-1"
                        >
                          <span className="text-2xl font-bold text-[#D4AF37]">
                            {total.toLocaleString()}
                          </span>
                          <span className="text-sm font-medium text-slate-600 truncate">
                            {japaTypes.find((j) => j.id === type)?.nameKannada || type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Previous Counts Section */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">
                    Previous Counts
                  </h3>
                  
                  {history.length === 0 ? (
                    <div className="bg-[#FAFAFA] rounded-xl p-6 text-center border border-slate-200 text-slate-400 text-sm">
                      Your timeline is empty.
                    </div>
                  ) : (
                    <>
                      {/* Mobile & Tablet View (Cards) */}
                      <div className="lg:hidden space-y-3">
                        {history.map((item, index) => (
                          <div 
                            key={item.id} 
                            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3"
                          >
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Entry #{index + 1}
                              </span>
                              <span className="text-xs font-medium text-slate-500">
                                {new Date(item.date).toLocaleDateString('en-GB')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-slate-800">
                                {japaTypes.find((j) => j.id === item.type)?.nameKannada || item.type}
                              </span>
                              <span className="text-base font-bold text-slate-800">
                                +{item.count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop View (Table) */}
                      <div className="hidden lg:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#FAFAFA] border-b border-slate-200">
                              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 text-center">
                                S.No
                              </th>
                              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">
                                Date
                              </th>
                              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Japa / Shloka
                              </th>
                              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right w-32">
                                Count
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {history.map((item, index) => (
                              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-sm text-slate-500 text-center font-medium">
                                  {index + 1}
                                </td>
                                <td className="p-4 text-sm text-slate-800 font-medium">
                                  {new Date(item.date).toLocaleDateString('en-GB')}
                                </td>
                                <td className="p-4 text-sm text-slate-800 font-medium">
                                  {japaTypes.find((j) => j.id === item.type)?.nameKannada || item.type}
                                </td>
                                <td className="p-4 text-sm text-slate-800 font-bold text-right">
                                  +{item.count}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>

              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}