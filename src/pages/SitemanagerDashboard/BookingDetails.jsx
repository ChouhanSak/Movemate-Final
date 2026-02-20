import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../Firebase";
import { useEffect, useState } from "react";
import { X, CalendarCheck } from "lucide-react";

export default function BookingDetails({ bookingId, onClose }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agencyRate, setAgencyRate] = useState(null);

  useEffect(() => {
  if (!booking?.agencyId) return;

  const agencyRef = doc(db, "agencies", booking.agencyId);

  const unsub = onSnapshot(agencyRef, (snap) => {
    if (snap.exists()) {
      setAgencyRate(snap.data().perKmRate);
    }
  });

  return () => unsub();
}, [booking]);

  useEffect(() => {
    if (!bookingId) return;

    const ref = doc(db, "bookings", bookingId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setBooking(snap.data());
      }
      setLoading(false);
    });

    return () => unsub();
  }, [bookingId]);

  if (!bookingId) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-8 relative max-h-[85vh] overflow-y-auto">

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>

          {loading ? (
            <div>Loading booking details...</div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-center mb-6">
                Booking Details
              </h2>

              {/* Details */}
              <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm mb-6">
                <p className="text-gray-500">Customer</p>
                <p className="font-medium">{booking.customerName}</p>

                <p className="text-gray-500">Agency</p>
                <p className="font-medium">{booking.agencyName}</p>

                <p className="text-gray-500">Pickup</p>
                <p className="font-medium">
                  {booking.pickupAddress.city}, {booking.pickupAddress.state}
                </p>

                <p className="text-gray-500">Drop</p>
                <p className="font-medium">
                  {booking.dropAddress.city}, {booking.dropAddress.state}
                </p>

                <p className="text-gray-500">Goods</p>
                <p className="font-medium">{booking.goodsType}</p>

                <p className="text-gray-500">Weight</p>
                <p className="font-medium">{booking.weight}</p>

                <p className="text-gray-500">Driver</p>
                <p className="font-medium"> {booking.driverName || "Not assigned"} </p>
                <p className="text-gray-500">Driver Phone</p>
                <p className="font-medium"> {booking.driverPhone || "Not assigned"} </p>

                <p className="text-gray-500">Vehicle ID</p>
               <p className="font-medium"> {booking.vehicleId || "Not assigned"} </p>



                <p className="text-gray-500">Status</p>
                <p className="font-medium">{booking.status}</p>
              </div>

              {/* Payment */}
              <div className="border-t pt-4 space-y-1">
                <h3 className="font-semibold">Payment Summary</h3>

                <p>
                    Distance:{" "}
                    <span className="font-medium">
                    {booking.distance ?? "—"} km
                    </span>
                </p>

                <p>
                    Rate per km:{" "}
                    <span className="font-medium">
                        ₹{agencyRate ?? "—"}
                    </span>
                </p>


                <p className="text-green-600 font-bold">
                    Total: ₹{Math.round(booking.price)}
                </p>
            </div>


              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                <CalendarCheck size={14} />
                Booked on{" "}
                {booking.createdAt?.toDate().toLocaleDateString("en-IN")}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}