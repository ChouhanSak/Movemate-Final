import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/* ================= STEP INDICATOR ================= */
function StepIndicator({ step }) {
  const steps = ["Requirements", "Select Agency", "More Details", "Summary"];

  return (
    <div className="flex gap-6 mb-6 flex-wrap">
      {steps.map((label, index) => {
        const num = index + 1;
        return (
          <div key={num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white ${
                step >= num ? "bg-purple-600" : "bg-gray-300"
              }`}
            >
              {num}
            </div>
            <span
              className={`text-sm ${
                step >= num ? "text-purple-600" : "text-gray-500"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */
export default function NewBooking() {
  const [step, setStep] = useState(1);

  /* STEP 1 */
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");

  /* STEP 2 */
  const [selectedAgency, setSelectedAgency] = useState(null);

  /* STEP 3 */
  const [goodsType, setGoodsType] = useState("");
  const [productCount, setProductCount] = useState("");
  const [weight, setWeight] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [instructions, setInstructions] = useState("");

  const agencies = [
    { id: 1, name: "Swift Logistics", rating: 4.8, location: "Andheri West, Mumbai" },
    { id: 2, name: "QuickShip Solutions", rating: 4.7, location: "Kurla West, Mumbai" },
  ];

  const setDigitsMax = (setter, value, max) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= max) setter(digits);
  };

  const isStep1Valid =
    pickup && drop && pincode.length === 6 && phone.length === 10;

  /* ================= FIRESTORE SAVE ================= */
  const handleConfirmBooking = async () => {
    try {
      await addDoc(collection(db, "bookings"), {
        pickupAddress: pickup,
        dropAddress: drop,
        pincode,
        phone,
        agency: selectedAgency,
        goodsType,
        productCount,
        weight,
        pickupDate,
        instructions,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert("✅ Booking Confirmed & Saved!");
      setStep(1);
    } catch (error) {
      console.error(error);
      alert("❌ Booking failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">

      {/* ================= STEP 1 ================= */}
      {step === 1 && (
        <>
          <StepIndicator step={step} />
          <h1 className="text-2xl font-bold mb-6">Book New Transport</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <input className="border px-3 py-2 rounded" placeholder="Pickup Address"
              value={pickup} onChange={(e) => setPickup(e.target.value)} />
            <input className="border px-3 py-2 rounded" placeholder="Delivery Address"
              value={drop} onChange={(e) => setDrop(e.target.value)} />
            <input className="border px-3 py-2 rounded" placeholder="6-digit Pincode"
              value={pincode}
              onChange={(e) => setDigitsMax(setPincode, e.target.value, 6)} />
            <input className="border px-3 py-2 rounded" placeholder="10-digit Phone"
              value={phone}
              onChange={(e) => setDigitsMax(setPhone, e.target.value, 10)} />
          </div>

          <button
            className="mt-8 px-6 py-2 bg-purple-600 text-white rounded"
            onClick={() => {
              if (!isStep1Valid) return alert("Fill all details correctly");
              setStep(2);
            }}
          >
            Next →
          </button>
        </>
      )}

      {/* ================= STEP 2 ================= */}
      {step === 2 && (
        <>
          <StepIndicator step={step} />
          <h2 className="text-2xl font-bold mb-6">Select Agency</h2>

          <div className="space-y-4 max-w-3xl">
            {agencies.map((a) => (
              <div
                key={a.id}
                className="border p-4 rounded cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setSelectedAgency(a);
                  setStep(3);
                }}
              >
                <h3 className="font-semibold">{a.name}</h3>
                <p className="text-sm text-gray-600">{a.location}</p>
                <p className="text-yellow-500">⭐ {a.rating}</p>
              </div>
            ))}
          </div>

          <button className="mt-6 px-4 py-2 bg-gray-200 rounded" onClick={() => setStep(1)}>
            Back
          </button>
        </>
      )}

      {/* ================= STEP 3 ================= */}
      {step === 3 && (
        <>
          <StepIndicator step={step} />
          <h2 className="text-2xl font-bold mb-6">More Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">

            <div>
              <label className="text-sm font-medium">Goods Type</label>
              <select
                className="border px-3 py-2 rounded w-full"
                value={goodsType}
                onChange={(e) => setGoodsType(e.target.value)}
              >
                <option value="">Select Goods</option>
                <option>Furniture</option>
                <option>Electronics</option>
                <option>Household Items</option>
                <option>Office Equipment</option>
                <option>Fragile Items</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Number of Products</label>
              <input className="border px-3 py-2 rounded w-full"
                value={productCount}
                onChange={(e) => setProductCount(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium">Total Weight (kg)</label>
              <input className="border px-3 py-2 rounded w-full"
                value={weight}
                onChange={(e) => setWeight(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium">Pickup Date</label>
              <input type="date"
                className="border px-3 py-2 rounded w-full"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Special Instructions</label>
              <textarea className="border px-3 py-2 rounded w-full"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)} />
            </div>

          </div>

          <div className="flex gap-4 mt-6">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setStep(2)}>
              Back
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded" onClick={() => setStep(4)}>
              Next →
            </button>
          </div>
        </>
      )}

      {/* ================= STEP 4 ================= */}
      {step === 4 && (
        <>
          <StepIndicator step={step} />
          <h2 className="text-2xl font-bold mb-6">Booking Summary</h2>

          <div className="border p-4 rounded max-w-3xl space-y-2 text-sm">
            <p><b>Pickup:</b> {pickup}</p>
            <p><b>Drop:</b> {drop}</p>
            <p><b>Agency:</b> {selectedAgency?.name}</p>
            <p><b>Goods:</b> {goodsType}</p>
            <p><b>Products:</b> {productCount}</p>
            <p><b>Weight:</b> {weight} kg</p>
            <p><b>Pickup Date:</b> {pickupDate}</p>
            <p><b>Instructions:</b> {instructions}</p>
          </div>

          <div className="flex gap-4 mt-6">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setStep(3)}>
              Back
            </button>
            <button
              className="px-6 py-2 bg-green-600 text-white rounded"
              onClick={handleConfirmBooking}
            >
              Confirm Booking
            </button>
          </div>
        </>
      )}
    </div>
  );
}