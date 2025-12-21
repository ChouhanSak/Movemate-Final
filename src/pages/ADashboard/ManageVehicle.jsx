import React, { useState } from "react";
import { Plus, X, Truck, Trash2 } from "lucide-react";

export default function ManageVehicle() {
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehicles, setVehicles] = useState([
    { id: "V001", type: "Small Truck (5T)", capacity: 5000, license: "MH-02-AB-1234", status: "Available" }, 
    { id: "V002", type: "Medium Truck (10T)", capacity: 10000, license: "MH-02-AB-5678", status: "Available" },
    { id: "V003", type: "Large Truck (20T)", capacity: 20000, license: "MH-02-AB-9012", status: "Not Available" },
  ]);
  const [form, setForm] = useState({ id: "", type: "", capacity: "", license: "" });
  const [message, setMessage] = useState("");

  // Add Vehicle
  const handleAddVehicle = () => {
    if (!form.id || !form.type || !form.capacity || !form.license) {
      setMessage("All fields are mandatory!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const formattedLicense = form.license
      .replace(/[^a-zA-Z0-9]/g, "")
      .match(/^([a-zA-Z]{2})(\d{2})([a-zA-Z]{2})(\d{4})$/);

    const displayLicense = formattedLicense
      ? `${formattedLicense[1].toUpperCase()}-${formattedLicense[2]}-${formattedLicense[3].toUpperCase()}-${formattedLicense[4]}`
      : form.license.toUpperCase();

    const newVehicle = {
      id: form.id,
      type: form.type,
      capacity: parseInt(form.capacity),
      license: displayLicense,
      status: "Available",
    };

    setVehicles([...vehicles, newVehicle]);
    setForm({ id: "", type: "", capacity: "", license: "" });
    setShowAddVehicle(false);
    setMessage(`Vehicle ${newVehicle.license} added successfully!`);
    setTimeout(() => setMessage(""), 3000);
  };

  // Delete Vehicle
  const handleDeleteVehicle = (vehicleId, license) => {
    setVehicles(vehicles.filter((v) => v.id !== vehicleId));
    setMessage(`Vehicle ${license} (ID: ${vehicleId}) deleted successfully!`);
    setTimeout(() => setMessage(""), 3000);
  };

  const getStatusStyle = (status) => {
    if (status === "Available") return "bg-green-100 text-green-700";
    if (status === "Not Available") return "bg-gray-200 text-gray-700";
    return "bg-yellow-100 text-yellow-700";
  };

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
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(v.status)}`}>
                {v.status}
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
              <div>
                <label className="text-sm font-medium text-gray-700">Vehicle ID</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., V004"
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Vehicle Type</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Small Truck (5T)"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                />
              </div>
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
