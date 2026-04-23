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
  Settings
} from "lucide-react";
import { Phone, Package, Weight, MapPin,
  Eye,
  Check,User
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
import FeedbackPopup from "../../components/FeedbackPopup";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { auth, db } from "../../firebase";
import { onAuthStateChanged,signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useRef } from "react";
import BookingDetails from "./BookingDetails";
import AssignBookingModal from "./AssignBookingModal";
import { serverTimestamp } from "firebase/firestore";
import { orderBy, limit } from "firebase/firestore";
import { calculatePrice } from "../../utils/priceUtils";
import { addDoc } from "firebase/firestore";
import BookingRequests from "./BookingRequests";
import AgencySettings from "./AgencySettings";
import ManageDriver from "./ManageDriver";
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
const [activityLoaded, setActivityLoaded] = useState(false);
const [bookingRequests, setBookingRequests] = useState([]);
const [agency, setAgency] = useState(null);
const [loadingAgency, setLoadingAgency] = useState(true);
const [showDetails, setShowDetails] = useState(false);
const [selectedBooking, setSelectedBooking] = useState(null);
const [showAssignModal, setShowAssignModal] = useState(false);
const [assignBooking, setAssignBooking] = useState(null);
const [showFeedback, setShowFeedback] = useState(false);
const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);
const notifRef = useRef(null);
const navigate = useNavigate();
const [authReady, setAuthReady] = useState(false);
const [currentUser, setCurrentUser] = useState(null);
const [kycStatus, setKycStatus] = useState(null);
const [stats, setStats] = useState({
completed: 0,
pending: 0,
active: 0,
fleet: 0,
availableFleet: 0,
});
const isKycBlocked = kycStatus === "MANUAL_REVIEW" ;
const [monthlyStats, setMonthlyStats] = useState({
  deliveries: 0,
  earnings: 0,
  successRate: 0
});
useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    setCurrentUser(user);
    setAuthReady(true);
  });
  return () => unsub();
}, []);

useEffect(() => {
  if (!currentUser) return;
  const unsub = onSnapshot(
    doc(db, "agencies", currentUser.uid),
    (snap) => {
      if (snap.exists()) {
        setKycStatus(snap.data().kyc?.status);
      }
    }
  );
  return () => unsub();
}, [currentUser]);

 // must match Firestore field
const [recentActivity, setRecentActivity] = useState([]);
const rejectedShown = useRef(false);
useEffect(() => {
  if (!currentUser) return;
  if (kycStatus !== "REJECTED") return;
  if (rejectedShown.current) return;

  rejectedShown.current = true;

  const handleRejected = async () => {
    try {
      const docRef = doc(db, "agencies", currentUser.uid);
      const docSnap = await getDoc(docRef);

      let reason = "Your account verification failed. Please sign up again.";
      if (docSnap.exists()) {
        const data = docSnap.data();
        reason = data?.kyc?.review?.reason || data?.kyc?.reason || reason;
      }

      // 🔹 Show alert first
      await Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: reason,
        confirmButtonColor: "#d33",
        allowOutsideClick: false,
      });

      // 🔹 Delete agency doc BEFORE signing out
      try {
        await deleteDoc(docRef);
        console.log("Agency document deleted successfully");
      } catch (err) {
        console.warn("Could not delete agency doc:", err);
      }

      // 🔹 Then sign out
      await signOut(auth);

      // 🔹 Redirect to signup page
      navigate("/signup/agency", { replace: true });
    } catch (err) {
      console.error("Error handling rejected KYC:", err);
      Swal.fire("Error", "Something went wrong. Please try again.", "error");
    }
  };
  handleRejected();
}, [kycStatus, currentUser, navigate]);

const blockedShown = useRef(false);

