import React from "react";
import { X, MapPin, Plus, CheckCircle } from "lucide-react";

export default function PaymentModal({
  isOpen,
  onClose,
  booking,
  onConfirm,
}) {
  if (!isOpen || !booking) return null;

  const distance = booking.distance || 0;
  const rate = booking.perKmRate || 0;
  const additional = booking.additionalCharges || 0;
  const total = booking.price || 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">
            Payment Summary
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">

          {/* PRICE BREAKDOWN CARD */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">

            {/* Distance */}
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin size={16} className="text-blue-600" />
                Distance ({distance} km)
              </div>
              <div className="font-medium">
                ₹{rate} × {distance} km = ₹{rate * distance}
              </div>
            </div>

            {/* Additional Charges */}
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Plus size={16} className="text-orange-600" />
                Additional Charges
              </div>
              <div className="font-medium">
                ₹{additional}
              </div>
            </div>

            <hr />

            {/* TOTAL */}
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">
                Total Amount
              </span>
              <span className="text-2xl font-bold text-green-600">
                ₹{total}
              </span>
            </div>
          </div>

          {/* NOTE BOX */}
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg p-3">
            <b>Note:</b> Payment will be processed securely. 
            Your shipment will begin immediately after successful payment.
          </div>

        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex gap-3 p-4 border-t bg-white">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(booking.id)}
            className="flex-1 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            Confirm & Pay
          </button>
        </div>
      </div>
    </div>
  );
}