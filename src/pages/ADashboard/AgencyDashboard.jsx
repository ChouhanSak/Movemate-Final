// src/pages/agency-dashboard/AgencyDashboard.jsx
import React, { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import {
  Bell as BellIcon,
  Menu,
  X,
  Home,
  Clock,
  Truck,
  CheckCircle,
  LogOut,
} from "lucide-react";
import { Phone, Package, Weight, MapPin,
  Eye,
  Check,
   } from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc
} from "firebase/firestore";
import smallTruck from "../../assets/smalltruck.png";
import ManageVehicle from "./ManageVehicle"; // Fleet management component
import ActiveBooking from "./ActiveBooking"; // Active bookings overlay
import Completed from "./Completed";
import Footer from "../../components/Footer"; 
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useRef } from "react";
import BookingDetails from "./BookingDetails";
import AssignBookingModal from "./AssignBookingModal";
import { serverTimestamp } from "firebase/firestore";
import { orderBy, limit } from "firebase/firestore";
import { calculatePrice } from "../../utils/priceUtils";
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
  const expiryTime = 1000 * 60 * 60 * 5; // 5 hours in ms
  const now = new Date().getTime();
  const priceTime = priceSetAt.toDate().getTime();
  return now - priceTime > expiryTime;
}

export default function AgencyDashboard() {
  const [bookingRequests, setBookingRequests] = useState([]);
  const [agency, setAgency] = useState(null);
const [loadingAgency, setLoadingAgency] = useState(true);
const [showDetails, setShowDetails] = useState(false);
const [selectedBooking, setSelectedBooking] = useState(null);
const [showAssignModal, setShowAssignModal] = useState(false);
const [assignBooking, setAssignBooking] = useState(null);
const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);
const notifRef = useRef(null);
const agencyId = auth.currentUser?.uid;
const [kycStatus, setKycStatus] = useState(null);
useEffect(() => {
  if (!auth.currentUser) return;

  const unsub = onSnapshot(doc(db, "agencies", auth.currentUser.uid), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      setKycStatus(data.kycStatus);
    }
  });

  return () => unsub();
}, []);


 // must match Firestore field
const [recentActivity, setRecentActivity] = useState([]);

