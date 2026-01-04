import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import Swal from "sweetalert2";
import { serverTimestamp } from "firebase/firestore";
export default function AssignBookingModal({ open, booking, onClose }) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [price, setPrice] = useState("");
  const [step, setStep] = useState(1); // 1 = assign driver/vehicle, 2 = price

  // Fetch available vehicles
  useEffect(() => {
    if (!open || !auth.currentUser) return;

    const q = query(
      collection(db, "vehicles"),
      where("agencyId", "==", auth.currentUser.uid),
      where("status", "==", "Available")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setVehicles(list);
    });

    return () => unsub();
  }, [open]);

  if (!open || !booking) return null;

  // Handle Next button
const handleAssign = async () => {
  if (!driverName || !driverPhone || !selectedVehicle) {
    Swal.fire("Fill all fields!");
    return;
  }

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(driverPhone)) {
    Swal.fire("Driver phone number must be 10 digits");
    return;
  }

  try {
    await updateDoc(doc(db, "bookings", booking.id), {
      status: "In Transit",
      vehicleId: selectedVehicle,
      driverName,
      driverPhone,
      assignedAt: new Date(),
    });

    await updateDoc(doc(db, "vehicles", selectedVehicle), {
  status: "Not Available",
});

    Swal.fire("Assigned!", `Driver & Vehicle assigned successfully`, "success");

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
        <h2 className="text-xl font-semibold mb-4">Assign Driver & Vehicle</h2>

        {step === 1 && (
          <>
            {/* Driver */}
            <div className="mb-4">
  <label className="text-sm font-medium text-gray-600">Assign Driver</label>
  <input
    value={driverName}
    onChange={(e) => setDriverName(e.target.value)}
    placeholder="Driver name"
    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
  />
  <input
    value={driverPhone}
    onChange={(e) => setDriverPhone(e.target.value)}
    placeholder="Driver phone number"
    type="tel"
    className="mt-2 w-full border rounded-lg px-3 py-2 text-sm"
  />
</div>

<div className="mb-4">
  <label className="text-sm font-medium text-gray-600">Assign Vehicle</label>
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

<div className="flex justify-end gap-3">
  <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm">
    Cancel
  </button>
  <button
    onClick={handleAssign}
    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
  >
    Done
  </button>
</div>

          </>
        )}
      </div>
    </div>
  );
}