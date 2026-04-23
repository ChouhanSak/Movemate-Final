import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  updateDoc,
  doc,
  getDocs,
  where,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { serverTimestamp } from "firebase/firestore";
function Payment() {
  const [payments, setPayments] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
const [filterStatus, setFilterStatus] = useState("all"); // all, holding, released
const [searchQuery, setSearchQuery] = useState("");
  // Fetch payments + booking names
  useEffect(() => {
    const q = query(collection(db, "payments"));

    const unsub = onSnapshot(q, async (snap) => {
      const list = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();

          let agencyName = "";
let customerName = "";
let bookingStatus = "";
let pickupCity = "";
let dropCity = "";

          // booking fetch
          if (data.bookingId) {
            const bookingRef = doc(db, "bookings", data.bookingId);
            const bookingSnap = await getDoc(bookingRef);
if (bookingSnap.exists()) {
  const bookingData = bookingSnap.data();

  agencyName = bookingData.agencyName || "N/A";
  customerName = bookingData.customerName || "N/A";
  bookingStatus = bookingData.status || "";

  // ROUTE FIELDS
  pickupCity = bookingData.pickupAddress?.city || "N/A";
dropCity = bookingData.dropAddress?.city || "N/A";
}
          }

         return {
  id: d.id,
  ...data,
  agencyName,
  customerName,
  bookingStatus,
  pickupCity,
  dropCity,
};
        })
      );
//       const filtered = list.filter(p => 
//   p.releaseAt && p.bookingStatus === "COMPLETED" && p.paymentStatus !== "released"
// );
      const filtered = list.filter(p => 
  p.releaseAt && p.bookingStatus === "COMPLETED"
);
setPayments(filtered);
    });

    return () => unsub();
  }, []);

  // Auto release payments after releaseAt time
  useEffect(() => {
    const interval = setInterval(async () => {
      const snap = await getDocs(
        query(
          collection(db, "payments"),
          where("paymentStatus", "==", "holding")
        )
      );

      snap.forEach(async (docSnap) => {
        const data = docSnap.data();

        if (data.releaseAt && data.releaseAt.toDate() <= new Date()) {
        await updateDoc(doc(db, "payments", docSnap.id), {
        paymentStatus: "released",
        releasedAt: serverTimestamp()
      });
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);
useEffect(() => {
  if (!selectedPayment) return;

  const fetchRating = async () => {
    try {
      const ratingSnap = await getDocs(
        query(
          collection(db, "ratings"),
          where("bookingId", "==", selectedPayment.bookingId)
        )
      );

      if (!ratingSnap.empty) {
        const data = ratingSnap.docs[0].data();
        setSelectedPayment(prev => ({
          ...prev,
          rating: data.rating,
          comment: data.comment
        }));
      } else {
        setSelectedPayment(prev => ({
          ...prev,
          rating: null,
          comment: null
        }));
      }
    } catch (err) {
      console.log("Error fetching rating:", err);
    }
  };

  fetchRating();
}, [selectedPayment]);


  return (
    <div className="p-8">
      {/* TITLE */}
      <h1 className="text-3xl font-bold text-black">Payment Management</h1>
      <p className="text-gray-500 mt-1">
        Manage payments held and release to agencies
      </p>

      {/* CARD */}
      <div className="mt-8 bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          Payments Ready for Release
        </h2>
       <div className="flex justify-end items-center gap-3 mb-4">
  
  {/* Search */}
  <input
    type="text"
    placeholder="Search by Booking ID or Customer"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="border rounded-full px-4 py-2 w-64 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  {/* Filter */}
  <select
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="all">All</option>
    <option value="holding">Holding</option>
    <option value="released">Released</option>
  </select>

</div>
        {payments.length === 0 && (
          <p className="text-gray-500">No payments found</p>
        )}

        {payments
  .filter((p) => {
    // filter by status
    if (filterStatus !== "all" && p.paymentStatus !== filterStatus) return false;

    // search by bookingId or customerName
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !p.bookingId?.toLowerCase().includes(q) &&
        !p.customerName?.toLowerCase().includes(q)
      )
        return false;
    }

    return true;
  })
  .map((p) => (
    <div
  key={p.id}
  className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6 mb-5 shadow-sm hover:shadow-md transition"
>
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

      {/* LEFT SIDE */}
      <div className="flex-1">

        {/* STATUS */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
            Completed
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              p.paymentStatus === "released"
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-600"
            }`}
          >
            {p.paymentStatus === "released"
              ? "Released"
              : "Admin Holding"}
          </span>

          <span className="text-gray-400 text-sm">
            #{p.bookingId?.slice(0, 10)}
          </span>
        </div>

        {/* DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm text-gray-600">

          <p className="mb-2">
            <span className="text-gray-400">Agency:</span>{" "}
            <span className="font-medium text-gray-800">
              {p.agencyName}
            </span>
          </p>

          <p className="mb-2">
            <span className="text-gray-400">Customer:</span>{" "}
            <span className="font-medium text-gray-800">
              {p.customerName}
            </span>
          </p>

              <p className="mb-2">
            <span className="text-gray-400">Release At:</span>{" "}
            {p.releaseAt?.toDate().toLocaleString()}
          </p>
          <p className="mb-2">
  <span className="text-gray-400">Route:</span>{" "}
  {p.pickupCity || "N/A"} → {p.dropCity || "N/A"}
</p>
          

        </div>
      </div>

      {/* RIGHT SIDE */}
    <div className="flex flex-col items-end justify-between min-w-[180px]">
      <p className="text-3xl font-bold text-emerald-600">₹{p.amount}</p>
    </div>
  </div>

  {/* FULL WIDTH DIVIDER */}
  <div className="-mx-6 border-t border-gray-300 mt-7"></div>

  {/* BUTTON ROW */}
  <div className="flex justify-end mt-3">
    <button
      onClick={() => {
        setSelectedPayment(p);
        setOpen(true);
      }}
      className="px-4 py-1 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-green-500 hover:scale-105 transition shadow-md"
    >
      View Details
    </button>
  </div>
      
  </div>
))}
      </div>


      {/* MODAL */}
      {open && selectedPayment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-green-600">
              Release Payment to{" "}
              <span className="text-blue-600">Agency</span>
            </h2>
            <div className="mt-6 border rounded-xl p-5 bg-gradient-to-r from-green-50 to-blue-50">
              <p className="font-semibold">
                Booking #{selectedPayment.bookingId}
              </p>
              <p className="text-sm text-gray-500">
                Agency: {selectedPayment.agencyName}
              </p>
              {/* RATING & COMMENT */}
  <p className="text-sm text-gray-500 mt-1">
    Rating:{" "}
    {selectedPayment.rating != null
      ? `${selectedPayment.rating} ★`
      : "Not been rated yet"}
  </p>
  <p className="text-sm text-gray-500">
    Comment:{" "}
    {selectedPayment.comment
      ? selectedPayment.comment
      : "Not been rated yet"}
  </p>
              <p className="text-sm text-gray-500">
                Customer: {selectedPayment.customerName}
              </p>

              <p className="text-sm text-gray-500">
                Amount: ₹{selectedPayment.amount}
              </p>

              <p className="text-sm text-gray-500">
                Release At:{" "}
                {selectedPayment.releaseAt?.toDate().toLocaleString()}
              </p>
            </div>
            <div className="mt-6 border rounded-xl p-4 bg-blue-50 text-blue-700">
              <strong>Confirmation Required:</strong> Once released, this
              payment will be transferred immediately and cannot be undone.
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="border px-5 py-2 rounded-lg"
              >
                Cancel
              </button>

            
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Payment;