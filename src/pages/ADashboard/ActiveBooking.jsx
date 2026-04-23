// src/pages/agency/ActiveBooking.jsx
import React, { useEffect, useState } from "react";
import { createDriverUploadLink } from "../../utils/driverUpload";
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  doc,
  where,
  getDoc
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { Phone, User, Truck, MapPin, X } from "lucide-react";
import { Card } from "../../components/ui/card";
import BookingFilter from "../../components/BookingFilter";
import EmptyState from "../../components/EmptyState";
import { getDocs } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

/* ---------------- STATUS CONFIG ---------------- */
const ACTIVE_STATUSES = ["BOOKING_PLACED", "IN_TRANSIT","WAITING_FOR_PROOF"];

const statusBadgeColor = (status) => {
  if (status === "BOOKING_PLACED") return "bg-indigo-100 text-indigo-700";
  if (status === "IN_TRANSIT") return "bg-blue-100 text-blue-700";
  if (status === "COMPLETED") return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-600";
};

const formatStatus = (status) => (status ? status.replaceAll("_", " ") : "");
const getDisplayStatus = (b) => {
  if (b.proofPending) return "WAITING FOR PROOF";
  return formatStatus(b.status);
};

/* ---------------- COMPONENT ---------------- */
export default function ActiveBooking() {
  const [bookings, setBookings] = useState([]);
  const [vehiclesMap, setVehiclesMap] = useState({});
  const [driversMap, setDriversMap] = useState({});
  const [modalState, setModalState] = useState({
    open: false,
    bookingId: null,
    chosenStatus: null,
  });
const [searchTerm, setSearchTerm] = useState("");
const [hasSearched, setHasSearched] = useState(false);
const handleSearch = () => {
  setHasSearched(true);
};
const ALLOWED_TRANSITIONS = {
  BOOKING_PLACED: ["IN_TRANSIT"],
  IN_TRANSIT: ["COMPLETED"],
  WAITING_FOR_PROOF: [],
  COMPLETED: []
};

const formatAddress = (addr, fallback) => {
  if (!addr) return fallback || "N/A";

  return [
    addr.street,       // street number ya name
    addr.area,         // agar area hai
    addr.city,
    addr.state,      
  ]
    .filter(Boolean)    
    .join(", ");
};


  /* ---------------- FETCH BOOKINGS ---------------- */
 useEffect(() => {
  if (!auth.currentUser) return;

  const q = query(
    collection(db, "bookings"),
    where("agencyId", "==", auth.currentUser.uid)
  );

  const unsub = onSnapshot(q, async (snap) => {
    const bookingsData = [];
    const vehicleIds = new Set();
    const driverIds = new Set();

    snap.docs.forEach((d) => {
      const data = d.data();
      bookingsData.push({ id: d.id, ...data });

      if (data.vehicleId) vehicleIds.add(data.vehicleId);
      if (data.driverId) driverIds.add(data.driverId);
    });

    setBookings(bookingsData);

    // 🔹 FETCH VEHICLES
    const vehiclesTemp = {};
    for (let vid of vehicleIds) {
      const vSnap = await getDoc(doc(db, "vehicles", vid));
      if (vSnap.exists()) {
        vehiclesTemp[vid] = vSnap.data();
      }
    }
    setVehiclesMap(vehiclesTemp);

    // 🔹 FETCH DRIVERS
    const driversTemp = {};
    for (let did of driverIds) {
      const dSnap = await getDoc(doc(db, "drivers", did));
      if (dSnap.exists()) {
        driversTemp[did] = dSnap.data();
      }
    }
    setDriversMap(driversTemp);
  });

  return () => unsub();
}, []);

  /* ---------------- FILTER ACTIVE BOOKINGS ---------------- */
  const today = new Date();

const activeBookings = bookings.filter((b) => {
  if (!ACTIVE_STATUSES.includes(b.status)) return false;

  if (!b.pickupDate) return true;

const pickup = b.pickupDate?.toDate
  ? b.pickupDate.toDate()
  : new Date(b.pickupDate);


  // Agar pickup date nikal gayi → active mat dikhao
  if (today > pickup && b.status !== "COMPLETED") {
    return false;
  }

  return true;
});

const [filterStatus, setFilterStatus] = useState("");

// Apply filter
const filteredBookings = activeBookings.filter((b) => {
  // STATUS FILTER
  if (filterStatus && b.status !== filterStatus) return false;

  // SEARCH FILTER
  if (!searchTerm) return true;

  const term = searchTerm.toLowerCase();

  return (
    b.id?.toLowerCase().includes(term) ||

    b.pickup?.toLowerCase().includes(term) ||
    b.destination?.toLowerCase().includes(term) ||

    b.pickupAddress?.city?.toLowerCase().includes(term) ||
    b.pickupAddress?.area?.toLowerCase().includes(term) ||
    b.dropAddress?.city?.toLowerCase().includes(term) ||
    b.dropAddress?.area?.toLowerCase().includes(term)
  );
});


  /* ---------------- MODAL HELPERS ---------------- */
  const closeModal = () =>
    setModalState({ open: false, bookingId: null, chosenStatus: null });

  const currentBooking = activeBookings.find(
    (b) => b.id === modalState.bookingId
  );

  /* ---------------- UPDATE STATUS ---------------- */
  const updateStatus = async () => {
  if (!modalState.bookingId || !modalState.chosenStatus) return;
  if (currentBooking?.pickupDate) {
  const today = new Date();

  const pickup = currentBooking.pickupDate?.toDate
    ? currentBooking.pickupDate.toDate()
    : new Date(currentBooking.pickupDate);

  if (today > pickup && currentBooking.status !== "COMPLETED") {
    alert("Pickup date expired. Cannot update status.");
    return;
  }
}



  try {
const currentStatus = currentBooking.status;

if (
  !ALLOWED_TRANSITIONS[currentStatus]?.includes(modalState.chosenStatus) &&
  modalState.chosenStatus !== currentStatus
) {
  alert("Invalid status transition!");
  return;
}
    // 🔹 WHEN STATUS BECOMES IN_TRANSIT
    if (modalState.chosenStatus === "COMPLETED") {
const driver = driversMap[currentBooking.driverId];

// 🔥 DRIVER LOAD CHECK
if (!driver) {
  alert("Driver data still loading. Please wait.");
  return;
}

// 🔥 PHONE CHECK
if (!driver.phone) {
  alert("Driver phone number missing!");
  return;
}

const driverPhone = driver.phone;

  // 🔹 create link
  const token = await createDriverUploadLink(modalState.bookingId);

  const uploadUrl =
    `${window.location.origin}/driver-upload/${token}`;

  const msg = encodeURIComponent(
    `Please upload delivery photos (valid for 20 minutes): ${uploadUrl}`
  );

  const waLink = `https://wa.me/91${driverPhone}?text=${msg}`;

  // 🔹 try opening WhatsApp
  const newWindow = window.open(waLink, "_blank");

  if (!newWindow) {
    alert("Popup blocked! Please allow popups.");
    return; // ❌ STOP → status update nahi hoga
  }

  // OPTIONAL: delay (better UX)
 alert("WhatsApp open ho gaya....");
}
const booking = currentBooking;
 if (modalState.chosenStatus === "COMPLETED") {

  // ❗ DO NOT COMPLETE HERE
  await updateDoc(doc(db, "bookings", modalState.bookingId), {
    status: "IN_TRANSIT",
    proofPending: true,
  });
}
 else {
  await updateDoc(doc(db, "bookings", modalState.bookingId), {
    status: modalState.chosenStatus,
    proofPending: false,
  });
}
   

    closeModal();
  } catch (err) {
    console.error("Status update failed:", err);
  }
};

  /* ---------------- UI ---------------- */
  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">
      Active Bookings
    </h1>
    <p className="text-gray-500 mt-1">
      Manage and track ongoing deliveries
    </p>
  </div>

  {/* SEARCH — OUTSIDE CARD */}
  <div className="flex items-center gap-2">
  <input
    type="text"
    placeholder="Search by Booking ID or Location"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleSearch();
    }}
    className="border rounded-xl px-4 py-2 w-72
               focus:outline-none focus:ring-2
               focus:ring-purple-500"
  />

 <button
  onClick={handleSearch}
  className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700"
