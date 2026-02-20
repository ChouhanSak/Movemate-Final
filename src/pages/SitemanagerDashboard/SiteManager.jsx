import React, { useMemo, useState, useEffect } from "react";
import { 
  Home, Users, Building, Box, AlertTriangle, DollarSign, LogOut, X as XIcon, Menu, Bell as BellIcon, 
  BarChart3, Activity, Clock, Truck, CheckCircle 
} from "lucide-react";

import smallTruck from "../../assets/smalltruck.png";
import ManageCustomer from "./ManageCustomer";
import ManageAgency from "./ManageAgency"; // import ManageAgency
import AllBookings from "./AllBookings";
import PaymentManagement from "./paymentmanagement";
import SiteManagerDispute from "./SiteManagerDispute";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../Firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../Firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer"; 

/* ---------- StatCard Component ---------- */

const StatCard = ({ title, value, subtitle, gradientClass = "" }) => (
  <div
    className={`rounded-2xl p-6 text-white shadow-lg ${gradientClass} relative min-w-[190px]`}
    style={{ minHeight: 130 }}
  >
    <div>
      <div className="text-sm opacity-90">{title}</div>
      <div className="text-3xl font-semibold mt-3">{value}</div>
      {subtitle && <div className="text-sm opacity-90 mt-2">{subtitle}</div>}
    </div>
  </div>
);

/* ---------- BookingTrends Component ---------- */
const BookingTrends = ({ width = 520, height = 260, data = [45, 52, 49, 62, 72, 69] }) => {
  const padding = 40;
  const w = width;
  const h = height;
  const safeData = data.length ? data : [0, 0, 0, 0, 0, 0];
  const maxVal = Math.max(...safeData) * 1.2 || 10;

 const stepX = (w - padding * 2) / (safeData.length - 1);


  const points = safeData
  .map((d, i) => {
    const x = padding + i * stepX;
    const y = padding + (1 - d / maxVal) * (h - padding * 2);
    return `${x},${y}`;
  })
  .join(" ");


 const circles = safeData.map((d, i) => {

    const x = padding + i * stepX;
    const y = padding + (1 - d / maxVal) * (h - padding * 2);
    return <circle key={i} cx={x} cy={y} r={4.5} fill="#2b7bf6" stroke="#fff" strokeWidth="1" />;
  });

  const ticks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md">
      <div className="text-md font-medium mb-4">Booking Trends</div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
        {ticks.map((t, i) => {
          const y = padding + (1 - t / maxVal) * (h - padding * 2);
          return (
            <g key={i}>
              <line x1={padding} x2={w - padding} y1={y} y2={y} stroke="#e6e9ef" strokeDasharray="4 6" strokeWidth="1" />
              <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#7b8794">
                {Math.round(t)}
              </text>
            </g>
          );
        })}
        {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((lab, i) => {

          const x = padding + i * stepX;
          return (
            <text key={i} x={x} y={h - padding + 15} fontSize="11" fill="#7b8794" textAnchor="middle">
              {lab}
            </text>
          );
        })}
        <polyline fill="none" stroke="#2b7bf6" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points} />
        <polyline points={`${points} ${w - padding},${h - padding} ${padding},${h - padding}`} fill="#cfe3ff" opacity="0.12" />
        {circles}
      </svg>
    </div>
  );
};

/* ---------- QuickInsights Component ---------- */
const QuickInsights = () => {
  return (
    <div className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-white/20 p-2 rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-xl">Quick Insights</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <p className="text-sm text-blue-100 mb-1">Growth This Month</p>
            <p className="text-2xl mb-1">+15.3%</p>
            <p className="text-xs text-blue-100">Compared to last month</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <p className="text-sm text-blue-100 mb-1">Avg. Booking Value</p>
            <p className="text-2xl mb-1">₹3,250</p>
            <p className="text-xs text-blue-100">Per transaction</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <p className="text-sm text-blue-100 mb-1">Customer Satisfaction</p>
            <p className="text-2xl mb-1">4.8/5.0</p>
            <p className="text-xs text-blue-100">Based on 245 reviews</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <p className="text-sm text-blue-100 mb-1">Agency Performance</p>
            <p className="text-2xl mb-1">92%</p>
            <p className="text-xs text-blue-100">On-time delivery rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Card Helpers ---------- */
const Card = ({ children, className = "" }) => <div className={`rounded-2xl ${className}`}>{children}</div>;
const CardHeader = ({ children }) => <div className="border-b p-4 flex justify-between items-center">{children}</div>;
const CardTitle = ({ children, className = "" }) => <h4 className={`font-semibold text-lg ${className}`}>{children}</h4>;
const CardContent = ({ children, className = "" }) => <div className={className}>{children}</div>;

/* ---------- Main Component ---------- */
export default function SiteManager() {
  const [activePage, setActivePage] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showActiveBookingPanel, setShowActiveBookingPanel] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      }
    });
    return () => unsub();
  }, []);

  const [stats, setStats] = useState({
  pendingKYC: 0,
  activeBookings: 0,
  disputes: 0,
  pendingPayments: 0,
  totalHolding: 0,
  releasedToday: 0,
  releasedCount: 0, 
  verifiedUsers: 0,
  totalBookings: 0,
});
const [monthlyBookings, setMonthlyBookings] = useState([]);
useEffect(() => {
  const unsub = onSnapshot(collection(db, "bookings"), (snap) => {
    const months = Array(12).fill(0);


    snap.forEach(doc => {
      const data = doc.data();
      if (!data.createdAt) return;

      const date = data.createdAt.toDate();
      const monthIndex = date.getMonth(); // 0 = Jan

     if (monthIndex >= 0 && monthIndex < 12) {

        months[monthIndex]++;
      }
    });

    setMonthlyBookings(months);
  });

  return () => unsub();
}, []);

