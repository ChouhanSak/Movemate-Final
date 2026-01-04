import React, { useState, updateDoc } from "react";
import { Plus, X, Truck, Trash2 } from "lucide-react";
import { auth, db } from "../../firebase";
import { 
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import Swal from "sweetalert2";

export default function ManageVehicle() {
  
  const [showAddVehicle, setShowAddVehicle] = useState(false);
 const [vehicles, setVehicles] = useState([]);
const [agency, setAgency] = useState(null);

  const [form, setForm] = useState({ type: "", capacity: "", license: "" });
  const [message, setMessage] = useState("");
  const vehicleTypes = [
  { label: "Mini Truck (MN)", value: "Mini Truck" },
  { label: "Small Truck (ST)", value: "Small Truck" },
  { label: "Medium Truck (MT)", value: "Medium Truck" },
  { label: "Large Truck (LT)", value: "Large Truck" },
  { label: "Container Truck (CT)", value: "Container Truck" },
  { label: "Tempo (TP)", value: "Tempo" },
];

  // Delete Vehicle
  const handleDeleteVehicle = async (vehicleId, license) => {
  // SweetAlert2 confirmation
  const result = await Swal.fire({
    title: `Delete ${license}?`,
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });
  const handleCompleteBooking = async () => {
  try {
    // 1️⃣ booking complete
    await updateDoc(doc(db, "bookings", bookingId), {
      status: "Completed",
      completedAt: new Date(),
    });

    // 2️⃣ vehicle free
    await updateDoc(doc(db, "vehicles", vehicleId), {
      status: "Available",
    });

    alert("Booking completed & vehicle is now available");
  } catch (error) {
    console.error(error);
  }
};
await updateDoc(doc(db, "vehicles", booking.vehicleId), {
  status: "Available",
});
  if (result.isConfirmed) {
    // delete document
    await deleteDoc(doc(db, "vehicles", vehicleId));
    setVehicles(vehicles.filter(v => v.id !== vehicleId));
    setMessage("Vehicle deleted successfully!");
    setTimeout(() => setMessage(""), 3000);

    // success alert
    Swal.fire("Deleted!", `${license} has been deleted.`, "success");
  }
};
const normalizeStatus = (status) => {
  if (status === "Busy") return "Not Available";
  return status;
};
    const handleAddVehicle = async () => {
      if (!agency) {
    setMessage("Agency data is loading. Please wait...");
    return;
  }
  if (!form.type || !form.capacity || !form.license) {
    setMessage("All fields are mandatory!");
    setTimeout(() => setMessage(""), 3000);
    return;
  }

  try {
    const q = query(
    collection(db, "vehicles"),
    where("license", "==", form.license.toUpperCase()),
    where("agencyId", "==", auth.currentUser.uid)
  );

  const snap = await getDocs(q);
  if (!snap.empty) {
    setMessage("Vehicle with this license already exists!");
    return;
  }
    const docRef = await addDoc(collection(db, "vehicles"), {
      agencyId: auth.currentUser.uid,          // 🔥 IMPORTANT
      agencyName: agency.agencyName,            // 🔥 AUTO
      type: form.type,
      capacity: Number(form.capacity),
      license: form.license.toUpperCase(),
      status: "Available",
      createdAt: serverTimestamp(),
    });

    setVehicles([...vehicles, { id: docRef.id, ...form, status: "Available" }]);
    setShowAddVehicle(false);
    setForm({ id: "", type: "", capacity: "", license: "" });
    setMessage("Vehicle added successfully!");
    setTimeout(() => {
  setMessage("");
}, 5000); // 5 seconds
  } catch (err) {
    setMessage("Error adding vehicle");
  }
};


  const getStatusStyle = (status) => {
    if (status === "Available") return "bg-green-100 text-green-700";
    if (status === "Not Available") return "bg-gray-200 text-gray-700";
    return "bg-yellow-100 text-yellow-700";
  };
 useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    // ✅ 1. AGENCY DATA FETCH
    const agencyRef = doc(db, "agencies", user.uid);
    const agencySnap = await getDoc(agencyRef);

    if (agencySnap.exists()) {
      setAgency(agencySnap.data());
    }

    // ✅ 2. VEHICLES FETCH
    const q = query(
      collection(db, "vehicles"),
      where("agencyId", "==", user.uid)
    );

    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setVehicles(list);
  });

  return () => unsub();
}, []);


  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fleet Management</h1>
        <button
          onClick={() => setShowAddVehicle(true)}
          className="flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(90deg, #3b82f6, #a855f7)" }}
        >
          <Plus className="w-5 h-5" /> Add Vehicle
        </button>
      </div>
      <p className="text-gray-500 mb-8">Manage your vehicle fleet</p>

      {/* Vehicle List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className={`p-6 rounded-xl shadow-lg transition-transform hover:scale-[1.02] 
              ${v.status === 'Available' ? 'bg-white border-2 border-green-50' : 'bg-gray-50 border border-gray-200'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${v.status === 'Available' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                <Truck className="w-6 h-6" />
              </div>
             <span
  className={`px-3 py-1 text-xs font-semibold rounded-full 
    ${getStatusStyle(normalizeStatus(v.status))}`}
>
  {normalizeStatus(v.status)}
</span>

            </div>

            <h3 className="text-xl font-semibold mb-1">{v.license}</h3>
            <p className="text-gray-600 mb-4">{v.type}</p>

            <div className="space-y-1 text-sm">
              <p className="text-gray-500 flex justify-between">
                <span>Capacity:</span>
                <span className="font-medium text-gray-800">{v.capacity} kg</span>
              </p>
              <p className="text-gray-500 flex justify-between">
                <span>Vehicle ID:</span>
                <span className="font-medium text-gray-800">{v.id}</span>
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              {/* Delete Button */}
              <button
  onClick={() => handleDeleteVehicle(v.id, v.license)}
  className="p-3 border rounded-lg text-red-500 hover:bg-red-50 transition-colors"
  title={`Delete ${v.license}`}
>
  <Trash2 className="w-4 h-4" />
</button>

            </div>
          </div>
        ))}
      </div>

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-[420px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Vehicle</h2>
              <X className="w-6 h-6 cursor-pointer text-gray-500 hover:text-gray-800" onClick={() => setShowAddVehicle(false)} />
            </div>
            <div className="space-y-4">
             <label className="text-sm font-medium text-gray-700">Vehicle Type</label>

<select
  className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-white"
  value={form.type}
  onChange={(e) => setForm({ ...form, type: e.target.value })}
>
  <option value="">Select vehicle type</option>

  {vehicleTypes.map((v, index) => (
    <option key={index} value={v.value}>
      {v.label}
    </option>
  ))}
</select>

              <div>
                <label className="text-sm font-medium text-gray-700">Capacity (KG)</label>
                <input
                  type="number"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 5000"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">License Plate (e.g., MH02AB1234)</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                  placeholder="Enter license plate"
                  value={form.license}
                  onChange={(e) => setForm({ ...form, license: e.target.value })}
                />
              </div>
              {message && !message.includes("successfully") && (
                <p className="text-red-500 text-sm">{message}</p>
              )}
              <button
                className="w-full py-2 text-white font-medium rounded-lg mt-4 shadow-md hover:shadow-lg transition-all"
                style={{ background: "linear-gradient(90deg, #3b82f6, #a855f7)" }}
                onClick={handleAddVehicle}
              >
                Save Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success / Error Message */}
      {message && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-xl text-white font-medium transition-opacity duration-300 ${
            message.includes("successfully") ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
