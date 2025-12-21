// src/components/Sidebar.jsx
import { X, Home, Clock, Truck, CheckCircle, LogOut } from "lucide-react";

export default function Sidebar({ open, setOpen, activePage, setActivePage, setShowActiveBookingPanel }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl p-6 z-50 transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button className="absolute top-4 right-4" onClick={() => setOpen(false)}>
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <h2 className="text-2xl font-bold mb-8">MoveMate</h2>

        <div className="space-y-5 text-gray-700 text-lg">

          <div className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${activePage === "overview" ? "text-purple-600 font-semibold" : ""}`}
            onClick={() => setActivePage("overview")}>
            <Home className="w-5 h-5" />
            Overview
          </div>

          <div className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${activePage === "booking" ? "text-purple-600 font-semibold" : ""}`}
            onClick={() => setActivePage("booking")}>
            <Clock className="w-5 h-5" />
            Booking Requests
          </div>

          <div className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
            onClick={() => setShowActiveBookingPanel(true)}>
            <Truck className="w-5 h-5" />
            Active Bookings
          </div>

          <div className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${activePage === "completed" ? "text-purple-600 font-semibold" : ""}`}
            onClick={() => setActivePage("completed")}>
            <CheckCircle className="w-5 h-5" />
            Completed
          </div>

          <div className={`flex items-center gap-3 cursor-pointer hover:text-blue-600 ${activePage === "fleet" ? "text-purple-600 font-semibold" : ""}`}
            onClick={() => setActivePage("fleet")}>
            <Truck className="w-5 h-5" />
            Manage Vehicle
          </div>

          <div className="flex items-center gap-3 cursor-pointer hover:text-red-600"
            onClick={() => {
              const c = window.confirm("Are you sure you want to logout?");
              if (c) window.location.href = "/login";
            }}>
            <LogOut className="w-5 h-5" />
            Logout
          </div>

        </div>
      </div>
    </>
  );
}
