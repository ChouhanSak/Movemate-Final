import { CalendarCheck, CheckCircle, AlertTriangle, Eye } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../Firebase";
import { useEffect, useState } from "react";
import BookingDetails from "./BookingDetails";
export default function AllBookings() {
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
useEffect(() => {

  // fetch ALL bookings
  const q = query(collection(db, "bookings"));

  const unsub = onSnapshot(q, (snapshot) => {

    const list = snapshot.docs
      .map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          trackId: `#${doc.id.slice(0, 10).toUpperCase()}`,
          customer: data.customerName,
          agency: data.agencyName,

          // optional chaining crash avoid karega
          from: `${data.pickupAddress?.city || ""}, ${data.pickupAddress?.state || ""}`,
          to: `${data.dropAddress?.city || ""}, ${data.dropAddress?.state || ""}`,

          amount: Math.round(data.price || 0),
          date: data.createdAt?.toDate(),

          adminHold: data.status !== "COMPLETED",
          status: data.status?.toUpperCase(),
        };
      })

      // only remove completed bookings
      .filter((b) => b.status !== "COMPLETED");

    // 🔴 THIS WAS MISSING
    setBookings(list);

    setLoading(false);
  });

  return () => unsub();

}, []);

const formatDate = (date) =>
  date?.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const STATUS = {
  
  PENDING: {
  bg: "bg-yellow-50",
  text: "text-yellow-600",
  icon: <AlertTriangle size={14} />,
  label: "Pending",
},
PAYMENT_PENDING: {
  bg: "bg-orange-50",
  text: "text-orange-700",
  icon: <AlertTriangle size={14} />,
  label: "Payment Pending",
},
CANCELLED: {
  bg: "bg-red-50",
  text: "text-red-600",
  icon: <AlertTriangle size={14} />,
  label: "Cancelled",
},
  BOOKING_PLACED: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    icon: <CalendarCheck size={14} />,
    label: "Booking Placed",
  },

  PAYMENT_CONFIRMED: {
    bg: "bg-green-50",
    text: "text-green-600",
    icon: <CheckCircle size={14} />,
    label: "Payment Confirmed",
  },

  // ASSIGNED: {
  //   bg: "bg-purple-50",
  //   text: "text-purple-600",
  //   icon: <CheckCircle size={14} />,
  //   label: "Driver Assigned",
  // },

  IN_TRANSIT: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    icon: <CalendarCheck size={14} />,
    label: "In Transit",
  },

  COMPLETED: {
    bg: "bg-green-50",
    text: "text-green-700",
    icon: <CheckCircle size={14} />,
    label: "Completed",
  },

  DISPUTED: {
    bg: "bg-red-50",
    text: "text-red-600",
    icon: <AlertTriangle size={14} />,
    label: "Disputed",
  },

  admin: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    label: "Admin Holding",
  },
};

  // Filter bookings based on search input (from/to locations or booking ID)
  const filteredBookings = bookings.filter(
    (b) =>
      (b.from || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.to || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.trackId || "").toLowerCase().includes(search.toLowerCase())
);


  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold">All Bookings</h1>
          <p className="text-gray-500">Monitor all bookings across the platform</p>
        </div>
        <input
          type="text"
          placeholder="Search by location or booking ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Booking Cards */}
          <div className="space-y-4">

          {filteredBookings.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              No bookings found
            </div>
          )}

          {filteredBookings.map((b, i) => {

          const mainStatus = STATUS[b.status] || STATUS.BOOKING_PLACED;
          const adminStatus = STATUS.admin;
          return (
            <div
              key={i}
              className="bg-blue-50 rounded-2xl shadow-md p-4 border border-gray-200 space-y-3 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Top Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${mainStatus.bg} ${mainStatus.text}`}
                >
                  {mainStatus.icon} {mainStatus.label}
                </span>

                {b.adminHold && (
                  <>
                    <span
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${adminStatus.bg} ${adminStatus.text}`}
                    >
                      {adminStatus.label}
                    </span>
                    <span className="text-gray-500 text-xs ml-auto">{b.trackId}</span>
                  </>
                )}

                {!b.adminHold && (
                  <span className="text-gray-500 ml-auto text-xs">₹{b.amount.toLocaleString()}</span>
                )}
              </div>

              {/* Customer & Agency Details */}
              <div className="grid grid-cols-2 text-sm text-gray-700 gap-y-1">
                <p>
                  <strong>Customer:</strong> {b.customer}
                </p>
                <p>
                  <strong>Agency:</strong> {b.agency}
                </p>
                <p>
                  <strong>From:</strong> {b.from}
                </p>
                <p>
                  <strong>To:</strong> {b.to}
                </p>
              </div>

              <hr className="border-gray-200" />

              {/* Bottom Row */}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={14} />
                  <span>{formatDate(b.date)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-semibold">
                    ₹{b.amount.toLocaleString()}
                  </span>
                  <button
                  onClick={() => setSelectedBookingId(b.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  <Eye size={14} /> View
                </button>


                </div>
              </div>
            </div>
          );
        })}
      </div>
      {selectedBookingId && (
              <BookingDetails
                bookingId={selectedBookingId}
                onClose={() => setSelectedBookingId(null)}
              />
            )}

    </div>
  );
}