import React, { useMemo, useState, useEffect } from "react";
import { 
  Home, Users, Building, Box, AlertTriangle, DollarSign, LogOut, X as XIcon, Menu, Bell as BellIcon, 
  BarChart3, Activity, Clock, Truck, CheckCircle 
} from "lucide-react";
import { getDocs } from "firebase/firestore";
import { addDoc, serverTimestamp, Timestamp, updateDoc, doc } from "firebase/firestore";
import smallTruck from "../../assets/smalltruck.png";
import ManageCustomer from "./ManageCustomer";
import ManageAgency from "./ManageAgency"; // import ManageAgency
import AllBookings from "./AllBookings";
import PaymentManagement from "./paymentmanagement";
import SiteManagerDispute from "./SiteManagerDispute";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer"; 
import { deleteDoc } from "firebase/firestore";
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
  const [hoverIndex, setHoverIndex] = useState(null);
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
    return (
  <circle
    key={i}
    cx={x}
    cy={y}
    r={5}
    fill="#2b7bf6"
    stroke="#fff"
    strokeWidth="1"
    style={{ cursor: "pointer" }}
  />
);
  });

  const ticks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md relative">
      <div className="text-md font-medium mb-4">Booking Trends</div>
      <svg
  viewBox={`0 0 ${w} ${h}`}
  width="100%"
  height={h}
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const index = Math.round((mouseX - padding) / stepX);

    if (index >= 0 && index < safeData.length) {
      setHoverIndex(index);
    }
  }}
  onMouseLeave={() => setHoverIndex(null)}
>
  <rect
    x="0"
    y="0"
    width={w}
    height={h}
    fill="transparent"
  />
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
      {hoverIndex !== null && (
  <div
    className="absolute bg-white border shadow-lg rounded-lg px-3 py-2 text-sm"
    style={{
      top: 60,
      left: padding + hoverIndex * stepX
    }}
  >
    <div className="font-medium">
      {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][hoverIndex]}
    </div>

    <div className="text-blue-600">
      Bookings: {safeData[hoverIndex]}
    </div>
  </div>
)}
    </div>
  );
};

