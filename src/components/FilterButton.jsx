import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Filter } from "lucide-react";

export default function FilterButton({ allCustomers, setCustomers }) {
  const [open, setOpen] = useState(false);

  const handleFilter = (option) => {
    if (option === "all") setCustomers(allCustomers);
    else if (option === "verified")
      setCustomers(
        allCustomers.filter((c) =>
          ["AUTO_VERIFIED", "VERIFIED"].includes(c.kyc?.status)
        )
      );
    else if (option === "pending")
      setCustomers(allCustomers.filter((c) => c.kyc?.status === "MANUAL_REVIEW"));

    setOpen(false); // dropdown close after select
  };

  return (
    <div className="relative inline-block text-left">
      <button
      
        onClick={() => setOpen(!open)}
        className="inline-flex justify-center items-center gap-2 rounded-lg border px-4 py-2 bg-white shadow hover:bg-gray-50"
      >
        <Filter size={18} />
        <span>Filter</span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
          <ul className="flex flex-col">
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleFilter("all")}
            >
              All
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleFilter("verified")}
            >
              Verified
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleFilter("pending")}
            >
              Pending
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}