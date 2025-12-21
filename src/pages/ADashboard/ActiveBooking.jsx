// components/ActiveBooking.jsx
import React, { useState } from "react";
import { Phone, User, Truck, MapPin, Calendar, X } from "lucide-react";

const initialBookings = [
  {
    id: "BK001",
    status: "In Transit",
    payment: "Customer Paid",
    customer: { name: "Michael Brown", phone: "+91 98765 11111" },
    driver: { name: "Amit Sharma", vehicle: "MH-02-AB-5678" },
    pickup: "Ahmedabad, Gujarat",
    drop: "Jaipur, Rajasthan",
    eta: "Nov 8, 2025",
    amount: "₹28,000",
  },
  {
    id: "BK002",
    status: "Out For Delivery",
    payment: "Customer Paid",
    customer: { name: "Priya Sharma", phone: "+91 98765 22222" },
    driver: { name: "Rajesh Kumar", vehicle: "MH-02-AB-1234" },
    pickup: "Kolkata, West Bengal",
    drop: "Bhubaneswar, Odisha",
    eta: "Nov 7, 2025",
    amount: "₹15,000",
  },
];

const statusBadgeColor = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("deliver")) return "bg-green-600";
  if (s.includes("transit")) return "bg-blue-500";
  if (s.includes("booked")) return "bg-indigo-500";
  if (s.includes("out for delivery")) return "bg-green-600";
  return "bg-gray-400";
};

export default function ActiveBooking({ showPanel, onClose, sideNavOpen }) {
  const [bookings, setBookings] = useState(initialBookings);

  // Modal state: 'none' | 'bookingId' | 'status'
  const [modalState, setModalState] = useState({
    type: "none",
    bookingIdInput: "",
    selectedBookingId: null,
    chosenStatus: null,
  });

  if (!showPanel) return null;

  const openBookingIdModal = () => {
    setModalState({
      type: "bookingId",
      bookingIdInput: "",
      selectedBookingId: null,
      chosenStatus: null,
    });
  };

  const closeModal = () => {
    setModalState({
      type: "none",
      bookingIdInput: "",
      selectedBookingId: null,
      chosenStatus: null,
    });
  };

  const handleTrack = () => {
    let cleanId = modalState.bookingIdInput.trim().toUpperCase();
    if (!cleanId) return alert("Please enter a Booking ID.");
    if (cleanId.startsWith("#")) cleanId = cleanId.substring(1);

    const found = bookings.find((b) => b.id.toUpperCase() === cleanId);
    if (!found) return alert("Invalid Booking ID");

    setModalState({
      type: "status",
      selectedBookingId: found.id,
      bookingIdInput: "",
      chosenStatus: found.status,
    });
  };

  const finalizeStatus = () => {
    if (!modalState.chosenStatus) return alert("Please select a status.");

    setBookings((prev) =>
      prev.map((b) =>
        b.id === modalState.selectedBookingId
          ? { ...b, status: modalState.chosenStatus }
          : b
      )
    );

    closeModal();
  };

  // Always get latest booking from array
  const currentBooking = bookings.find(
    (b) => b.id === modalState.selectedBookingId
  );

  return (
    <div
      className={`fixed top-0 h-full overflow-auto bg-gray-100 shadow-xl transition-all duration-300 ${
        sideNavOpen ? "right-[256px] w-[calc(100%-256px)]" : "right-0 w-full"
      }`}
    >
      <div className="relative min-h-screen p-6">
        {/* Close Panel */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
        >
          <X className="w-6 h-6" />
        </button>

        <h1 className="text-3xl font-bold mb-6">Active Bookings</h1>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={openBookingIdModal}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-150"
          >
            Update Booking Status
          </button>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            {bookings.length} Active
          </span>
        </div>

        {/* Booking List */}
        {bookings.map((b) => (
          <div
            key={b.id}
            className="border p-4 rounded-xl mb-4 shadow-md bg-white"
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span
                className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${statusBadgeColor(
                  b.status
                )}`}
              >
                {b.status}
              </span>
              <span className="text-gray-700 font-semibold">#{b.id}</span>
              <span className="text-lg font-bold text-gray-900">{b.amount}</span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="text-sm flex items-center flex-wrap gap-x-6">
                <span className="flex items-center gap-1 text-gray-700">
                  <User className="w-4 h-4 text-purple-500" /> {b.customer.name}
                </span>
                <span className="flex items-center gap-1 text-gray-700">
                  <Phone className="w-4 h-4 text-purple-500" /> {b.customer.phone}
                </span>
              </div>

              <div className="text-sm flex items-center flex-wrap gap-x-6">
                <span className="flex items-center gap-1 text-gray-700">
                  <Truck className="w-4 h-4 text-purple-500" /> {b.driver.name} | Vehicle:{" "}
                  {b.driver.vehicle}
                </span>
              </div>

              <div className="text-sm flex items-center flex-wrap gap-x-6">
                <span className="flex items-center gap-1 text-gray-700">
                  <MapPin className="w-4 h-4 text-purple-500" /> Pickup:{" "}
                  <strong>{b.pickup}</strong> → Drop: <strong>{b.drop}</strong>
                </span>
                <span className="flex items-center gap-1 text-gray-700">
                  <Calendar className="w-4 h-4 text-purple-500" /> ETA: {b.eta}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Booking ID Modal */}
        {modalState.type === "bookingId" && (
          <div
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-[999]"
            onClick={closeModal}
          >
            <div
              className="bg-white w-full max-w-sm p-6 rounded-xl shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X />
              </button>
              <h2 className="text-xl font-semibold mb-4">Enter Booking ID</h2>
              <input
                type="text"
                value={modalState.bookingIdInput}
                onChange={(e) =>
                  setModalState({ ...modalState, bookingIdInput: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTrack();
                }}
                placeholder="e.g., BK001"
                className="w-full border p-3 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                onClick={handleTrack}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-150"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {modalState.type === "status" && currentBooking && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[999] p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X />
              </button>

              <h2 className="text-2xl font-bold mb-4">
                Update Status for #{currentBooking.id}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Current Status:{" "}
                <span className="font-semibold text-purple-600">
                  {currentBooking.status}
                </span>
              </p>

              <div className="space-y-3">
                {["Booked", "In Transit", "Out For Delivery", "Delivered"].map(
                  (status) => (
                    <div
                      key={status}
                      onClick={() =>
                        setModalState({ ...modalState, chosenStatus: status })
                      }
                      className={`cursor-pointer border rounded-xl p-4 text-lg font-medium transition duration-150 ${
                        modalState.chosenStatus === status
                          ? "border-2 border-purple-600 bg-purple-50 text-purple-800"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {status}
                    </div>
                  )
                )}
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={finalizeStatus}
                  className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition duration-150"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
