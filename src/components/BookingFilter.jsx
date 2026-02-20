import { Filter } from "lucide-react";
import { useState } from "react";

export default function BookingFilter1({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-3 relative">
      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by Booking ID or Location"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-[280px] border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* FILTER BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 border rounded-full hover:bg-gray-100"
      >
        <Filter size={18} />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 top-12 w-44 bg-white border rounded-lg shadow-md z-50">
          {["", "PENDING", "ACTIVE", "COMPLETED"].map((item) => (
            <button
              key={item || "ALL"}
              onClick={() => {
                setFilterCategory(item);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                filterCategory === item ? "font-semibold" : ""
              }`}
            >
              {item === ""
                ? "All"
                : item.charAt(0) + item.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}