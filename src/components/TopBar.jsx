// src/components/TopBar.jsx
import { Menu, Bell as BellIcon } from "lucide-react";
import smallTruck from "../assets/smalltruck.png";

export default function TopBar({ setOpen }) {
  return (
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
  );
}