useEffect(() => {
  if (!auth.currentUser) return;

  // 🔹 Real-time notifications listener
  const q = query(
    collection(db, "notifications"),
    where("agencyId", "==", auth.currentUser.uid),
  );
const unsubscribe = onSnapshot(q, (snapshot) => {
  const notifList = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  console.log("Notifications:", notifList);
  setNotifications(notifList);
});


  return () => unsubscribe();
}, []);
useEffect(() => {
  if (!auth.currentUser) return;

  const q = query(
    collection(db, "bookings"),
    where("agencyId", "==", auth.currentUser.uid),
    orderBy("updatedAt", "desc"),
    limit(5)
  );

  const unsubscribe = onSnapshot(q, (snap) => {
    const activities = [];

    snap.docs.forEach((docSnap) => {
      const b = docSnap.data();
      const id = docSnap.id;

      if (b.completedAt) {
        activities.push({
          type: "DELIVERED",
          label: "Status updated to delivered",
          ref: id,
          time: b.completedAt,
        });
      } else if (b.paymentAt) {
        activities.push({
          type: "PAYMENT",
          label: "Payment received",
          ref: `₹${b.price}`,
          time: b.paymentAt,
        });
      } else if (b.acceptedAt) {
        activities.push({
          type: "ACCEPTED",
          label: "Booking accepted",
          ref: id,
          time: b.acceptedAt,
        });
      } else {
        activities.push({
          type: "NEW",
          label: "New request received",
          ref: id,
          time: b.createdAt,
        });
      }
    });

    setRecentActivity(activities.slice(0, 4));
  });

  return () => unsubscribe();
}, []);
useEffect(() => {
  const handleClickOutside = (event) => {
    if (notifRef.current && !notifRef.current.contains(event.target)) {
      setShowNotifications(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activePage, setActivePage] = useState("overview"); // overview | booking | fleet | completed
  // const [showActiveBookingPanel, setShowActiveBookingPanel] = useState(false);
const handleReject = async (bookingId) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "Do you want to reject this booking?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, Reject",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) return;

  try {
    await updateDoc(doc(db, "bookings", bookingId), {
      status: "Rejected",
      rejectedAt: new Date(),
    });

    Swal.fire("Rejected!", "Booking has been rejected", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Unable to reject booking", "error");
  }
};


  useEffect(() => {
  let unsubscribeBookings = null;

  const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    try {
      const docRef = doc(db, "agencies", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setAgency({
          name: data.agencyName || "Agency",
          email: data.email || user.email || "",
        });
      }
const q = query(
  collection(db, "bookings"),
  where("agencyId", "==", user.uid),
  where("status", "in", [
    "PENDING",
    "pending",
    "WAITING_FOR_PAYMENT",
    "PAYMENT_PENDING",
    "PAYMENT_CONFIRMED"   
  ])
);


unsubscribeBookings = onSnapshot(q, (snap) => {
  const list = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
  setBookingRequests(list);
});


    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAgency(false);
    }
  });

  return () => {
    unsubscribeAuth();
    if (unsubscribeBookings) unsubscribeBookings();
  };
}, []);

  if (loadingAgency) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-semibold">Loading dashboard...</p>
    </div>
  );
}

  return (
    
    <div className="w-full min-h-screen flex relative bg-gray-100">
      {/* WHITE BLUR BACKGROUND OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[px] z-40 transition"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ---------------- Sidebar ---------------- */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl p-6 z-50 transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button className="absolute top-4 right-4" onClick={() => setOpen(false)}>
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <h2 className="text-2xl font-bold mb-8">MoveMate</h2>

        <div className="space-y-5 text-gray-700 text-lg">
          <div
            className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${activePage === "overview" ? "text-purple-600 font-semibold" : ""}`}
            onClick={() => {
            setActivePage("overview");
            setOpen(false);
          }}

          >
            <Home className="w-5 h-5" />
            Overview
          </div>

          <div
            className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${activePage === "booking" ? "text-purple-600 font-semibold" : ""}`}
            onClick={() => {
            setActivePage("booking");
            setOpen(false);
          }}
          >
            <Clock className="w-5 h-5" />
            Booking Requests
          </div>

          <div
  className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${
    activePage === "activeBooking"
      ? "text-purple-600 font-semibold"
      : ""
  }`}
  onClick={() => {
    setActivePage("activeBooking");
    setOpen(false);
  }}
>
  <Truck className="w-5 h-5" />
  Active Bookings
</div>


          <div
            className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${activePage === "completed" ? "text-purple-600 font-semibold" : ""}`}
           onClick={() => {
          setActivePage("completed");
          setOpen(false);
        }}
          >
            <CheckCircle className="w-5 h-5" />
            Completed
          </div>

          <div
            className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${activePage === "fleet" ? "text-purple-600 font-semibold" : ""}`}
            onClick={() => {
            setActivePage("fleet");
            setOpen(false);
          }}

          >
            <Truck className="w-5 h-5" />
            Manage Vehicle
          </div>

          <div
            className="flex items-center gap-3 cursor-pointer hover:text-red-600"
            onClick={() => {
  Swal.fire({
    title: "Logout?",
    text: "Are you sure you want to logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#7c3aed",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Logout",
  }).then((result) => {
    if (result.isConfirmed) {
      // 🔥 optional: Firebase signout later
      // await signOut(auth);

      Swal.fire({
        icon: "success",
        title: "Logged out",
        text: "You have been logged out successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate("/select-user"); // ✅ SELECT USER PAGE
      }, 1500);
    }
  });
}}

          >
            <LogOut className="w-5 h-5" />
            Logout
          </div>
        </div>
      </div>

      {/* ---------------- Main Content ---------------- */}
     <div
      className="flex-1 pt-24 px-6 transition-all duration-300"
      style={{ marginLeft: open ? "16rem" : "0" }}
      >
      {kycStatus === "MANUAL_REVIEW" && (
  <div className="mb-4 p-4 rounded-lg bg-yellow-100 border border-yellow-400 text-yellow-800">
    ⚠ Your account is under verification.  
    You cannot accept bookings until verification is complete.
  </div>
)}
        {/* ---------------- Top Bar ---------------- */}
<div
  className="fixed top-0 bg-white shadow-sm px-6 py-3 z-50 transition-all duration-300"
  style={{
    left: open ? "16rem" : "0",
    width: open ? "calc(100% - 16rem)" : "100%",
  }}
>
  {/* ✅ SINGLE FLEX ROW */}
  <div className="flex items-center justify-between w-full flex-nowrap">

    {/* LEFT SIDE */}
    <div className="flex items-center gap-4">
      <button onClick={() => setOpen(true)}>
        <Menu className="w-7 h-7 text-gray-700" />
      </button>

      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full text-white flex items-center justify-center font-semibold"
          style={{ background: "linear-gradient(90deg, #3b82f6, #a855f7)" }}
        >
          {agency?.name?.slice(0, 2).toUpperCase()}

        </div>

        <div>
          <h1 className="text-lg font-semibold text-gray-900">
           {agency?.name}

          </h1>
          <p className="text-xs text-gray-500 -mt-1">
            {agency?.email}

          </p>
        </div>

        <div className="w-px h-8 bg-gray-300 mx-4" />
<div className="relative ml-4">
  <button onClick={() => setShowNotifications(!showNotifications)}>
    <BellIcon className="w-6 h-6 text-gray-700 cursor-pointer" />
    {notifications.some(n => !n.read) && (
      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
    )}
  </button>

  {showNotifications && (
    <div
      ref={notifRef}
      className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg z-50 overflow-hidden p-3"
    >
      {notifications.length === 0 ? (
        <div className="p-4 text-gray-500">No notifications</div>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`p-2 rounded mb-2 text-sm ${
              n.read ? "bg-gray-100" : "bg-purple-50"
            }`}
            onClick={async () => {
              if (!n.read) {
                const notifDocRef = doc(db, "notifications", n.id);
                await updateDoc(notifDocRef, { read: true });
              }
            }}
          >
            🔔 {n.message}
            <div className="text-xs text-gray-400 mt-1">
              {n.createdAt?.toDate().toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  )}
</div>

      </div>
    </div>
    {/* RIGHT SIDE */}
    <div className="flex items-center gap-3 whitespace-nowrap">
      <div className="text-right">
        <p className="text-lg font-semibold text-gray-900">MoveMate</p>
        <p className="text-sm text-gray-500 -mt-1">
          Goods Transportation Platform
        </p>
      </div>

      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: "linear-gradient(90deg, #3b82f6, #a855f7)" }}
      >
        <img src={smallTruck} alt="Truck" className="w-6 h-6" />
      </div>
    </div>

  </div>
</div>

        {/* ---------------- Page Content ---------------- */}
        {activePage === "overview" && (
          <>
            {/* Overview Header */}
            <div className="mb-12">
              <h1 className="text-3xl font-bold flex items-center gap-2">
  Welcome back, {agency?.name}! 👋
</h1>

              <p className="text-gray-500 mt-1">Manage your bookings and grow your transportation business</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-purple-600 text-white rounded-xl shadow-md hover:-translate-y-1 transition">
                <CardContent className="p-4">
                  <p className="text-lg">Completed Jobs</p>
                  <h2 className="text-2xl font-bold mt-1">x</h2>
                  <p className="text-sm mt-1">All time deliveries</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-600 text-white rounded-xl shadow-md hover:-translate-y-1 transition">
                <CardContent className="p-4">
                  <p className="text-lg">Pending Requests</p>
                  <h2 className="text-2xl font-bold mt-1">x</h2>
                  <p className="text-sm mt-1">Needs your attention</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-600 text-white rounded-xl shadow-md hover:-translate-y-1 transition">
                <CardContent className="p-4">
                  <p className="text-lg">Active Deliveries</p>
                  <h2 className="text-2xl font-bold mt-1">x</h2>
                  <p className="text-sm mt-1">Currently in transit</p>
                </CardContent>
              </Card>
              <Card className="bg-green-600 text-white rounded-xl shadow-md hover:-translate-y-1 transition">
                <CardContent className="p-4">
                  <p className="text-lg">Fleet Vehicles</p>
                  <h2 className="text-2xl font-bold mt-1">x</h2>
                  <p className="text-sm mt-1">2 available</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mt-10 rounded-2xl shadow-lg bg-white hover:shadow-xl transition cursor-pointer">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 bg-green-500 rounded-full mt-1" />
                    <div>
                      <p className="font-medium">Booking accepted</p>
                      <p className="text-gray-500 text-sm">REQ004 • 1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mt-1" />
                    <div>
                      <p className="font-medium">Status updated to delivered</p>
                      <p className="text-gray-500 text-sm">BK003 • 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mt-1" />
                    <div>
                      <p className="font-medium">New request received</p>
                      <p className="text-gray-500 text-sm">REQ003 • 5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mt-1" />
                    <div>
                      <p className="font-medium">Payment received</p>
                      <p className="text-gray-500 text-sm">₹32,000 • 1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* This Month Section */}
            <div className="mt-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-3xl p-8 hover:shadow-2xl transition cursor-pointer">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">📈 This Month</h2>
              <div className="grid grid-cols-2 gap-y-4">
                <p className="text-lg">Deliveries</p>
                <p className="text-lg text-right">18 trips</p>
                <p className="text-lg">Earnings</p>
                <p className="text-lg text-right">₹2,85,000</p>
                <p className="text-lg">Avg. Rating</p>
                <p className="text-lg text-right">4.8 ⭐</p>
                <p className="text-lg">Success Rate</p>
                <p className="text-lg text-right">98%</p>
              </div>
            </div>
          </>
        )}

        {activePage === "booking" && (
          <div className="w-full h-full bg-white p-6 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Booking Requests</h2>
              <button onClick={() => setActivePage("overview")}>
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>
            <p className="text-gray-500 mb-2">Review and accept new booking requests from customers</p>
            <div className="space-y-4">
              
              {bookingRequests.map((req) =>(
      
                <div key={req.id} className="bg-gray-50 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-0">
  {/* LEFT : STATUS */}
  <span className="flex items-center gap-2 font-semibold text-sm">
    <span
      className={
        req.status === "PAYMENT_CONFIRMED"
          ? "text-green-600"
          : req.status === "PAYMENT_PENDING"
          ? isPaymentExpired(req.priceSetAt)
            ? "text-red-600"
            : "text-blue-600"
          : "text-yellow-600"
      }
    >
      {req.status === "PAYMENT_CONFIRMED"
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

  <button
    onClick={() => handleReject(req.id)}
    className="px-4 py-2 border border-red-500 text-red-600 rounded-lg text-sm hover:bg-red-50"
  >
    Reject
  </button>

{req.status?.toUpperCase() === "PENDING" && kycStatus !== "MANUAL_REVIEW" && agency?.featureAllowed && (
  <button
    onClick={async () => {
      try {
        // 1️⃣ Firestore se agency ka perKmRate fetch karo
        const agencyDoc = await getDoc(doc(db, "agencies", auth.currentUser.uid));
        const perKmRate = agencyDoc.exists() ? agencyDoc.data().perKmRate || 0 : 0;

        // 2️⃣ Distance from booking
   let distance = req.distance; // can be null


        let additionalPrice = 0;
        let totalPrice = distance * perKmRate;

        // 3️⃣ Swal modal
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
    distance: res.value.distance,   // ✅ manual save
    price: res.value.totalPrice,
    additionalCharges: res.value.additionalCharges,
    perKmRate,
    status: "PAYMENT_PENDING",
    priceSetAt: serverTimestamp(),
  });

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
              ))}
            </div>
          </div>
        )}

        {activePage === "fleet" && <ManageVehicle />}
        {activePage === "completed" && <Completed />}
        {activePage === "activeBooking" && (
        <ActiveBooking
          showPanel={true}
          onClose={() => setActivePage("overview")}
          sideNavOpen={open}
        />
)}
       {/* Footer & Modals */}
        <Footer />
        <BookingDetails
          open={showDetails}
          booking={selectedBooking}
          onClose={() => {
            setShowDetails(false);
            setSelectedBooking(null);
          }}
        />
        <AssignBookingModal
          open={showAssignModal}
          booking={assignBooking}
          onClose={() => {
            setShowAssignModal(false);
            setAssignBooking(null);
          }}
        />
      </div>
    </div>
  );
}