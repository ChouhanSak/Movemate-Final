import React from "react";
import { MapPin, Truck, DollarSign, Clock } from "lucide-react";

export default function AllBookings() {
  const bookings = [
    {
      id: "#BK001",
      truck: "Medium Truck (10T)",
      weight: "8500 kg • Electronics",
      from: "Mumbai, Maharashtra",
      to: "Delhi, NCR",
      status: "In Transit",
      price: "₹35,000",
      date: "Nov 10, 2025",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      id: "#BK002",
      truck: "Small Truck (5T)",
      weight: "3200 kg • Furniture",
      from: "Pune, Maharashtra",
      to: "Bangalore, Karnataka",
      status: "Waiting for Assign",
      price: "₹18,500",
      date: "Nov 11, 2025",
      badgeColor: "bg-yellow-100 text-yellow-700",
    },
    {
      id: "#BK003",
      truck: "Large Truck (20T)",
      weight: "15000 kg • Construction Materials",
      from: "Chennai, Tamil Nadu",
      to: "Hyderabad, Telangana",
      status: "Payment Pending",
      price: "₹52,000",
      date: "Nov 12, 2025",
      badgeColor: "bg-orange-100 text-orange-700",
    },
  ];

  return (
    <div className="w-full p-6 font-sans bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">All Bookings</h2>

      <div className="space-y-4">
        {bookings.map((b, idx) => (
          <div
            key={idx}
            className="bg-blue-50 rounded-xl border p-5 shadow-sm hover:shadow-md transition"
          >
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 text-xs rounded-md font-semibold ${b.badgeColor}`}
                >
                  {b.status}
                </span>
                <span className="text-sm text-gray-600">{b.id}</span>
              </div>
            </div>

            {/* City Row */}
            <div className="mt-3 flex items-start gap-6">
              <div className="flex items-start space-x-1">
                <MapPin size={16} strokeWidth={2} className="text-green-600" />
                <span className="text-sm">{b.from}</span>
              </div>

              <div className="flex items-start space-x-1 text-red-600">
                <MapPin size={16} strokeWidth={2} />
                <span className="text-sm">{b.to}</span>
              </div>
            </div>

            {/* Truck & Weight */}
            <div className="mt-2 text-sm text-gray-700">
              <span className="font-medium">{b.truck}</span> • {b.weight}
            </div>

            {/* Bottom: Price & Date & Button */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-1 text-lg font-semibold text-gray-800">
                <DollarSign size={18} />
                <span>{b.price}</span>
              </div>

              <div className="text-sm text-gray-500">{b.date}</div>

              <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
