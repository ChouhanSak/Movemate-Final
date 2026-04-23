import React from "react";
import { useState, useMemo } from "react";
import { Filter } from "lucide-react";
import { Eye, Phone, Package, Weight, MapPin, Weight as Kg, Check } from "lucide-react";
import Swal from "sweetalert2";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import EmptyState from "../../components/EmptyState";
function timeAgo(timestamp) {
  if (!timestamp) return "";
  const now = new Date();
  const date = timestamp.toDate();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

function isPaymentExpired(priceSetAt) {
  if (!priceSetAt) return false;
  const expiryTime = 1000 * 60 * 60 * 5;
  const now = new Date().getTime();
  const priceTime = priceSetAt.toDate().getTime();
  return now - priceTime > expiryTime;
}

export default function BookingRequests({
  bookingRequests,
  kycStatus,
  agency,
  setSelectedBooking,
  setShowDetails,
  setAssignBooking,
  setShowAssignModal,
  handleReject
}) {
    const [searchText, setSearchText] = useState("");
const [filterStatus, setFilterStatus] = useState("ALL"); 
const [showFilter, setShowFilter] = useState(false);
const filteredBookings = useMemo(() => {
  return bookingRequests.filter((req) => {
    // 🔍 SEARCH LOGIC
    const search = searchText.toLowerCase();
    const matchesSearch =
      req.id?.toLowerCase().includes(search) ||
      req.pickupAddress?.city?.toLowerCase().includes(search) ||
      req.dropAddress?.city?.toLowerCase().includes(search);

    //  FILTER LOGIC
    let matchesFilter = true;

    if (filterStatus === "PENDING") {
      matchesFilter =
        req.status === "PENDING" ||
        req.status === "PAYMENT_PENDING";
    }

    if (filterStatus === "PAYMENT_CONFIRMED") {
      matchesFilter = req.status === "PAYMENT_CONFIRMED";
    }

    return matchesSearch && matchesFilter;
  });
}, [bookingRequests, searchText, filterStatus]);

  return (
    <div className="w-full h-full p-6">
        <div className="flex items-start justify-between mb-8">
  {/* LEFT: TITLE + SUBTITLE */}
  <div>
    <h2 className="text-2xl font-bold">Booking Requests</h2>
    <p className="text-gray-500 mt-1">
      Review and accept new booking requests from customers
    </p>
  </div>

 {/* RIGHT: SEARCH + FILTER */}
<div className="flex items-center gap-3 relative">
  {/* SEARCH INPUT */}
  <input
    type="text"
    placeholder="Search by Booking ID or Location"
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    className="px-6 py-3 border rounded-full text-sm w-[340px] focus:outline-none bg-gray-50"
  />

  {/* FILTER ICON */}
  <button
  onClick={() => setShowFilter((prev) => !prev)}
  className={`
    p-3
    border
    rounded-lg
    transition-all
    duration-200
    hover:bg-purple-50
    hover:border-purple-400
    hover:shadow-sm
    active:scale-95
    ${showFilter ? "bg-purple-100 border-purple-500" : "bg-white"}
  `}
>
  <Filter
    className={`w-5 h-5 transition-colors duration-200 ${
      showFilter ? "text-purple-600" : "text-gray-600"
    }`}
  />
</button>


  {/* FILTER DROPDOWN */}
  {showFilter && (
    <div className="absolute right-0 top-14 bg-white border rounded-lg shadow-lg w-44 z-50">
      <button
        onClick={() => {
          setFilterStatus("ALL");
          setShowFilter(false);
        }}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        All
      </button>

      <button
        onClick={() => {
          setFilterStatus("PENDING");
          setShowFilter(false);
        }}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        Pending
      </button>

      <button
        onClick={() => {
          setFilterStatus("PAYMENT_CONFIRMED");
          setShowFilter(false);
        }}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        Payment Confirmed
      </button>
    </div>
  )}
</div>
</div>


            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
    <div className="flex items-center justify-center min-h-[60vh]">
      <EmptyState
        title="No booking requests yet"
        description="New booking requests will appear here."
      />
    </div>
  ) : (
    filteredBookings.map((req) => (
      
                <div key={req.id} className="bg-gray-50 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-0">
  {/* LEFT : STATUS */}
  <span className="flex items-center gap-2 font-semibold text-sm">
    <span
      className={
        req.status === "CANCELLED"
  ? "text-red-600"
        :req.status === "PAYMENT_CONFIRMED"
          ? "text-green-600"
          : req.status === "PAYMENT_PENDING"
          ? isPaymentExpired(req.priceSetAt)
            ? "text-red-600"
            : "text-blue-600"
          : "text-yellow-600"
      }
    >
      {req.status === "CANCELLED"
  ? "Booking Cancelled by Customer"
  :req.status === "PAYMENT_CONFIRMED"
        ? "Payment Confirmed"
        : req.status === "PAYMENT_PENDING"
        ? isPaymentExpired(req.priceSetAt)
          ? "Booking Expired"
          : "Waiting for Payment"
        : "New Request"}
    </span>

    <span className="text-gray-400 font-normal text-xs">
      • {timeAgo(req.createdAt)}
    </span>
  </span>

  {/* RIGHT : BOOKING ID + PRICE */}
  <div className="text-right">
    <div className="text-gray-400 text-sm">
      {req.id} • {req.date}
    </div>

    {(req.status === "PAYMENT_PENDING" ||
      req.status === "PAYMENT_CONFIRMED") && (
      <div className="mt-1 text-base font-semibold text-gray-900">
  ₹{req.price}
</div>

    )}
  </div>
</div>

{/* CUSTOMER INFO */}
  <div className="space-y-0.5 mt-1">  {/* Reduced spacing */}
  <p className="text-base font-semibold -mt-0.5">
    {req.customerName}
  </p>

    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Phone className="w-4 h-4" />
      {req.phone}
    </div>
  </div>

  {/* LOCATIONS */}
 <div className="flex items-center gap-8 mt-3 text-sm text-gray-700">
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-green-600" />
      {req.pickupAddress?.city}, {req.pickupAddress?.state}
    </div>

    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-red-500" />
      {req.dropAddress?.city}, {req.dropAddress?.state}
    </div>
  </div>

  {/* DETAILS */}
  <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
    <span className="flex items-center gap-1">
      <Weight className="w-4 h-4" />
      {req.weight} kg
    </span>

    <span className="flex items-center gap-1">
      <Package className="w-4 h-4" />
      {req.goodsType}
    </span>
  </div>

  {/* DIVIDER LINE */}
  <hr className="my-4 border-gray-200" />

  {/* ACTION BUTTONS */}
 <div className="flex justify-end gap-3">
  <button
    onClick={() => {
      setSelectedBooking(req);
      setShowDetails(true);
    }}
    className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
  >
    <Eye className="w-4 h-4" />
    View Details
  </button>

  {req.status?.toUpperCase() === "PENDING" && req.status !== "CANCELLED" && (
  <button
    onClick={() => handleReject(req.id)}
    className="px-4 py-2 border border-red-500 text-red-600 rounded-lg text-sm hover:bg-red-50"
  >
    Reject
  </button>
)}
{req.status?.toUpperCase() === "PENDING" && req.status !== "CANCELLED" && (
  <button
    onClick={async () => {
      console.log("CUSTOMER ID 👉", req.customerId);
      //  STEP A: customer email fetch from customers collection
const customerSnap = await getDoc(
  doc(db, "customers", req.customerId)
);

if (!customerSnap.exists()) {
  Swal.fire("Error", "Customer email not found", "error");
  return;
}

const customerEmail = customerSnap.data().email;

console.log("FINAL EMAIL 👉", customerEmail);
      try {
          const agencyDoc = await getDoc(doc(db, "agencies", auth.currentUser.uid));
const perKmRate = agencyDoc.exists() ? agencyDoc.data().perKmRate || 0 : 0;

let distance = req.distance; // booking se
let additionalPrice = 0;
Swal.fire({
  title: 'Set Price',
  html: `
    <div class="text-left space-y-2">
      
      ${
        distance === null
          ? `
            <label class="block mb-1">Enter Distance (km):</label>
            <input type="number" id="manualDistance" class="swal2-input" placeholder="e.g. 120" />
          `
          : `<p>Total Distance: <b>${distance} km</b></p>`
      }

      <p>Per Km Rate: <b>₹${perKmRate}</b></p>

      <label class="block mt-2 mb-1">Additional Charges (₹):</label>
      <input type="number" id="additionalPrice" class="swal2-input" placeholder="0" />

      <p class="mt-2">Total Price: <b id="totalPrice">₹0</b></p>
    </div>
  `,
  showCancelButton: true,
  confirmButtonText: 'Confirm & Send for Payment',
  preConfirm: () => {
    const add = Number(
      Swal.getPopup().querySelector('#additionalPrice')?.value
    ) || 0;

    if (distance === null) {
      const manual = Number(
        Swal.getPopup().querySelector('#manualDistance')?.value
      );
      if (!manual || manual <= 0) {
        Swal.showValidationMessage("Please enter valid distance");
        return false;
      }
      distance = manual;
    }

    return {
      distance,
      totalPrice: distance * perKmRate + add,
      additionalCharges: add
    };
  },
  didOpen: () => {
    const calc = () => {
      const add =
        Number(
          Swal.getPopup().querySelector('#additionalPrice')?.value
        ) || 0;

      const manual =
        Number(
          Swal.getPopup().querySelector('#manualDistance')?.value
        ) || distance || 0;

      Swal.getPopup().querySelector(
        '#totalPrice'
      ).innerHTML = `₹${(manual * perKmRate + add).toFixed(2)}`;
    };

    Swal.getPopup().querySelectorAll('input').forEach(i =>
      i.addEventListener('input', calc)
    );
  }
}).then(async (res) => {
  if (!res.isConfirmed) return;

  await updateDoc(doc(db, "bookings", req.id), {
    distance: res.value.distance,
    price: res.value.totalPrice,
    additionalCharges: res.value.additionalCharges,
    perKmRate,
    status: "PAYMENT_PENDING",
    priceSetAt: serverTimestamp(),
    paymentDeadline: new Date(Date.now() + 5 * 60 * 60 * 1000),
  });

  try {
    await fetch("http://127.0.0.1:5000/agency/accept-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerEmail: customerEmail,
        bookingId: req.id,
        price: res.value.totalPrice,
      }),
    });
  } catch (err) {
    console.error("Email API failed", err);
  }

  Swal.fire("Price Sent", "Waiting for customer payment", "success");
});
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Unable to fetch rate or set price", "error");
      }
    }}
    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
  >
    Set Price
  </button>
)}


{req.status === "PAYMENT_CONFIRMED" && kycStatus !== "MANUAL_REVIEW" && (
  <button
    onClick={() => {
      setAssignBooking(req);
      setShowAssignModal(true);
    }}
    
    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
  >
  
    <Check className="w-4 h-4" />
    Accept & Assign
  </button>
)}
</div>
</div>
  )))},
            </div>
          </div>
        )}