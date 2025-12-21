import { useState } from "react";

function Payment() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold text-black">
        Payment Management
      </h1>
      <p className="text-gray-500 mt-1">
        Manage payments held and release to agencies
      </p>

      {/* MAIN CARD */}
      <div className="mt-8 bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          Payments Ready for Release
        </h2>

        {/* PAYMENT ITEM */}
        <div className="border rounded-xl p-6 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex justify-between">
            <div>
              <div className="flex gap-2 items-center flex-wrap">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Completed
                </span>
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                  Holding
                </span>
                <span className="text-gray-500">
                  #TRK456123789
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <p>
                  <span className="text-gray-500">Agency:</span>{" "}
                  Express Transport
                </p>
                <p>
                  <span className="text-gray-500">Customer:</span>{" "}
                  Priya Sharma
                </p>
                <p>
                  <span className="text-gray-500">Completed:</span>{" "}
                  Nov 7, 2025
                </p>
                <p>
                  <span className="text-gray-500">Route:</span>{" "}
                  Kolkata → Bhubaneswar
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                ₹15,000
              </p>
              <p className="text-sm text-gray-500">
                Ready to release
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
            <button className="border px-4 py-2 rounded-lg">
              View Details
            </button>
            <button
              onClick={() => setOpen(true)}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
            >
              Release to Agency
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {open && (
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

            {/* BOOKING INFO */}
            <div className="mt-6 border rounded-xl p-5 bg-gradient-to-r from-green-50 to-blue-50">
              <p className="font-semibold">Booking #BK002</p>
              <p className="text-sm text-gray-500">
                TRK456123789
              </p>

              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <p>
                  <span className="text-gray-500">Agency:</span>{" "}
                  Express Transport
                </p>
                <p>
                  <span className="text-gray-500">Customer:</span>{" "}
                  Priya Sharma
                </p>
                <p>
                  <span className="text-gray-500">Completed:</span>{" "}
                  Nov 7, 2025
                </p>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full w-fit">
                  Completed
                </span>
              </div>
            </div>

            {/* PAYMENT DETAILS */}
            <div className="mt-6 border rounded-xl p-5 bg-orange-50">
              <h3 className="font-semibold mb-2">
                Payment Details
              </h3>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Amount to Release:
                </span>
                <span className="text-xl font-bold text-green-600">
                  ₹15,000
                </span>
              </div>

              <p className="mt-1">
                <span className="text-gray-500">
                  Payment Status:
                </span>{" "}
                Admin Holding
              </p>

              <p className="text-green-600 mt-1">
                Action: Transfer to Agency Account
              </p>
            </div>

            {/* CONFIRMATION */}
            <div className="mt-6 border rounded-xl p-4 bg-blue-50 text-blue-700">
              <strong>Confirmation Required:</strong> Once
              released, this payment will be transferred
              immediately and cannot be undone.
            </div>

            {/* MODAL BUTTONS */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="border px-5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                Confirm & Release Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;