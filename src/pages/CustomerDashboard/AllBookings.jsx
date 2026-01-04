// src/pages/customer/AllBookings.jsx
import React, { useState, useEffect } from "react";
import { updateDoc, serverTimestamp } from "firebase/firestore";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { MapPin, DollarSign, Package, Box, Cpu, Truck } from "lucide-react";
import Swal from "sweetalert2";

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const currentUserId = auth.currentUser?.uid;
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [vehiclesMap, setVehiclesMap] = useState({});

  // ================= FETCH BOOKINGS =================
 useEffect(() => {
  if (!currentUserId) return;

  const q = query(
    collection(db, "bookings"),
    where("customerId", "==", currentUserId)
  );

  const unsub = onSnapshot(q, async (snap) => {
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    setBookings(data);

    // 🔥 VEHICLE FETCH
    const vehicleIds = data.map(b => b.vehicleId).filter(Boolean);

    const vehicleDocs = await Promise.all(
      vehicleIds.map(id => getDoc(doc(db, "vehicles", id)))
    );

    const map = {};
    vehicleDocs.forEach(v => {
      if (v.exists()) {
        map[v.id] = v.data();
      }
    });

    setVehiclesMap(map);
  });

  return () => unsub();
}, [currentUserId]);

  // ================= UI HELPERS =================
  const getBadgeColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";
    const s = status.toUpperCase();

    if (s === "PAYMENT_PENDING")
      return "bg-orange-100 text-orange-700";
    if (s === "PENDING")
      return "bg-yellow-100 text-yellow-700";
    if (s === "IN TRANSIT")
      return "bg-blue-100 text-blue-700";
    if (s === "COMPLETED")
      return "bg-green-100 text-green-700";
    if (s === "PAYMENT_CONFIRMED")
  return "bg-purple-100 text-purple-700";


    return "bg-gray-100 text-gray-700";
  };

  const getCardColor = (status) => {
    if (!status) return "bg-gray-50 border-gray-200";
    const s = status.toUpperCase();

    if (s === "PAYMENT_PENDING")
      return "bg-orange-50 border-orange-300";
    if (s === "PENDING")
      return "bg-yellow-50 border-yellow-300";
    if (s === "IN TRANSIT")
      return "bg-blue-50 border-blue-300";
    if (s === "COMPLETED")
      return "bg-green-50 border-green-300";
     if (s === "PAYMENT_CONFIRMED")
  return "bg-purple-50 border-purple-300";


    return "bg-gray-50 border-gray-200";
  };
  const confirmPayment = async (bookingId) => {
  try {
    const ref = doc(db, "bookings", bookingId);

    await updateDoc(ref, {
      status: "PAYMENT_CONFIRMED",
      paidAt: serverTimestamp(),
    });

    Swal.fire({
      icon: "success",
      title: "Payment Successful",
      text: "Your payment has been confirmed.",
      confirmButtonColor: "#16a34a",
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Payment Failed",
      text: "Something went wrong. Try again.",
    });
  }
};


  const formatStatus = (status) =>
    status ? status.replace("_", " ") : "";

  // ================= PAYMENT BUTTON (5 HOURS) =================
  const canShowPaymentButton = (booking) => {
    if (!booking.priceSetAt) return false;

    const requestedTime = booking.priceSetAt.toDate();
    const now = new Date();

    const diffHours = (now - requestedTime) / (1000 * 60 * 60);
    return diffHours <= 5;
  };

  // ================= FETCH VEHICLE =================
  const fetchVehicleInfo = async (vehicleId) => {
    if (!vehicleId) return null;
    const ref = doc(db, "vehicles", vehicleId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  };

  // ================= RENDER =================
  return (
    <div className="w-full p-6 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">All Bookings</h2>

      {bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No bookings found
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
              {/* TOP */}
              <div className="flex justify-between">
                <div>
                  <div className="flex gap-2 items-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-md font-semibold ${getBadgeColor(
                        b.status
                      )}`}
                    >
                      {formatStatus(b.status)}
                    </span>
                    <span className="text-xs text-gray-500">{b.id}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">
                    {b.agencyName || "Agency not assigned"}
                  </p>
                </div>

                <div className="flex items-center gap-1 font-semibold">
                       ₹{b.price || 0}
                 </div>

              </div>

              {/* LOCATIONS */}
              <div className="mt-3 flex gap-4 flex-col sm:flex-row">
                <div className="flex items-center gap-1">
                  <MapPin size={16} className="text-green-600" />
                  {b.pickupAddress?.city}, {b.pickupAddress?.state}
                </div>
                <div className="flex items-center gap-1 text-red-600">
                  <MapPin size={16} />
                  {b.dropAddress?.city}, {b.dropAddress?.state}
                </div>
              </div>
{/* GOODS */} 
<div className="mt-2 text-sm text-gray-700 flex flex-wrap gap-4 items-center">
  {/* STATUS / DRIVER INFO */}
  {/* VEHICLE INFO */}
{["IN TRANSIT", "COMPLETED"].includes(b.status?.toUpperCase()) && (
  <span className="flex items-center gap-1 font-medium">
    <Truck className="w-4 h-4 text-gray-600" />
    {vehiclesMap[b.vehicleId]?.type || "Vehicle Info"}
  </span>
)}

  {/* WEIGHT */}
  <span className="flex items-center gap-1">
    <Box className="w-4 h-4 text-gray-600" />
    {b.weight} kg
  </span>

  {/* GOODS TYPE */}
  <span className="flex items-center gap-1">
    {b.goodsType === "Electronics" && <Cpu className="w-4 h-4 text-gray-600" />}
    {b.goodsType === "Furniture" && <Package className="w-4 h-4 text-gray-600" />}
    {b.goodsType !== "Electronics" && b.goodsType !== "Furniture" && (
      <Box className="w-4 h-4 text-gray-600" />
    )}
    {b.goodsType}
  </span>
</div>

              {/* BOTTOM */}
              <div className="mt-4 grid grid-cols-3 items-center">
                <div></div>

                <div className="text-sm text-center text-gray-500">
                  {b.pickupDate}
                </div>

                <div className="flex justify-end gap-2">
                  {/* View Details button first */}
                  <button
                    onClick={async () => {
                      setSelectedBooking(b);
                      if (b.vehicleId) {
                        const v = await fetchVehicleInfo(b.vehicleId);
                        setVehicleData(v);
                      } else {
                        setVehicleData(null);
                      }
                      setIsOpen(true);
                    }}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    View Details
                  </button>

                  {/* Pay Now button after View Details */}
                  {b.status?.toUpperCase() === "PAYMENT_PENDING" && (
  <button
    onClick={() => {
      const requestedTime = b.priceSetAt.toDate();
      const now = new Date();
      const diffHours = (now - requestedTime) / (1000 * 60 * 60);

      if (diffHours > 5) {
        Swal.fire({
          icon: "error",
          title: "Time Expired",
          text: "Your time limit to proceed with payment has expired.",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK"
        });
      } else {
        confirmPayment(b.id);
      }
    }}
    className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
  >
    Pay Now
  </button>
)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
{isOpen && selectedBooking && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl w-full max-w-lg relative">
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-3 right-3"
      >
        ✕
      </button>

      <h3 className="text-lg font-semibold mb-4">Booking Details</h3>

      <div className="text-sm space-y-2">
        <p><b>Customer Name:</b> {selectedBooking.customerName}</p>
        <p><b>Status:</b> {formatStatus(selectedBooking.status)}</p>
        <p><b>Booking ID:</b> {selectedBooking.id}</p>
        <p><b>Agency:</b> {selectedBooking.agencyName || "NA"}</p>
        <p><b>Price:</b> ₹{selectedBooking.price || 0}</p>

        <hr />

        {/* LOCATIONS */}
<div className="mt-3 flex flex-col sm:flex-row justify-between gap-4">
  {/* Pickup */}
  <div className="flex flex-col gap-1 w-full sm:w-1/2">
    <span className="font-semibold text-sm text-gray-600">Pickup</span>
    <span className="flex items-center gap-1 text-green-600">
      <MapPin size={16} />
      {selectedBooking.pickupAddress?.street}, {selectedBooking.pickupAddress?.city}, {selectedBooking.pickupAddress?.state}
    </span>
  </div>

  {/* Drop */}
  <div className="flex flex-col gap-1 w-full sm:w-1/2">
    <span className="font-semibold text-sm text-gray-600">Drop</span>
    <span className="flex items-center gap-1 text-red-600">
      <MapPin size={16} />
      {selectedBooking.dropAddress?.street}, {selectedBooking.dropAddress?.city}, {selectedBooking.dropAddress?.state}
    </span>
  </div>
</div>

        <hr />

        <p><b>Vehicle:</b> {vehicleData?.type || "Not assigned"}</p>
        <p><b>License:</b> {vehicleData?.license || "Not assigned"}</p>
        <p><b>Driver:</b> {selectedBooking.driverName || "NA"}</p>
        <p><b>Driver Phone:</b> {selectedBooking.driverPhone || "NA"}</p>

        <hr />

        <p><b>Weight:</b> {selectedBooking.weight} kg</p>
        <p><b>Goods Type:</b> {selectedBooking.goodsType}</p>
        <p><b>Pickup Date:</b> {selectedBooking.pickupDate}</p>
        <p><b>Special Instructions:</b> {selectedBooking.instructions || "NA"}</p>
      </div>
    </div>
  </div>
)}

      
    </div>
  );
}