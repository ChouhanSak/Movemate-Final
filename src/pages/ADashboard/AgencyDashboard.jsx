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
  Plus,
} from "lucide-react";
import smallTruck from "../../assets/smalltruck.png";
import ManageVehicle from "./ManageVehicle"; // Fleet management component
import ActiveBooking from "./ActiveBooking"; // Active bookings overlay
import Completed from "./Completed";
import Footer from "../../components/Footer"; 

export default function AgencyDashboard() {
  const [open, setOpen] = useState(false);
  const [activePage, setActivePage] = useState("overview"); // overview | booking | fleet | completed
  const [showActiveBookingPanel, setShowActiveBookingPanel] = useState(false);

  const bookingRequests = [
    {
      id: "REQ001",
      name: "John Doe",
      phone: "+91 98765 43210",
      from: "Mumbai, Maharashtra",
      to: "Delhi, NCR",
      truck: "Medium Truck (10T)",
      weight: "8500 kg",
      goods: "Electronics",
      date: "Nov 12, 2025",
      price: "₹35,000",
    },
    {
      id: "REQ002",
      name: "Sarah Williams",
      phone: "+91 87654 32109",
      from: "Pune, Maharashtra",
      to: "Bangalore, Karnataka",
      truck: "Small Truck (5T)",
      weight: "3200 kg",
      goods: "Furniture",
      date: "Nov 12, 2025",
      price: "₹18,500",
    },
  ];

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
            onClick={() => setActivePage("overview")}
          >
            <Home className="w-5 h-5" />
            Overview
          </div>

          <div
            className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${activePage === "booking" ? "text-purple-600 font-semibold" : ""}`}
            onClick={() => setActivePage("booking")}
          >
            <Clock className="w-5 h-5" />
            Booking Requests
          </div>

          <div
            className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
            onClick={() => setShowActiveBookingPanel(true)}
          >
            <Truck className="w-5 h-5" />
            Active Bookings
          </div>

          <div
            className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${activePage === "completed" ? "text-purple-600 font-semibold" : ""}`}
            onClick={() => setActivePage("completed")}
          >
            <CheckCircle className="w-5 h-5" />
            Completed
          </div>

          <div
            className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${activePage === "fleet" ? "text-purple-600 font-semibold" : ""}`}
            onClick={() => setActivePage("fleet")}
          >
            <Truck className="w-5 h-5" />
            Manage Vehicle
          </div>

          <div
            className="flex items-center gap-3 cursor-pointer hover:text-red-600"
            onClick={() => {
              const confirmLogout = window.confirm("Are you sure you want to logout?");
              if (confirmLogout) {
                console.log("Agency logged out!");
                window.location.href = "/login"; 
              }
            }}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </div>
        </div>
      </div>

      {/* ---------------- Main Content ---------------- */}
      <div
        className={`flex-1 p-6 transition-all duration-300`}
        style={{ marginLeft: open ? "16rem" : "0" }}
      >
        {/* ---------------- Top Bar ---------------- */}
        <div className="w-full bg-white shadow-sm px-6 py-3 flex justify-between items-center rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(true)}>
              <Menu className="w-7 h-7 text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full text-white flex items-center justify-center font-semibold"
                style={{ background: "linear-gradient(90deg, #3b82f6, #a855f7)" }}
              >
                SL
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Swift Logistics</h1>
                <p className="text-xs text-gray-500 -mt-1">swift@logistics.com</p>
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

        {/* ---------------- Page Content ---------------- */}
        {activePage === "overview" && (
          <>
            {/* Overview Header */}
            <div className="mb-12">
              <h1 className="text-3xl font-bold flex items-center gap-2">Welcome back, Swift Logistics! 👋</h1>
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
              {bookingRequests.map((req) => (
                <div key={req.id} className="bg-gray-50 p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-yellow-500 font-semibold">New Request</span>
                    <span className="text-gray-400 text-sm">{req.id} • {req.date}</span>
                  </div>
                  <p className="font-medium">{req.name} • {req.phone}</p>
                  <p className="text-sm text-gray-500">{req.from} → {req.to}</p>
                  <p className="text-sm text-gray-500">{req.truck} • {req.weight} • {req.goods}</p>
                  <p className="font-semibold text-right mt-1">{req.price}</p>
                  <div className="flex gap-2 mt-2">
                    <button className="px-3 py-1 bg-gray-200 rounded-lg text-sm">View Details</button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm">Reject</button>
                    <button className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm">Accept & Assign</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePage === "fleet" && <ManageVehicle />}
        {activePage === "completed" && <Completed />}

       {/* IMPORTED FOOTER */}
             <Footer />
      </div>

      {/* ---------------- Active Booking Overlay ---------------- */}
      {showActiveBookingPanel && (
        <ActiveBooking 
          showPanel={true} 
          onClose={() => setShowActiveBookingPanel(false)} 
        />
      )}
    </div>
  );
}
