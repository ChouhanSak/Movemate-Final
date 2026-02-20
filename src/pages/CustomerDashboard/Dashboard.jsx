import { onAuthStateChanged } from "firebase/auth";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import smallTruck from "../../assets/smallTruck.png";
import {
  Box,
  Truck,
  CheckCircle,
  Clock,
  Bell as BellIcon,
  LayoutDashboard,
  PlusCircle,
  Search,
  FileText,
  LogOut,
  Menu, 
  X,
  Settings
} from "lucide-react";
import CustomerSettings from "./CustomerSettings";
import Footer from "../../components/Footer";
import NewBooking from "./NewBooking";
import TrackShipment from "./Trackshipment";
import AllBookings from "./AllBookings";
import Swal from "sweetalert2";
import { signOut } from "firebase/auth";
import { auth } from "../../Firebase";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
// import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../Firebase"; 
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { getDoc, deleteDoc, updateDoc } from "firebase/firestore";

export default function Dashboard() {
  const [stats, setStats] = useState({
  total: 0,
  active: 0,
  completed: 0,
  pending: 0,
  monthly: 0
});

const [recentActivities, setRecentActivities] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState("overview");
  const [userData, setUserData] = useState({ fullName: "", email: "" });
  const [recentBooking, setRecentBooking] = useState(null);
  // const [recentActivities, setRecentActivities] = useState([]);
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState("");
  const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);
