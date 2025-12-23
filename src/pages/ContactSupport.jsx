import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
export default function ContactSupport() {
  const navigate = useNavigate(); // ← hook for navigation

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="max-w-3xl mx-auto mb-4">
  <button
    onClick={() => navigate(-1)}
    className="flex items-center gap-2 text-purple-600 hover:underline"
  >
    <ArrowLeft size={20} /> Back to Home
  </button>
</div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19V6l-2 2m0 0l-2-2m2 2v13m6-9v6m-2-6h4"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-purple-600 mt-4">
            Contact Support
          </h1>
          <p className="text-gray-500 mt-2">
            Need help? We're here for you 24/7. Reach out to us through any of the channels below.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Call Us */}
<div className="bg-white shadow rounded-lg p-6 flex flex-col items-center text-center 
                transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
    {/* Icon */}
  </div>
  <h2 className="text-xl font-semibold">Call Us</h2>
  <p className="text-gray-500 mt-1 text-sm">24/7 Helpline - Immediate Response</p>
  <p className="text-green-600 font-medium mt-2 text-lg">+91 1800-XXX-XXXX</p>
  <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
    Call Now
  </button>
</div>

{/* Email Us */}
<div className="bg-white shadow rounded-lg p-6 flex flex-col items-center text-center 
                transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mb-4">
    {/* Icon */}
  </div>
  <h2 className="text-xl font-semibold">Email Us</h2>
  <p className="text-gray-500 mt-1 text-sm">Response within 24 hours</p>
  <p className="text-blue-600 font-medium mt-2 text-lg">support@movemate.com</p>
  <button className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded hover:opacity-90">
    Send Email
  </button>
</div>

        </div>

        {/* Bottom Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6 transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
            <h3 className="font-semibold mb-2">Head Office</h3>
            <p className="text-gray-500">MoveMate Logistics Pvt. Ltd.</p>
            <p className="text-gray-500">Mumbai, Maharashtra</p>
            <p className="text-gray-500">India - 400001</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6 transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
            <h3 className="font-semibold mb-2">Support Hours</h3>
            <p>Availability: <span className="text-green-500 font-medium">24/7</span></p>
            <p>Email Response: 24 hours</p>
            <p>Phone Support: Immediate</p>
            <p>Critical Issues: <span className="text-red-500">2-4 hours</span></p>
          </div>
        </div>

        {/* Common Help Topics */}
        <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <h4 className="font-semibold mb-2">Common Help Topics</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <span>• Booking Process</span>
            <span>• Tracking Shipments</span>
            <span>• Payment Methods</span>
            <span>• Dispute Management</span>
            <span>• Customer Registration</span>
            <span>• Agency Registration</span>
          </div>
        </div>
      </div>
    </div>
  );
}
