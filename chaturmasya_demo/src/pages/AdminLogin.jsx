import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Sun, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (err) {
      alert("Invalid Email or Password");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FCF8F2] selection:bg-[#722013] selection:text-white font-sans">
      
      {/* --- LEFT SIDE: Image Cover --- */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-[#2a0b06]">
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent z-10"></div>
        <img 
          src="/hero.jpeg" 
          alt="Karki Mutt Chaturmasya" 
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute bottom-12 left-12 z-20 text-white max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <Sun className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">Official Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-4 shadow-sm">
            Preserving Sacred Traditions
          </h1>
          <p className="text-white/80 font-medium leading-relaxed">
            Authorized personnel only. Access the administrative dashboard to manage sevas, devotees, and daily schedules.
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: Login Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#f8e5cc] to-transparent rounded-bl-full opacity-50 -z-10 pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-[#722013]/5 border border-[#E8DCC4]/60 relative overflow-hidden"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#722013]"></div>

          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF6F0] border border-[#E8DCC4] flex items-center justify-center mx-auto mb-6 shadow-inner text-[#722013]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-[#2a0b06] mb-1">Karki Mutt</h2>
            <p className="text-sm font-bold text-[#722013] uppercase tracking-[0.15em] mb-3">Chaturmasya 2026</p>
            <p className="text-gray-500 text-sm font-medium">Secure Admin Login</p>
          </div>

          <form onSubmit={login} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#D4AF37] transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@karkimutt.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 rounded-xl border border-[#E8DCC4] focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none text-sm transition-all bg-[#FAF6F0] focus:bg-white text-gray-900 font-medium placeholder:font-normal"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#D4AF37] transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 rounded-xl border border-[#E8DCC4] focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none text-sm transition-all bg-[#FAF6F0] focus:bg-white text-gray-900 font-medium placeholder:font-normal"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#722013] to-[#4a150c] text-white py-4 rounded-xl font-bold text-sm hover:from-[#5a190f] hover:to-[#381009] transition-all duration-300 shadow-lg shadow-[#722013]/20 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Authenticating...
                  </span>
                ) : (
                  <>
                    Access Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-6 font-medium flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" /> Encrypted Connection
            </p>
          </form>
        </motion.div>
      </div>

    </div>
  );
}