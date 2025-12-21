import React from "react";
import { useNavigate } from "react-router-dom";
import smallTruck from "../assets/smalltruck.png";
import { Facebook, Instagram } from "lucide-react";

export default function Footer({ hideFooter }) {
  const navigate = useNavigate();

  if (hideFooter) return null;

  return (
    <footer className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4">
      <div className="w-full px-4 sm:px-8 lg:px-16 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">

        {/* LEFT — LOGO & TAGLINE */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-lg flex-shrink-0 hover:scale-105 transform transition-transform duration-300 cursor-pointer">
            <img src={smallTruck} alt="MoveMate" className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-wide">MoveMate</h2>
            <p className="text-white/80 text-sm leading-relaxed mt-1 sm:mt-0">
              Goods transportation platform connecting customers with verified transport agencies.
            </p>
          </div>
        </div>

        {/* CENTER — SOCIAL ICONS */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="font-semibold text-lg">Follow Us</h3>
          <div className="flex gap-5 mt-1">
            <Facebook className="cursor-pointer text-white/90 hover:text-white hover:scale-125 transition-transform duration-300 drop-shadow-md" />
            <Instagram className="cursor-pointer text-white/90 hover:text-white hover:scale-125 transition-transform duration-300 drop-shadow-md" />
          </div>
        </div>

        {/* RIGHT — QUICK LINKS */}
        <div className="flex flex-col items-end gap-2">
          <h3 className="font-semibold text-lg mb-1">Quick Links</h3>
          <div className="flex flex-col gap-1 text-sm text-white/80 text-right">
            <button
              className="hover:text-white hover:underline transition-all px-2 py-1 text-right transform hover:scale-105"
              onClick={() => navigate("/contact")}
            >
              Contact Us
            </button>
            <button
              className="hover:text-white hover:underline transition-all px-2 py-1 text-right transform hover:scale-105"
              onClick={() => navigate("/privacy")}
            >
              Privacy Policy
            </button>
            <button
              className="hover:text-white hover:underline transition-all px-2 py-1 text-right transform hover:scale-105"
              onClick={() => navigate("/terms")}
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-white/70 text-sm mt-4">
        © 2025 MoveMate — All Rights Reserved.
      </p>
    </footer>
  );
}
