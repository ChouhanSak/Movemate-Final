import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Headset } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../Firebase";
import Swal from "sweetalert2";


export default function ContactSupport() {
  const navigate = useNavigate(); // ← hook for navigation
  
const [formData, setFormData] = useState({
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: ""
});
const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  const nameRegex = /^[A-Za-z\s]+$/; // sirf letters aur spaces
  const phoneRegex = /^\d{10}$/;     // exactly 10 digits
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // simple email

  if (!formData.fullName || !formData.email || !formData.subject || !formData.message) {
    Swal.fire({
      icon: "warning",
      title: "Missing fields",
      text: "Please fill all required fields"
    });
    return;
  }

  if (!nameRegex.test(formData.fullName)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Name",
      text: "Name should contain only letters and spaces"
    });
    return;
  }

  if (formData.phone && !phoneRegex.test(formData.phone)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Phone Number",
      text: "Phone number must be 10 digits"
    });
    return;
  }

  if (!emailRegex.test(formData.email)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Email",
      text: "Please enter a valid email address"
    });
    return;
  }

  if (formData.subject.length < 3 || formData.message.length < 5) {
    Swal.fire({
      icon: "error",
      title: "Too Short",
      text: "Subject or message is too short"
    });
    return;
  }

  // Firestore submit
  try {
    await addDoc(collection(db, "contactSupportRequests"), {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      createdAt: serverTimestamp()
    });

    Swal.fire({
      icon: "success",
      title: "Message Sent",
      text: "Our support team will contact you soon",
      timer: 2000,
      showConfirmButton: false
    });

    setFormData({
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });
  } catch (err) {
    console.error("Firestore error:", err);
    Swal.fire({
      icon: "error",
      title: "Failed",
      text: "Message not sent. Try again later"
    });
  }
};

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
         <div className="relative w-16 h-16 mx-auto mb-2">
        {/* Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-xl opacity-40"></div>

        {/* Icon circle */}
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
          <Headset className="text-white" size={32} strokeWidth={2} />
        </div>
      </div>

          <h1 className="text-3xl font-semibold text-purple-600 mt-4">
            Contact Support
          </h1>
          <p className="text-gray-500 mt-2">
            Need help? We're here for you 24/7. Reach out to us through any of the channels below.
          </p>
        </div>
        {/* Contact Form */}
<div className="max-w-6xl mx-auto mb-10">
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    {/* Top Gradient Bar */}
    <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

    <div className="p-6 md:p-8">
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold text-purple-600">
          Send us a Message
        </h2>
      </div>

      {/* Form */}
      <form
  onSubmit={handleSubmit}
  className="grid grid-cols-1 md:grid-cols-2 gap-4"
>

        <div>
          <label className="text-sm font-medium">Full Name *</label>
          <input
  type="text"
  placeholder="Enter your name"
  value={formData.fullName}
  onChange={(e) => {
    const value = e.target.value;
    if (/^[A-Za-z\s]*$/.test(value)) { // only letters & spaces
      setFormData({ ...formData, fullName: value });
    }
  }}
  className="w-full px-4 py-2 border rounded-md"
/>


        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Email Address *
          </label>

          <input
  type="email"
  placeholder="Enter your email"
  value={formData.email}
  onChange={(e) =>
    setFormData({ ...formData, email: e.target.value })
  }
  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
/>


        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Phone Number
          </label>
          <input
  type="text"
  placeholder="Enter your phone no."
  value={formData.phone}
  onChange={(e) => {
    const value = e.target.value;
    // allow only digits, max length 10
    if (/^\d{0,10}$/.test(value)) {
      setFormData({ ...formData, phone: value });
    }
  }}
  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
/>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Subject *
            </label>
          <input
  type="text"
  placeholder="How can we help you?."
  value={formData.subject}
  onChange={(e) =>
    setFormData({ ...formData, subject: e.target.value })
  }
  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
/>


        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Your Message *
            </label>
          <textarea
  rows="4"
   placeholder="Tell us more about your inquiry..."
  value={formData.message}
  onChange={(e) =>
    setFormData({ ...formData, message: e.target.value })
  }
 className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
 />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-md text-white font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition"
          >
            Send Message
          </button>    
          <p className="text-center text-sm text-gray-500 mt-2">
            We'll respond within 24 hours
          </p>
        </div>
      </form>
    </div>
  </div>
</div>
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Call Us */}
<div className="bg-white shadow rounded-lg p-6 flex flex-col items-center text-center 
                transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
  <Phone className="text-white" size={28} />
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
  <Mail className="text-white" size={28} />
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