useEffect(() => {
  if (!currentUser) return;
  if (blockedShown.current) return;

  const checkBlocked = async () => {
    const docRef = doc(db, "agencies", currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const status = data.status || "Active";

      if (status === "Blocked") {
        blockedShown.current = true;

        await Swal.fire({
          icon: "error",
          title: "Account Blocked",
          text: "Your account has been blocked. Contact support for more info.",
          allowOutsideClick: false,
        });

        await signOut(auth);
        navigate("/select-user");
      }
    }
  };

  checkBlocked();
}, [navigate]);
useEffect(() => {
  if (!currentUser) return;

  const unsub = onSnapshot(
    query(collection(db, "bookings"), where("agencyId", "==", currentUser.uid)),
    (snap) => {
      if (snap.empty) return;

      let request = null;
      let placed = null;
      let delivered = null;

      snap.forEach(doc => {
        const b = doc.data();
        const id = doc.id;

        if (b.createdAt) {
          if (!request || b.createdAt.toDate() > request.time.toDate()) {
            request = { label: "New booking request", ref: id, time: b.createdAt, type: "REQUEST" };
          }
        }
        if (b.assignedAt) {
          if (!placed || b.assignedAt.toDate() > placed.time.toDate()) {
            placed = { label: "Booking placed", ref: id, time: b.assignedAt, type: "PLACED" };
          }
        }

        if (b.completedAt) {
          if (!delivered || b.completedAt.toDate() > delivered.time.toDate()) {
            delivered = { label: "Status updated to delivered", ref: id, time: b.completedAt, type: "DELIVERED" };
          }
        }
      });

      const activities = [];
      if (request) activities.push(request);
      if (placed) activities.push(placed);
      if (delivered) activities.push(delivered);

      activities.sort((a, b) => b.time.toDate() - a.time.toDate());
      setRecentActivity(activities);
    }
  );

  return () => unsub();
}, [currentUser]);

useEffect(() => {

  if (!currentUser) return;

  const timer = setTimeout(() => {

    const lastShown = Number(localStorage.getItem("agencyFeedbackShown"));

    if (!lastShown || Date.now() - lastShown > 86400000) {
      setShowFeedback(true);
      localStorage.setItem("agencyFeedbackShown", Date.now());
    }

  }, 240000);

  return () => clearTimeout(timer);

}, [currentUser]);
// useEffect(() => {

//   const timer = setTimeout(() => {
//     setShowFeedback(true);
//   }, 2000);

//   return () => clearTimeout(timer);

// }, []); for testing of feedback only
useEffect(() => {
  if (!currentUser) return;

  const q = query(
    collection(db, "bookings"),
    where("agencyId", "==", currentUser.uid)
  );

  const unsubscribe = onSnapshot(q, (snap) => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    let deliveries = 0;
    let earnings = 0;
    let total = 0;
    let success = 0;

    snap.docs.forEach(doc => {
      const b = doc.data();
      if (!b.createdAt) return;

      const date = b.createdAt.toDate();
      if (date.getMonth() === month && date.getFullYear() === year) {
        total++;
        if (b.status === "COMPLETED") {
          deliveries++;
          earnings += b.price || 0;
          success++;
        }
      }
    });

    const successRate = total === 0 ? 0 : Math.round((success / total) * 100);
    setMonthlyStats({ deliveries, earnings, successRate });
  });

  return () => unsubscribe();
}, [currentUser]);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (notifRef.current && !notifRef.current.contains(event.target)) {
      setShowNotifications(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  
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
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) return;

    const booking = bookingSnap.data();

    // 1️⃣ Update booking status
    await updateDoc(bookingRef, {
      status: "REJECTED",
      rejectedAt: serverTimestamp(),
    });

    // 2️⃣ Send notification to customer
    await addDoc(collection(db, "notifications"), {
  userId: booking.customerId,     // 👈 only customer will receive
  message: "❌ Your booking has been rejected by the agency",
  bookingId,
  read: false,
  userType: "customer",
  createdAt: serverTimestamp(),
  type: "BOOKING_REJECTED",
});


    Swal.fire("Rejected!", "Booking has been rejected", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Unable to reject booking", "error");
  }
};
let unsubscribeStats = null;
let unsubscribeFleet = null;

  useEffect(() => {
  let unsubscribeBookings = null;
  let unsubNotif = null; 
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
          averageRating: data.averageRating || 0, // add this
          ratingCount: data.ratingCount || 0, 
        });
      }
      // ATTACH NOTIFICATION LISTENER HERE
