import { useState } from "react";
import { Link } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  MapPin,
  Sparkles,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Loader2,
  Package,
} from "lucide-react";

/* =========================================================
   INITIAL STATE
========================================================= */
const initialForm = {
  mobile: "",
  secondaryMobile: "",
  name: "",
  nakshatra: "",
  gotra: "",
  rashi: "",
  state: "",
  district: "",
  city: "",
  addressLine1: "",
  landmark: "",
  pincode: "",
  reason: "",
};

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function MantrakshataRequest() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (
      !form.name.trim() ||
      !form.state.trim() ||
      !form.district.trim() ||
      !form.city.trim() ||
      !form.addressLine1.trim() ||
      form.pincode.length !== 6 ||
      !form.reason.trim()
    ) {
      setError("Please complete all required fields marked with an asterisk (*).");
      return;
    }

    setLoading(true);

    try {
      const counterRef = doc(db, "counters", "mantrakshataCounter");

      const requestId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        const nextNumber = counterDoc.exists() ? (counterDoc.data().lastNumber || 0) + 1 : 1;
        transaction.set(counterRef, { lastNumber: nextNumber });
        return `MTR-${String(nextNumber).padStart(4, "0")}`;
      });

      const requestData = {
        requestId,
        mobile: form.mobile,
        secondaryMobile: form.secondaryMobile,
        name: form.name.trim(),
        nakshatra: form.nakshatra.trim(),
        gotra: form.gotra.trim(),
        rashi: form.rashi.trim(),
        state: form.state.trim(),
        district: form.district.trim(),
        city: form.city.trim(),
        addressLine1: form.addressLine1.trim(),
        landmark: form.landmark.trim(),
        pincode: form.pincode,
        reason: form.reason.trim(),
        status: "Pending",
        tracking: "",
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "mantrakshata"), requestData);
      setSubmittedRequest(requestData);
    } catch (err) {
      console.error("Mantrakshata request error:", err);
      setError("Unable to submit your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     SUCCESS VIEW
  ============================ */
  if (submittedRequest) {
    return (
      <div className="min-h-[100dvh] bg-stone-50 px-4 py-12 flex items-center justify-center font-sans selection:bg-amber-200">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="w-full max-w-md bg-white border border-stone-200 rounded-[32px] p-8 md:p-10 text-center shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
          
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>

          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Request Received</h1>
          <p className="text-sm text-stone-500 mb-8 leading-relaxed">
            Your request for blessed Mantrakshata has been successfully registered and will be dispatched soon.
          </p>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 mb-8 shadow-inner">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Request ID</p>
            <p className="text-3xl font-black text-stone-900 tracking-tight">{submittedRequest.requestId}</p>
          </div>

          <Link
            to="/"
            className="flex items-center justify-center w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md text-sm uppercase tracking-widest"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ===========================
     FORM VIEW
  ============================ */
  return (
    <div className="min-h-[100dvh] bg-stone-50 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-200 selection:text-stone-900">
      <div className="max-w-3xl mx-auto">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-4 border border-amber-200 shadow-sm">
            <Package size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900 tracking-tight mb-2">
            Request Mantrakshata
          </h1>
          <p className="text-stone-500 text-sm font-medium">
            Receive blessed Mantrakshata at your home via post.
          </p>
        </div>

        {/* Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white border border-stone-200 rounded-[24px] shadow-sm overflow-hidden"
        >
          {error && (
            <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center gap-3 text-rose-700">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            
            {/* --- SECTION: Devotee Details --- */}
            <section>
              <SectionTitle title="Devotee Details" icon={User} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input label="Full Name *" value={form.name} onChange={(v) => updateField("name", v)} placeholder="e.g. Ramesh Kumar" />
                </div>
                <Input label="Mobile Number *" value={form.mobile} onChange={(v) => updateField("mobile", v.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit number" />
                <Input label="Alternative Mobile" value={form.secondaryMobile} onChange={(v) => updateField("secondaryMobile", v.replace(/\D/g, "").slice(0, 10))} placeholder="Optional" />
              </div>
            </section>

            {/* --- SECTION: Spiritual Details --- */}
            <section>
              <SectionTitle title="Spiritual Details (Optional)" icon={Sparkles} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Gotra" value={form.gotra} onChange={(v) => updateField("gotra", v)} placeholder="If known" />
                <Input label="Rashi" value={form.rashi} onChange={(v) => updateField("rashi", v)} placeholder="If known" />
                <Input label="Nakshatra" value={form.nakshatra} onChange={(v) => updateField("nakshatra", v)} placeholder="If known" />
              </div>
            </section>

            {/* --- SECTION: Delivery Address --- */}
            <section>
              <SectionTitle title="Delivery Address" icon={MapPin} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input label="Address Line 1 *" value={form.addressLine1} onChange={(v) => updateField("addressLine1", v)} placeholder="House/Flat No., Street, Area" />
                </div>
                <Input label="Landmark" value={form.landmark} onChange={(v) => updateField("landmark", v)} placeholder="Optional" />
                <Input label="PIN Code *" value={form.pincode} onChange={(v) => updateField("pincode", v.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit PIN" />
                <Input label="City / Town *" value={form.city} onChange={(v) => updateField("city", v)} placeholder="e.g. Sagara" />
                <Input label="District *" value={form.district} onChange={(v) => updateField("district", v)} placeholder="e.g. Shimoga" />
                <div className="md:col-span-2">
                  <Input label="State *" value={form.state} onChange={(v) => updateField("state", v)} placeholder="e.g. Karnataka" />
                </div>
              </div>
            </section>

            {/* --- SECTION: Reason --- */}
            <section>
              <SectionTitle title="Reason for Request" icon={MessageSquare} />
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">
                  Message *
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) => updateField("reason", e.target.value)}
                  rows="4"
                  placeholder="Briefly state the reason or occasion..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-amber-400 focus:bg-white transition-colors text-stone-900 placeholder:text-stone-400 resize-none"
                />
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-4 border-t border-stone-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest shadow-md transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
              </button>
              <p className="text-center text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-4">
                Your details are secure with us
              </p>
            </div>

          </form>
        </motion.div>

      </div>
    </div>
  );
}

/* =========================================================
   SUB-COMPONENTS
========================================================= */
const SectionTitle = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-4 col-span-full border-b border-stone-100 pb-2">
    <Icon size={16} className="text-amber-500" />
    <h2 className="text-[11px] font-bold uppercase tracking-widest text-stone-800">{title}</h2>
  </div>
);

const Input = ({ label, value, onChange, placeholder = "" }) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-amber-400 focus:bg-white transition-colors text-stone-900 placeholder:text-stone-400"
    />
  </div>
);