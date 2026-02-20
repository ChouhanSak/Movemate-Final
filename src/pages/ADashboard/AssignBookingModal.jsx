import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  addDoc,
  getDoc  
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import Swal from "sweetalert2";

export default function AssignBookingModal({ open, booking, onClose }) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
const [step, setStep] = useState(1); // 1 = assign driver/vehicle, 2 = price
  // Fetch available vehicles when modal opens
  useEffect(() => {
    if (!open || !auth.currentUser) return;

    const q = query(
      collection(db, "vehicles"),
      where("agencyId", "==", auth.currentUser.uid),
      where("status", "==", "Available")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setVehicles(list);
    });

    return () => unsub();
  }, [open]);

  if (!open || !booking) return null;

  // Assign driver & vehicle
  const handleAssign = async () => {
    // 🔹 STEP A: fetch customer email
const customerSnap = await getDoc(
  doc(db, "customers", booking.customerId)
);

if (!customerSnap.exists()) {
  Swal.fire("Error", "Customer email not found", "error");
  return;
}

const customerEmail = customerSnap.data().email;
console.log("FINAL CUSTOMER EMAIL 👉", customerEmail);

    if (!driverName || !driverPhone || !selectedVehicle) {
      Swal.fire({
        icon: "warning",
        title: "Missing Details",
        text: "Please fill driver name, phone number and select a vehicle",
      });
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(driverPhone)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Phone",
        text: "Driver phone number must be 10 digits",
      });
      return;
    }

    try {
      // Update booking
      await updateDoc(doc(db, "bookings", booking.id), {
        status: "BOOKING_PLACED",
        vehicleId: selectedVehicle,
        driverName,
        driverPhone,
        assignedAt: serverTimestamp(),
      });
       await addDoc(collection(db, "notifications"), {
  userType: "customer",
  userId: booking.customerId,
  bookingId: booking.id,
  title: "Driver Assigned",
  message: `Your driver ${driverName} has been assigned.`,
  createdAt: serverTimestamp(),
  read: false
});

      // Mark vehicle unavailable
      await updateDoc(doc(db, "vehicles", selectedVehicle), {
        status: "Not Available",
      });
console.log("BOOKING 👉", booking);
console.log("CUSTOMER ID 👉", booking.customerId);
console.log("FETCHING DRIVER ASSIGN EMAIL...");

// 🔹 EMAIL: Driver & Vehicle Assigned
const res = await fetch("http://127.0.0.1:5000/booking/assign-driver", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    customerEmail: customerEmail,
    bookingId: booking.id,
    pickup: `${booking.pickupAddress.city}, ${booking.pickupAddress.state}`,
    drop: `${booking.dropAddress.city}, ${booking.dropAddress.state}`,
    dateTime: `${booking.pickupDate} ${booking.timeSlot}`,

  }),
});

const data = await res.json();
console.log("📨 DRIVER ASSIGN MAIL RESPONSE 👉", data);

if (!res.ok) {
  Swal.fire("Email Error", data.message || "Mail not sent", "error");
  return;
}
      Swal.fire({
        icon: "success",
        title: "Assigned!",
        text: "Driver & vehicle assigned successfully",
      });

      // Reset
      setDriverName("");
      setDriverPhone("");
      setSelectedVehicle("");
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">
          Assign Driver & Vehicle
        </h2>

        {/* Driver Info */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-600">
            Driver Name
          </label>
          <input
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="Driver name"
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />

          <label className="text-sm font-medium text-gray-600 mt-3 block">
            Driver Phone
          </label>
          <input
            value={driverPhone}
            onChange={(e) => setDriverPhone(e.target.value)}
            placeholder="Driver phone number"
            type="tel"
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Vehicle */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-600">
            Select Vehicle
          </label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.license} • {v.type} • {v.capacity} kg
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}