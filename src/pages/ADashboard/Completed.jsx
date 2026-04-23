// src/pages/agency-dashboard/Completed.jsx
import React, { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
export default function Completed() {
  const [completedJobs, setCompletedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("agencyId", "==", user.uid),
      where("status", "==", "COMPLETED")
    );

    const unsubscribe = onSnapshot(q, async (snap) => {
      const jobs = await Promise.all(
        snap.docs.map(async (docItem) => {
          const b = docItem.data();

          // ⭐ RATING
          const ratingSnap = await getDocs(
            query(
              collection(db, "ratings"),
              where("bookingId", "==", docItem.id)
            )
          );

          let rating = 0;
          if (!ratingSnap.empty) {
            rating = ratingSnap.docs[0].data().rating;
          }

          // 🚚 DRIVER
          let driverName = "Not Assigned";
          if (b.driverId) {
            try {
              const driverSnap = await getDoc(
                doc(db, "drivers", b.driverId)
              );
              if (driverSnap.exists()) {
                driverName =
                  driverSnap.data().driverName || "Driver";
              }
            } catch (err) {
              console.error(err);
            }
          }

          // 💰 PAYMENT
          const paymentSnap = await getDocs(
            query(
              collection(db, "payments"),
              where("bookingId", "==", docItem.id)
            )
          );

         let paymentStatus = "Unpaid";

if (!paymentSnap.empty) {
  paymentSnap.forEach((doc) => {
    const data = doc.data();

    if (data.paymentStatus === "released") {
      paymentStatus = "Paid";
    } else if (data.paymentStatus === "holding") {
      paymentStatus = "Holding";
    } else {
      paymentStatus = "Pending";
    }
  });
}

          return {
            id: docItem.id,
            tracking: docItem.id,
            customer: b.customerName || "Customer",
            driver: driverName,
            from: b.pickupAddress?.city || "Unknown",
            to: b.dropAddress?.city || "Unknown",
            price: `₹${(b.price || 0).toLocaleString()}`,
            rating,
            paymentStatus,
            date: b.completedAt
              ? b.completedAt.toDate().toLocaleDateString()
              : "N/A",
            weight: `${b.weight || 0} kg`,
            type: b.vehicleType || "Vehicle",
          };
        })
      );

      setCompletedJobs(jobs);
    });
    return () => unsubscribe();
  }, []);
const filteredJobs = completedJobs.filter((job) => {
  // FILTER
  if (
    filterStatus &&
    filterStatus !== "ALL" &&
    job.paymentStatus?.toLowerCase() !== filterStatus.toLowerCase()
  ) {
    return false;
  }

  // SEARCH (optional)
  if (!searchTerm) return true;

  const term = searchTerm.toLowerCase();

  return (
    job.tracking?.toLowerCase().includes(term) ||
    job.customer?.toLowerCase().includes(term) ||
    job.from?.toLowerCase().includes(term) ||
    job.to?.toLowerCase().includes(term)
  );
});
  return (
    <div className="mt-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
  <div>
    <h2 className="text-3xl font-bold mb-2">
      Completed Deliveries
    </h2>
    <p className="text-gray-500">
      View your successful delivery history
    </p>
  </div>
</div>
     <div className="flex justify-end mb-6 relative">
  <div className="flex items-center gap-2">

    {/* SEARCH BAR */}
    <input
      type="text"
      placeholder="Search by Booking ID or Location"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="border rounded-xl px-4 py-2 w-72
                 focus:outline-none focus:ring-2
                 focus:ring-purple-500"
    />

    {/* FILTER ICON */}
    <button
      onClick={() => setShowFilter((prev) => !prev)}
      className="p-2 rounded-full border hover:bg-gray-100"
    >
      <Filter size={18} />
    </button>

  </div>

  {/* DROPDOWN */}
  {showFilter && (
    <div className="absolute right-0 top-12 bg-white shadow-lg rounded-xl w-40 border z-10">
      {["ALL", "Paid", "Holding"].map((option) => (
        <div
          key={option}
          onClick={() => {
            setFilterStatus(option);
            setShowFilter(false);
          }}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        >
          {option === "ALL" ? "All" : option}
        </div>
      ))}
    </div>
  )}
</div>
      {filteredJobs.length === 0 ? (
      searchTerm ? (
        <p className="text-red-500 text-center py-10">
          No such booking found
        </p>
      ) : (
        <p className="text-gray-400 text-center py-10">
          No completed deliveries yet.
        </p>
      )
    ) : (
        filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-green-50 border border-green-100 rounded-xl p-5 shadow-sm mb-4 hover:shadow-2xl transition cursor-pointer"
          >
            <div className="flex justify-between">
              <div>
                {/* STATUS */}
                <span className="text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full">
                  Completed
                </span>

                {/* TRACKING + PAYMENT */}
                <div className="flex gap-3 mt-2 text-gray-700 text-sm">
                  <span className="font-mono">{job.tracking}</span>

                  <span
                    className={`px-2 rounded-md text-xs ${
                      job.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-700"
                        : job.paymentStatus === "Holding"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {job.paymentStatus}
                  </span>
                </div>

                {/* CUSTOMER */}
                <p className="text-lg font-semibold mt-3">
                  {job.customer}
                </p>

                {/* DRIVER */}
                <p className="text-sm text-gray-600">
                  Driver: <strong>{job.driver}</strong>
                </p>

                {/* LOCATION */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <span>📍 {job.from}</span> → <span>📍 {job.to}</span>
                </div>

                {/* DETAILS */}
                <p className="text-sm text-gray-600 mt-1">
                  {job.type} • {job.weight} • {job.date}
                </p>
              </div>

              <div className="text-right">
                <h3 className="text-xl font-bold text-green-600">
                  {job.price}
                </h3>

                {/* ⭐ RATING */}
                <div className="flex items-center justify-end gap-1 mt-2">
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
                  <span className="text-sm text-gray-600 ml-1">
                    ({job.rating})
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setShowModal(true);
                  }}
                  className="mt-4 px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* MODAL */}
      {showModal && selectedJob && (
        <div
          className="fixed inset-0 backdrop-blur-md bg-black/10 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              Booking Details
            </h2>

            <div className="space-y-2 text-sm">
              <p><b>Tracking:</b> {selectedJob.tracking}</p>
              <p><b>Customer:</b> {selectedJob.customer}</p>
              <p><b>Driver:</b> {selectedJob.driver}</p>
              <p><b>Route:</b> {selectedJob.from} → {selectedJob.to}</p>
              <p><b>Price:</b> {selectedJob.price}</p>
              <p><b>Payment:</b> {selectedJob.paymentStatus}</p>
              <p><b>Vehicle:</b> {selectedJob.type}</p>
              <p><b>Weight:</b> {selectedJob.weight}</p>
              <p><b>Date:</b> {selectedJob.date}</p>
              <p><b>Rating:</b> ⭐ {selectedJob.rating}/5</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}