/* ---------- QuickInsights Component ---------- */
const QuickInsights = ({ stats }) => {
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
           <p className="text-2xl mb-1">
             {stats.growth > 0 ? `+${formatNumber(stats.growth)}` : formatNumber(stats.growth)}%
          </p>
            <p className="text-xs text-blue-100">Compared to last month</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <p className="text-sm text-blue-100 mb-1">Avg. Booking Value</p>
            <p className="text-2xl mb-1">₹{formatNumber(stats.avgBookingValue)}</p>
            <p className="text-xs text-blue-100">Per transaction</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <p className="text-sm text-blue-100 mb-1">Customer Satisfaction</p>
            <p className="text-2xl mb-1">{stats.avgRating || 0}/5.0</p>
            <p className="text-xs text-blue-100">Based on {stats.totalRatings || 0} reviews</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <p className="text-sm text-blue-100 mb-1">Agency Performance</p>
            <p className="text-2xl mb-1">{stats.agencyPerformance || 0}%</p>
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
const formatNumber = (num) => {
  if (!num) return "0";

  num = Number(num);

  if (num >= 10000000) return (num / 10000000).toFixed(2) + "Cr";
  if (num >= 100000) return (num / 100000).toFixed(2) + "L";
  if (num >= 1000) return (num / 1000).toFixed(2) + "K";

  return num.toString();
};

/* ---------- Main Component ---------- */
export default function SiteManager() {
  const [activePage, setActivePage] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showActiveBookingPanel, setShowActiveBookingPanel] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const [showNotifications, setShowNotifications] = useState(false);
const hasLoadedDisputes = React.useRef(false);
const hasLoadedCustomers = React.useRef(false);
const hasLoadedAgencies = React.useRef(false);
useEffect(() => {
  const unsub = onSnapshot(collection(db, "disputes"), (snapshot) => {

    let pendingCount = 0;

    snapshot.forEach(doc => {
      const status = (doc.data().status || "").toUpperCase();

      if (
        status !== "APPROVED" &&
        status !== "REJECTED" &&
        status !== "AI_REVIEWED"
      ) {
        pendingCount++;
      }
    });

    setStats(prev => ({
  ...prev,
  pendingDisputes: pendingCount
}));
  });

  return () => unsub();
}, []);
useEffect(() => {
  const unsub = onSnapshot(collection(db, "disputes"), (snapshot) => {

    let approvedCount = 0;

    snapshot.forEach(doc => {
      const status = (doc.data().status || "").toUpperCase();

      if (status === "APPROVED") {
        approvedCount++;
      }
    });

    setStats(prev => ({
      ...prev,
      approvedDisputes: approvedCount
    }));
  });

  return () => unsub();
}, []);
useEffect(() => {
  const unsub = onSnapshot(collection(db, "bookings"), (snap) => {

    let activeCount = 0;
    let totalCount = snap.size;

    snap.forEach(doc => {
      const status = (doc.data().status || "").toUpperCase();

      if (
        status === "BOOKING_PLACED" ||
        status === "IN_TRANSIT"
      ) {
        activeCount++;
      }
    });

    setStats(prev => ({
      ...prev,
      activeBookings: activeCount,
      totalBookings: totalCount
    }));

  });

  return () => unsub();
}, []);
useEffect(() => {
  const unsub = onSnapshot(collection(db, "payments"), (snap) => {
    let holdingCount = 0;
    let holdingAmount = 0;

    snap.forEach(doc => {
      const data = doc.data();
      const paymentStatus = (data.paymentStatus || "").toUpperCase();

      if (paymentStatus === "HOLDING") {
        holdingCount++;

        if (data.amount) {
          holdingAmount += data.amount;
        }
      }
    });

    setStats(prev => ({
      ...prev,
      pendingPayments: holdingCount,
      totalHolding: Math.round(holdingAmount)
    }));
  });

  return () => unsub();
}, []);
useEffect(() => {
  const unsub = onSnapshot(collection(db, "payments"), (snap) => {

    let releasedAmount = 0;
    let releasedCount = 0;

    const today = new Date();
    const todayDate = today.toDateString();

    snap.forEach(doc => {
      const data = doc.data();

      if (data.releaseAt) {
        const releaseDate = data.releaseAt.toDate().toDateString();

        if (releaseDate === todayDate) {
          releasedCount++;

          if (data.amount) {
            releasedAmount += data.amount;
          }
        }
      }
    });

    setStats(prev => ({
      ...prev,
      releasedToday: Math.round(releasedAmount),
      releasedCount: releasedCount
    }));
  });

  return () => unsub();
}, []);

useEffect(() => {
  let customerCount = 0;
  let agencyCount = 0;

  const unsubCustomers = onSnapshot(collection(db, "customers"), (snap) => {
    customerCount = 0;

    snap.forEach(doc => {
      const status = (doc.data()?.kyc?.status || "").toUpperCase();

      if (status === "MANUAL_REVIEW") {
        customerCount++;
      }
    });

    setStats(prev => ({
      ...prev,
      pendingKYC: customerCount + agencyCount
    }));
  });

  const unsubAgencies = onSnapshot(collection(db, "agencies"), (snap) => {
    agencyCount = 0;

    snap.forEach(doc => {
      const status = (doc.data()?.kyc?.status || "").toUpperCase();

      if (status === "MANUAL_REVIEW") {
        agencyCount++;
      }
    });

    setStats(prev => ({
      ...prev,
      pendingKYC: customerCount + agencyCount
    }));
  });

  return () => {
    unsubCustomers();
    unsubAgencies();
  };
}, []);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      }
    });
    return () => unsub();
  }, []);
