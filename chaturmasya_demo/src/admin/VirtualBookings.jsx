
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const DEFAULT_MEET_LINK =
  "https://meet.google.com/abc-defg-hij";

const VirtualBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [meetLink, setMeetLink] =
    useState(DEFAULT_MEET_LINK);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // FETCH REAL VIRTUAL BOOKINGS FROM FIRESTORE
  // ----------------------------------------------------

  useEffect(() => {
    fetchVirtualBookings();
  }, []);

  const fetchVirtualBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const virtualBookingsQuery = query(
        collection(db, "bookings"),
        where("seva", "==", "Virtual Pada Pooja")
      );

      const snapshot = await getDocs(
        virtualBookingsQuery
      );

      const fetchedBookings =
        snapshot.docs.map((bookingDoc) => ({
          id: bookingDoc.id,
          ...bookingDoc.data(),
        }));

      // Sort latest booking date first
      fetchedBookings.sort((a, b) => {
        const dateA = getDateObject(a.date);
        const dateB = getDateObject(b.date);

        return dateB - dateA;
      });

      setBookings(fetchedBookings);
    } catch (err) {
      console.error(
        "Error fetching virtual bookings:",
        err
      );

      setError(
        "Unable to load Virtual Pada Pooja bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // DATE HELPERS
  // ----------------------------------------------------

  const getDateObject = (date) => {
    if (!date) return new Date(0);

    if (date?.toDate) {
      return date.toDate();
    }

    return new Date(date);
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const actualDate = getDateObject(date);

    return actualDate.toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  // ----------------------------------------------------
  // SEARCH
  // ----------------------------------------------------

  const filteredBookings = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    if (!searchValue) {
      return bookings;
    }

    return bookings.filter((booking) => {
      const bookingId = String(
        booking.bookingId || ""
      ).toLowerCase();

      const mobile = String(
        booking.mobile || ""
      ).toLowerCase();

      const name = String(
        booking.name || ""
      ).toLowerCase();

      const address = String(
        booking.address || ""
      ).toLowerCase();

      return (
        bookingId.includes(searchValue) ||
        mobile.includes(searchValue) ||
        name.includes(searchValue) ||
        address.includes(searchValue)
      );
    });
  }, [bookings, search]);

  // ----------------------------------------------------
  // GET BOOKING MEET LINK
  // ----------------------------------------------------

  const getBookingMeetLink = (booking) => {
    return booking.meetLink || meetLink;
  };

  // ----------------------------------------------------
  // COPY MASTER MEET LINK
  // ----------------------------------------------------

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        meetLink
      );

      alert("Google Meet Link Copied");
    } catch (err) {
      console.error(
        "Unable to copy Meet link:",
        err
      );

      alert(
        "Unable to copy the Google Meet link."
      );
    }
  };

  // ----------------------------------------------------
  // SEND WHATSAPP INVITE
  // ----------------------------------------------------

  const handleSendLink = (booking) => {
    const bookingMeetLink =
      getBookingMeetLink(booking);

    if (!booking.mobile) {
      alert(
        "Mobile number is not available for this booking."
      );

      return;
    }

    const whatsappMessage =
`Namaskara ${booking.name || "Devotee"} 🙏

Your Virtual Pada Pooja booking details:

Booking ID: ${booking.bookingId || "-"}
Date: ${formatDate(booking.date)}
Participants: ${booking.participants || "1"}

Google Meet Link:
${bookingMeetLink}

Please use the above link on your scheduled Virtual Pada Pooja date.

Karki Mutt Chaturmasya`;

    const whatsappUrl =
      `https://wa.me/91${booking.mobile}?text=${encodeURIComponent(
        whatsappMessage
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ----------------------------------------------------
  // SAVE MASTER LINK
  // ----------------------------------------------------
  // Currently updates local state only.
  // If you want, this can later be stored in Firestore
  // and automatically used by all virtual bookings.

  const saveMeetLink = () => {
    if (!meetLink.trim()) {
      alert(
        "Please enter a valid Google Meet link."
      );

      return;
    }

    alert("Master Meet Link Saved");
  };

  // ----------------------------------------------------
  // PRINT BOOKING RECEIPT
  // ----------------------------------------------------

  const handleDownload = (booking) => {
    const receiptWindow = window.open(
      "",
      "_blank"
    );

    if (!receiptWindow) {
      alert(
        "Please allow pop-ups to download the receipt."
      );

      return;
    }

    receiptWindow.document.write(`
      <!DOCTYPE html>

      <html>
        <head>
          <title>
            ${booking.bookingId || "Virtual Pada Pooja"}
          </title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #292524;
            }

            .receipt {
              max-width: 600px;
              margin: auto;
              border: 2px solid #d4af37;
              border-radius: 16px;
              padding: 30px;
            }

            h1 {
              text-align: center;
              margin-bottom: 5px;
            }

            .subtitle {
              text-align: center;
              color: #9a3412;
              margin-bottom: 30px;
            }

            .row {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              padding: 12px 0;
              border-bottom: 1px solid #e7e5e4;
            }

            .label {
              color: #78716c;
            }

            .value {
              font-weight: bold;
              text-align: right;
            }
          </style>
        </head>

        <body>

          <div class="receipt">

            <h1>
              Virtual Pada Pooja
            </h1>

            <div class="subtitle">
              Karki Mutt Chaturmasya 2026
            </div>

            <div class="row">
              <span class="label">
                Booking ID
              </span>

              <span class="value">
                ${booking.bookingId || "-"}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Devotee
              </span>

              <span class="value">
                ${booking.name || "-"}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Mobile
              </span>

              <span class="value">
                ${booking.mobile || "-"}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Date
              </span>

              <span class="value">
                ${formatDate(booking.date)}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Participants
              </span>

              <span class="value">
                ${booking.participants || "1"}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Address
              </span>

              <span class="value">
                ${booking.address || "-"}
              </span>
            </div>

          </div>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>

        </body>
      </html>
    `);

    receiptWindow.document.close();
  };

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">

      {/* BREADCRUMB */}

      <nav className="flex text-stone-500 text-sm font-bold uppercase tracking-wider mb-6">

        <Link
          to="/admin"
          className="hover:text-orange-700 transition"
        >
          Admin
        </Link>

        <span className="mx-2">
          /
        </span>

        <span className="text-stone-900">
          Virtual Bookings
        </span>

      </nav>

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b-2 border-stone-800 pb-4">

        <div>

          <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900 uppercase tracking-tight">
            Virtual Pada Pooja
          </h1>

          <p className="text-stone-500 font-serif italic mt-1 text-lg">
            Manage virtual bookings and send
            Google Meet invitations.
          </p>

        </div>

        <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg border border-orange-200 text-sm font-bold shadow-sm whitespace-nowrap">
          Total Records:{" "}
          {filteredBookings.length}
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
          {error}

          <button
            onClick={fetchVirtualBookings}
            className="ml-3 underline font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* CONTROLS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* MEET LINK */}

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">

          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">
            🎥 Master Google Meet Link
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">

            <input
              type="text"
              value={meetLink}
              onChange={(e) =>
                setMeetLink(e.target.value)
              }
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none"
              placeholder="Paste Google Meet URL..."
            />

            <div className="flex gap-2">

              <button
                onClick={saveMeetLink}
                className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-3 rounded-xl font-bold"
              >
                Save
              </button>

              <button
                onClick={handleCopyLink}
                className="bg-stone-100 hover:bg-stone-200 px-4 py-3 rounded-xl border border-stone-200"
              >
                Copy
              </button>

            </div>

          </div>

        </div>

        {/* SEARCH */}

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">

          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">
            🔍 Find Booking
          </h2>

          <input
            type="text"
            placeholder="Search by Booking ID, Name, Mobile or Address..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none"
          />

        </div>

      </div>

      {/* LOADING */}

      {loading ? (

        <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center">

          <div className="w-10 h-10 mx-auto border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4" />

          <p className="font-bold text-stone-700">
            Loading Virtual Pada Pooja bookings...
          </p>

        </div>

      ) : (

        <>

          {/* DESKTOP TABLE */}

          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full text-left border-collapse">

                <thead>

                  <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 text-xs uppercase tracking-wider font-bold">

                    <th className="p-5">
                      Booking
                    </th>

                    <th className="p-5">
                      Devotee
                    </th>

                    <th className="p-5">
                      Date
                    </th>

                    <th className="p-5">
                      Address
                    </th>

                    <th className="p-5 text-center">
                      Status
                    </th>

                    <th className="p-5 text-right">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-stone-100">

                  {filteredBookings.length >
                  0 ? (

                    filteredBookings.map(
                      (booking) => (

                        <tr
                          key={
                            booking.id ||
                            booking.bookingId
                          }
                          className="hover:bg-orange-50/50 transition-colors"
                        >

                          {/* BOOKING */}

                          <td className="p-5">

                            <div className="font-bold text-stone-900">
                              {booking.bookingId}
                            </div>

                            <div className="text-orange-700 text-sm font-bold mt-1">
                              Virtual Pada Pooja
                            </div>

                          </td>

                          {/* DEVOTEE */}

                          <td className="p-5">

                            <div className="font-bold text-stone-900">
                              {booking.name}
                            </div>

                            <div className="text-stone-500 text-sm mt-1">
                              📞 {booking.mobile}
                            </div>

                            <div className="text-stone-500 text-sm">
                              👥{" "}
                              {booking.participants ||
                                "1"}{" "}
                              Person(s)
                            </div>

                          </td>

                          {/* DATE */}

                          <td className="p-5">

                            <div className="font-bold text-stone-900 whitespace-nowrap">
                              {formatDate(
                                booking.date
                              )}
                            </div>

                          </td>

                          {/* ADDRESS */}

                          <td className="p-5">

                            <div
                              className="text-stone-600 text-sm max-w-xs line-clamp-3"
                              title={
                                booking.address
                              }
                            >
                              {booking.address ||
                                "Not provided"}
                            </div>

                          </td>

                          {/* STATUS */}

                          <td className="p-5 text-center">

                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 uppercase">
                              {booking.status ||
                                "Confirmed"}
                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td className="p-5">

                            <div className="flex gap-2 justify-end">

                              <button
                                onClick={() =>
                                  handleSendLink(
                                    booking
                                  )
                                }
                                className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-2 rounded-lg text-sm whitespace-nowrap"
                              >
                                Send Invite
                              </button>

                              <button
                                onClick={() =>
                                  handleDownload(
                                    booking
                                  )
                                }
                                className="bg-white border-2 border-stone-200 text-stone-700 hover:border-orange-600 hover:text-orange-600 font-bold px-3 py-2 rounded-lg text-sm"
                              >
                                Receipt
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="6"
                        className="p-12 text-center"
                      >

                        <div className="text-4xl mb-3">
                          🔍
                        </div>

                        <h3 className="text-lg font-bold text-stone-900">
                          No virtual bookings found
                        </h3>

                        <p className="text-stone-500 text-sm">
                          No matching Virtual Pada Pooja
                          bookings are available.
                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* MOBILE */}

          <div className="md:hidden space-y-4">

            {filteredBookings.map(
              (booking) => (

                <div
                  key={
                    booking.id ||
                    booking.bookingId
                  }
                  className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden"
                >

                  <div className="bg-stone-50 p-4 border-b border-stone-100 flex justify-between">

                    <div>

                      <div className="text-xs text-stone-500 font-bold uppercase">
                        Booking ID
                      </div>

                      <div className="font-black text-lg">
                        {booking.bookingId}
                      </div>

                    </div>

                    <span className="h-fit px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 uppercase">
                      {booking.status ||
                        "Confirmed"}
                    </span>

                  </div>

                  <div className="p-4 space-y-4">

                    <div>

                      <div className="text-orange-700 font-bold">
                        Virtual Pada Pooja
                      </div>

                      <div className="font-bold text-stone-900 text-xl mt-1">
                        {booking.name}
                      </div>

                      <div className="text-stone-500 text-sm mt-1">
                        📞 {booking.mobile}
                      </div>

                      <div className="text-stone-500 text-sm">
                        👥{" "}
                        {booking.participants ||
                          "1"}{" "}
                        Person(s)
                      </div>

                    </div>

                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">

                      <span className="block text-xs font-bold text-stone-400 uppercase">
                        Virtual Pooja Date
                      </span>

                      <span className="font-bold text-stone-800">
                        {formatDate(
                          booking.date
                        )}
                      </span>

                    </div>

                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">

                      <span className="block text-xs font-bold text-stone-400 uppercase mb-1">
                        Detailed Address
                      </span>

                      <span className="text-sm text-stone-700">
                        {booking.address ||
                          "Not provided"}
                      </span>

                    </div>

                    <div className="grid grid-cols-2 gap-2">

                      <button
                        onClick={() =>
                          handleSendLink(
                            booking
                          )
                        }
                        className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-bold px-4 py-3 rounded-xl"
                      >
                        Send Invite
                      </button>

                      <button
                        onClick={() =>
                          handleDownload(
                            booking
                          )
                        }
                        className="bg-white border-2 border-stone-200 text-stone-700 font-bold px-4 py-3 rounded-xl"
                      >
                        Receipt
                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </>

      )}

    </div>
  );
};

export default VirtualBookings;

