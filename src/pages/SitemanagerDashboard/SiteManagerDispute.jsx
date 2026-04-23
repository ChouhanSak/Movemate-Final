import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  getDoc,addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../firebase";

export default function SiteManagerDispute() {
  const [loadingId, setLoadingId] = useState(null);
  const [disputes, setDisputes] = useState([]);

  // 🔥 Fetch disputes
  useEffect(() => {
    const q = query(
      collection(db, "disputes"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list = await Promise.all(
        snapshot.docs.map(async (d) => {
          const disputeData = d.data();

          const bookingSnap = await getDoc(
            doc(db, "bookings", disputeData.bookingId)
          );

          let bookingData = {};
          let route = "";

          if (bookingSnap.exists()) {
            bookingData = bookingSnap.data();
            route = `${bookingData.pickupAddress?.city || "N/A"} → ${
              bookingData.dropAddress?.city || "N/A"
            }`;
          }

          return {
            id: d.id,
            ...disputeData,
            route,
            customerPhotos: bookingData.customerPhotos || [],
            driverPhotos: bookingData.driverPhotos || []
          };
        })
      );

      setDisputes(list);
    });

    return () => unsubscribe();
  }, []);

 const runAICompare = async (dispute) => {
  try {
     setLoadingId(dispute.id);
    // fetch booking to get real before/after photos
    const bookingSnap = await getDoc(
      doc(db, "bookings", dispute.bookingId)
    );

    if (!bookingSnap.exists()) {
      alert("Booking not found");
      return;
    }

    const booking = bookingSnap.data();

    const res = await fetch("http://127.0.0.1:5000/compare-damage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        driverPhotos: booking.driverPhotos || [],
        customerPhotos: booking.customerPhotos || [],
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.error || "AI comparison failed");
      return;
    }

    await updateDoc(doc(db, "disputes", dispute.id), {
      aiResult: result,
      status: "AI_REVIEWED",
    });

    alert("AI Comparison Completed ✅");
  } catch (err) {
    console.error(err);
    alert("AI comparison failed");
  }
  finally {
    setLoadingId(null);
  }
};



 const handleAction = async (dispute, action) => {
  // 🔹 booking fetch karo
  const bookingSnap = await getDoc(
    doc(db, "bookings", dispute.bookingId)
  );

  if (!bookingSnap.exists()) return;

  const customerId = bookingSnap.data().customerId;

  // 🔹 dispute status update
  await updateDoc(doc(db, "disputes", dispute.id), {
    status: action
  });

  // 🔥 notification send
  await addDoc(collection(db, "notifications"), {
    userId: customerId,
    title: action === "APPROVED" ? "Dispute Approved" : "Dispute Rejected",
    message:
      action === "APPROVED"
        ? "Your dispute has been approved."
        : "Your dispute has been rejected.",
    createdAt: serverTimestamp(),
    read: false,
  });
};

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-1">Dispute Management</h1>
      <p className="text-gray-500 mb-6">
        Handle and resolve customer disputes with AI image comparison
      </p>

      {disputes.length === 0 && (
        <p className="text-gray-400">No disputes found.</p>
      )}

      {disputes.map((d) => (
        <div
          key={d.id}
          className="mb-8 p-6 rounded-lg shadow-md border bg-red-50 border-red-200"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-white font-semibold px-2 py-1 rounded bg-red-500">
                {d.status}
              </span>
              <span className="ml-3 text-gray-700">
                Booking ID: {d.bookingId}
              </span>
            </div>
          </div>

          {/* Route */}
          <div className="mb-4 p-3 border rounded bg-gray-100">
            <p className="text-gray-700">{d.route}</p>
          </div>

          {/* Customer Claim */}
          <div className="mb-3 p-3 rounded border border-red-200 bg-red-100">
            <p className="font-medium text-red-700 mb-1">
              CUSTOMER'S CLAIM
            </p>
            <p>{d.description}</p>
          </div>

          {/* BEFORE Photos */}
          <div className="mb-3">
            <p className="font-semibold mb-2">Before Delivery Photos</p>
            <div className="grid grid-cols-3 gap-3">
              {d.customerPhotos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="before"
                  className="w-32 h-32 object-cover rounded border"
                />
              ))}
            </div>
          </div>

          {/* AFTER Photos */}
          <div className="mb-3">
            <p className="font-semibold mb-2">After Delivery Photos</p>
            <div className="grid grid-cols-3 gap-3">
              {d.driverPhotos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="after"
                  className="w-32 h-32 object-cover rounded border"
                />
              ))}
            </div>
          </div>

          {/* AI Result */}
          <div className="mb-3 p-3 rounded border border-green-200 bg-green-100">
            <p className="font-medium text-green-700 mb-1">
              AI Similarity Score
            </p>

            <p className="text-lg font-bold">
              {d.aiResult
                ? `${d.aiResult.similarity}% (${d.aiResult.damageLevel})`
                : "Not Calculated"}
            </p>

            <div className="w-full h-2 bg-gray-200 rounded mt-2">
              <div
                className="h-2 rounded bg-green-500"
                style={{
                  width: `${d.aiResult ? d.aiResult.similarity : 0}%`
                }}
              ></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
  onClick={() => runAICompare(d)}
  disabled={loadingId === d.id}
  className={`px-4 py-2 text-white rounded ${
    loadingId === d.id
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-purple-600 hover:bg-purple-700"
  }`}
>
  {loadingId === d.id ? "Running..." : "Run AI Comparison"}
</button>

            <button
              onClick={() => handleAction(d, "APPROVED")}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Approve
            </button>

            <button
              onClick={() => handleAction(d, "REJECTED")}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}