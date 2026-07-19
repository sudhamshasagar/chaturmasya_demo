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

const MantrakshataRequest = () => {
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
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);

    try {
      const counterRef = doc(
        db,
        "counters",
        "mantrakshataCounter"
      );

      const requestId = await runTransaction(
        db,
        async (transaction) => {
          const counterDoc = await transaction.get(counterRef);

          const nextNumber = counterDoc.exists()
            ? (counterDoc.data().lastNumber || 0) + 1
            : 1;

          transaction.set(counterRef, {
            lastNumber: nextNumber,
          });

          return `MTR-${String(nextNumber).padStart(4, "0")}`;
        }
      );

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

      await addDoc(
        collection(db, "mantrakshata"),
        requestData
      );

      setSubmittedRequest(requestData);
    } catch (err) {
      console.error("Mantrakshata request error:", err);
      setError(
        "Unable to submit your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submittedRequest) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white border border-[#E8E2D2] rounded-3xl p-8 text-center shadow-lg">

          <div className="text-5xl mb-5">🙏</div>

          <h1 className="text-3xl font-bold text-[#333333]">
            Request Submitted
          </h1>

          <p className="text-gray-500 mt-3">
            Your request for blessed Mantrakshata has been
            received successfully.
          </p>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mt-8">

            <p className="text-xs uppercase tracking-widest text-orange-700 font-bold">
              Request ID
            </p>

            <p className="text-3xl font-black text-[#333333] mt-1">
              {submittedRequest.requestId}
            </p>

          </div>

          <p className="text-sm text-gray-500 mt-6">
            Please keep this Request ID for future reference.
          </p>

          <Link
            to="/"
            className="block mt-8 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl"
          >
            Return Home
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] px-4 py-8">

      <div className="max-w-3xl mx-auto">

        <Link
          to="/"
          className="inline-flex mb-8 text-gray-600 hover:text-orange-600 font-medium"
        >
          ← Back to Home
        </Link>

        <div className="text-center mb-10">

          <div className="text-5xl mb-3">
            🌸
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-[#333333]">
            Request Mantrakshata
          </h1>

          <p className="text-[#800000] mt-3">
            Request blessed Mantrakshata to be sent to your home
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E8E2D2] rounded-3xl p-6 md:p-10 shadow-sm space-y-8"
        >

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
              {error}
            </div>
          )}

          <FormSection title="Devotee Details">

            <div className="grid md:grid-cols-2 gap-5">

              <Input
                label="Mobile Number *"
                value={form.mobile}
                onChange={(value) =>
                  updateField(
                    "mobile",
                    value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                placeholder="10-digit mobile number"
              />

              <Input
                label="Secondary Mobile Number"
                value={form.secondaryMobile}
                onChange={(value) =>
                  updateField(
                    "secondaryMobile",
                    value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                placeholder="Optional"
              />

              <div className="md:col-span-2">
                <Input
                  label="Devotee Name *"
                  value={form.name}
                  onChange={(value) =>
                    updateField("name", value)
                  }
                  placeholder="Enter full name"
                />
              </div>

            </div>

          </FormSection>

          <FormSection title="Spiritual Details">

            <p className="text-sm text-gray-500 -mt-2 mb-5">
              Fill these details only if known.
            </p>

            <div className="grid md:grid-cols-3 gap-5">

              <Input
                label="Nakshatra"
                value={form.nakshatra}
                onChange={(value) =>
                  updateField("nakshatra", value)
                }
                placeholder="If known"
              />

              <Input
                label="Gotra"
                value={form.gotra}
                onChange={(value) =>
                  updateField("gotra", value)
                }
                placeholder="If known"
              />

              <Input
                label="Rashi"
                value={form.rashi}
                onChange={(value) =>
                  updateField("rashi", value)
                }
                placeholder="If known"
              />

            </div>

          </FormSection>

          <FormSection title="Delivery Address">

            <div className="grid md:grid-cols-2 gap-5">

              <Input
                label="State *"
                value={form.state}
                onChange={(value) =>
                  updateField("state", value)
                }
              />

              <Input
                label="District *"
                value={form.district}
                onChange={(value) =>
                  updateField("district", value)
                }
              />

              <Input
                label="City / Town *"
                value={form.city}
                onChange={(value) =>
                  updateField("city", value)
                }
              />

              <Input
                label="PIN Code *"
                value={form.pincode}
                onChange={(value) =>
                  updateField(
                    "pincode",
                    value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder="6-digit PIN code"
              />

              <div className="md:col-span-2">

                <Input
                  label="Address Line 1 *"
                  value={form.addressLine1}
                  onChange={(value) =>
                    updateField("addressLine1", value)
                  }
                  placeholder="House/Flat No., Street, Area"
                />

              </div>

              <div className="md:col-span-2">

                <Input
                  label="Landmark"
                  value={form.landmark}
                  onChange={(value) =>
                    updateField("landmark", value)
                  }
                  placeholder="Optional"
                />

              </div>

            </div>

          </FormSection>

          <FormSection title="Reason for Request">

            <textarea
              value={form.reason}
              onChange={(e) =>
                updateField("reason", e.target.value)
              }
              rows="5"
              placeholder="Please share the reason for requesting Mantrakshata..."
              className="w-full border border-[#E8E2D2] bg-[#FFFDF8] focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 p-4 rounded-xl outline-none resize-none"
            />

          </FormSection>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-lg shadow-md"
          >
            {loading
              ? "Submitting Request..."
              : "Submit Mantrakshata Request"}
          </button>

        </form>

      </div>

    </div>
  );
};

const FormSection = ({ title, children }) => (
  <section>

    <h2 className="text-xl font-bold text-[#333333] mb-5 border-b border-[#E8E2D2] pb-3">
      {title}
    </h2>

    {children}

  </section>
);

const Input = ({
  label,
  value,
  onChange,
  placeholder = "",
}) => (
  <div>

    <label className="block text-sm font-bold text-[#333333] mb-2">
      {label}
    </label>

    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-[#E8E2D2] bg-[#FFFDF8] focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 p-3.5 rounded-xl outline-none"
    />

  </div>
);

export default MantrakshataRequest;