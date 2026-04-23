import { Filter } from "lucide-react";
import { useState } from "react";

export default function BookingFilter({
  filterStatus,
  setFilterStatus,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-3 relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 border rounded-full hover:bg-gray-100"
      >
        <Filter size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-44 bg-white border rounded-lg shadow-md z-50">
          {["", "BOOKING_PLACED", "IN_TRANSIT", "COMPLETED"].map((item) => (
            <button
              key={item || "ALL"}
              onClick={() => {
                setFilterStatus(item);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                filterStatus === item ? "font-semibold" : ""
              }`}
            >
              {item === "" && "All"}
              {item === "BOOKING_PLACED" && "Booking Placed"}
              {item === "IN_TRANSIT" && "In Transit"}
              {item === "COMPLETED" && "Completed"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}