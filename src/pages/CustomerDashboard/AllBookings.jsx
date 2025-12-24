// src/pages/customer/AllBookings.jsx
import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { MapPin, DollarSign } from "lucide-react";

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const currentUserId = auth.currentUser?.uid;

  // Fetch bookings for current user
  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, "bookings"),
      where("customerId", "==", currentUserId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const userBookings = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(userBookings);
    });

    return () => unsub();
  }, [currentUserId]);

  // Badge color based on status
  const getBadgeColor = (status) => {
    switch (status) {
      case "In Transit":
        return "bg-blue-100 text-blue-700";
      case "Waiting for Assign":
        return "bg-yellow-100 text-yellow-700";
      case "Payment Pending":
        return "bg-orange-100 text-orange-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Card color based on status
  const getCardColor = (status) => {
    if (
      status === "Waiting for Assign" ||
      status === "Payment Pending" ||
      status === "pending"
    ) {
      return "bg-yellow-50 border-yellow-300";
    }
    return "bg-blue-50 border-blue-200";
  };

  return (
    <div className="w-full p-6 font-sans bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">All Bookings</h2>

      {bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No bookings found.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition ${getCardColor(
                b.status
              )}`}
            >
              {/* Top Row: Status & Booking ID */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-md font-semibold ${getBadgeColor(
                      b.status
                    )}`}
                  >
                    {b.status}
                  </span>
                  <span className="text-sm text-gray-600">{b.id}</span>
                </div>
              </div>

              {/* Pickup & Drop */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex items-center space-x-1">
                  <MapPin size={16} strokeWidth={2} className="text-green-600" />
                  <span className="text-sm">
                    {b.pickupAddress?.city}, {b.pickupAddress?.state}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-red-600">
                  <MapPin size={16} strokeWidth={2} />
                  <span className="text-sm">
                    {b.dropAddress?.city}, {b.dropAddress?.state}
                  </span>
                </div>
              </div>

              {/* Truck & Goods Info */}
              <div className="mt-2 text-sm text-gray-700">
                <span className="font-medium">{b.truck || "Truck Info"}</span> •{" "}
                {b.weight} kg • {b.goodsType}
              </div>

              {/* Bottom: Price, Pickup Date, View Button */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="flex items-center space-x-1 text-lg font-semibold text-gray-800">
                  <DollarSign size={18} />
                  <span>{b.price || "₹0"}</span>
                </div>
                <div className="text-sm text-gray-500">{b.pickupDate}</div>
                <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}