// src/pages/agency-dashboard/Completed.jsx
import React from "react";

export default function Completed() {
  const completedJobs = [
    {
      id: "#BK103",
      tracking: "TRK321654987",
      customer: "David Lee",
      driver: "Amit Sharma",
      from: "Surat, Gujarat",
      to: "Mumbai, Maharashtra",
      price: "₹32,000",
      rating: 5,
      date: "Nov 4, 2025",
      weight: "9000 kg",
      type: "Medium Truck (10T)",
    },
    {
      id: "#BK104",
      tracking: "TRK654987321",
      customer: "Anita Desai",
      driver: "Rajesh Kumar",
      from: "Lucknow, UP",
      to: "Kanpur, UP",
      price: "₹12,000",
      rating: 4,
      date: "Nov 3, 2025",
      weight: "2500 kg",
      type: "Small Truck (5T)",
    },
    
  ];

  return (
    <div className="mt-6">
      <h2 className="text-3xl font-bold mb-2">Completed Deliveries</h2>
      <p className="text-gray-500 mb-6">View your successful delivery history</p>

      {completedJobs.map((job, index) => (
        <div
          key={index}
          className="bg-green-50 border border-green-100 rounded-xl p-5 shadow-sm mb-4 hover:shadow-2xl transition cursor-pointer"
        >
          <div className="flex justify-between">
            <div>
              <span className="text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full hover:shadow-2xl transition cursor-pointer">
                Completed
              </span>

              <div className="flex gap-3 mt-2 text-gray-700 text-sm">
                <span>{job.id}</span>
                <span>{job.tracking}</span>
                <span className="bg-green-100 text-green-700 px-2 rounded-md text-xs">
                  Paid
                </span>
              </div>

              <p className="text-lg font-semibold mt-3">{job.customer}</p>
              <p className="text-sm text-gray-600">
                Driver: <strong>{job.driver}</strong>
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <span>📍 {job.from}</span> → <span>📍 {job.to}</span>
              </div>

              <p className="text-sm text-gray-600 mt-1">
                {job.type} • {job.weight} • {job.date}
              </p>
            </div>

            <div className="text-right">
              <h3 className="text-xl font-bold text-green-600">{job.price}</h3>

              <div className="flex mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-yellow-500 text-xl ${
                      i < job.rating ? "" : "opacity-30"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <button className="mt-4 px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
