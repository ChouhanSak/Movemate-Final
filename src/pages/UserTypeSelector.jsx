import React, { useState } from "react";
import { ShieldCheck, Clock, CreditCard, X } from "lucide-react";
import truck from "../assets/truck.png";
import smallTruck from "../assets/smalltruck.png";
import customer from "../assets/customer.png";
import agency from "../assets/agency.png";
import Footer from "../components/Footer"; 
import Counter from "../components/Counter";
import ScrollReveal from "../components/ScrollReveal";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "../Firebase";

export default function UserTypeSelector({ onSelect, setPage }) {
  const [userType, setUserType] = useState(null);
  const [zoomed, setZoomed] = useState(false); // For image zoom
const navigate = useNavigate();
const location = useLocation();
const params = new URLSearchParams(location.search);
const mode = params.get("mode"); // "login" | null
const isLoginMode = mode === "login";
const [stats, setStats] = useState({
  verifiedAgencies: 0,
  happyCustomers: 0,
  successfulDeliveries: 0,
});
useEffect(() => {
  const fetchStats = async () => {
    try {
      // Happy Customers
      const customerSnap = await getDocs(collection(db, "customers"));
      const happy = customerSnap.docs.filter(
        (doc) => doc.data().status !== "REJECTED"
      );

      // Verified Agencies
      const agencySnap = await getDocs(collection(db, "agencies"));
      const verified = agencySnap.docs.filter(
        (doc) => doc.data().status !== "REJECTED"
      );

      // Successful Deliveries
      const bookingsSnap = await getDocs(collection(db, "bookings"));
      const successful = bookingsSnap.docs.filter(
        (doc) => doc.data().status === "COMPLETED"
      );

      // Set stats dynamically
      setStats({
        happyCustomers: happy.length,
        verifiedAgencies: verified.length,
        successfulDeliveries: successful.length, // ✅ use dynamic count
      });

      console.log("Happy Customers:", happy.length);
      console.log("Verified Agencies:", verified.length);
      console.log("Successful Deliveries:", successful.length);
    } catch (err) {
      console.error(err);
    }
  };

  fetchStats();
}, []);


const handleSelect = (type) => {
  setUserType(type);
  if (onSelect) onSelect(type);

  if (isLoginMode) {
    navigate(`/login/${type}`);
  } else {
    navigate(`/signup/${type}`);
  }
};




  const toggleZoom = () => {
    setZoomed(!zoomed);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 to-white text-gray-800">
      
      {/* Hero Section */}
      <main className="flex flex-col lg:flex-row justify-between items-start px-10 py-16 lg:gap-x-24">
        <div className="max-w-2xl mx-auto text-left">
          <h2 className="text-2xl sm:text-5xl lg:text-5.5xl font-bold text-gray-900 leading-tight mb-4">
            Your Trusted{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Logistics Partner
            </span>
          </h2>
          <p className="text-gray-600 mb-6">
            Whether you're shipping goods across cities or looking to grow your
            transport business, MoveMate connects customers with trusted
            agencies for seamless logistics solutions.
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="text-blue-600 w-4 h-4" /> Real-time updates
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="text-blue-600 w-4 h-4" /> Secure payments
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-blue-600 w-4 h-4" /> 24/7 support
            </div>
          </div>

          {/* Truck Image */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-lg w-full max-w-3xl mx-auto cursor-pointer"
            onClick={toggleZoom}
          >
            <img
              src={truck}
              alt="Truck"
              className="w-full h-70 object-cover transition-transform duration-300 transform hover:scale-105"
            />
            <div className="absolute top-4 left-4 w-12 h-12 rounded-full border-2 border-white bg-white p-1">
              <img src={smallTruck} alt="Small Truck" className="w-full h-full" />
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 text-sm">
              Reliable • Fast • Secure — Your goods, our responsibility
            </div>
          </div>

          {/* Zoom Modal */}
          {zoomed && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
              <div className="relative">
                <img
                  src={truck}
                  alt="Truck Zoomed"
                  className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-lg"
                />
                <button
                  onClick={toggleZoom}
                  className="absolute top-2 right-2 text-white p-2 bg-gray-800 rounded-full hover:bg-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right side: User Type Cards */}
        <div className="mt-8 lg:mt-12 flex flex-col items-center gap-6">
          <h3 className="text-3xl font-bold text-gray-800">Select User Type</h3>
          <p className="text-gray-500 text-center mb-4">
            Choose the option that best describes you
          </p>
          <div className="w-16 h-1 bg-blue-600 mb-6 rounded"></div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Customer */}
            <div
              onClick={() => handleSelect("customer")}
              className={`p-6 border rounded-xl flex flex-col items-center cursor-pointer hover:shadow-xl transition-transform transform hover:-translate-y-1 ${
                userType === "customer"
                  ? "border-blue-600 shadow-xl"
                  : "border-gray-200"
              }`}
            >
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <img src={customer} alt="Customer Icon" className="w-8 h-8" />
              </div>
              <h4 className="font-semibold mb-1">Customer</h4>
              <p className="text-gray-400 text-sm text-center">
                I want to transport my goods
              </p>
            </div>

            {/* Transport Agency */}
            <div
              onClick={() => handleSelect("agency")}
              className={`p-6 border rounded-xl flex flex-col items-center cursor-pointer hover:shadow-xl transition-transform transform hover:-translate-y-1 ${
                userType === "agency"
                  ? "border-green-600 shadow-xl"
                  : "border-gray-200"
              }`}
            >
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <img src={agency} alt="Agency Icon" className="w-8 h-8" />
              </div>
              <h4 className="font-semibold mb-1">Transport Agency</h4>
              <p className="text-gray-400 text-sm text-center">
                I provide transportation services
              </p>
            </div>
          </div>

          {userType && (
            <p className="mt-4 text-gray-700">
              You selected: <span className="font-semibold">{userType}</span>
            </p>
          )}
        </div>
      </main>
      {/* Stats Section */}
<section className="py-8">
  <div className="flex flex-col sm:flex-row justify-center items-center gap-8 max-w-5xl mx-auto">

    <div className="bg-white rounded-xl shadow-md p-9 w-64 text-center hover:shadow-xl transition">
      <Counter to={stats.verifiedAgencies} duration={1500} color="text-purple-600" />
      <p className="text-gray-500 mt-2">Verified Agencies</p>
    </div>

    <div className="bg-white rounded-xl shadow-md p-9 w-64 text-center hover:shadow-xl transition">
      <Counter
  to={stats.happyCustomers}
  duration={1500}
  color="text-teal-600"
/>
<p className="text-gray-500 mt-2">Happy Customers</p>

    </div>

    <div className="bg-white rounded-xl shadow-md p-9 w-64 text-center hover:shadow-xl transition">
      <Counter to={stats.successfulDeliveries} duration={1500} color="text-pink-600" />
      <p className="text-gray-500 mt-2">Successful Deliveries</p>
    </div>

  </div>
</section>

      {/* About Section */}
<section className="bg-gradient-to-b from-white to-indigo-50 px-10 py-16">
  <ScrollReveal>
    <h3 className="text-2xl font-semibold text-center text-gray-900 mb-8 flex justify-center items-center gap-2">
      <img src={smallTruck} alt="Small Truck" className="w-6 h-6" /> About
      MoveMate
    </h3>
  </ScrollReveal>

  <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
    <div>
      <ScrollReveal>
        <h4 className="font-bold text-lg mb-2 text-blue-700">Who We Are</h4>
        <p className="text-gray-600 mb-6">
          MoveMate is digital logistics platform that connects customers
          with verified transport agencies. We provide transparent,
          efficient, and accessible goods transportation solutions across
          the nation.
        </p>
      </ScrollReveal>

      <ScrollReveal>
        <h4 className="font-bold text-lg mb-2 text-blue-700">Our Mission</h4>
        <p className="text-gray-600">
          To revolutionize India's transportation landscape by building the
          most trusted digital marketplace where customers effortlessly
          discover verified transport partners, enjoy complete shipment
          visibility with real-time updates, and experience seamless secure
          transactions—all while empowering transport businesses to scale
          and thrive through cutting-edge technology solutions.
        </p>
      </ScrollReveal>
    </div>

    <div>
      <ScrollReveal>
        <h4 className="font-bold text-lg mb-2 text-blue-700">Our Goals</h4>
        <ul className="text-gray-600 list-disc pl-5 space-y-2">
          <li>Build India’s largest verified transport network</li>
          <li>Provide transparent pricing with secure payments</li>
          <li>Empower transport businesses with digital solutions</li>
          <li>Ensure end-to-end updates with 24/7 support</li>
        </ul>
      </ScrollReveal>

      <ScrollReveal>
        <div className="bg-white shadow-md p-4 rounded-xl mt-6 border">
          <h5 className="font-semibold text-blue-600 mb-2">Why Choose MoveMate?</h5>
          <ul className="text-gray-600 text-sm space-y-1">
            <li>✔ KYC-verified agencies with bank-grade security</li>
            <li>✔ Transparent pricing with real-time tracking</li>
            <li>✔ Extensive pan-India coverage backed by experts</li>
          </ul>
        </div>
      </ScrollReveal>
    </div>
  </div>
</section>

      {/* 🔹 Footer with working links */}
     <Footer setPage={setPage ?? (() => {})} /> 

    </div>
  );
}