useEffect(() => {
  let agenciesCount = 0;

  const unsubAgencies = onSnapshot(
    collection(db, "agencies"),
    (agencySnap) => {
      agenciesCount = agencySnap.size;
    }
  );

  const unsubCustomers = onSnapshot(
    collection(db, "customers"),
    (customerSnap) => {
      const customersCount = customerSnap.size;

      setStats(prev => ({
        ...prev,
        verifiedUsers: customersCount + agenciesCount
      }));
    }
  );

  return () => {
    unsubCustomers();
    unsubAgencies();
  };
}, []);
useEffect(() => {
  let customersPending = 0;
  let agenciesPending = 0;

  const unsubCustomers = onSnapshot(collection(db, "customers"), (snap) => {
    customersPending = 0;

    snap.forEach(doc => {
      const status = (doc.data()?.kyc?.status || "").toUpperCase();
      if (status === "MANUAL_REVIEW") customersPending++;
    });

    setStats(prev => ({
      ...prev,
      pendingKYC: customersPending + agenciesPending
    }));
  });

  const unsubAgencies = onSnapshot(collection(db, "agencies"), (snap) => {
    agenciesPending = 0;

    snap.forEach(doc => {
      const status = (doc.data()?.kyc?.status || "").toUpperCase();
      if (status === "MANUAL_REVIEW") agenciesPending++;
    });

    setStats(prev => ({
      ...prev,
      pendingKYC: customersPending + agenciesPending
    }));
  });

  return () => {
    unsubCustomers();
    unsubAgencies();
  };
}, []);


useEffect(() => {
  const q = query(
    collection(db, "bookings"),
    where("paidAt", "!=", null) // SAME AS AllBookings
  );

  const unsub = onSnapshot(q, (snapshot) => {
    let active = 0;

    snapshot.forEach(doc => {
      const status = (doc.data().status || "").toUpperCase();

      if (
        status === "BOOKING_PLACED" ||
        status === "IN_TRANSIT"
        ) {
             active++;
          }

    });

    setStats(prev => ({
      ...prev,
      totalBookings: snapshot.size, //  REAL TOTAL
      activeBookings: active
    }));
  });

  return () => unsub();
}, []);


  return (
    <div className="w-full min-h-screen flex relative bg-gray-100">
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[px] z-40 transition"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ---------- Sidebar (UPDATED) ---------- */}
<div
  className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl p-6 z-50 transform transition-transform duration-300
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
>
  <button className="absolute top-4 right-4" onClick={() => setIsSidebarOpen(false)}>
    <XIcon className="w-6 h-6 text-gray-700" />
  </button>

  <h2 className="text-2xl font-bold mb-8">MoveMate</h2>

  <div className="space-y-5 text-gray-700 text-lg">
    <div
      className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${
        activePage === "overview" ? "text-purple-600 font-semibold" : ""
      }`}
      onClick={() => setActivePage("overview")}
    >
      <Home className="w-5 h-5" /> Overview
    </div>

    <div
      className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${
        activePage === "manageCustomer" ? "text-purple-600 font-semibold" : ""
      }`}
      onClick={() => setActivePage("manageCustomer")}
    >
      <Users className="w-5 h-5" /> Manage Customer
    </div>

    <div
      className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${
        activePage === "manageAgency" ? "text-purple-600 font-semibold" : ""
      }`}
      onClick={() => setActivePage("manageAgency")}
    >
      <Building className="w-5 h-5" /> Manage Agency
    </div>

    <div
      className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${
        activePage === "allBookings" ? "text-purple-600 font-semibold" : ""
      }`}
      onClick={() => setActivePage("allBookings")}
    >
      <Box className="w-5 h-5" /> All Bookings
    </div>

    <div
      className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${
        activePage === "disputes" ? "text-purple-600 font-semibold" : ""
      }`}
      onClick={() => setActivePage("disputes")}
    >
      <AlertTriangle className="w-5 h-5" /> Disputes
    </div>

    <div
      className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${
        activePage === "paymentManagement" ? "text-purple-600 font-semibold" : ""
      }`}
      onClick={() => setActivePage("paymentManagement")}
    >
      <DollarSign className="w-5 h-5" /> Payment Management
    </div>

    <div
      className="flex items-center gap-3 cursor-pointer hover:text-red-600"
      onClick={async () => {
  const confirmLogout = window.confirm("Are you sure you want to logout?");
  if (!confirmLogout) return;

  await signOut(auth);
  navigate("/login");
}}

    >
      <LogOut className="w-5 h-5" /> Logout
    </div>
  </div>
