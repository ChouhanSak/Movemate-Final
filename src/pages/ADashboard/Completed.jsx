// src/pages/agency-dashboard/Completed.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../Firebase";

export default function Completed() {
  const [completedJobs, setCompletedJobs] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("agencyId", "==", user.uid),
      where("status", "==", "COMPLETED")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const jobs = snap.docs.map((doc) => {
        const b = doc.data();

        return {
          id: doc.id,
          tracking: b.trackingId || "N/A",
          customer: b.customerName || "Customer",
          driver: b.driverName || "Not Assigned",
          from: b.pickupCity || "Unknown",
          to: b.dropCity || "Unknown",
          price: `₹${(b.price || 0).toLocaleString()}`,
          rating: b.rating || 0,
          date: b.completedAt
            ? b.completedAt.toDate().toLocaleDateString()
            : "N/A",
          weight: `${b.weight || 0} kg`,
          type: b.vehicleType || "Vehicle",
        };
      });

      setCompletedJobs(jobs);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-3xl font-bold mb-2">Completed Deliveries</h2>
      <p className="text-gray-500 mb-6">View your successful delivery history</p>

      {completedJobs.length === 0 ? (
        <p className="text-gray-400">No completed deliveries yet.</p>
      ) : (
        completedJobs.map((job) => (
          <div
            key={job.id}
            className="bg-green-50 border border-green-100 rounded-xl p-5 shadow-sm mb-4 hover:shadow-2xl transition cursor-pointer"
          >
            <div className="flex justify-between">
              <div>
                <span className="text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full">
                  Completed
                </span>

                <div className="flex gap-3 mt-2 text-gray-700 text-sm">
                  <span>#{job.id.slice(0, 6)}</span>
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
        ))
      )}
    </div>
  );
}