useEffect(() => {
  const unsub = onSnapshot(
    collection(db, "disputes"),
    async (snapshot) => {

      if (!hasLoadedDisputes.current) {
        hasLoadedDisputes.current = true;
        return;
      }

      for (const change of snapshot.docChanges()) {
        if (change.type === "added") {

          const data = change.doc.data();

          await addDoc(collection(db, "notifications"), {
            message: `New dispute from ${data.customerName || "Customer"}`,
            type: "dispute",
            userRole: "siteManager",
            read: false,
            createdAt: serverTimestamp(),
            expireAt: Timestamp.fromDate(
              new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            )
          });

        }
      }
    }
  );

  return () => unsub();
}, []);
  const [stats, setStats] = useState({
  pendingKYC: 0,
  activeBookings: 0,
  pendingDisputes: 0,
  approvedDisputes: 0,
  pendingPayments: 0,
  totalHolding: 0,
  releasedToday: 0,
  releasedCount: 0, 
  verifiedUsers: 0,
  totalBookings: 0,
  growth: 0,
  avgBookingValue: 0,
  avgRating: 0,
  totalRatings: 0,
  agencyPerformance: 0,
});
const [monthlyBookings, setMonthlyBookings] = useState([]);
useEffect(() => {
  const q = query(
    collection(db, "notifications"),
    where("userRole", "==", "siteManager")
  );

  const unsub = onSnapshot(q, (snapshot) => {

   const list = snapshot.docs
  .map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  }))
  .sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return b.createdAt.toDate() - a.createdAt.toDate(); // 🔥 latest first
  });

    setNotifications(list);
    setUnreadCount(list.filter(n => !n.read).length);
  });

  return () => unsub();
}, []);
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
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const fiveDaysAgoTimestamp = Timestamp.fromDate(fiveDaysAgo);

    const q = query(
      collection(db, "notifications"),
      where("createdAt", "<", fiveDaysAgoTimestamp)
    );

    const snapshot = await getDocs(q);

    const deletePromises = snapshot.docs.map(docSnap =>
      deleteDoc(doc(db, "notifications", docSnap.id))
    );

    await Promise.all(deletePromises);
  });

  return () => unsub();
}, []);
useEffect(() => {

  const unsubCustomers = onSnapshot(
    collection(db, "customers"),
    async (snapshot) => {

      if (!hasLoadedCustomers.current) {
        hasLoadedCustomers.current = true;
        return;
      }

      for (const change of snapshot.docChanges()) {
        const status = (change.doc.data()?.kyc?.status || "").toUpperCase();

      if (
  change.type === "added" &&
  status === "MANUAL_REVIEW" 
) {
  const data = change.doc.data();

  // check duplicate
  const existingQuery = query(
    collection(db, "notifications"),
    where("type", "==", "kyc"),
    where("customerId", "==", change.doc.id)
  );

  const existingSnap = await getDocs(existingQuery);
  if (!existingSnap.empty) return;

  // create notification
  await addDoc(collection(db, "notifications"), {
    message: `Customer Manual Review: ${data.fullName  || "Customer"}`,
    type: "kyc",
    userRole: "siteManager",
    customerId: change.doc.id, // ⭐ new field
    read: false,
    createdAt: serverTimestamp(),
    expireAt: Timestamp.fromDate(
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    )
  });
}
      }
    }
  );

  const unsubAgencies = onSnapshot(
    collection(db, "agencies"),
    async (snapshot) => {

      if (!hasLoadedAgencies.current) {
        hasLoadedAgencies.current = true;
        return;
      }

      for (const change of snapshot.docChanges()) {
        const status = (change.doc.data()?.kyc?.status || "").toUpperCase();
if (
  change.type === "added" &&
  status === "MANUAL_REVIEW"
) {
  const data = change.doc.data();

  const existingQuery = query(
    collection(db, "notifications"),
    where("type", "==", "kyc"),
    where("agencyId", "==", change.doc.id)
  );

  const existingSnap = await getDocs(existingQuery);
  if (!existingSnap.empty) return;

  await addDoc(collection(db, "notifications"), {
    message: `Agency Manual Review: ${data.agencyName || "Agency"}`,
    type: "kyc",
    userRole: "siteManager",
    agencyId: change.doc.id,
    read: false,
    createdAt: serverTimestamp(),
    expireAt: Timestamp.fromDate(
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    )
  });
}
      }
    }
  );

  return () => {
    unsubCustomers();
    unsubAgencies();
  };

}, []);