const notifQuery = query(
  collection(db, "notifications"),
  where("agencyId", "==", user.uid),
  orderBy("createdAt", "desc")
);

unsubNotif = onSnapshot(notifQuery, (snapshot) => {
  const list = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  setNotifications(list);
});


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
const statsQuery = query(
  collection(db, "bookings"),
  where("agencyId", "==", user.uid)
);

 unsubscribeStats = onSnapshot(statsQuery, (snap) => {
  let completed = 0;
  let pending = 0;
  let active = 0;

  snap.docs.forEach(doc => {
    const b = doc.data();

    if (b.status === "COMPLETED") completed++;
    else if (
  [ "pending", "WAITING_FOR_PAYMENT", "PAYMENT_PENDING"].includes(b.status)
)
 pending++;
    else if (["IN_TRANSIT", "BOOKING_PLACED"].includes(b.status)) active++;
  });

  setStats(s => ({
    ...s,
    completed,
    pending,
    active
  }));
});
const fleetQuery = query(
  collection(db, "vehicles"),
  where("agencyId", "==", user.uid)
);
 unsubscribeFleet = onSnapshot(fleetQuery, (snap) => {
  let available = 0;

  snap.docs.forEach(doc => {
    const v = doc.data();
    if (v.status === "Available") available++;
  });

  setStats(s => ({
    ...s,
    fleet: snap.size,
    availableFleet: available
  }));
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
  if (unsubNotif) unsubNotif();
  if (unsubscribeStats) unsubscribeStats();
if (unsubscribeFleet) unsubscribeFleet();

};

}, []);
if (!authReady) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-semibold">Loading...</p>
    </div>
  );
}

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
  if (isKycBlocked) {
    Swal.fire({
      icon: "warning",
      title: "Access Restricted",
      text: "Your account is under verification. Please wait until admin approval.",
      confirmButtonColor: "#7c3aed",
    });
    return;
  }
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
  if (isKycBlocked) {
    Swal.fire({
      icon: "warning",
      title: "Access Restricted",
      text: "Vehicle management is locked until KYC verification is complete.",
      confirmButtonColor: "#7c3aed",
    });
    return;
  }
  setActivePage("fleet");
  setOpen(false);
}}
          >
            <Truck className="w-5 h-5" />
            Manage Vehicle
          </div>
          <div
