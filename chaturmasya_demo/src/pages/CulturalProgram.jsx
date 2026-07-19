import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Music2,
  Users,
  User,
  Smartphone,
  Check,
  AlertCircle,
  Building2,
  UserCircle,
  Loader2
} from "lucide-react";

const PROGRAM_CATEGORIES = [
  "Harikatha",
  "Bhajan",
  "Vocal Music",
  "Instrumental",
  "Classical Dance",
  "Spiritual Discourse",
  "Group Chanting",
  "Others",
];

const MONTHS = [
  { year: 2026, month: 6 }, // July
  { year: 2026, month: 7 }, // August
  { year: 2026, month: 8 }, // September
];

/*
  ============================================================
  DATE HELPERS
  ============================================================
*/

const parseLocalDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getMaxSlotsForDate = (dateId) => {
  const date = parseLocalDate(dateId);
  if (!date) return 3;
  // JavaScript: Sunday = 0, Monday = 1
  return date.getDay() === 1 ? 2 : 3;
};

const getMonthLabel = (year, month) =>
  new Date(year, month, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

/*
  ============================================================
  COMPONENT
  ============================================================
*/

const CBookingUser = ({
  culturalDates = [],
  getRemainingSlots,

  selectedDateId,
  setSelectedDateId,
  selectedDateData,
  selectedDateRemainingSlots,

  culturalForm,
  setCulturalForm,

  bookingType,
  setBookingType,

  groupCount,
  setGroupCount,

  isSubmittingCultural,
  handleCulturalSubmit,
}) => {
  /*
    ============================================================
    LOCAL UI STATE
    ============================================================
  */

  const [monthIndex, setMonthIndex] = useState(0);

  const selectedCategory = culturalForm?.category || "";
  const otherCategory = culturalForm?.otherCategory || "";

  /*
    ============================================================
    CURRENT MONTH & CALENDAR LOGIC
    ============================================================
  */

  const currentMonth = MONTHS[monthIndex];

  const currentMonthDates = useMemo(() => {
    return culturalDates.filter((date) => {
      const parsedDate = parseLocalDate(date.id);
      if (!parsedDate) return false;
      return (
        parsedDate.getFullYear() === currentMonth.year &&
        parsedDate.getMonth() === currentMonth.month
      );
    });
  }, [culturalDates, currentMonth.year, currentMonth.month]);

  const firstDayOffset = new Date(
    currentMonth.year,
    currentMonth.month,
    1
  ).getDay();

  const previousMonth = () => {
    if (monthIndex === 0) return;
    setMonthIndex((current) => current - 1);
    setSelectedDateId("");
  };

  const nextMonth = () => {
    if (monthIndex === MONTHS.length - 1) return;
    setMonthIndex((current) => current + 1);
    setSelectedDateId("");
  };

  /*
    ============================================================
    HANDLERS
    ============================================================
  */

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setCulturalForm((previous) => ({
      ...previous,
      category: value,
      otherCategory: value === "Others" ? previous.otherCategory || "" : "",
    }));
  };

  const handleOtherCategoryChange = (event) => {
    setCulturalForm((previous) => ({
      ...previous,
      otherCategory: event.target.value,
    }));
  };

  /*
    ============================================================
    FORM VALIDATION
    ============================================================
  */

  const isCategoryValid =
    selectedCategory &&
    (selectedCategory !== "Others" || otherCategory.trim());

  const isGroupValid =
    bookingType === "solo" ||
    (bookingType === "group" &&
      culturalForm?.groupName?.trim() &&
      culturalForm?.managerName?.trim() &&
      groupCount >= 2);

  const canSubmit =
    selectedDateId &&
    culturalForm?.name?.trim() &&
    culturalForm?.contact?.length === 10 &&
    isCategoryValid &&
    isGroupValid &&
    !isSubmittingCultural;

  /*
    ============================================================
    RENDER
    ============================================================
  */

  return (
    <section id="cultural" className="scroll-mt-32 max-w-5xl mx-auto px-4 py-8">
      
      {/* ======================================================
          HEADER & COMPACT NOTICE
      ====================================================== */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#722013]/10 border border-[#722013]/20 mb-3">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E86A33] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#E86A33]" />
            </span>
            <span className="text-[10px] font-bold text-[#722013] uppercase tracking-widest">
              Bookings Open
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2a0b06] mb-1.5">
            Cultural Seva Booking
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Offer Harikatha, Bhajans, Music, Dance, or Spiritual Discourse.
          </p>
        </div>

        {/* Compact Admin Notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-3 max-w-sm shrink-0 shadow-sm">
          <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-orange-800 leading-snug">
            <strong>Admin approval required.</strong> Submitting this request does not confirm the slot. Availability is subject to administrative review.
          </p>
        </div>
      </div>

      {/* ======================================================
          MAIN CONTAINER (SIDE-BY-SIDE)
      ====================================================== */}
      <div className="bg-white border border-[#E8DCC4] rounded-2xl shadow-sm overflow-hidden flex flex-col lg:flex-row">
        
        {/* ==================================================
            LEFT: CALENDAR (COMPACT)
        ================================================== */}
        <div className="lg:w-5/12 bg-[#FAF6F0] p-5 border-b lg:border-b-0 lg:border-r border-[#E8DCC4] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-lg text-[#2a0b06]">Select Date</h3>
            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#D4AF37]" /> Available</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-300" /> Full</span>
            </div>
          </div>

          <div className="bg-white border border-[#E8DCC4] rounded-xl overflow-hidden shadow-sm flex-1">
            {/* Month Nav */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-[#FCF8F2] border-b border-[#E8DCC4]">
              <button
                type="button"
                onClick={previousMonth}
                disabled={monthIndex === 0}
                className="p-1.5 rounded-md hover:bg-white text-[#722013] border border-transparent hover:border-[#E8DCC4] disabled:opacity-30 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h4 className="text-sm font-serif font-bold text-[#2a0b06]">
                {getMonthLabel(currentMonth.year, currentMonth.month)}
              </h4>
              <button
                type="button"
                onClick={nextMonth}
                disabled={monthIndex === MONTHS.length - 1}
                className="p-1.5 rounded-md hover:bg-white text-[#722013] border border-transparent hover:border-[#E8DCC4] disabled:opacity-30 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 border-b border-[#E8DCC4] bg-[#fafafa]">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="py-2 text-center text-[10px] font-bold uppercase text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 p-1.5 gap-1">
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10" />
              ))}

              {currentMonthDates.map((date) => {
                const normalRemainingSlots = getRemainingSlots(date.id);
                const maxSlotsForDate = getMaxSlotsForDate(date.id);
                const remainingSlots = Math.min(normalRemainingSlots, maxSlotsForDate);
                const isFullyBooked = remainingSlots <= 0;
                const isSelected = selectedDateId === date.id;

                return (
                  <button
                    key={date.id}
                    type="button"
                    disabled={isFullyBooked}
                    onClick={() => setSelectedDateId(date.id)}
                    className={`
                      relative h-10 w-full rounded-lg flex flex-col items-center justify-center transition-all border
                      ${isSelected
                        ? "bg-[#2a0b06] text-white border-[#2a0b06] shadow-md"
                        : isFullyBooked
                        ? "bg-gray-50 text-gray-300 border-transparent cursor-not-allowed"
                        : "bg-white text-[#2a0b06] border-transparent hover:border-[#D4AF37] hover:bg-[#FCF8F2]"}
                    `}
                  >
                    <span className="text-xs sm:text-sm font-bold leading-none">{date.dayNumber}</span>
                    <span
                      className={`text-[8px] font-bold uppercase mt-0.5 tracking-tight
                        ${isSelected ? "text-[#D4AF37]" : isFullyBooked ? "text-gray-300" : remainingSlots === 1 ? "text-orange-500" : "text-gray-400"}
                      `}
                    >
                      {isFullyBooked ? "Full" : `${remainingSlots} left`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==================================================
            RIGHT: FORM (COMPACT)
        ================================================== */}
        <div className="lg:w-7/12 p-5 sm:p-7 flex flex-col justify-between">
          <form onSubmit={handleCulturalSubmit} className="space-y-4">
            
            <div className="mb-2">
              <h3 className="font-serif font-bold text-xl text-[#2a0b06]">Devotee Details</h3>
            </div>

            {/* Row 1: Name & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={culturalForm?.name || ""}
                  onChange={(e) => setCulturalForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  className="w-full bg-[#FAF6F0] border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013] focus:bg-white transition"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  <Smartphone className="w-3 h-3" /> Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  value={culturalForm?.contact || ""}
                  onChange={(e) => setCulturalForm((prev) => ({ ...prev, contact: e.target.value.replace(/\D/g, "") }))}
                  placeholder="10-digit mobile"
                  className="w-full bg-[#FAF6F0] border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Row 2: Category */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                <Music2 className="w-3 h-3" /> Program Category
              </label>
              <select
                required
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full bg-[#FAF6F0] border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013] focus:bg-white transition cursor-pointer"
              >
                <option value="" disabled>Select category...</option>
                {PROGRAM_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Conditional Row: Other Category */}
            {selectedCategory === "Others" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                <input
                  type="text"
                  required
                  value={otherCategory}
                  onChange={handleOtherCategoryChange}
                  placeholder="Specify program category"
                  className="w-full bg-[#FAF6F0] border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013] focus:bg-white transition"
                />
              </motion.div>
            )}

            {/* Row 3: Participation Type Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 mb-2 uppercase tracking-wider">
                <Users className="w-3 h-3" /> Participation Type
              </label>
              <div className="flex bg-[#FAF6F0] border border-[#E8DCC4] p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => { setBookingType("solo"); setGroupCount(2); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    bookingType === "solo" ? "bg-[#2a0b06] text-white shadow-sm" : "text-gray-500 hover:text-[#2a0b06]"
                  }`}
                >
                  Solo
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType("group")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    bookingType === "group" ? "bg-[#2a0b06] text-white shadow-sm" : "text-gray-500 hover:text-[#2a0b06]"
                  }`}
                >
                  Group
                </button>
              </div>
            </div>

            {/* Conditional Rows: Group Specific Fields */}
            {bookingType === "group" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      <Building2 className="w-3 h-3" /> Group Name
                    </label>
                    <input
                      type="text"
                      required
                      value={culturalForm?.groupName || ""}
                      onChange={(e) => setCulturalForm((prev) => ({ ...prev, groupName: e.target.value }))}
                      placeholder="e.g. Sagara Bhajana Mandali"
                      className="w-full bg-[#FAF6F0] border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013] focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      <UserCircle className="w-3 h-3" /> Manager Name
                    </label>
                    <input
                      type="text"
                      required
                      value={culturalForm?.managerName || ""}
                      onChange={(e) => setCulturalForm((prev) => ({ ...prev, managerName: e.target.value }))}
                      placeholder="Group manager name"
                      className="w-full bg-[#FAF6F0] border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013] focus:bg-white transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Participant Count
                  </label>
                  <input
                    type="number"
                    min="2"
                    required
                    value={groupCount}
                    onChange={(e) => setGroupCount(e.target.value)}
                    className="w-full sm:w-1/2 bg-[#FAF6F0] border border-[#E8DCC4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#722013] focus:bg-white transition"
                  />
                </div>
              </motion.div>
            )}

            {/* Selected Date Summary & Submit */}
            <div className="mt-6 pt-6 border-t border-[#E8DCC4]">
              {selectedDateData ? (
                <div className="flex items-center justify-between mb-4 bg-[#FCF8F2] border border-[#D4AF37]/50 rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-sm font-bold text-[#2a0b06]">{selectedDateData.fullDate}</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#722013]">
                    {selectedDateRemainingSlots} Slots Available
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-500 font-bold mb-4 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Please select a date from the calendar.
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                  canSubmit
                    ? "bg-[#2a0b06] text-white hover:bg-[#722013] shadow-md hover:shadow-lg"
                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                }`}
              >
                {isSubmittingCultural ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span>
                ) : (
                  <>Submit Request <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </section>
  );
};

export default CBookingUser;