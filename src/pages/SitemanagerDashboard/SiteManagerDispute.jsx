import React, { useState } from "react";

export default function SiteManagerDispute() {
  const [disputes, setDisputes] = useState([
    {
      id: 1,
      status: "Damaged Goods",
      tracking: "#TRK789123456",
      date: "Nov 7, 2025",
      amountHeld: 22000,
      customerName: "Ankit Verma",
      customerEmail: "ankit.verma@example.com",
      agencyName: "Swift Logistics",
      agencyEmail: "swift@logistics.com",
      route: "Surat, Gujarat → Nagpur, Maharashtra",
      customerClaim:
        "Multiple items were damaged during transit. The packaging was torn and items inside were broken. Photos attached show the condition at delivery versus pickup.",
      agencyResponse:
        "We delivered the goods as received. The packaging was already weak at pickup. Customer signed delivery without complaint.",
      similarityScore: 42,
      matchLevel: "Low",
      evidenceCount: 2,
    },
    {
      id: 2,
      status: "Delayed Delivery & Missing Items",
      tracking: "#TRK555666777",
      date: "Nov 8, 2025",
      amountHeld: 14500,
      customerName: "Riya Sharma",
      customerEmail: "riya.sharma@example.com",
      agencyName: "FastTrack Couriers",
      agencyEmail: "fasttrack@example.com",
      route: "Mumbai → Pune",
      customerClaim: "Delivery delayed by 3 days and 2 items missing.",
      agencyResponse: "Shipment delayed due to weather conditions. Items dispatched separately.",
      similarityScore: 70,
      matchLevel: "Medium",
      evidenceCount: 1,
    },
  ]);

  const handleAction = (id, action) => {
    alert(`Dispute ${id} ${action}`);
  };

  // Function to determine card background based on status
  const getCardBg = (status) => {
    if (status.includes("Damaged")) return "bg-red-50 border-red-200";
    if (status.includes("Delayed")) return "bg-yellow-50 border-yellow-200";
    return "bg-blue-50 border-blue-200";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-1">Dispute Management</h1>
      <p className="text-gray-500 mb-6">
        Handle and resolve customer disputes with image comparison
      </p>

      {disputes.map((d) => (
        <div
          key={d.id}
          className={`mb-8 p-6 rounded-lg shadow-md border ${getCardBg(
            d.status
          )}`}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2 items-center">
              <span className="text-white font-semibold px-2 py-1 rounded" 
                    style={{backgroundColor: d.status.includes("Damaged") ? "#F87171" : d.status.includes("Delayed") ? "#FACC15" : "#60A5FA"}}>
                {d.status}
              </span>
              <span className="text-gray-700">{d.tracking}</span>
              <span className="text-gray-700">{d.date}</span>
            </div>
            <span className="text-red-600 font-bold text-lg">
              ₹{d.amountHeld.toLocaleString()}
            </span>
          </div>

          {/* Customer & Agency */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 border rounded bg-red-50">
              <p className="font-medium text-red-700 mb-1">Customer</p>
              <p>{d.customerName}</p>
              <p className="text-sm text-gray-500">{d.customerEmail}</p>
            </div>
            <div className="p-3 border rounded bg-blue-50">
              <p className="font-medium text-blue-700 mb-1">Agency</p>
              <p>{d.agencyName}</p>
              <p className="text-sm text-gray-500">{d.agencyEmail}</p>
            </div>
          </div>

          {/* Route */}
          <div className="mb-4 p-3 border rounded bg-gray-100">
            <p className="text-gray-700">{d.route}</p>
          </div>

          {/* Customer Claim */}
          <div className="mb-3 p-3 rounded border border-red-200 bg-red-100">
            <p className="font-medium text-red-700 mb-1">CUSTOMER'S CLAIM</p>
            <p>{d.customerClaim}</p>
          </div>

          {/* Agency Response */}
          <div className="mb-3 p-3 rounded border border-blue-200 bg-blue-100">
            <p className="font-medium text-blue-700 mb-1">AGENCY'S RESPONSE</p>
            <p>{d.agencyResponse}</p>
          </div>

          {/* AI Similarity Score */}
          <div className="mb-3 p-3 rounded border border-green-200 bg-green-100 flex justify-between items-center">
            <div>
              <p className="font-medium text-green-700 mb-1">AI Similarity Score</p>
              <p className="text-lg font-bold">{d.similarityScore}%</p>
              <div className="w-full h-2 bg-gray-200 rounded mt-1">
                <div
                  className={`h-2 rounded ${
                    d.similarityScore < 50
                      ? "bg-red-500"
                      : d.similarityScore < 75
                      ? "bg-yellow-400"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${d.similarityScore}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm bg-purple-100 px-2 py-1 rounded">
              Evidence: {d.evidenceCount} file{d.evidenceCount > 1 ? "s" : ""}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => handleAction(d.id, "Escalate")}
              className="px-4 py-2 border border-orange-400 text-orange-500 rounded hover:bg-orange-50"
            >
              Escalate
            </button>
            <button
              onClick={() => handleAction(d.id, "Reject")}
              className="px-4 py-2 border border-red-400 text-red-500 rounded hover:bg-red-50"
            >
              Reject
            </button>
            <button
              onClick={() => handleAction(d.id, "Approve")}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}