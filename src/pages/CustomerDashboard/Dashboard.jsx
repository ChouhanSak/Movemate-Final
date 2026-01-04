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
  X
} from "lucide-react";

import Footer from "../../components/Footer";
import NewBooking from "./NewBooking";
import TrackShipment from "./TrackShipment";
import AllBookings from "./AllBookings";
import Swal from "sweetalert2";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
// import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase"; 
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState("overview");
  const [userData, setUserData] = useState({ fullName: "", email: "" });
  const [recentBooking, setRecentBooking] = useState(null);
  // const [recentActivities, setRecentActivities] = useState([]);
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState("");

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
  let unsubscribeBookings = null;
  const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    // ---------- USER INFO ----------
    let fullName = "";
    let email = user.email || "";

    const docRef = doc(db, "customers", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().fullName) {
      setKycStatus(docSnap.data().kycStatus?.toLowerCase());
      fullName = docSnap.data().fullName;
    } else if (user.displayName) {
      fullName = user.displayName;
    } else if (email) {
      fullName = email.split("@")[0];
    } else {
      fullName = "User";
    }

    setUserData({ fullName, email });

    // ---------- RECENT BOOKING ----------
   const q = query(
  collection(db, "bookings"),
  where("userId", "==", user.uid),
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
    unsubscribeAuth();
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
    if (pageKey === "newBooking" && kycStatus === "manual_review") {
    Swal.fire({
      icon: "warning",
      title: "KYC Under Review",
      text: "Your KYC is under manual review. You can create a booking once it is verified.",
      confirmButtonColor: "#7c3aed",
    });
    return; // ⛔ page change stop
  }
    if (pageKey === "logout") {
      handleLogout();        // 🔴 logout action
    } else {
      setActivePage(pageKey); // 🟢 normal pages
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
    <BellIcon className="w-6 h-6 text-gray-700 cursor-pointer" />
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

        {/* ----------------- HEADER ----------------- */}
        {activePage === "overview" ? (
          <header className="mt-6">
            <h1 className="text-5xl font-semibold">
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
                  <h2 className="text-3xl font-bold mt-2">X</h2>
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
                  <h2 className="text-3xl font-bold mt-2">X</h2>
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
                  <h2 className="text-3xl font-bold mt-2">X</h2>
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
                  <h2 className="text-3xl font-bold mt-2">X</h2>
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

      {/* <button
        onClick={() => setShowAllBookings(true)}
        className={`px-5 py-2 rounded-full font-medium ${
          showAllBookings ? "text-white" : "text-black"
        }`}
        style={
          showAllBookings
            ? { background: "linear-gradient(90deg,#3b82f6,#a855f7)" }
            : {}
        }
      >
        🕒 All Bookings
      </button> */}
    </div>
  </div>
)}


        {/* ----------------- ACTION REQUIRED ----------------- */}
        {/* {!showAllBookings && activePage === "overview" && (
          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Action Required</h2>

            <Card className="border-l-4 border-yellow-500 bg-yellow-50 rounded-xl shadow-sm hover:shadow-xl transition cursor-pointer">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-semibold">Payment Pending</p>
                    <p className="font-medium">FastMove Express ⭐4.6</p>
                    <p className="text-sm text-gray-700">Pickup: Pune</p>
                    <p className="text-sm text-gray-700">Drop: Bangalore</p>
                  </div>

                  <p className="text-xl font-bold text-green-800">₹18,500</p>
                </div>

                <div className="flex gap-3 mt-2">
                  <Button className="bg-green-600 text-white">💳 Make Payment</Button>
                  <Button className="bg-red-100 text-red-600 border border-red-300">
                    ❌ Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )} */}

        {/* ----------------- ACTIVE SHIPMENTS ----------------- */}
        {/* {activePage === "overview" && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Active Shipments</h2>
            <Card className="border-l-4 border-blue-500 bg-blue-50 rounded-xl shadow-sm hover:shadow-xl transition">
              <CardContent className="p-4 space-y-3">
                <p className="text-blue-600 font-semibold">In Transit</p>
                <p className="font-medium">Swift Logistics</p>
                <p className="text-sm text-gray-700">Mumbai → Delhi</p>
                <p className="text-sm text-gray-500">ETA: Nov 15, 2025</p>

                <div className="flex justify-between">
                  <p className="text-xl font-bold text-green-700">₹35,000</p>

                  <div className="space-x-3">
                    <Button variant="outline">Contact</Button>
                    <Button className="bg-blue-600 text-white">Track</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )} */}
        {/* ----------------- RECENT ACTIVITY ----------------- */}
          {activePage === "overview" && (
            <Card className="mt-10 rounded-2xl shadow-lg bg-white hover:shadow-xl transition">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🕒 Recent Activity
                </h2>

                <div className="space-y-4">

                  {/* Payment successful */}
                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 bg-green-500 rounded-full mt-1" />
                    <div>
                      <p className="font-medium">Payment successful</p>
                      <p className="text-gray-500 text-sm">
                        BK001 • ₹35,000
                      </p>
                    </div>
                  </div>

                  {/* Shipment in transit */}
                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mt-1" />
                    <div>
                      <p className="font-medium">Shipment in transit</p>
                      <p className="text-gray-500 text-sm">
                        BK001 • 2 hours ago
                      </p>
                    </div>
                  </div>

                  {/* Agency confirmed booking */}
                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mt-1" />
                    <div>
                      <p className="font-medium">Agency confirmed booking</p>
                      <p className="text-gray-500 text-sm">
                        BK002 • 5 hours ago
                      </p>
                    </div>
                  </div>
                 {/* Booking created */}
              <div className="flex items-start gap-3">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mt-1" />
                  <div>
                    <p className="font-medium">Booking created</p>
                    <p className="text-gray-500 text-sm">
                      BK003 • 1 day ago
                    </p>
                  </div>
                </div>
                </div>
              </CardContent>
            </Card>
          )}

      {/* ----------------- THIS MONTH ----------------- */}
        {activePage === "overview" && (
         <div className="mt-8 mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-3xl p-8 hover:shadow-2xl transition cursor-pointer">

            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              📊 This Month
            </h2>

            <div className="grid grid-cols-2 gap-y-4">
              <p className="text-lg">Bookings</p>
              <p className="text-lg text-right">8 trips</p>

              {/* <p className="text-lg">Amount</p>
              <p className="text-lg text-right">₹1,42,000</p> */}

              <p className="text-lg">Avg. Delivery</p>
              <p className="text-lg text-right">2.5 days</p>
            </div>
          </div>
        )}


        {/* ----------------- DYNAMIC PAGES ----------------- */}
        {activePage === "overview" && <div> {/* Put overview content here if needed */} </div>}
        {activePage === "newBooking" && <NewBooking />}
        {activePage === "track" && <TrackShipment />}
        {activePage === "all" && <AllBookings />}
        

        {/* ----------------- FOOTER ----------------- */}
        <Footer />
      </div>
    </div>
  );
}