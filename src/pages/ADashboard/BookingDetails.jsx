import React from "react";
import { X, Phone, MapPin, Package, Weight, Calendar, Clock } from "lucide-react";
export default function BookingDetails({ open, onClose, booking }) {
  if (!open || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold mb-4">Booking Details</h2>

        {/* Customer */}
        <div className="space-y-2 mb-4">
          <p className="text-lg font-semibold">{booking.customerName}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            {booking.phone}
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="font-semibold mb-1">Pickup Address</p>
            <p className="text-gray-600">
              {booking.pickupAddress?.street},{" "}
              {booking.pickupAddress?.city},{" "}
              {booking.pickupAddress?.state}
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Drop Address</p>
            <p className="text-gray-600">
              {booking.dropAddress?.street},{" "}
              {booking.dropAddress?.city},{" "}
              {booking.dropAddress?.state}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            {booking.goodsType}
          </div>

          <div className="flex items-center gap-2">
            <Weight className="w-4 h-4" />
            {booking.weight} kg
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {booking.pickupDate}
          </div>

          <div className="flex items-center gap-2">
  <Clock className="w-4 h-4" />
  {booking.timeSlot}
</div>

          <div>
            <span className="font-semibold">Product Count:</span>{" "}
            {booking.productCount}
          </div>
        </div>

        {booking.instructions && (
          <div className="mt-4">
            <p className="font-semibold">Instructions</p>
            <p className="text-sm text-gray-600">{booking.instructions}</p>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
