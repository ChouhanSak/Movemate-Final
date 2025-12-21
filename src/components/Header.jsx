import React from "react";
import smallTruck from "../assets/smalltruck.png";

export default function Header() {
  return (
    <header className="flex justify-between items-center px-10 py-6 bg-white shadow-sm">
      <div className="flex items-center space-x-2">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
          <img src={smallTruck} alt="Truck Logo" className="w-6 h-6" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-900">MoveMate</h1>
          <span className="text-sm text-gray-500">
            Goods Transportation Platform
          </span>
        </div>
      </div>

      <button className="text-blue-600 hover:underline font-medium">
        Help & Support
      </button>
    </header>
  );
}