className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${
activePage === "drivers" ? "text-purple-600 font-semibold" : ""
}`}
onClick={()=>{
setActivePage("drivers");
setOpen(false);
}}
>
<User className="w-5 h-5"/>
Manage Driver
</div>
          <div
          className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${
            activePage === "settings" ? "text-purple-600 font-semibold" : ""
          }`}
          onClick={() => {
            setActivePage("settings");
            setOpen(false);
          }}
        >
            <Settings className="w-5 h-5" />
          Settings
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
      // await signOut(auth);

      Swal.fire({
        icon: "success",
        title: "Logged out",
        text: "You have been logged out successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate("/select-user"); // SELECT USER PAGE
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
        {/* ---------------- Top Bar ---------------- */}
<div
  className="fixed top-0 bg-white shadow-sm px-6 py-3 z-50 transition-all duration-300"
  style={{
    left: open ? "16rem" : "0",
    width: open ? "calc(100% - 16rem)" : "100%",
  }}
>
  {/*SINGLE FLEX ROW */}
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
  className="absolute right-0 mt-2 w-72 max-h-96 bg-white shadow-lg rounded-lg z-50 overflow-y-auto p-3"
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
  {(n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt)).toLocaleString()}
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
{kycStatus === "MANUAL_REVIEW" && (
  <div className="mb-4 p-4 rounded-lg bg-yellow-100 border border-yellow-400 text-yellow-800">
    ⚠ Your account is under verification.  
    You cannot accept bookings until verification is complete.
  </div>
)}

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
                  <h2 className="text-2xl font-bold mt-1">{stats.completed}</h2>
                  <p className="text-sm mt-1">All time deliveries</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-600 text-white rounded-xl shadow-md hover:-translate-y-1 transition">
                <CardContent className="p-4">
                  <p className="text-lg">Pending Requests</p>
                  <h2 className="text-2xl font-bold mt-1">{stats.pending}</h2>
                  <p className="text-sm mt-1">Needs your attention</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-600 text-white rounded-xl shadow-md hover:-translate-y-1 transition">
                <CardContent className="p-4">
                  <p className="text-lg">Active Deliveries</p>
                  <h2 className="text-2xl font-bold mt-1">{stats.active}</h2>
                  <p className="text-sm mt-1">Currently in transit</p>
                </CardContent>
              </Card>
              <Card className="bg-green-600 text-white rounded-xl shadow-md hover:-translate-y-1 transition">
                <CardContent className="p-4">
                  <p className="text-lg">Fleet Vehicles</p>
                  <h2 className="text-2xl font-bold mt-1">{stats.fleet}</h2>
                  <p className="text-sm mt-1">{stats.availableFleet} available</p>

                </CardContent>
              </Card>
            </div>

            
            {/* Recent Activity */}
<Card className="mt-10 rounded-2xl shadow-lg bg-white hover:shadow-xl transition cursor-pointer">
  <CardContent className="p-6">
    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

    <div className="space-y-4">
      {recentActivity.length === 0 ? (
        <p className="text-gray-500">No recent activity</p>
      ) : (
        recentActivity.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <span
              className={`w-3 h-3 rounded-full mt-1 ${
                a.type === "DELIVERED"
                  ? "bg-green-500"
                  : a.type === "REQUEST"
                  ? "bg-blue-500"
                  : "bg-orange-500"
              }`}
            />

            <div>
              <p className="font-medium">{a.label}</p>

              <p className="text-gray-500 text-sm">
                {a.ref} • {timeAgo(a.time)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </CardContent>
</Card>

            {/* This Month Section */}
            <div className="mt-10 mb-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-3xl p-8 hover:shadow-2xl transition cursor-pointer">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">📈 This Month</h2>
              <div className="grid grid-cols-2 gap-y-4">
                <p className="text-lg">Deliveries</p>
                <p className="text-lg text-right">{monthlyStats.deliveries} trips</p>
                <p className="text-lg">Earnings</p>
                <p className="text-lg text-right">₹{0}</p>
                <p className="text-lg">Avg. Rating</p>
                <p className="text-lg text-right">{agency?.averageRating?.toFixed(1)} ⭐</p>
                <p className="text-lg">Success Rate</p>
                <p className="text-lg text-right">{monthlyStats.successRate}%</p>
              </div>
            </div>
          </>
        )}

       {activePage === "booking" && (
  <BookingRequests
    bookingRequests={bookingRequests}
    kycStatus={kycStatus}
    setSelectedBooking={setSelectedBooking}
    setShowDetails={setShowDetails}
    setAssignBooking={setAssignBooking}
    setShowAssignModal={setShowAssignModal}
    handleReject={handleReject}
  />
)}
{activePage === "fleet" && <ManageVehicle />}
{activePage === "settings" && <AgencySettings />}
{activePage === "completed" && <Completed />}
{activePage === "activeBooking" && (
  <ActiveBooking
    showPanel={true}
    onClose={() => setActivePage("overview")}
    sideNavOpen={open}
  />
)}
{activePage === "drivers" && <ManageDriver />}
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
{showFeedback && (
  <FeedbackPopup 
  onClose={() => setShowFeedback(false)} 
  userType="agency"
/>
)}
      </div>
    </div>
  );
}