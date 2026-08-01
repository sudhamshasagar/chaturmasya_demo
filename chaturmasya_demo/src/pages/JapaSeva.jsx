import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  checkUser,
  createUser,
  saveRecord,
  getSummary,
  getHistory,
  getJapaTypes,
} from "../services/japaService";

const GOLD = "#D4AF37";

/* ---------- small presentational helpers ---------- */

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-[15px] font-medium text-slate-900 outline-none transition " +
  "placeholder:font-normal placeholder:text-slate-400 " +
  "focus:border-[#D4AF37] focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/15 disabled:opacity-60";

function Button({ variant = "gold", className = "", children, ...rest }) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[15px] font-semibold transition " +
    "focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60";
  const variants = {
    gold:
      "bg-[#D4AF37] text-white shadow-sm shadow-[#D4AF37]/30 hover:bg-[#c29e2e] active:translate-y-px focus-visible:ring-[#D4AF37]/25",
    dark:
      "bg-slate-900 text-white hover:bg-slate-800 active:translate-y-px focus-visible:ring-slate-900/20",
    ghost:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-200",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
      <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-white text-[#B9932C] ring-1 ring-slate-200">
        ॐ
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
    </div>
  );
}

/* ---------------------- main ---------------------- */

export default function JapaSeva({ onClose, isModal = false }) {
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("entry"); // 'entry' | 'history'
  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [count, setCount] = useState("");

  const [summary, setSummary] = useState({});
  const [history, setHistory] = useState([]);
  const [japaTypes, setJapaTypes] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setJapaTypes(await getJapaTypes());
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const typeName = (id) =>
    japaTypes.find((j) => j.id === id)?.nameKannada || id;

  const grandTotal = useMemo(
    () => Object.values(summary).reduce((a, b) => a + Number(b || 0), 0),
    [summary]
  );

  const loadUserData = async (m) => {
    const [s, h] = await Promise.all([getSummary(m), getHistory(m)]);
    setSummary(s || {});
    setHistory(h || []);
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
      setActiveTab("history");
    } catch (err) {
      console.error(err);
      alert("Unable to save.");
    }
    setLoading(false);
  };

  const initials = (user?.name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={`flex h-full w-full flex-col bg-white text-slate-800 ${
        isModal ? "" : "min-h-screen bg-slate-50"
      }`}
    >
      {/* ---------- AUTH ---------- */}
      {!user && (
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
          <div className="w-full max-w-md">
            {!isModal && (
            <div className="mb-4">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Home
              </button>
            </div>
          )}
            {!isModal && (
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#FBF6E6] text-2xl text-[#B9932C] ring-1 ring-[#D4AF37]/25">
                  ॐ
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Japa &amp; Shloka Seva
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Record your daily offerings with devotion.
                </p>
              </div>
            )}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  {isNewUser ? "Create your profile" : "Devotee login"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isNewUser
                    ? "Just your name, and you're ready."
                    : "Enter your mobile number to continue."}
                </p>
              </div>

              <div className="space-y-5">
                <Field label="Mobile number">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      placeholder="10-digit number"
                      value={mobile}
                      onChange={(e) =>
                        setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && !isNewUser && handleContinue()
                      }
                      disabled={isNewUser}
                      className={`${inputCls} pl-12 tracking-[0.08em]`}
                    />
                  </div>
                </Field>

                {!isNewUser ? (
                  <Button variant="dark" onClick={handleContinue} disabled={loading}>
                    {loading && <Spinner />}
                    {loading ? "Verifying…" : "Continue"}
                  </Button>
                ) : (
                  <div className="space-y-5">
                    <Field label="Full name">
                      <input
                        type="text"
                        autoComplete="name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateUser()}
                        className={inputCls}
                      />
                    </Field>
                    <div className="flex flex-col gap-3 sm:flex-row-reverse">
                      <Button onClick={handleCreateUser} disabled={loading}>
                        {loading && <Spinner />}
                        {loading ? "Registering…" : "Create & continue"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setIsNewUser(false)}
                        disabled={loading}
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- DASHBOARD ---------- */}
      {user && (
        <div className="flex h-full min-h-0 w-full flex-col">
          {/* Devotee banner */}
          <div className="shrink-0 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 sm:px-7">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FBF6E6] text-sm font-bold text-[#B9932C] ring-1 ring-[#D4AF37]/25">
                  {initials || "ॐ"}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold tracking-tight text-slate-900">
                    Namaskara, {user.name}
                  </h2>
                  <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                    {user.mobile}
                  </p>
                </div>
              </div>

              <div className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-right">
                <div className="text-base font-bold leading-none text-[#B9932C] sm:text-lg">
                  {grandTotal.toLocaleString()}
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Total
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="shrink-0 border-b border-slate-200 bg-white px-4 sm:px-7">
            <div role="tablist" className="flex gap-1">
              {[
                { id: "entry", label: "Entry Count" },
                { id: "history", label: "History" },
              ].map((t) => {
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(t.id)}
                    className={`relative flex-1 px-3 py-3.5 text-sm font-semibold transition-colors sm:flex-none sm:px-8 sm:text-[15px] ${
                      active
                        ? "text-[#B9932C]"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t.label}
                    <span
                      className={`absolute inset-x-2 bottom-0 h-[3px] rounded-t-full transition-all sm:inset-x-4 ${
                        active ? "bg-[#D4AF37]" : "bg-transparent"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scroll area */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/50 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* TAB: ENTRY */}
            {activeTab === "entry" && (
              <div className="mx-auto w-full max-w-2xl px-5 py-6 sm:px-7 sm:py-10">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                  <div className="mb-6">
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">
                      New offering
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Choose what you chanted, then log the count.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <Field label="Select Japa / Shloka">
                      <div className="relative">
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className={`${inputCls} appearance-none pr-11`}
                        >
                          <option value="">— Choose offering —</option>
                          {japaTypes.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.nameKannada}
                            </option>
                          ))}
                        </select>
                        <svg
                          viewBox="0 0 24 24"
                          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                        </svg>
                      </div>
                    </Field>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field label="Date">
                        <input
                          type="date"
                          value={selectedDate}
                          max={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className={inputCls}
                        />
                      </Field>

                      <Field label="Total count">
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          placeholder="e.g. 108"
                          value={count}
                          onChange={(e) => setCount(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSave()}
                          className={`${inputCls} font-semibold`}
                        />
                      </Field>
                    </div>

                    {/* quick add chips */}
                    <div className="flex flex-wrap gap-2">
                      {[11, 27, 54, 108, 1008].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setCount(String(n))}
                          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                            String(n) === count
                              ? "border-[#D4AF37] bg-[#FBF6E6] text-[#B9932C]"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {n.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <Button onClick={handleSave} disabled={loading}>
                        {loading && <Spinner />}
                        {loading ? "Submitting…" : "Submit offering"}
                      </Button>
                      <p className="mt-3 text-center text-xs text-slate-400">
                        Offerings are saved to your devotee profile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: HISTORY */}
            {activeTab === "history" && (
              <div className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-7 sm:py-10">
                {/* Summary */}
                <section className="mb-9">
                  <div className="mb-4 flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Overall summary
                    </h3>
                    <span className="text-xs font-medium text-slate-400">
                      {Object.keys(summary).length} categor
                      {Object.keys(summary).length === 1 ? "y" : "ies"}
                    </span>
                  </div>

                  {Object.keys(summary).length === 0 ? (
                    <EmptyState
                      title="No offerings recorded yet"
                      subtitle="Your totals will appear here once you submit."
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {Object.entries(summary).map(([type, total]) => (
                        <div
                          key={type}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                        >
                          <div className="text-2xl font-bold leading-none text-[#B9932C]">
                            {Number(total).toLocaleString()}
                          </div>
                          <div className="mt-2 line-clamp-2 text-sm font-medium text-slate-600">
                            {typeName(type)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Previous counts */}
                <section>
                  <div className="mb-4 flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Previous counts
                    </h3>
                    <span className="text-xs font-medium text-slate-400">
                      {history.length} {history.length === 1 ? "entry" : "entries"}
                    </span>
                  </div>

                  {history.length === 0 ? (
                    <EmptyState
                      title="Your timeline is empty"
                      subtitle="Submit an offering to start your record."
                    />
                  ) : (
                    <>
                      {/* Mobile / tablet cards */}
                      <div className="space-y-3 lg:hidden">
                        {history.map((item, index) => (
                          <div
                            key={item.id ?? index}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {typeName(item.type)}
                                </p>
                                <p className="mt-1 text-xs font-medium text-slate-400">
                                  #{index + 1} ·{" "}
                                  {new Date(item.date).toLocaleDateString("en-GB")}
                                </p>
                              </div>
                              <span className="shrink-0 rounded-full bg-[#FBF6E6] px-3 py-1.5 text-sm font-bold text-[#B9932C]">
                                +{Number(item.count).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop table */}
                      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80">
                              <th className="w-16 p-4 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                S.No
                              </th>
                              <th className="w-36 p-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                Date
                              </th>
                              <th className="p-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                Japa / Shloka
                              </th>
                              <th className="w-32 p-4 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                Count
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {history.map((item, index) => (
                              <tr
                                key={item.id ?? index}
                                className="transition-colors hover:bg-slate-50"
                              >
                                <td className="p-4 text-center text-sm font-medium text-slate-400">
                                  {index + 1}
                                </td>
                                <td className="p-4 text-sm font-medium text-slate-700">
                                  {new Date(item.date).toLocaleDateString("en-GB")}
                                </td>
                                <td className="p-4 text-sm font-medium text-slate-900">
                                  {typeName(item.type)}
                                </td>
                                <td className="p-4 text-right text-sm font-bold text-[#B9932C]">
                                  +{Number(item.count).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </section>
              </div>
            )}
          </div>

          {/* Sticky footer action (modal only, mobile-friendly) */}
          {isModal && (
            <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-3 sm:px-7">
              <button
                onClick={onClose}
                className="w-full rounded-xl py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 sm:w-auto sm:px-5"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
