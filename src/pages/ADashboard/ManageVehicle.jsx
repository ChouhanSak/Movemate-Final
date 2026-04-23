import React, { useState, useEffect } from "react";
import { Plus, X, Truck, Trash2 } from "lucide-react";
import { auth, db } from "../../firebase";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, getDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import Swal from "sweetalert2";
import { onAuthStateChanged } from "firebase/auth";
import EmptyState from "../../components/EmptyState";

export default function ManageVehicle() {
  const [saving, setSaving] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const handleCloseModal = () => {
  setShowAddVehicle(false);
  setForm({ type: "", capacity: "", license: "" });
  setLicenseWarning("");
  setMessage("");
};
  const [vehicles, setVehicles] = useState([]);
  const [agency, setAgency] = useState(null);
  const [form, setForm] = useState({ type: "", capacity: "", license: "" });
  const [message, setMessage] = useState("");
  const [licenseWarning, setLicenseWarning] = useState("");

  const vehicleTypes = [
    { label: "Mini Truck (MN)", value: "Mini Truck" },
    { label: "Small Truck (ST)", value: "Small Truck" },
    { label: "Medium Truck (MT)", value: "Medium Truck" },
    { label: "Large Truck (LT)", value: "Large Truck" },
    { label: "Container Truck (CT)", value: "Container Truck" },
    { label: "Tempo (TP)", value: "Tempo" },
  ];

  // Normalize vehicle status
  const normalizeStatus = (status) => {
    if (status === "Busy") return "Not Available";
    return status;
  };

  const getStatusStyle = (status) => {
    if (status === "Available") return "bg-green-100 text-green-700";
    if (status === "Not Available") return "bg-gray-200 text-gray-700";
    return "bg-yellow-100 text-yellow-700";
  };

  // Delete vehicle
  const handleDeleteVehicle = async (vehicleId, license) => {
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

    if (result.isConfirmed) {
      await deleteDoc(doc(db, "vehicles", vehicleId));
      setVehicles(vehicles.filter((v) => v.id !== vehicleId));
      setMessage("Vehicle deleted successfully!");
      setTimeout(() => setMessage(""), 3000);

      Swal.fire("Deleted!", `${license} has been deleted.`, "success");
    }
  };

  // Add vehicle
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
    const licenseRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;

if (!licenseRegex.test(form.license)) {
  setMessage("Invalid license plate format. Example: MH12AB1234");
  setTimeout(() => setMessage(""), 3000);
  return;
}
    try {
      setSaving(true);
      const q = query(
        collection(db, "vehicles"),
        where("license", "==", form.license.toUpperCase()),
        where("agencyId", "==", auth.currentUser.uid)
      );

      const snap = await getDocs(q);
      if (!snap.empty) {
  setMessage("Vehicle with this license already exists!");
  setTimeout(() => setMessage(""), 3000);
  setSaving(false);
  return;
}
      const docRef = await addDoc(collection(db, "vehicles"), {
        agencyId: auth.currentUser.uid,
        agencyName: agency.agencyName,
        type: form.type,
        capacity: Number(form.capacity),
        license: form.license.toUpperCase(),
        status: "Available",
        createdAt: serverTimestamp(),
      });

      setVehicles([...vehicles, { id: docRef.id, ...form, status: "Available" }]);
      setShowAddVehicle(false);
      setForm({ type: "", capacity: "", license: "" });
      setMessage("Vehicle added successfully!");
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error(err);
      setMessage("Error adding vehicle");
    }
    finally {
    setSaving(false); 
  }
  };

  // Load agency & vehicles
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // Fetch agency data
      const agencyRef = doc(db, "agencies", user.uid);
      const agencySnap = await getDoc(agencyRef);
      if (agencySnap.exists()) setAgency(agencySnap.data());

      // Listen to vehicles in real-time
      const q = query(collection(db, "vehicles"), where("agencyId", "==", user.uid));
      const unsubVehicles = onSnapshot(q, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setVehicles(list);
      });
    });

    return () => unsub();
  }, []);

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fleet Management</h1>
        <button
  onClick={() => {
    setForm({ type: "", capacity: "", license: "" });
    setLicenseWarning("");
    setMessage("");
    setShowAddVehicle(true);
  }}
          className="flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(90deg, #3b82f6, #a855f7)" }}
        >
          <Plus className="w-5 h-5" /> Add Vehicle
        </button>
      </div>
      <p className="text-gray-500 mb-8">Manage your vehicle fleet</p>


      {/* Vehicle List */}
      {vehicles.length === 0 ? (
  <div className="flex items-center justify-center min-h-[60vh]">
    <EmptyState
      title="No vehicles added yet"
      description="Add your first vehicle to start accepting bookings."
    />
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {vehicles.map((v) => (
          <div
            key={v.id}
            className={`p-6 rounded-xl shadow-lg transition-transform hover:scale-[1.02] 
              ${v.status === "Available" ? "bg-white border-2 border-green-50" : "bg-gray-50 border border-gray-200"}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${v.status === "Available" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                <Truck className="w-6 h-6" />
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(normalizeStatus(v.status))}`}
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
  )}
      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-[420px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Vehicle</h2>
              <X
  className="w-6 h-6 cursor-pointer text-gray-500 hover:text-gray-800"
  onClick={handleCloseModal}
/>
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
                  <option key={index} value={v.value}>{v.label}</option>
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
                <label className="text-sm font-medium text-gray-700">License Plate</label>
                <input
  type="text"
  className={`w-full mt-1 p-2 border rounded-lg uppercase 
    ${licenseWarning ? "border-red-500" : "border-gray-300"}`}
  placeholder="e.g. MH12AB1234"
  value={form.license}
  maxLength={10}
  onChange={(e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    setForm({ ...form, license: value });

    const licenseRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;

    if (value && !licenseRegex.test(value)) {
      setLicenseWarning(
        "⚠️ License plate format is incorrect. Correct format: e.g. MH12AB1234"
      );
    } else {
      setLicenseWarning("");
    }
  }}
/>
{licenseWarning && (
  <p className="text-red-500 text-sm mt-1">
    {licenseWarning}
  </p>
)}

              </div>
              {message && !message.includes("successfully") && (
                <p className="text-red-500 text-sm">{message}</p>
              )}
              <button
  className={`w-full py-2 text-white font-medium rounded-lg mt-4 shadow-md transition-all ${
    saving ? "bg-gray-400 cursor-not-allowed" : ""
  }`}
  style={
    saving
      ? {}
      : { background: "linear-gradient(90deg, #3b82f6, #a855f7)" }
  }
  onClick={handleAddVehicle}
  disabled={saving}
>
  {saving ? "Saving..." : "Save Vehicle"}
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