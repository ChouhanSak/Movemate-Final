// src/pages/customer/AllBookings.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../../firebase";
import { MapPin, Package, Box, Cpu, Truck } from "lucide-react";
import Swal from "sweetalert2";
import BookingFilter1 from "../../components/BookingFilter1";
import PaymentModal from "./PaymentModal";

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const currentUserId = auth.currentUser?.uid;

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [vehiclesMap, setVehiclesMap] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState(null);

  //  Per-booking photo state
  const [bookingPhotos, setBookingPhotos] = useState({});
const [bookingConfirmed, setBookingConfirmed] = useState({});

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

      const vehicleIds = data.map((b) => b.vehicleId).filter(Boolean);

      const vehicleDocs = await Promise.all(
        vehicleIds.map((id) => getDoc(doc(db, "vehicles", id)))
      );

      const map = {};
      vehicleDocs.forEach((v) => {
        if (v.exists()) {
          map[v.id] = v.data();
        }
      });

      setVehiclesMap(map);
    });

    return () => unsub();
  }, [currentUserId]);

  // ================= STATUS COLORS =================
  const STATUS_COLORS = {
    BOOKING_PLACED: { badge: "bg-indigo-100 text-indigo-700", card: "bg-indigo-50 border-indigo-300" },
    IN_TRANSIT: { badge: "bg-blue-100 text-blue-700", card: "bg-blue-50 border-blue-300" },
    COMPLETED: { badge: "bg-green-100 text-green-700", card: "bg-green-50 border-green-300" },
    PAYMENT_PENDING: { badge: "bg-orange-100 text-orange-700", card: "bg-orange-50 border-orange-300" },
    PAYMENT_CONFIRMED: { badge: "bg-purple-100 text-purple-700", card: "bg-purple-50 border-purple-300" },
    PENDING: { badge: "bg-yellow-100 text-yellow-700", card: "bg-yellow-50 border-yellow-300" }
  };

  const getBadgeColor = (status) =>
    STATUS_COLORS[status?.toUpperCase()]?.badge || "bg-gray-100 text-gray-700";

  const getCardColor = (status) =>
    STATUS_COLORS[status?.toUpperCase()]?.card || "bg-gray-50 border-gray-200";

  const formatStatus = (status) =>
    status ? status.replaceAll("_", " ") : "";

  // ---------------- CLOUDINARY UPLOAD ----------------
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "MoveMate_upload");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dlh1uo28j/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Upload failed");
  }

  return data.secure_url;
};

  // ================= CONFIRM PAYMENT =================
