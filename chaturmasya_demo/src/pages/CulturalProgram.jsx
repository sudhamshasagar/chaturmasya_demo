import React, { useMemo, useState } from "react";
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

  /*
    Category is stored directly inside culturalForm.

    Expected structure after selection:

    culturalForm = {
      ...existingFields,
      category: "Bhajan",
      otherCategory: ""
    }
  */

  const selectedCategory = culturalForm?.category || "";

  const otherCategory = culturalForm?.otherCategory || "";

  /*
    ============================================================
    CURRENT MONTH
    ============================================================
  */

  const currentMonth = MONTHS[monthIndex];

  /*
    ============================================================
    FILTER CURRENT MONTH DATES
    ============================================================
  */

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

  /*
    ============================================================
    FIRST DAY OFFSET

    Example:
    If July 1 is Wednesday => 3 empty calendar cells.
    ============================================================
  */

  const firstDayOffset = new Date(
    currentMonth.year,
    currentMonth.month,
    1
  ).getDay();

  /*
    ============================================================
    MONTH NAVIGATION
    ============================================================
  */

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
    CATEGORY CHANGE
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

  /*
    ============================================================
    OTHER CATEGORY CHANGE
    ============================================================
  */

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

  const canSubmit =
    selectedDateId &&
    culturalForm?.name?.trim() &&
    culturalForm?.contact?.length === 10 &&
    isCategoryValid &&
    !isSubmittingCultural;

  /*
    ============================================================
    RENDER
    ============================================================
  */

  return (
    <section
      id="cultural"
      className="scroll-mt-32 max-w-7xl mx-auto px-4 sm:px-6"
    >
      {/* ======================================================
          SECTION HEADER
      ====================================================== */}

      <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
        <div
          className="
            inline-flex
            items-center
            gap-2
            bg-[#722013]/5
            border
            border-[#722013]/10
            px-4
            py-2
            rounded-full
            mb-5
          "
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E86A33] opacity-75" />

            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E86A33]" />
          </span>

          <span className="text-[10px] md:text-xs font-bold text-[#722013] uppercase tracking-[0.18em]">
            Bookings Open
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2a0b06] font-serif mb-4">
          Cultural Seva Booking
        </h2>

        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          Offer Harikatha, Bhajans, Music, Dance, Spiritual Discourse,
          or another cultural program during Chaturmasya.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4 text-xs sm:text-sm font-bold text-[#722013]">
          <span>July 29 — September 26, 2026</span>

          <span className="text-[#D4AF37]">•</span>

          <span>Maximum 3 approved programs per day</span>
        </div>
      </div>

      {/* ======================================================
          APPROVAL NOTICE
      ====================================================== */}

      <div className="max-w-5xl mx-auto mb-6 md:mb-8">
        <div className="bg-[#FFF8E8] border border-[#E8D3A5] rounded-2xl p-4 sm:p-5 md:p-6 flex items-start gap-4">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#9A7625]" />
          </div>

          <div>
            <h3 className="font-bold text-[#2a0b06] mb-1">
              Admin approval is required
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Submission does not confirm the Cultural Seva booking.
              Requests are reviewed by the administration and confirmed
              only after approval.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          MAIN BOOKING FORM
      ====================================================== */}

      <form
        onSubmit={handleCulturalSubmit}
        className="
          bg-white
          border
          border-[#E8DCC4]/70
          rounded-[1.75rem]
          md:rounded-[2.5rem]
          overflow-hidden
          shadow-[0_24px_80px_rgba(42,11,6,0.08)]
        "
      >
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          {/* ==================================================
              LEFT SIDE
          ================================================== */}

          <div className="p-4 sm:p-6 md:p-8 lg:p-10">
            {/* HEADER */}

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-bold text-[#722013] uppercase tracking-[0.2em] mb-2">
                  Select Program Date
                </p>

                <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#2a0b06]">
                  Choose a date
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                  Select a date to check program availability.
                </p>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                  Available
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  Full
                </span>
              </div>
            </div>

            {/* ================================================
                CALENDAR
            ================================================ */}

            <div className="border border-[#E8DCC4] rounded-2xl md:rounded-3xl overflow-hidden bg-white">
              {/* MONTH HEADER */}

              <div className="flex items-center justify-between px-3 sm:px-5 py-4 bg-[#FCF8F2] border-b border-[#E8DCC4]">
                <button
                  type="button"
                  onClick={previousMonth}
                  disabled={monthIndex === 0}
                  aria-label="Previous month"
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-white
                    border
                    border-[#E8DCC4]
                    flex
                    items-center
                    justify-center
                    text-[#722013]
                    hover:border-[#D4AF37]
                    disabled:opacity-30
                    disabled:cursor-not-allowed
                    transition
                  "
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.18em]">
                    Cultural Calendar
                  </p>

                  <h4 className="text-lg sm:text-xl font-serif font-bold text-[#2a0b06] mt-1">
                    {getMonthLabel(
                      currentMonth.year,
                      currentMonth.month
                    )}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={nextMonth}
                  disabled={monthIndex === MONTHS.length - 1}
                  aria-label="Next month"
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-white
                    border
                    border-[#E8DCC4]
                    flex
                    items-center
                    justify-center
                    text-[#722013]
                    hover:border-[#D4AF37]
                    disabled:opacity-30
                    disabled:cursor-not-allowed
                    transition
                  "
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* WEEKDAY HEADER */}

              <div className="grid grid-cols-7 border-b border-[#E8DCC4]">
                {[
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                ].map((day) => (
                  <div
                    key={day}
                    className="py-3 text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400"
                  >
                    <span className="sm:hidden">
                      {day.substring(0, 1)}
                    </span>

                    <span className="hidden sm:inline">{day}</span>
                  </div>
                ))}
              </div>

              {/* DATE GRID */}

              <div className="grid grid-cols-7 p-1.5 sm:p-2">
                {Array.from({
                  length: firstDayOffset,
                }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[58px] sm:min-h-[72px] md:min-h-[82px]"
                  />
                ))}

                {currentMonthDates.map((date) => {
                  const remainingSlots = getRemainingSlots(date.id);

                  const isFullyBooked = remainingSlots <= 0;

                  const isSelected = selectedDateId === date.id;

                  return (
                    <button
                      key={date.id}
                      type="button"
                      disabled={isFullyBooked}
                      onClick={() => setSelectedDateId(date.id)}
                      className={`
                        relative
                        min-w-0
                        min-h-[58px]
                        sm:min-h-[72px]
                        md:min-h-[82px]
                        m-0.5
                        sm:m-1
                        rounded-xl
                        sm:rounded-2xl
                        border
                        flex
                        flex-col
                        items-center
                        justify-center
                        transition-all
                        duration-200

                        ${
                          isSelected
                            ? `
                              bg-[#2a0b06]
                              text-white
                              border-[#2a0b06]
                              shadow-lg
                              scale-[1.02]
                            `
                            : isFullyBooked
                            ? `
                              bg-gray-50
                              text-gray-300
                              border-gray-100
                              cursor-not-allowed
                            `
                            : `
                              bg-[#FCF8F2]
                              text-[#2a0b06]
                              border-transparent
                              hover:bg-white
                              hover:border-[#D4AF37]
                              hover:shadow-md
                            `
                        }
                      `}
                    >
                      <span className="text-base sm:text-lg md:text-xl font-serif font-bold leading-none">
                        {date.dayNumber}
                      </span>

                      <span
                        className={`
                          mt-1.5
                          text-[7px]
                          sm:text-[9px]
                          font-black
                          uppercase

                          ${
                            isSelected
                              ? "text-[#D4AF37]"
                              : isFullyBooked
                              ? "text-gray-300"
                              : remainingSlots === 1
                              ? "text-orange-600"
                              : "text-[#8A6B1F]"
                          }
                        `}
                      >
                        {isFullyBooked
                          ? "Full"
                          : `${remainingSlots} Left`}
                      </span>

                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5">
                          <Check className="w-3 h-3 text-[#D4AF37]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ================================================
                AVAILABILITY RESULT
            ================================================ */}

            {selectedDateData ? (
              <div
                className="
                  mt-5
                  bg-gradient-to-r
                  from-[#2a0b06]
                  to-[#4a150c]
                  rounded-2xl
                  md:rounded-3xl
                  p-5
                  sm:p-6
                  text-white
                  shadow-xl
                "
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-[#D4AF37]" />
                    </div>

                    <div>
                      <p className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.18em]">
                        Selected Date
                      </p>

                      <p className="font-serif font-bold text-lg sm:text-xl mt-1">
                        {selectedDateData.fullDate}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <div className="flex sm:justify-end items-baseline gap-2">
                      <span className="text-3xl font-black text-[#D4AF37]">
                        {selectedDateRemainingSlots}
                      </span>

                      <span className="text-xs uppercase tracking-wider font-bold text-white/60">
                        {selectedDateRemainingSlots === 1
                          ? "Slot Left"
                          : "Slots Left"}
                      </span>
                    </div>

                    <p className="text-[10px] text-white/50 mt-1">
                      Subject to Admin approval
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 bg-[#FFFDF8] border border-dashed border-[#D4AF37] rounded-2xl p-5 text-center">
                <CalendarDays className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />

                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Select an available date to see remaining slots.
                </p>
              </div>
            )}
          </div>

          {/* ==================================================
              RIGHT SIDE FORM
          ================================================== */}

          <div className="bg-[#FAF6F0] border-t lg:border-t-0 lg:border-l border-[#E8DCC4] p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="lg:sticky lg:top-28">
              <div className="mb-7">
                <p className="text-[10px] font-bold text-[#722013] uppercase tracking-[0.2em] mb-2">
                  Program Information
                </p>

                <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#2a0b06]">
                  Request Cultural Seva
                </h3>

                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Enter devotee and program information for Admin review.
                </p>
              </div>

              <div className="space-y-5">
                {/* FULL NAME */}

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
                    <User className="w-3.5 h-3.5" />
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    value={culturalForm?.name || ""}
                    onChange={(event) =>
                      setCulturalForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Enter your full name"
                    className="
                      w-full
                      bg-white
                      border
                      border-[#E8DCC4]
                      rounded-2xl
                      px-4
                      sm:px-5
                      py-3.5
                      sm:py-4
                      outline-none
                      focus:ring-2
                      focus:ring-[#D4AF37]/30
                      focus:border-[#D4AF37]
                      transition
                    "
                  />
                </div>

                {/* MOBILE NUMBER */}

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
                    <Smartphone className="w-3.5 h-3.5" />
                    Mobile Number
                  </label>

                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    maxLength={10}
                    value={culturalForm?.contact || ""}
                    onChange={(event) =>
                      setCulturalForm((previous) => ({
                        ...previous,
                        contact: event.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="10-digit mobile number"
                    className="
                      w-full
                      bg-white
                      border
                      border-[#E8DCC4]
                      rounded-2xl
                      px-4
                      sm:px-5
                      py-3.5
                      sm:py-4
                      outline-none
                      focus:ring-2
                      focus:ring-[#D4AF37]/30
                      focus:border-[#D4AF37]
                      transition
                    "
                  />
                </div>

                {/* PROGRAM CATEGORY */}

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
                    <Music2 className="w-3.5 h-3.5" />
                    Program Category
                  </label>

                  <select
                    required
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="
                      w-full
                      bg-white
                      border
                      border-[#E8DCC4]
                      rounded-2xl
                      px-4
                      sm:px-5
                      py-3.5
                      sm:py-4
                      outline-none
                      focus:ring-2
                      focus:ring-[#D4AF37]/30
                      focus:border-[#D4AF37]
                      transition
                    "
                  >
                    <option value="">Select program category</option>

                    {PROGRAM_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* OTHER CATEGORY */}

                {selectedCategory === "Others" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2">
                      Specify Program Category
                    </label>

                    <input
                      type="text"
                      required
                      value={otherCategory}
                      onChange={handleOtherCategoryChange}
                      placeholder="Enter program category"
                      className="
                        w-full
                        bg-white
                        border
                        border-[#E8DCC4]
                        rounded-2xl
                        px-4
                        sm:px-5
                        py-3.5
                        sm:py-4
                        outline-none
                        focus:ring-2
                        focus:ring-[#D4AF37]/30
                        focus:border-[#D4AF37]
                        transition
                      "
                    />
                  </div>
                )}

                {/* PARTICIPATION TYPE */}

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
                    <Users className="w-3.5 h-3.5" />
                    Participation Type
                  </label>

                  <div className="grid grid-cols-2 gap-2 bg-white border border-[#E8DCC4] p-1.5 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setBookingType("solo");
                        setGroupCount(2);
                      }}
                      className={`
                        py-3.5
                        rounded-xl
                        text-sm
                        font-bold
                        transition-all

                        ${
                          bookingType === "solo"
                            ? "bg-[#2a0b06] text-white shadow-md"
                            : "text-gray-500 hover:bg-[#FAF6F0]"
                        }
                      `}
                    >
                      Solo
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingType("group")}
                      className={`
                        py-3.5
                        rounded-xl
                        text-sm
                        font-bold
                        transition-all

                        ${
                          bookingType === "group"
                            ? "bg-[#2a0b06] text-white shadow-md"
                            : "text-gray-500 hover:bg-[#FAF6F0]"
                        }
                      `}
                    >
                      Group
                    </button>
                  </div>
                </div>

                {/* GROUP COUNT */}

                {bookingType === "group" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2">
                      Number of Participants
                    </label>

                    <input
                      type="number"
                      min="2"
                      required
                      value={groupCount}
                      onChange={(event) =>
                        setGroupCount(event.target.value)
                      }
                      className="
                        w-full
                        bg-white
                        border
                        border-[#E8DCC4]
                        rounded-2xl
                        px-4
                        sm:px-5
                        py-3.5
                        sm:py-4
                        outline-none
                        focus:ring-2
                        focus:ring-[#D4AF37]/30
                        focus:border-[#D4AF37]
                      "
                    />
                  </div>
                )}

                {/* SELECTED DATE SUMMARY */}

                {selectedDateData && (
                  <div className="bg-white border border-[#D4AF37]/40 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-gray-400">
                          Selected Date
                        </p>

                        <p className="font-serif font-bold text-[#2a0b06] mt-1">
                          {selectedDateData.fullDate}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xl font-black text-[#722013]">
                          {selectedDateRemainingSlots}
                        </p>

                        <p className="text-[9px] uppercase tracking-wider text-gray-400">
                          Slots Left
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBMIT BUTTON */}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`
                    w-full
                    py-4
                    px-4
                    rounded-2xl
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                    transition-all
                    duration-300

                    ${
                      canSubmit
                        ? `
                          bg-[#2a0b06]
                          text-white
                          hover:bg-[#722013]
                          shadow-lg
                          hover:shadow-xl
                        `
                        : `
                          bg-gray-200
                          text-gray-400
                          cursor-not-allowed
                        `
                    }
                  `}
                >
                  {isSubmittingCultural
                    ? "Submitting Request..."
                    : "Submit Cultural Seva Request"}

                  {!isSubmittingCultural && (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>

                <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                  Your request remains pending until reviewed and approved
                  by the administration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default CBookingUser;