</div>


      {/* Main Content */}
      <main
        className="flex-1 p-6 transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? "16rem" : "0" }}
      >
        {/* Top Bar */}
        <div className="w-full bg-white shadow-sm px-6 py-3 flex justify-between items-center rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-7 h-7 text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full text-white flex items-center justify-center font-semibold"
                style={{ background: "linear-gradient(90deg, #3b82f6, #a855f7)" }}
              >
                SM
              </div>
              <div>
               <h1 className="text-lg font-semibold text-gray-900">Site Manager</h1>
<p className="text-xs text-gray-500 -mt-1">{userEmail}</p>

              </div>
              <div className="w-px h-8 bg-gray-300 mx-4" />
              <BellIcon className="w-6 h-6 text-gray-700 cursor-pointer ml-4" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">MoveMate</p>
              <p className="text-sm text-gray-500 -mt-1">Goods Transportation Platform</p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(90deg, #3b82f6, #a855f7)" }}
            >
              <img src={smallTruck} alt="Truck" className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Page Content */}
        {activePage === "overview" && (
          <>
            <div className="mb-12">
              <h1 className="text-3xl font-bold flex items-center gap-2">Welcome back, Site Manager! 👋</h1>
              <p className="text-gray-500 mt-1">Manage your bookings and grow your transportation business</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard title="Pending KYC" value={stats.pendingKYC} subtitle="Needs verification" gradientClass="bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md hover:-translate-y-1 transition" />
              <StatCard title="Active Bookings" value={stats.activeBookings} subtitle="Currently ongoing" gradientClass="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md hover:-translate-y-1 transition" />
              <StatCard title="Disputes" value={stats.disputes} subtitle="Needs resolution" gradientClass="bg-gradient-to-br from-red-500 to-red-600 shadow-md hover:-translate-y-1 transition" />
              <StatCard title="Pending Payments" value={stats.pendingPayments} subtitle="Ready to release" gradientClass="bg-gradient-to-br from-orange-400 to-red-500 shadow-md hover:-translate-y-1 transition" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
             <BookingTrends
               width={640}
               height={320}
               data={monthlyBookings}
            />

              <QuickInsights />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm rounded-2xl shadow-md hover:-translate-y-1 transition">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 ">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span>Payment Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm flex justify-between items-center shadow-md hover:-translate-y-1 transition">
                    <div>
                      <p className="text-sm text-orange-600">Total Holding</p>
                      <p className="text-2xl font-semibold text-orange-600">{stats.totalHolding}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-orange-400">Bookings</p>
                      <p className="text-sm">{stats.pendingPayments}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm flex justify-between items-center shadow-md hover:-translate-y-1 transition">
                    <div>
                      <p className="text-sm text-green-600">Released Today</p>
                      <p className="text-2xl font-semibold text-green-600">{stats.releasedToday}</p>
                    </div>
                   <div className="text-right">
                      <p className="text-xs text-green-400">Transactions</p>
                      <p className="text-sm">{stats.releasedCount}</p>
                   </div>

                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-md hover:-translate-y-1 transition">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4 shadow-md hover:-translate-y-1 transition">
                    <div className="bg-white/20 p-2 rounded-lg"><Activity className="w-5 h-5" /></div>
                    <h3>Platform Stats</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between ">
                      <span className="text-sm text-blue-100">Total Users</span>
                      <span>{stats.verifiedUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-100">Total Bookings</span>
                      <span>{stats.totalBookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-100">Pending KYC</span>
                      <span>{stats.pendingKYC}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-100">Active Disputes</span>
                      <span>{stats.disputes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
       

        {/* TODO: Add other pages here as components */}
        {activePage === "manageCustomer" && <ManageCustomer />}
        {activePage === "manageAgency" && <ManageAgency />}
        {activePage === "allBookings" && <AllBookings />}
        {activePage === "disputes" && <SiteManagerDispute />}
        {activePage === "paymentManagement" && <PaymentManagement />}
         {/* ----------------- FOOTER ----------------- */}
                <div className="mt-12">
  <Footer />
</div>
      </main>
      
    </div>
  );
}