// ================= CONFIRM PAYMENT =================
const confirmPayment = async (bookingId) => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);

    const selectedPhotos = bookingPhotos[bookingId];
    const confirmed = bookingConfirmed[bookingId];

    let photoUrls = [];

    // 🔹 Upload photos to Cloudinary (if any)
    if (selectedPhotos && selectedPhotos.length > 0) {
      for (let file of selectedPhotos) {
        const url = await uploadToCloudinary(file);
        photoUrls.push(url);
      }
    }

    // 🔹 Update booking document
    await updateDoc(bookingRef, {
      status: "PAYMENT_CONFIRMED",
      paidAt: serverTimestamp(),
      customerPhotos: photoUrls,   // array of Cloudinary URLs
      photoConfirmed: confirmed || false,
    });

    Swal.fire({
      icon: "success",
      title: "Payment Successful",
      text: "Your payment has been confirmed.",
    });

    // 🔹 Clear local state
    setBookingPhotos((prev) => ({
      ...prev,
      [bookingId]: [],
    }));

    setBookingConfirmed((prev) => ({
      ...prev,
      [bookingId]: false,
    }));

  } catch (err) {
    console.error(err);

    Swal.fire({
      icon: "error",
      title: "Payment Failed",
      text: err.message || "Something went wrong. Try again.",
    });
  }
};



  const fetchVehicleInfo = async (vehicleId) => {
    if (!vehicleId) return null;
    const ref = doc(db, "vehicles", vehicleId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  };

  // ================= FILTER =================
  const filteredBookings = bookings.filter((b) => {
    const status = b.status?.toUpperCase();

    if (filterCategory === "PENDING") {
      if (!["PENDING","BOOKING_PLACED","PAYMENT_PENDING","REJECTED"].includes(status))
        return false;
    }

    if (filterCategory === "ACTIVE" && status !== "IN_TRANSIT") return false;
    if (filterCategory === "COMPLETED" && status !== "COMPLETED") return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.agencyName?.toLowerCase().includes(q) ||
        b.id?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="w-full p-6 bg-gray-50">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold">All Bookings</h2>

        <BookingFilter1
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          onReset={() => {
            setSearchQuery("");
            setFilterCategory("");
          }}
        />
      </div>

      {/* BOOKINGS */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No bookings found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition ${getCardColor(b.status)}`}
            >

              {/* TOP */}
              <div className="flex justify-between">
                <div>
                  <div className="flex gap-2 items-center">
                    <span className={`px-2 py-1 text-xs rounded-md font-semibold ${getBadgeColor(b.status)}`}>
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
                {["BOOKING_PLACED","IN_TRANSIT","COMPLETED"].includes(b.status?.toUpperCase()) && (
                  <span className="flex items-center gap-1 font-medium">
                    <Truck className="w-4 h-4 text-gray-600" />
                    {vehiclesMap[b.vehicleId]?.type || "Vehicle Info"}
                  </span>
                )}

                <span className="flex items-center gap-1">
                  <Box className="w-4 h-4 text-gray-600" />
                  {b.weight} kg
                </span>

                <span className="flex items-center gap-1">
                  {b.goodsType === "Electronics" && <Cpu className="w-4 h-4 text-gray-600" />}
                  {b.goodsType === "Furniture" && <Package className="w-4 h-4 text-gray-600" />}
                  {b.goodsType !== "Electronics" && b.goodsType !== "Furniture" && (
                    <Box className="w-4 h-4 text-gray-600" />
                  )}
                  {b.goodsType}
                </span>
              </div>

              {/* BUTTONS */}
              <div className="mt-4 grid grid-cols-3 items-center">
                <div></div>
                <div className="text-sm text-center text-gray-500">
                  {b.pickupDate}
                </div>

                <div className="flex justify-end gap-2">

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
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
                  >
                    View Details
                  </button>
{b.status?.toUpperCase() === "PAYMENT_PENDING" && (
  <>
    {/* Hidden File Input */}
    <input
      type="file"
      id={`file-upload-${b.id}`}
      accept="image/*"
      multiple
      style={{ display: "none" }}
      onChange={(e) => {
        const files = Array.from(e.target.files);

        setBookingPhotos((prev) => ({
          ...prev,
          [b.id]: files,
        }));

        Swal.fire(
          "Photos Selected",
          `${files.length} photo(s) selected.`,
          "success"
        );
      }}
    />

    {/* Upload Button */}
    <button
      onClick={() =>
        document.getElementById(`file-upload-${b.id}`).click()
      }
      className="px-4 py-1.5 bg-yellow-500 text-white rounded-lg text-sm"
    >
      Upload Photo
    </button>
{bookingPhotos[b.id] && bookingPhotos[b.id].length > 0 && (
  <span className="text-xs text-green-600">
    {bookingPhotos[b.id].length} photo(s) selected ✔
  </span>
)}

    {/* Checkbox */}
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={bookingConfirmed[b.id] || false}
        onChange={(e) =>
          setBookingConfirmed((prev) => ({
            ...prev,
            [b.id]: e.target.checked,
          }))
        }
      />
      <label className="text-xs text-gray-600">
        Confirm without photo
      </label>
    </div>

    {/* Pay Now */}
   {(() => {
  const photos = bookingPhotos[b.id];
  const confirmed = bookingConfirmed[b.id];
  const canPay = (photos && photos.length > 0) || confirmed;

  return (
    <button
      disabled={!canPay}
      onClick={() => {
        if (!canPay) {
          Swal.fire(
            "Upload Required",
            "Upload at least one photo or tick confirmation checkbox.",
            "warning"
          );
          return;
        }

        setPaymentBooking(b);
        setIsPaymentOpen(true);
      }}
      className={`px-4 py-1.5 rounded-lg text-sm ${
        canPay
          ? "bg-green-600 text-white"
          : "bg-gray-400 text-white cursor-not-allowed"
      }`}
    >
      Pay Now
    </button>
  );
})()}
  </>
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
              <p><b>Customer:</b> {selectedBooking.customerName}</p>
              <p><b>Status:</b> {formatStatus(selectedBooking.status)}</p>
              <p><b>Booking ID:</b> {selectedBooking.id}</p>
              <p><b>Agency:</b> {selectedBooking.agencyName || "NA"}</p>
              <p><b>Price:</b> ₹{selectedBooking.price || 0}</p>

              <hr />

              <p><b>Vehicle:</b> {vehicleData?.type || "Not assigned"}</p>
              <p><b>Driver:</b> {selectedBooking.driverName || "NA"}</p>
              <p><b>Weight:</b> {selectedBooking.weight} kg</p>
              <p><b>Goods:</b> {selectedBooking.goodsType}</p>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={isPaymentOpen}
        booking={paymentBooking}
        onClose={() => setIsPaymentOpen(false)}
        onConfirm={(id) => {
          confirmPayment(id);
          setIsPaymentOpen(false);
        }}
      />
    </div>
  );
}
