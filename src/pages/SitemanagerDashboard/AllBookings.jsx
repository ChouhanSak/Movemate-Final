import { CalendarCheck, CheckCircle, AlertTriangle, Eye } from "lucide-react";
import { useState } from "react";

export default function AllBookings() {
  const [search, setSearch] = useState("");

  const bookings = [
    {
      trackId: "#TRK789456123",
      status: "active",
      adminHold: true,
      customer: "Michael Brown",
      from: "Ahmedabad, Gujarat",
      to: "Jaipur, Rajasthan",
      agency: "Swift Logistics",
      date: "Nov 5, 2025",
      amount: 28000,
      release: false,
    },
    {
      trackId: "#TRK456123789",
      status: "completed",
      adminHold: true,
      customer: "Priya Sharma",
      from: "Kolkata, West Bengal",
      to: "Bhubaneswar, Odisha",
      agency: "Express Transport",
      date: "Nov 6, 2025",
      amount: 15000,
      release: true,
    },
    {
      trackId: "#TRK789123456",
      status: "disputed",
      adminHold: true,
      customer: "Rahul Mehta",
      from: "Mumbai, Maharashtra",
      to: "Pune, Maharashtra",
      agency: "QuickShip",
      date: "Nov 7, 2025",
      amount: 22000,
      release: false,
    },
  ];

  const STATUS = {
    active: { bg: "bg-blue-50", text: "text-blue-600", icon: <CalendarCheck size={14} />, label: "Active" },
    completed: { bg: "bg-green-50", text: "text-green-600", icon: <CheckCircle size={14} />, label: "Completed" },
    disputed: { bg: "bg-red-50", text: "text-red-600", icon: <AlertTriangle size={14} />, label: "Disputed" },
    admin: { bg: "bg-orange-50", text: "text-orange-600", label: "Admin Holding" },
  };

  // Filter bookings based on search input (from/to locations or booking ID)
  const filteredBookings = bookings.filter(
    (b) =>
      b.from.toLowerCase().includes(search.toLowerCase()) ||
      b.to.toLowerCase().includes(search.toLowerCase()) ||
      b.trackId.toLowerCase().includes(search.toLowerCase())
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
          placeholder="Search by location or booking ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Booking Cards */}
      <div className="space-y-4">
        {filteredBookings.map((b, i) => {
          const mainStatus = STATUS[b.status];
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
                  <span>{b.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-semibold">
                    ₹{b.amount.toLocaleString()}
                  </span>
                  <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition">
                    <Eye size={14} /> View
                  </button>
                  {b.release && (
                    <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition">
                      Release Payment
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