const notifRef = React.useRef(null);
const [avgDelivery, setAvgDelivery] = useState("—");



  const timeAgo = (date) => {
    if (!date) return "";

    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;

    return `${Math.floor(diff / 86400)} days ago`;
  };
  useEffect(() => {
  const handleClickOutside = (e) => {
    if (notifRef.current && !notifRef.current.contains(e.target)) {
      setShowNotifications(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  useEffect(() => {
  if (kycStatus === "REJECTED") {
    const showRejectedAlert = async () => {
      //  Get user document
      const docRef = doc(db, "customers", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);

      //  Get the reason dynamically
      let reason = "Your account verification failed. Please try signup again.";
      if (docSnap.exists()) {
        const data = docSnap.data();
        reason = data?.kyc?.review?.reason || data?.kyc?.reason || reason;
      }

      //  Show alert with reason
      await Swal.fire({
        icon: "error",
        title: "Verification Failed",
        html: `
          <p>Your account verification failed due to <b>${reason}</b>.<br/>
          Please try signup again.</p>
          `,
        confirmButtonColor: "#d33",
      });

      // 4️⃣ Delete Firestore record
      await deleteDoc(doc(db, "customers", auth.currentUser.uid));

      // 5️⃣ Logout
      await signOut(auth);

      // 6️⃣ Redirect to signup
      navigate("/signup/customer");
    };

    showRejectedAlert();
  }
}, [kycStatus, navigate]);


  useEffect(() => {
  let unsubscribeBookings = null;
  let unsubscribeNotifications = null;

  const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    // ---------- USER INFO ----------
    let fullName = "";
    let email = user.email || "";

    const docRef = doc(db, "customers", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
  const data = docSnap.data();         // get all data once
  const kycData = data.kyc;           
  setKycStatus(kycData?.status || "");

  fullName = data.fullName || email.split("@")[0] || "User";
} else if (user.displayName) {
  fullName = user.displayName;
} else if (email) {
  fullName = email.split("@")[0];
} else {
  fullName = "User";
}

setUserData({ fullName, email });
// ---------- NOTIFICATIONS ----------
const notifQuery = query(
  collection(db, "notifications"),
  where("userId", "==", user.uid),
  orderBy("createdAt", "desc"),
  limit(20)
);

unsubscribeNotifications = onSnapshot(notifQuery, async (snap) => {
  const now = new Date();
  const fresh = [];
  const oldDocs = [];

  snap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const createdAt = data.createdAt?.toDate();

    if (!createdAt) return;

    const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24);

    if (diffDays > 5) {
      oldDocs.push(docSnap.id);      //  delete from DB
    } else {
      fresh.push({ id: docSnap.id, ...data });  //  show in UI
    }
  });

  // 🧹 Delete old notifications from Firestore
  for (const id of oldDocs) {
    await deleteDoc(doc(db, "notifications", id));
  }

  setNotifications(fresh);
});



    // ---------- RECENT BOOKING ----------
   const q = query(
  collection(db, "bookings"),
  where("customerId", "==", user.uid),
  orderBy("createdAt", "desc"),
  limit(1)
);
       unsubscribeBookings = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        setRecentBooking({
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
        });
      } else {
        setRecentBooking(null);
      }
    });
  });

  return () => {
  if (unsubscribeBookings) unsubscribeBookings();
  if (unsubscribeNotifications) unsubscribeNotifications();
  unsubscribeAuth();
};

}, []);
useEffect(() => {
  let unsubscribeBookings;

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("customerId", "==", user.uid)
    );

    unsubscribeBookings = onSnapshot(q, (snap) => {
      const priority = {
  "Delivery completed": 1,
  "Shipment in transit": 2,
  "Booking confirmed by agency": 3,
  "Payment successful": 4,
  "Booking created": 5
};

const bucket = {};
let total = 0, active = 0, completed = 0, pending = 0;
let monthCount = 0;
const now = new Date();
const month = now.getMonth();
const year = now.getFullYear();

snap.docs.forEach((doc) => {
  const b = doc.data();
  const id = doc.id;
  total++;

if (["IN_TRANSIT", "BOOKING_PLACED"].includes(b.status)) active++;
else if (b.status === "COMPLETED") completed++;
else pending++;

if (b.createdAt) {
  const d = b.createdAt.toDate();
  if (d.getMonth() === month && d.getFullYear() === year) {
    monthCount++;
  }
}

  

  let label, time, ref = id;

  if (b.status === "COMPLETED") {
    label = "Delivery completed";
    time = b.completedAt || b.createdAt;
  }
  else if (b.status === "IN_TRANSIT") {
    label = "Shipment in transit";
    time = b.updatedAt || b.createdAt;
  }
  else if (b.status === "ASSIGNED") {
    label = "Booking confirmed by agency";
    time = b.assignedAt || b.createdAt;
  }
  else if (b.status === "PAYMENT_CONFIRMED") {
    label = "Payment successful";
    time = b.paymentConfirmedAt || b.createdAt;
    ref = `₹${b.price}`;
  }
  else {
    label = "Booking created";
    time = b.createdAt;
  }

  if (!bucket[label] || bucket[label].time.toDate() < time.toDate()) {
    bucket[label] = { label, time, ref };
  }
});
setStats({ total, active, completed, pending, monthly: monthCount });

const activities = Object.values(bucket)
  .sort((a, b) => b.time.toDate() - a.time.toDate())
  .sort((a, b) => priority[a.label] - priority[b.label])
  .slice(0, 4);

setRecentActivities(activities);
//  Average Delivery Calculation
let totalDeliveryHours = 0;
let deliveredCount = 0;

snap.docs.forEach((doc) => {
  const b = doc.data();

  if (b.status === "COMPLETED" && b.createdAt && b.completedAt) {
    const start = b.createdAt.toDate();
    const end = b.completedAt.toDate();

    const hours = (end - start) / (1000 * 60 * 60);
    totalDeliveryHours += hours;
    deliveredCount++;
  }
});

if (deliveredCount > 0) {
  const avgDays = (totalDeliveryHours / deliveredCount) / 24;
  setAvgDelivery(avgDays.toFixed(1));
} else {
  setAvgDelivery("—");
}

    });
  });

  return () => {
    unsubscribeAuth();
    if (unsubscribeBookings) unsubscribeBookings();
  };
}, []);

  const handleLogout = async () => {
  const result = await Swal.fire({
    title: "Logout?",
    text: "Are you sure you want to logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, Logout",
  });

  if (result.isConfirmed) {
    await signOut(auth);

    await Swal.fire({
      icon: "success",
      title: "Logged out",
      text: "You have been logged out successfully",
      timer: 1500,
      showConfirmButton: false,
    });

    navigate("/select-user");
  }
};

  const getPageMainTitle = () => {
    switch (activePage) {
      case "newBooking":
        return "New Booking";
      case "track":
        return "Track Shipment";
      case "all":
        return "All Bookings";
      default:
        return "";
    }
  };

  const getPageSubTitle = () => {
    switch (activePage) {
      case "newBooking":
        return "Create a New Shipment with Ease";
      case "track":
        return "Track Your Shipment and delivery progress";
      case "all":
        return "View, manage, and organize all your shipments";
      default:
        return "";
    }
  };

  const SidebarItem = ({ icon, label, pageKey }) => {
  const handleClick = () => {
    if (pageKey === "newBooking" && kycStatus === "MANUAL_REVIEW") {
    Swal.fire({
      icon: "warning",
      title: "KYC Under Review",
      text: "Your KYC is under manual review. You can create a booking once it is verified.",
      confirmButtonColor: "#7c3aed",
    });
    return; //  page change stop
  }
    if (pageKey === "logout") {
      handleLogout();        //  logout action
    } else {
      setActivePage(pageKey); //  normal pages
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition ${
        activePage === pageKey
          ? "bg-blue-100 text-blue-700 font-semibold"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};


  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* ----------------- SIDEBAR ----------------- */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl p-6 z-50 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Cross button */}
        <button
          className="absolute top-4 right-4"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <h2 className="text-2xl font-bold mb-8">MoveMate</h2>

        <div className="space-y-5 text-gray-700 text-lg mt-6">
          <SidebarItem icon={<LayoutDashboard size={16} />} label="Overview" pageKey="overview" />
          <SidebarItem icon={<PlusCircle size={16} />} label="New Booking" pageKey="newBooking" />
          <SidebarItem icon={<FileText size={16} />} label="All Bookings" pageKey="all" />
          <SidebarItem icon={<Search size={16} />} label="Track Shipment" pageKey="track" />
          <SidebarItem icon={<Settings size={16} />} label="Settings" pageKey="settings" />
        </div>

        <hr className="my-4" />
        <SidebarItem icon={<LogOut size={16} />} label="Logout" pageKey="logout" />
      </div>

      {/* ----------------- Overlay ----------------- */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}


      {/* MAIN CONTENT */}
<div
  className={`flex-1 p-6 relative transition-all duration-300 ${
    sidebarOpen ? "ml-64" : "ml-0"
  }`}
>

        {/* ----------------- TOP NAVBAR ----------------- */}
<div className="w-full bg-white shadow-sm px-6 py-3 flex justify-between items-center relative rounded-2xl mb-6">
  {/* Left side: logo + title + menu */}
<div className="flex items-center gap-3">
  {/* Hamburger icon */}
  <div className="flex items-center h-12">
    <Menu
      className="w-6 h-6 cursor-pointer"
      onClick={() => setSidebarOpen(true)}
    />
  </div>

  {/* Logo */}
  <div
    className="w-12 h-12 rounded-xl flex items-center justify-center"
    style={{ background: "linear-gradient(90deg, #3b82f6, #a855f7)" }}
  >
    <img src={smallTruck} alt="Truck" className="w-8 h-8" />
  </div>

  {/* Title */}
  <div className="flex flex-col justify-center">
    <h1 className="text-xl font-semibold text-gray-900">MoveMate</h1>
    <p className="text-sm text-gray-500 -mt-1">Goods Transportation Platform</p>
  </div>
</div>


  {/* Right side profile + bell */}
  <div className="flex items-center gap-6 relative">
    <div className="relative" ref={notifRef}>
  <button onClick={() => setShowNotifications(!showNotifications)}>
    <BellIcon className="w-6 h-6 text-gray-700 cursor-pointer" />
    {notifications.some(n => !n.read) && (
      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
    )}
  </button>

  {showNotifications && (
  <div className="absolute right-0 mt-2 w-72 max-h-80 bg-white shadow-lg rounded-lg z-50 p-2
                  overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
      {notifications.length === 0 ? (
        <div className="p-4 text-gray-500">No notifications</div>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`p-2 rounded mb-2 text-sm cursor-pointer ${
              n.read ? "bg-gray-100" : "bg-purple-50"
            }`}
            onClick={async () => {
              if (!n.read) {
                await updateDoc(doc(db, "notifications", n.id), { read: true });
              }
            }}
          >
           {n.title && <div className="font-medium">{n.title}</div>}
<div className="text-xs text-gray-700">{n.message}</div>
            <div className="text-xs text-gray-400 mt-1">
              {n.createdAt?.toDate().toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  )}
</div>

    <div className="h-6 w-px bg-gray-300" />

    <div
      className="flex items-center gap-3 cursor-pointer relative"
      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
    >
      <div
  className="w-10 h-10 rounded-full text-white flex items-center justify-center font-semibold"
  style={{ background: "linear-gradient(90deg, #3b82f6, #a855f7)" }}
>
  {userData.fullName ? userData.fullName.charAt(0) : "U"}
</div>

<div>
  <p className="font-medium text-gray-900">{userData.fullName}</p>
  <p className="text-sm text-gray-500 -mt-1">{userData.email}</p>
</div>


      {profileDropdownOpen && (
        <div className="absolute right-0 top-14 bg-white shadow-lg border rounded-lg w-44 z-50 p-2">
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
            Manage Profile
          </button>
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
            Recent Activity
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  </div>
</div>
{kycStatus === "MANUAL_REVIEW" && (
  <div className="mb-4 p-4 rounded-lg bg-yellow-100 border border-yellow-400 text-yellow-800">
    ⚠ Your account is under verification. You cannot create bookings yet.
  </div>
)}

        {/* ----------------- HEADER ----------------- */}
        {activePage === "overview" ? (
          <header className="mt-6">
            <h1 className="text-4xl font-semibold">
  Welcome back, {userData.fullName || "User"}! 👋
</h1>

            <p className="text-gray-600 text-xl mt-3">
              Book your shipment and track deliveries
            </p>
          </header>
        ) : (
          <header className="mt-6">
    <h1 className="text-4xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      {getPageMainTitle()}
    </h1>
    <p className="text-gray-500 text-base mt-2">
      {getPageSubTitle()}
    </p>
  </header>
)}

        {/* ----------------- TOP STATS CARDS ----------------- */}
        {activePage === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
            <Card className="bg-blue-500 text-white">
              <CardContent className="p-4 flex justify-between items-center hover:-translate-y-1 transition">
                <div>
                  <p>Total Bookings</p>
                  <h2 className="text-3xl font-bold mt-2">{stats.total}</h2>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Box className="w-10 h-10" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-500 text-white">
              <CardContent className="p-4 flex justify-between items-center hover:-translate-y-1 transition">
                <div>
                  <p>Active Shipments</p>
                  <h2 className="text-3xl font-bold mt-2">{stats.active}</h2>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Truck className="w-10 h-10" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-500 text-white">
              <CardContent className="p-4 flex justify-between items-center hover:-translate-y-1 transition">
                <div>
                  <p>Completed</p>
                  <h2 className="text-3xl font-bold mt-2">{stats.completed}</h2>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-500 text-white">
              <CardContent className="p-4 flex justify-between items-center hover:-translate-y-1 transition">
                <div>
                  <p>Pending</p>
                  <h2 className="text-3xl font-bold mt-2">{stats.pending}</h2>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Clock className="w-10 h-10" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
{/* ----------------- TOGGLE ----------------- */}
{activePage === "overview" && (
  <div className="flex justify-between items-center mt-12 mb-3">
    <div className="flex bg-white shadow p-1 rounded-full items-center gap-1">
      <button
        onClick={() => setShowAllBookings(false)}
        className={`px-5 py-2 rounded-full font-medium ${
          !showAllBookings ? "text-white" : "text-black"
        }`}
        style={
          !showAllBookings
            ? { background: "linear-gradient(90deg,#3b82f6,#a855f7)" }
            : {}
        }
      >
        ⚡ Overview
      </button>
    </div>
  </div>
)}
        {/* ----------------- RECENT ACTIVITY ----------------- */}
        {activePage === "overview" && (
  <div className="space-y-4">
    {recentActivities.length === 0 ? (
      <p className="text-gray-500 text-sm">No recent activity</p>
    ) : (
      recentActivities.map((a, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="w-3 h-3 bg-blue-500 rounded-full mt-1" />
          <div>
            <p className="font-medium">{a.label}</p>
            <p className="text-gray-500 text-sm">
              {a.ref} • {timeAgo(a.time?.toDate())}
            </p>
          </div>
        </div>
      ))
    )}
  </div>
)}

      {/* ----------------- THIS MONTH ----------------- */}
        {activePage === "overview" && (
         <div className="mt-8 mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-3xl p-8 hover:shadow-2xl transition cursor-pointer">

            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              📊 This Month
            </h2>

            <div className="grid grid-cols-2 gap-y-4">
              <p className="text-lg">Bookings</p>
             <p className="text-lg text-right">{stats.monthly} trips</p>

              {/* <p className="text-lg">Amount</p>
              <p className="text-lg text-right">₹1,42,000</p> */}

              <p className="text-lg">Avg. Delivery</p>
              <p className="text-lg text-right">
              {avgDelivery !== "—" ? `${avgDelivery} days` : "—"}
              </p>

            </div>
          </div>
        )}


        {/* ----------------- DYNAMIC PAGES ----------------- */}
        {activePage === "overview" && <div> {/* Put overview content here if needed */} </div>}
        {activePage === "newBooking" && <NewBooking />}
        {activePage === "track" && <TrackShipment />}
        {activePage === "all" && <AllBookings />}
       {activePage === "settings" && <CustomerSettings userData={userData} />}

        {/* ----------------- FOOTER ----------------- */}
        <Footer />
      </div>
    </div>
  );
}