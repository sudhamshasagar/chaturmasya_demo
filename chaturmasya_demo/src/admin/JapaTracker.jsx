import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  Filter,
  RotateCw,
  ArrowLeft,
  Flame,
  ChevronDown,
  Users,
  Sparkles,
  Trophy,
  X,
  SlidersHorizontal,
  History,
} from "lucide-react";
import { db } from "../firebase/firebase";

/* ------------------------- Theme tokens ------------------------- */
const INK = "#2A0B06";
const RUST = "#722013";
const GOLD = "#D4AF37";

/* ---------------------------- Helpers --------------------------- */
const fmt = (n) => new Intl.NumberFormat("en-IN").format(Number(n) || 0);

const shortDate = (d, longYear = false) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: longYear ? "numeric" : "2-digit",
  });

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

const calculateStreak = (datesArray) => {
  if (!datesArray || datesArray.length === 0) return 0;

  const sorted = [...new Set(datesArray)].sort((a, b) => new Date(b) - new Date(a));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastSubmission = new Date(sorted[0]);
  lastSubmission.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today - lastSubmission) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return 0;

  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = new Date(sorted[i]);
    const previous = new Date(sorted[i + 1]);
    current.setHours(0, 0, 0, 0);
    previous.setHours(0, 0, 0, 0);

    if (Math.floor((current - previous) / (1000 * 60 * 60 * 24)) === 1) streak++;
    else break;
  }
  return streak;
};

/* ------------------------ Small UI pieces ----------------------- */
function StatTile({ icon: Icon, label, value, accent = false, sub }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm ${
        accent
          ? "border-[#D4AF37]/40 bg-gradient-to-br from-[#2A0B06] to-[#4a1409] text-white"
          : "border-[#E8DCC4] bg-white"
      }`}
    >
      <div
        className={`absolute -right-6 -top-6 h-20 w-20 rounded-full ${
          accent ? "bg-[#D4AF37]/20" : "bg-[#FCF8F2]"
        }`}
      />
      <div className="relative flex items-center gap-2">
        <Icon className={`h-4 w-4 shrink-0 ${accent ? "text-[#D4AF37]" : "text-[#722013]"}`} />
        <p
          className={`truncate text-[10px] font-bold uppercase tracking-[0.14em] ${
            accent ? "text-white/70" : "text-[#722013]/70"
          }`}
        >
          {label}
        </p>
      </div>
      <p
        className={`relative mt-2 font-serif text-2xl font-black leading-none tabular-nums sm:text-3xl ${
          accent ? "text-[#F5D77A]" : "text-[#2A0B06]"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`relative mt-1.5 truncate text-[11px] font-medium ${
            accent ? "text-white/60" : "text-slate-500"
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function TypePill({ children, tiny = false }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-[#E8DCC4] bg-[#FCF8F2] font-bold text-[#722013] ${
        tiny ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-0.5 text-[10px]"
      }`}
    >
      {children}
    </span>
  );
}

