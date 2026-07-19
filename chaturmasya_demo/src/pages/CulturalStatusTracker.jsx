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
    <section id="cultural-status" className="scroll-mt-12 max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white border border-[#E8DCC4]/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-[#FAF6F0] px-5 py-6 sm:px-8 border-b border-[#E8DCC4]/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2a0b06] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                Track Cultural Seva Booking Status
              </h2>
              <p className="text-xs sm:text-sm text-[#5a5046] mt-1">
                Enter your Booking ID or registered mobile number to view status.
              </p>
            </div>

            <form onSubmit={handleCheckCulturalStatus} className="w-full md:w-[400px] shrink-0">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={statusSearch}
                  onChange={handleSearchChange}
                  placeholder="Booking ID or Mobile..."
                  className="w-full bg-white text-sm text-[#2a0b06] border border-[#E8DCC4] rounded-lg pl-10 pr-24 py-2.5 outline-none focus:border-[#722013] focus:ring-1 focus:ring-[#722013] transition-all placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={isCheckingStatus || !statusSearch.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#722013] hover:bg-[#5a180e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold tracking-wider px-4 rounded-md transition-colors flex items-center justify-center min-w-[80px]"
                >
                  {isCheckingStatus ? (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    "CHECK"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ==================================================
            CONTENT AREA (RESULTS / ERRORS / EMPTY)
        ================================================== */}
        <div className="p-5 sm:p-8 bg-white min-h-[160px]">
          
          {/* Error State */}
          {statusError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-medium text-red-800">{statusError}</p>
            </div>
          )}

          {/* No Results State */}
          {statusSearched && !isCheckingStatus && statusResults.length === 0 && !statusError && (
            <div className="text-center py-8">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-[#2a0b06]">No request found.</p>
              <p className="text-xs text-gray-500 mt-1">Verify your ID or mobile number and try again.</p>
            </div>
          )}

          {/* Pending Search State (Empty init) */}
          {!statusSearched && statusResults.length === 0 && !statusError && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 font-medium italic">Your status results will appear here.</p>
            </div>
          )}

          {/* Results List */}
          {statusResults.length > 0 && (
            <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] border-b border-[#E8DCC4]/40 pb-2">
                {statusResults.length} {statusResults.length === 1 ? "Request Found" : "Requests Found"}
              </p>

              {statusResults.map((booking) => {
                const status = booking.status?.toLowerCase() || "pending";
                const isApproved = status === "approved";
                const isRejected = status === "rejected";
                const displayedCategory = booking.category || booking.categoryType || "Not specified";

                return (
                  <article
                    key={booking.id}
                    className="border border-[#E8DCC4] rounded-xl overflow-hidden bg-[#FDFBF7] shadow-sm"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-white border-b border-[#E8DCC4]/60">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-[#FAF6F0] flex items-center justify-center shrink-0 border border-[#E8DCC4]">
                          <Hash className="w-3.5 h-3.5 text-[#D4AF37]" />
                        </div>
                        <div className="truncate">
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold leading-none mb-1">
                            Booking ID
                          </p>
                          <p className="text-sm font-bold text-[#2a0b06] truncate">
                            {booking.bookingId || "N/A"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest self-start sm:self-auto ${
                          isApproved
                            ? "bg-green-100 text-green-700"
                            : isRejected
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : isRejected ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {isApproved ? "Approved" : isRejected ? "Rejected" : "Pending"}
                      </span>
                    </div>

                    {/* Data Grid */}
                    <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <Detail icon={User} label="Devotee" value={booking.name} />
                      <Detail icon={CalendarDays} label="Date" value={booking.date} />
                      <Detail icon={Music2} label="Category" value={displayedCategory} />
                      <Detail icon={Smartphone} label="Mobile" value={booking.contact} />
                      <Detail 
                        icon={Users} 
                        label="Type" 
                        value={booking.participationType ? booking.participationType.charAt(0).toUpperCase() + booking.participationType.slice(1) : "Solo"} 
                      />
                      <Detail icon={Users} label="Participants" value={booking.participantCount || 1} />
                    </div>

                    {/* Status Specific Footer */}
                    <div className="px-5 py-4 bg-white border-t border-[#E8DCC4]/60">
                      
                      {/* Pending */}
                      {!isApproved && !isRejected && (
                        <div className="flex items-start gap-2.5">
                          <Clock className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-orange-800">Awaiting Admin Approval</p>
                            <p className="text-xs text-orange-700/80 mt-0.5">Time and duration will be allocated upon approval.</p>
                          </div>
                        </div>
                      )}

                      {/* Approved */}
                      {isApproved && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">Confirmed Slot</p>
                              <p className="text-sm font-bold text-green-900 mt-0.5">
                                {formatCulturalTime(booking.startTime)} — {formatCulturalTime(booking.endTime)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 border-l-0 sm:border-l border-green-200 sm:pl-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase text-gray-400">Duration</p>
                              <p className="text-xs font-bold text-[#2a0b06] mt-0.5">{getDurationLabel(booking.durationMinutes)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase text-gray-400">Approved</p>
                              <p className="text-xs font-bold text-[#2a0b06] mt-0.5">{formatCulturalTimestamp(booking.approvedAt)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rejected */}
                      {isRejected && (
                        <div className="flex items-start gap-2.5">
                          <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <p className="text-xs font-bold text-red-800">Request Rejected</p>
                              <p className="text-[10px] font-bold text-red-600/70">
                                On: {formatCulturalTimestamp(booking.rejectedAt)}
                              </p>
                            </div>
                            <div className="mt-2 bg-red-50 rounded-md p-2 border border-red-100">
                              <p className="text-[10px] uppercase font-bold text-red-700/60 mb-0.5">Reason</p>
                              <p className="text-xs text-red-900">{booking.rejectionReason || "No reason provided."}</p>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
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
  COMPACT DETAIL COMPONENT
  ============================================================
*/
const Detail = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <Icon className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400 leading-none mb-1">
          {label}
        </p>
        <p className="text-xs font-semibold text-[#2a0b06] truncate">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default CulturalStatusTracker;