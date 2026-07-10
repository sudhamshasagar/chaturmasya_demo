import React from "react";
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarDays,
  User,
  Users,
  Music2,
  Timer,
  ShieldCheck,
  Hash,
  Smartphone,
} from "lucide-react";

const CulturalStatusTracker = ({
  statusSearch,
  setStatusSearch,

  statusResults = [],
  setStatusResults,

  isCheckingStatus,

  statusSearched,
  setStatusSearched,

  statusError,
  setStatusError,

  handleCheckCulturalStatus,

  formatCulturalTime,
  formatCulturalTimestamp,
  getDurationLabel,
}) => {
  const handleSearchChange = (event) => {
    setStatusSearch(event.target.value);

    setStatusError("");
    setStatusSearched(false);
    setStatusResults([]);
  };

  return (
    <section
      id="cultural-status"
      className="scroll-mt-32 max-w-5xl mx-auto px-4 sm:px-6"
    >
      <div
        className="
          relative
          overflow-hidden
          rounded-[1.75rem]
          md:rounded-[2.75rem]
          bg-gradient-to-br
          from-[#2a0b06]
          via-[#3a1009]
          to-[#5a1a0e]
          border
          border-[#722013]/40
          shadow-[0_30px_90px_rgba(42,11,6,0.18)]
        "
      >
        {/* DECORATIVE BACKGROUND */}

        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#E86A33]/10 blur-3xl pointer-events-none" />

        <div className="absolute top-0 right-0 opacity-[0.035] pointer-events-none">
          <ShieldCheck className="w-72 h-72" />
        </div>

        <div className="relative z-10 p-5 sm:p-8 md:p-10 lg:p-12">
          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-3.5 py-2 rounded-full mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-50" />

                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
              </span>

              <span className="text-[9px] sm:text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">
                Booking Status
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
              Track Cultural Seva Request
            </h2>

            <p className="text-sm md:text-base text-[#D8C3BD] leading-relaxed mt-4">
              Enter your Booking ID or registered mobile number to view
              the latest status of your Cultural Seva request.
            </p>
          </div>

          {/* ==================================================
              SEARCH FORM
          ================================================== */}

          <form
            onSubmit={handleCheckCulturalStatus}
            className="
              bg-white/10
              backdrop-blur-md
              border
              border-white/10
              rounded-2xl
              md:rounded-3xl
              p-3
              sm:p-4
            "
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                <input
                  type="text"
                  value={statusSearch}
                  onChange={handleSearchChange}
                  placeholder="Booking ID or Mobile Number"
                  className="
                    w-full
                    bg-white
                    text-[#2a0b06]
                    border
                    border-white
                    rounded-xl
                    sm:rounded-2xl
                    pl-11
                    pr-4
                    py-4
                    outline-none
                    focus:ring-2
                    focus:ring-[#D4AF37]
                    placeholder:text-gray-400
                  "
                />
              </div>

              <button
                type="submit"
                disabled={isCheckingStatus}
                className="
                  sm:min-w-[160px]
                  bg-gradient-to-r
                  from-[#D4AF37]
                  to-[#b5952f]
                  text-white
                  px-6
                  py-4
                  rounded-xl
                  sm:rounded-2xl
                  font-bold
                  flex
                  items-center
                  justify-center
                  gap-2
                  hover:shadow-[0_0_25px_rgba(212,175,55,0.25)]
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  transition-all
                "
              >
                {isCheckingStatus ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />

                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />

                    Check Status
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ==================================================
              ERROR
          ================================================== */}

          {statusError && (
            <div className="mt-5 bg-red-500/10 border border-red-400/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />

              <p className="text-sm font-medium text-red-200 leading-relaxed">
                {statusError}
              </p>
            </div>
          )}

          {/* ==================================================
              NO RESULTS
          ================================================== */}

          {statusSearched &&
            !isCheckingStatus &&
            statusResults.length === 0 &&
            !statusError && (
              <div className="mt-6 bg-white/10 border border-white/10 rounded-2xl md:rounded-3xl p-7 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-5 h-5 text-[#D4AF37]" />
                </div>

                <p className="font-bold text-white">
                  No Cultural Seva request found.
                </p>

                <p className="text-sm text-[#D8C3BD] mt-2">
                  Verify your Booking ID or registered mobile number and
                  try again.
                </p>
              </div>
            )}

          {/* ==================================================
              RESULTS
          ================================================== */}

          {statusResults.length > 0 && (
            <div className="mt-8 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                  {statusResults.length === 1
                    ? "1 Request Found"
                    : `${statusResults.length} Requests Found`}
                </p>
              </div>

              {statusResults.map((booking) => {
                const status =
                  booking.status?.toLowerCase() || "pending";

                const isApproved = status === "approved";

                const isRejected = status === "rejected";

                const displayedCategory =
                  booking.category ||
                  booking.categoryType ||
                  "Not specified";

                return (
                  <article
                    key={booking.id}
                    className="
                      bg-[#FCF8F2]
                      rounded-2xl
                      md:rounded-[2rem]
                      p-5
                      sm:p-6
                      md:p-7
                      shadow-xl
                      overflow-hidden
                    "
                  >
                    {/* ========================================
                        RESULT HEADER
                    ======================================== */}

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#E8DCC4]">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
                          <Hash className="w-3 h-3" />

                          Booking ID
                        </p>

                        <p className="font-black text-[#2a0b06] mt-1 break-all">
                          {booking.bookingId || "Not available"}
                        </p>
                      </div>

                      <span
                        className={`
                          self-start
                          inline-flex
                          items-center
                          gap-1.5
                          px-4
                          py-2
                          rounded-full
                          text-[10px]
                          sm:text-xs
                          font-black
                          uppercase
                          tracking-wider

                          ${
                            isApproved
                              ? "bg-green-100 text-green-700"
                              : isRejected
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }
                        `}
                      >
                        {isApproved ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isRejected ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}

                        {isApproved
                          ? "Approved"
                          : isRejected
                          ? "Rejected"
                          : "Pending Approval"}
                      </span>
                    </div>

                    {/* ========================================
                        COMMON DETAILS
                    ======================================== */}

                    <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-4 py-6">
                      <StatusDetail
                        icon={User}
                        label="Devotee"
                        value={booking.name || "Not available"}
                      />

                      <StatusDetail
                        icon={CalendarDays}
                        label="Requested Date"
                        value={booking.date || "Not available"}
                      />

                      <StatusDetail
                        icon={Music2}
                        label="Program Category"
                        value={displayedCategory}
                      />

                      <StatusDetail
                        icon={Users}
                        label="Participation"
                        value={
                          booking.participationType
                            ? booking.participationType
                                .charAt(0)
                                .toUpperCase() +
                              booking.participationType.slice(1)
                            : "Solo"
                        }
                      />

                      <StatusDetail
                        icon={Users}
                        label="Participants"
                        value={booking.participantCount || 1}
                      />

                      <StatusDetail
                        icon={Smartphone}
                        label="Registered Mobile"
                        value={booking.contact || "Not available"}
                      />
                    </div>

                    {/* ========================================
                        PENDING
                    ======================================== */}

                    {!isApproved && !isRejected && (
                      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-orange-700" />
                          </div>

                          <div>
                            <p className="font-bold text-orange-900">
                              Awaiting Admin Approval
                            </p>

                            <p className="text-sm text-orange-700/80 mt-2 leading-relaxed">
                              Your request is under review. The requested
                              date is not confirmed yet. Program timing
                              and duration will be allocated by the
                              administration before approval.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ========================================
                        APPROVED
                    ======================================== */}

                    {isApproved && (
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 md:p-6">
                        <div className="flex items-start gap-3 mb-5">
                          <div className="w-11 h-11 shrink-0 rounded-xl bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-700" />
                          </div>

                          <div>
                            <p className="text-[9px] uppercase tracking-wider font-bold text-green-600">
                              Confirmed Program Slot
                            </p>

                            <p className="text-xl md:text-2xl font-serif font-bold text-green-900 mt-1">
                              {formatCulturalTime(booking.startTime)}
                              {" — "}
                              {formatCulturalTime(booking.endTime)}
                            </p>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <StatusInfoBox
                            icon={Timer}
                            label="Duration"
                            value={getDurationLabel(
                              booking.durationMinutes
                            )}
                          />

                          <StatusInfoBox
                            icon={ShieldCheck}
                            label="Approved On"
                            value={formatCulturalTimestamp(
                              booking.approvedAt
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* ========================================
                        REJECTED
                    ======================================== */}

                    {isRejected && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 md:p-6">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 shrink-0 rounded-xl bg-red-100 flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-700" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] uppercase tracking-wider font-bold text-red-600">
                              Request Status
                            </p>

                            <p className="text-xl font-serif font-bold text-red-900 mt-1">
                              Cultural Seva Request Rejected
                            </p>

                            <div className="mt-5 bg-white rounded-xl p-4 border border-red-100">
                              <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
                                Reason for Rejection
                              </p>

                              <p className="text-sm font-medium text-gray-700 mt-2 leading-relaxed break-words">
                                {booking.rejectionReason ||
                                  "No rejection reason was provided."}
                              </p>
                            </div>

                            <p className="text-xs text-red-700 mt-4">
                              Rejected on:{" "}
                              <span className="font-bold">
                                {formatCulturalTimestamp(
                                  booking.rejectedAt
                                )}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/*
  ============================================================
  DETAIL COMPONENT
  ============================================================
*/

const StatusDetail = ({ icon: Icon, label, value }) => {
  return (
    <div className="bg-white border border-[#E8DCC4]/70 rounded-xl p-4 min-w-0">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />

        <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
          {label}
        </p>
      </div>

      <p className="font-bold text-sm text-[#2a0b06] mt-2 break-words">
        {value}
      </p>
    </div>
  );
};

/*
  ============================================================
  APPROVED INFO BOX
  ============================================================
*/

const StatusInfoBox = ({ icon: Icon, label, value }) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-green-100">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-green-600" />

        <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
          {label}
        </p>
      </div>

      <p className="font-black text-sm text-[#2a0b06] mt-2 break-words">
        {value}
      </p>
    </div>
  );
};

export default CulturalStatusTracker;