useEffect(() => {
  const unsub = onSnapshot(collection(db, "bookings"), (snap) => {

    let totalPrice = 0;
    let totalBookings = snap.size;

    const now = new Date();
    const currentMonth = now.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    let currentCount = 0;
    let lastCount = 0;
    let completed = 0;

    snap.forEach(doc => {
      const d = doc.data();

      if (d.price) {
  const cleanPrice = parseFloat(
    String(d.price).replace(/[^\d.]/g, "")
  );
  if (!isNaN(cleanPrice)) {
    totalPrice += cleanPrice;
  }
}

      if (d.status === "COMPLETED") completed++;

      if (d.createdAt) {
        const month = d.createdAt.toDate().getMonth();

        if (month === currentMonth) currentCount++;
        if (month === lastMonth) lastCount++;
      }
    });

    const avgBookingValue = totalBookings
      ? Math.round(totalPrice / totalBookings)
      : 0;

    const growth = lastCount
      ? (((currentCount - lastCount) / lastCount) * 100).toFixed(1)
      : 0;

    const performance = totalBookings
      ? Math.round((completed / totalBookings) * 100)
      : 0;

    setStats(prev => ({
      ...prev,
      avgBookingValue,
      growth,
      agencyPerformance: performance
    }));
  });

  return () => unsub();
}, []);
useEffect(() => {
  const unsub = onSnapshot(collection(db, "ratings"), (snap) => {

    let sum = 0;

    snap.forEach(doc => {
      sum += doc.data().rating || 0;
    });

    const avg = snap.size ? (sum / snap.size).toFixed(1) : 0;

    setStats(prev => ({
      ...prev,
      avgRating: avg,
      totalRatings: snap.size
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
             <div className="relative ml-4">
  <BellIcon
  className="w-6 h-6 text-gray-700 cursor-pointer"
  onClick={async () => {
    setShowNotifications(!showNotifications);

    for (const n of notifications) {
      if (!n.read) {
        await updateDoc(doc(db, "notifications", n.id), {
          read: true
        });
      }
    }
  }}
/>

  {unreadCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
      {unreadCount}
    </span>
  )}
{showNotifications && (
  <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl p-4 z-50 max-h-96 overflow-y-auto border">

    <h4 className="font-semibold mb-3">Notifications</h4>

    {notifications.length === 0 ? (
      <p className="text-sm text-gray-500">No notifications</p>
    ) : (
      notifications.map((note, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg mb-2 border transition 
          ${note.read ? "bg-gray-50" : "bg-blue-50 border-blue-300"}`}
        >
          <div className="flex justify-between items-start">

            <p className="text-sm font-medium">
              {note.message}
            </p>

            {!note.read && (
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
            )}

          </div>

          <p className="text-xs text-gray-400 mt-1">
          {note.createdAt?.toDate().toLocaleString()}
          </p>
        </div>
      ))
    )}

  </div>
)}
</div>
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
              <StatCard title="Pending Disputes" value={stats.pendingDisputes} subtitle="Needs resolution" gradientClass="bg-gradient-to-br from-red-500 to-red-600 shadow-md hover:-translate-y-1 transition" />
              <StatCard title="Pending Payments" value={stats.pendingPayments} subtitle="Ready to release" gradientClass="bg-gradient-to-br from-orange-400 to-red-500 shadow-md hover:-translate-y-1 transition" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
             <BookingTrends
               width={640}
               height={320}
               data={monthlyBookings}
            />

              <QuickInsights stats={stats} />
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
                      <span className="text-sm text-blue-100">Approved Disputes</span>
                      <span>{stats.approvedDisputes}</span> 
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