>
  Search
</button>

</div>

</div>

<Card className="bg-white rounded-2xl p-8">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2 text-lg font-semibold text-purple-700">
      <Truck size={24} /> Active Shipments
    </div>


    {/* FILTER */}
    <BookingFilter
      filterStatus={filterStatus}
      setFilterStatus={setFilterStatus}
    />
</div>

      {filteredBookings.length === 0 ? (
  hasSearched ? (
    <div className="text-center py-20 text-red-500 font-medium">
      No such booking exists
    </div>
  ) : (
    <div className="text-center py-20 text-gray-500">
      No Active Bookings
    </div>
  )
        
      ) : (
        filteredBookings.map((b) => (
  <div
    key={b.id}
    className="bg-gradient-to-r from-blue-50 to-purple-50 
               border rounded-2xl p-6 mb-6 shadow-sm"
  >
    {/* TOP ROW */}
    <div className="flex justify-between items-start">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeColor(b.status)}`}>
         {getDisplayStatus(b)}
        </span>

        <span className="text-gray-500 font-small">
          #{b.id}
        </span>
      </div>

      <p className="text-lg font-bold text-green-600">
        ₹{b.price || b.amount || 0}
      </p>
    </div>

    {/* CUSTOMER */}
    <div className="flex items-center gap-3 mt-4 text-gray-800">
      <User className="w-4 h-4 text-blue-600" />
      <span className="font-medium">{b.customerName}</span>
      <span className="text-gray-400">•</span>
      <Phone className="w-4 h-4" />
      <span>{b.phone || "N/A"}</span>

    </div>
      {/* DRIVER */}
<div className="flex items-center gap-3 mt-3 text-gray-700">
  <User className="w-4 h-4 text-indigo-600" />
  <span>
    <b>Driver:</b>{b.driverId
  ? driversMap[b.driverId]?.driverName || "Loading..."
  : "Not Assigned"}
  </span>
</div>

{/* VEHICLE */}
<div className="flex items-center gap-3 mt-2 text-gray-700">
  <Truck className="w-4 h-4 text-purple-600" />
  <span>
    <b>Vehicle:</b>{" "}
    {b.vehicleId
      ? vehiclesMap[b.vehicleId]?.type || "Loading..."
      : "Not Assigned"}
  </span>

  {vehiclesMap[b.vehicleId]?.license && (
    <>
      <span className="text-gray-400">•</span>
      <span>{vehiclesMap[b.vehicleId].license}</span>
    </>
  )}
</div>
    {/* PICKUP / DROP */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <div className="flex items-start gap-2">
        <MapPin className="w-4 h-4 text-green-600 mt-1" />
        <div>
          <p className="text-1.5xs text-gray-500">Pickup</p>
         <p className="font-medium">
  {formatAddress(b.pickupAddress, b.pickup)}
</p>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <MapPin className="w-4 h-4 text-red-600 mt-1" />
        <div>
          <p className="text-1.5xs text-gray-500">Drop</p>
          <p className="font-medium">
  {formatAddress(b.dropAddress, b.destination)}
</p>
        </div>
      </div>
    </div>

    {/* FOOTER */}
    <div className="flex justify-between items-center mt-5 pt-4 border-t">
      <p className="font-medium">
  Pickup Date: {b.pickupDate || "N/A"}
</p>



      <button
        onClick={() =>
          setModalState({
            open: true,
            bookingId: b.id,
            chosenStatus: b.status,
          })
        }
        className="px-5 py-2 rounded-lg text-white 
                   bg-gradient-to-r from-blue-600 to-purple-600 
                   hover:opacity-90"
      >
        Update Status
      </button>
      
    </div>
  </div>

))

      )}

      {/* ---------------- STATUS MODAL ---------------- */}
      {modalState.open && currentBooking && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-xl w-full max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4"
              onClick={closeModal}
            >
              <X />
            </button>

            <h2 className="text-2xl font-bold mb-4">
              Update Status – #{currentBooking.id}
            </h2>

            {(() => {
  const currentStatus = currentBooking.proofPending
  ? "WAITING_FOR_PROOF"
  : currentBooking.status;

 const statusOptions = [
  { label: "Booking Placed", value: "BOOKING_PLACED" },
  { label: "In Transit", value: "IN_TRANSIT" },
  { label: "Completed", value: "COMPLETED" },
];

  return statusOptions.map((s) => {
  const isAllowed =
    s.value === currentStatus ||
    ALLOWED_TRANSITIONS[currentStatus]?.includes(s.value);

  return (
    <div
      key={s.value}
      onClick={() => {
        if (!isAllowed) return; // ❌ block click
        setModalState((prev) => ({
          ...prev,
          chosenStatus: s.value,
        }));
      }}
      className={`p-4 border rounded-xl mb-3 ${
        modalState.chosenStatus === s.value
          ? "border-purple-600 bg-purple-50"
          : ""
      } ${
        !isAllowed
          ? "opacity-50 cursor-not-allowed bg-gray-100"
          : "cursor-pointer"
      }`}
    >
      {s.label}
    </div>
  );
});
})()}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={updateStatus}
                className="px-5 py-2 bg-purple-600 text-white rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
      </Card>
    </div>
  );
}