function StreakBadge({ streak, tiny = false }) {
  if (!streak)
    return <span className="text-[10px] font-medium text-slate-300">—</span>;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-50 font-bold text-orange-600 ring-1 ring-orange-200 ${
        tiny ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"
      }`}
    >
      <Flame className="h-3 w-3" /> {streak}d
    </span>
  );
}

function RankBadge({ rank }) {
  const podium = rank <= 3;
  return (
    <span
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-black tabular-nums ${
        podium
          ? "bg-gradient-to-br from-[#D4AF37] to-[#b8912a] text-white shadow"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {rank}
    </span>
  );
}

function Avatar({ name }) {
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#E8DCC4] bg-[#FCF8F2] font-serif text-xs font-black text-[#722013]">
      {initials(name)}
    </div>
  );
}

function ShareBar({ pct }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#722013] transition-all duration-500"
        style={{ width: `${Math.max(2, pct)}%` }}
      />
    </div>
  );
}

function HistoryList({ submissions, dense = false }) {
  return (
    <div className={`space-y-0 ${dense ? "max-h-56" : "max-h-64"} overflow-y-auto pr-1`}>
      {submissions.map((sub, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-b border-dashed border-slate-100 py-2 last:border-0"
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-[#722013]">{sub.type}</p>
            <p className="text-[10px] font-medium text-slate-400">{shortDate(sub.date, true)}</p>
          </div>
          <span className="shrink-0 text-xs font-black tabular-nums text-slate-700">
            +{fmt(sub.count)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* --------------------------- Component -------------------------- */
export default function AdminJapa() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDevotee, setExpandedDevotee] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const q = query(collection(db, "records"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRecords(data);
    } catch (err) {
      console.error(err);
      alert("Unable to load records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const japaTypes = useMemo(
    () => [...new Set(records.map((r) => r.type))].filter(Boolean),
    [records]
  );

  const groupedDevotees = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      if (!map[r.mobile]) {
        map[r.mobile] = {
          mobile: r.mobile,
          name: r.name,
          totalCount: 0,
          types: new Set(),
          dates: new Set(),
          submissions: [],
        };
      }
      map[r.mobile].totalCount += Number(r.count || 0);
      if (r.type) map[r.mobile].types.add(r.type);
      if (r.date) map[r.mobile].dates.add(r.date);
      map[r.mobile].submissions.push(r);
    });

    return Object.values(map)
      .map((d) => ({
        ...d,
        types: Array.from(d.types),
        streak: calculateStreak(Array.from(d.dates)),
        submissions: d.submissions.sort((a, b) => new Date(b.date) - new Date(a.date)),
      }))
      .sort((a, b) => b.totalCount - a.totalCount);
  }, [records]);

  const filteredDevotees = useMemo(() => {
    return groupedDevotees.filter((devotee) => {
      const matchesSearch =
        devotee.name?.toLowerCase().includes(search.toLowerCase()) ||
        devotee.mobile?.includes(search);
      const matchesType = !selectedType || devotee.types.includes(selectedType);
      const matchesDate = !selectedDate || devotee.dates.has(selectedDate);
      return matchesSearch && matchesType && matchesDate;
    });
  }, [groupedDevotees, search, selectedType, selectedDate]);

  const totalDevotees = filteredDevotees.length;
  const overallJapaCount = filteredDevotees.reduce((s, d) => s + d.totalCount, 0);
  const topDevotee = filteredDevotees[0];
  const bestStreak = filteredDevotees.reduce((m, d) => Math.max(m, d.streak), 0);
  const maxCount = topDevotee?.totalCount || 1;

  const activeFilters = [
    search && { key: "search", label: `"${search}"`, clear: () => setSearch("") },
    selectedType && { key: "type", label: selectedType, clear: () => setSelectedType("") },
    selectedDate && {
      key: "date",
      label: shortDate(selectedDate, true),
      clear: () => setSelectedDate(""),
    },
  ].filter(Boolean);

  const clearAll = () => {
    setSearch("");
    setSelectedType("");
    setSelectedDate("");
  };

  const toggleExpand = (mobile) =>
    setExpandedDevotee(expandedDevotee === mobile ? null : mobile);

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pl-9 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/15";

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-[#FAFAF9] font-sans text-slate-900 lg:h-[100dvh] lg:overflow-hidden">
      {/* ------------------------- Command bar ------------------------- */}
      <header className="sticky top-0 z-30 shrink-0 border-b border-[#D4AF37]/25 bg-[#2A0B06] px-4 py-3 sm:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
                Chaturmasya Seva
              </p>
              <h1 className="truncate font-serif text-base font-black text-white sm:text-lg">
                Admin Portal
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 md:hidden"
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilters.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-[#D4AF37] text-[9px] font-black text-[#2A0B06]">
                  {activeFilters.length}
                </span>
              )}
            </button>
            <button
              onClick={() => loadRecords(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-1.5 rounded-xl bg-[#D4AF37] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#2A0B06] transition hover:brightness-105 disabled:opacity-60"
            >
              <RotateCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{refreshing ? "Syncing" : "Refresh"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pt-4 sm:px-6 lg:overflow-hidden">
        {/* ----------------------------- KPIs ---------------------------- */}
        <div className="shrink-0 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile icon={Users} label="Devotees" value={fmt(totalDevotees)} sub="Unique participants" />
          <StatTile
            icon={Sparkles}
            label="Overall Sankalpa"
            value={fmt(overallJapaCount)}
            accent
            sub="Total japa offered"
          />
          <StatTile
            icon={Trophy}
            label="Top Devotee"
            value={topDevotee ? fmt(topDevotee.totalCount) : "0"}
            sub={topDevotee?.name || "—"}
          />
          <StatTile icon={Flame} label="Best Streak" value={`${bestStreak}d`} sub="Consecutive days" />
        </div>

        {/* ---------------------------- Filters -------------------------- */}
        <div
          className={`mt-3 shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm ${
            filtersOpen ? "block" : "hidden"
          } md:block`}
        >
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or mobile…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={`${inputClass} appearance-none pr-8`}
              >
                <option value="">All Japas</option>
                {japaTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
              {activeFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={f.clear}
                  className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#FCF8F2] px-2.5 py-1 text-[10px] font-bold text-[#722013] ring-1 ring-[#E8DCC4] transition hover:bg-[#F3E7D3]"
                >
                  <span className="truncate">{f.label}</span>
                  <X className="h-3 w-3 shrink-0" />
                </button>
              ))}
              <button
                onClick={clearAll}
                className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-400 transition hover:text-[#722013]"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* -------------------------- Data panel ------------------------- */}
        <section className="mb-4 mt-3 flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Devotee Leaderboard
            </h2>
            <span className="text-[10px] font-bold tabular-nums text-slate-400">
              {fmt(totalDevotees)} shown
            </span>
          </div>

          {loading ? (
            <div className="flex flex-1 flex-col gap-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : filteredDevotees.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#FCF8F2]">
                <Search className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <p className="mt-3 font-serif text-lg font-black text-slate-700">No Records Found</p>
              <p className="mt-1 text-xs text-slate-400">Adjust your search or filters.</p>
              {activeFilters.length > 0 && (
                <button
                  onClick={clearAll}
                  className="mt-4 rounded-xl bg-[#2A0B06] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {/* ---------------------- Desktop table ---------------------- */}
              <div className="hidden lg:block">
                <table className="w-full min-w-[880px] border-collapse text-left">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        #
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Devotee
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Japa / Shloka
                      </th>
                      <th className="px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Streak
                      </th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Overall Count
                      </th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">
                        History
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDevotees.map((devotee, idx) => {
                      const open = expandedDevotee === devotee.mobile;
                      return (
                        <React.Fragment key={devotee.mobile}>
                          <tr className={`transition-colors ${open ? "bg-[#FCF8F2]" : "hover:bg-slate-50"}`}>
                            <td className="px-4 py-3">
                              <RankBadge rank={idx + 1} />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <Avatar name={devotee.name} />
                                <div className="min-w-0">
                                  <p className="truncate font-bold text-slate-900">{devotee.name}</p>
                                  <p className="text-[10px] font-medium tracking-wider text-slate-400">
                                    +91 {devotee.mobile}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex max-w-[260px] flex-wrap gap-1.5">
                                {devotee.types.map((type, i) => (
                                  <TypePill key={i}>{type}</TypePill>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <StreakBadge streak={devotee.streak} />
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-right font-serif text-base font-black tabular-nums text-[#722013]">
                                {fmt(devotee.totalCount)}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => toggleExpand(devotee.mobile)}
                                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition ${
                                  open
                                    ? "bg-[#2A0B06] text-white"
                                    : "bg-slate-100 text-[#2A0B06] hover:bg-[#D4AF37] hover:text-white"
                                }`}
                              >
                                {devotee.submissions.length}
                                <ChevronDown
                                  className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
                                />
                              </button>
                            </td>
                          </tr>

                          {open && (
                            <tr className="bg-[#FCF8F2]/60">
                              <td colSpan={6} className="px-4 pb-4 pt-0">
                                <div className="ml-12 rounded-xl border border-[#E8DCC4] bg-white p-4 shadow-sm">
                                  <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <History className="h-3.5 w-3.5 text-[#D4AF37]" />
                                    Submission History
                                  </h4>
                                  <HistoryList submissions={devotee.submissions} />
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ------------------- Mobile / tablet cards ------------------ */}
              <div className="flex flex-col gap-3 p-3 lg:hidden">
                {filteredDevotees.map((devotee, idx) => {
                  const open = expandedDevotee === devotee.mobile;
                  return (
                    <article
                      key={devotee.mobile}
                      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                        open ? "border-[#D4AF37]/60" : "border-slate-200"
                      }`}
                    >
                      <div className="p-4">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <RankBadge rank={idx + 1} />
                            <Avatar name={devotee.name} />
                            <div className="min-w-0">
                              <h3 className="truncate font-bold text-slate-900">{devotee.name}</h3>
                              <p className="text-[10px] font-medium tracking-wider text-slate-400">
                                +91 {devotee.mobile}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                              Total
                            </p>
                            <p className="font-serif text-lg font-black leading-tight tabular-nums text-[#722013]">
                              {fmt(devotee.totalCount)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <ShareBar pct={(devotee.totalCount / maxCount) * 100} />
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          {devotee.types.map((type, i) => (
                            <TypePill key={i} tiny>
                              {type}
                            </TypePill>
                          ))}
                          <span className="ml-auto">
                            <StreakBadge streak={devotee.streak} tiny />
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleExpand(devotee.mobile)}
                        className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 bg-slate-50/60 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:bg-slate-100 hover:text-[#2A0B06]"
                      >
                        {open ? "Hide" : `View ${devotee.submissions.length} submissions`}
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </button>

                      {open && (
                        <div className="border-t border-slate-100 bg-[#FCF8F2]/50 px-4 py-3">
                          <HistoryList submissions={devotee.submissions} dense />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
