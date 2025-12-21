import React, { useState } from "react";
import smallTruck from "../../assets/smalltruck.png";

// STEP INDICATOR COMPONENT
function StepIndicator({ step }) {
  return (
    <div className="flex items-center gap-8 mb-6">
      {[1, 2, 3, 4].map((num) => (
        <div key={num} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full text-white ${
              step >= num ? "bg-purple-600" : "bg-gray-300"
            }`}
          >
            {num}
          </div>
          <span className={step >= num ? "text-purple-600" : "text-gray-500"}>
            {num === 1 && "Requirements"}
            {num === 2 && "Select Agency"}
            {num === 3 && "Select Vehicle"}
            {num === 4 && "Summary"}
          </span>
        </div>
      ))}
    </div>
  );
}

// MAIN COMPONENT
export default function NewBooking({ onBack }) { // <- destructure prop
  const [step, setStep] = useState(1);

  // FORM FIELDS
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [goods, setGoods] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const goodsTypes = [
    "Electronics",
    "Furniture",
    "Construction Materials",
    "Perishables",
    "Fragile Items",
    "General Cargo",
  ];

  const agencies = [
    {
      id: 1,
      name: "Swift Logistics",
      rating: 4.8,
      distance: "2.5 km",
      time: "< 15 min",
      phone: "+91 98765 43210",
      location: "Andheri West, Mumbai",
      tags: ["Express Delivery", "Heavy Cargo"],
      completed: 2340,
      vehicles: [{ type: "Small Truck (5T)", number: "MH-03-GH-4567", capacity: "5000 kg" }],
    },
    {
      id: 2,
      name: "QuickShip Solutions",
      rating: 4.7,
      distance: "4.1 km",
      time: "< 25 min",
      phone: "+91 98765 33333",
      location: "Kurla West, Mumbai",
      tags: ["Same Day", "Perishables"],
      completed: 1560,
      vehicles: [{ type: "Small Truck (5T)", number: "MH-03-GH-4567", capacity: "5000 kg" }],
    },
  ];

  // Helper to allow only digits and max length
  const setDigitsMax = (setter, raw, maxLen) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length <= maxLen) setter(digits);
  };

  const allFieldsFilled = () => {
    return (
      pickup &&
      drop &&
      goods &&
      weight &&
      dimensions &&
      pickupDate &&
      instructions !== "" &&
      pincode.length === 6 &&
      phone.length === 10
    );
  };

  return (
    <div className="max-w-7.5xl mx-auto bg-white p-6 rounded shadow">
    

      {/* STEP 1 — REQUIREMENTS */}
      {step === 1 && (
        <div>
          <StepIndicator step={step} />
          <h1 className="text-2xl font-bold mb-4">Book New Transport</h1>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Pickup Address</label>
              <input
                type="text"
                className="border p-2 rounded"
                placeholder="Enter pickup address"
                maxLength={200}
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Delivery Address</label>
              <input
                type="text"
                className="border p-2 rounded"
                placeholder="Enter delivery address"
                maxLength={200}
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Pincode</label>
              <input
                type="text"
                className="border p-2 rounded"
                placeholder="6-digit pincode"
                value={pincode}
                onChange={(e) => setDigitsMax(setPincode, e.target.value, 6)}
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                className="border p-2 rounded"
                placeholder="10-digit phone number"
                value={phone}
                onChange={(e) => setDigitsMax(setPhone, e.target.value, 10)}
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Goods Type</label>
              <select
                className="border p-2 rounded"
                value={goods}
                onChange={(e) => setGoods(e.target.value)}
              >
                <option value="">Select goods type</option>
                {goodsTypes.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Weight (kg)</label>
              <input
                type="text"
                className="border p-2 rounded"
                placeholder="e.g., 5000"
                value={weight}
                onChange={(e) => setDigitsMax(setWeight, e.target.value, 10)}
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Dimensions (L x W x H)</label>
              <input
                type="text"
                className="border p-2 rounded"
                placeholder="e.g., 3 x 2 x 2"
                maxLength={200}
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Pickup Date</label>
              <input
                type="date"
                className="border p-2 rounded"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col mt-4">
            <label className="font-semibold mb-1">Special Instructions</label>
            <textarea
              className="border p-2 rounded w-full"
              placeholder="Any special handling requirements..."
              maxLength={200}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <button
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded"
            onClick={() => {
              if (!allFieldsFilled()) {
                alert("Please fill all fields correctly before proceeding.");
                return;
              }
              setStep(2);
            }}
          >
            Next: View Nearby Agencies →
          </button>
        </div>
      )}

      {/* STEP 2 — SELECT AGENCY */}
      {step === 2 && (
        <div>
          <StepIndicator step={step} />
          <h1 className="text-2xl font-bold mb-4 w-full bg-white p-6 rounded shadow">
            Nearby Agencies (Sorted by Rating)
          </h1>
          {agencies.map((a) => (
            <div
              key={a.id}
              className="border rounded p-4 mb-4 shadow cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setSelectedAgency(a);
                setStep(3);
              }}
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{a.name}</h2>
                  <p className="text-yellow-500">⭐ {a.rating}</p>
                  <p>{a.distance} • {a.time}</p>
                  <p>{a.phone}</p>
                  <p>{a.location}</p>
                  <div className="flex gap-2 mt-2">
                    {a.tags.map((t) => (
                      <span key={t} className="px-2 py-1 bg-gray-200 rounded-full text-sm">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{a.completed.toLocaleString()}</p>
                  <p className="text-gray-500 text-sm">Completed</p>
                </div>
              </div>
            </div>
          ))}
          <button
            className="mt-4 px-6 py-2 bg-gray-200 rounded"
            onClick={() => setStep(1)}
          >
            Back
          </button>
        </div>
      )}

      {/* STEP 3 — SELECT VEHICLE */}
      {step === 3 && (
        <div>
          <StepIndicator step={step} />
          <h1 className="text-2xl font-bold mb-4">Select Vehicle</h1>
          {selectedAgency?.vehicles.map((v, i) => (
            <div
              key={i}
              className="border p-4 rounded shadow mb-4 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setSelectedVehicle(v);
                setStep(4);
              }}
            >
              <h2 className="text-lg font-semibold">{v.type}</h2>
              <p>Vehicle No: {v.number}</p>
              <p>Capacity: {v.capacity}</p>
            </div>
          ))}
          <button className="mt-4 px-6 py-2 bg-gray-200 rounded" onClick={() => setStep(2)}>
            Back
          </button>
        </div>
      )}

      {/* STEP 4 — SUMMARY */}
      {step === 4 && (
        <div>
          <StepIndicator step={step} />
          <h2 className="text-2xl font-bold mb-4">Booking Summary</h2>
          <div className="border rounded p-4 shadow space-y-1">
            <p><b>Pickup Address:</b> {pickup}</p>
            <p><b>Delivery Address:</b> {drop}</p>
            <p><b>Pincode:</b> {pincode}</p>
            <p><b>Phone:</b> {phone}</p>
            <p><b>Pickup Date:</b> {pickupDate}</p>
            <p><b>Goods:</b> {goods}</p>
            <p><b>Weight:</b> {weight} kg</p>
            <p><b>Dimensions:</b> {dimensions}</p>
            <p><b>Instructions:</b> {instructions}</p>
            <p><b>Agency:</b> {selectedAgency?.name}</p>
            <p><b>Vehicle:</b> {selectedVehicle?.type}</p>

            {!bookingConfirmed && (
              <span className="inline-block bg-yellow-200 px-3 py-1 rounded mt-2">
                ⏳ Awaiting Confirmation
              </span>
            )}
          </div>

          <div className="flex gap-4 mt-4">
            <button className="px-6 py-2 bg-gray-200 rounded" onClick={() => setStep(3)}>
              Back
            </button>
            {!bookingConfirmed && (
              <button
                className="px-6 py-2 bg-green-600 text-white rounded"
                onClick={() => {
                  setBookingConfirmed(true);
                  setTimeout(() => alert("Booking Confirmed!"), 500);
                }}
              >
                Confirm Booking
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
