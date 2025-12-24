// src/pages/customer/NewBooking.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp, query, onSnapshot } from "firebase/firestore";
import { auth } from "../../firebase";
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

export default function NewBooking() {
  const [step, setStep] = useState(1);

  // STEP 1 - Pickup & Drop
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [dropStreet, setDropStreet] = useState("");
  const [dropCity, setDropCity] = useState("");
  const [dropStateName, setDropStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");

  // STEP 2 - Agencies
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [loadingAgencies, setLoadingAgencies] = useState(true);

  // STEP 3 - Booking details
  const [customerName, setCustomerName] = useState("");
  const [goodsType, setGoodsType] = useState("");
  const [productCount, setProductCount] = useState("");
  const [weight, setWeight] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [instructions, setInstructions] = useState("");

  // 🔥 DYNAMIC AGENCIES FROM FIRESTORE
  useEffect(() => {
    const q = query(collection(db, "agencies"));
    const unsub = onSnapshot(q, (snap) => {
      const allAgencies = snap.docs.map(d => ({
        uid: d.id,
        name: d.data().agencyName || "Agency Name",
        rating: d.data().rating || 4.5,
        location: d.data().address || "N/A",
        city: d.data().city || "",
        ratePerKm: d.data().ratePerKm || 10,
      }));

      const filteredAgencies = city
        ? allAgencies.filter(a => a.city.toLowerCase().includes(city.toLowerCase()))
        : allAgencies;

      setAgencies(filteredAgencies);
      setLoadingAgencies(false);
    });

    return unsub;
  }, [city]);

  // Helper to allow only numbers up to max digits
  const setDigitsMax = (setter, value, max) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= max) setter(digits);
  };

  // Step 1 Validation
  const isStep1Valid = street && city && stateName &&
                       dropStreet && dropCity && dropStateName &&
                       pincode.length === 6 && phone.length === 10;

  // Combined pickup/drop addresses for summary
  const pickupAddress = `${street}, ${city}, ${stateName}`;
  const dropAddressFull = `${dropStreet}, ${dropCity}, ${dropStateName}`;

  // Firestore Save
  const handleConfirmBooking = async () => {
    if (!selectedAgency) {
      alert("Please select an agency");
      return;
    }

    try {
      await addDoc(collection(db, "bookings"), {
        customerId: auth.currentUser.uid,
        customerName,
        pickupAddress: {
          street,
          city,
          state: stateName,
        },
        dropAddress: {
          street: dropStreet,
          city: dropCity,
          state: dropStateName,
        },
        pincode,
        phone,
        agencyId: selectedAgency.uid,
        agencyName: selectedAgency.name,
        goodsType,
        productCount,
        weight,
        pickupDate,
        instructions,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert("✅ Booking Confirmed & Saved!");

      // Reset form
      setStep(1);
      setStreet(""); setCity(""); setStateName("");
      setDropStreet(""); setDropCity(""); setDropStateName("");
      setPincode(""); setPhone("");
      setSelectedAgency(null);
      setCustomerName(""); setGoodsType(""); setProductCount("");
      setWeight(""); setPickupDate(""); setInstructions("");
    } catch (error) {
      console.error(error);
      alert("❌ Booking failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
      {/* STEP 1 */}
      {step === 1 && (
        <>
          <StepIndicator step={step} />
          <h1 className="text-2xl font-bold mb-6">Book New Transport</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <div>
              <label className="block text-sm font-medium mb-1">Pickup Address</label>
              <input className="border px-3 py-2 rounded w-full mb-2" placeholder="Street / House No" value={street} onChange={e => setStreet(e.target.value)} />
              <input className="border px-3 py-2 rounded w-full mb-2" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
              <input className="border px-3 py-2 rounded w-full" placeholder="State" value={stateName} onChange={e => setStateName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Delivery Address</label>
              <input className="border px-3 py-2 rounded w-full mb-2" placeholder="Street / House No" value={dropStreet} onChange={e => setDropStreet(e.target.value)} />
              <input className="border px-3 py-2 rounded w-full mb-2" placeholder="City" value={dropCity} onChange={e => setDropCity(e.target.value)} />
              <input className="border px-3 py-2 rounded w-full" placeholder="State" value={dropStateName} onChange={e => setDropStateName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">6-digit Pincode</label>
              <input className="border px-3 py-2 rounded w-full" placeholder="Enter pincode" value={pincode} onChange={e => setDigitsMax(setPincode, e.target.value, 6)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">10-digit Phone</label>
              <input className="border px-3 py-2 rounded w-full" placeholder="Enter phone number" value={phone} onChange={e => setDigitsMax(setPhone, e.target.value, 10)} />
            </div>
          </div>

          <button className="mt-8 px-6 py-2 bg-purple-600 text-white rounded"
            onClick={() => {
              if (!isStep1Valid) return alert("Fill all details correctly");
              setStep(2);
            }}
          >
            Next →
          </button>
        </>
      )}

      {/* STEP 2 - DYNAMIC AGENCIES */}
      {step === 2 && (
        <>
          <StepIndicator step={step} />
          <h2 className="text-2xl font-bold mb-6">Select Agency</h2>

          {loadingAgencies ? (
            <div className="text-center py-12 text-gray-400">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading agencies...</p>
            </div>
          ) : agencies.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No agencies available yet</div>
          ) : (
            <div className="space-y-4 max-w-3xl">
              {agencies.map(a => (
                <div key={a.uid} className="border p-4 rounded cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                  onClick={() => { setSelectedAgency(a); setStep(3); }}
                >
                  <div>
                    <h3 className="font-semibold">{a.name}</h3>
                    <p className="text-sm text-gray-600">{a.location}</p>
                    <p className="text-yellow-500">⭐ {a.rating}</p>
                  </div>
                  <div className="text-green-600 font-medium text-lg">
                    ₹{a.ratePerKm} / km
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="mt-6 px-4 py-2 bg-gray-200 rounded" onClick={() => setStep(1)}>Back</button>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <StepIndicator step={step} />
          <h2 className="text-2xl font-bold mb-6">More Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Customer Name</label>
              <input className="border px-3 py-2 rounded w-full" placeholder="Enter customer full name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Goods Type</label>
              <select className="border px-3 py-2 rounded w-full" value={goodsType} onChange={e => setGoodsType(e.target.value)}>
                <option value="">Select Goods</option>
                <option>Furniture</option>
                <option>Electronics</option>
                <option>Household Items</option>
                <option>Office Equipment</option>
                <option>Fragile Items</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Number of Products</label>
              <input className="border px-3 py-2 rounded w-full" value={productCount} onChange={e => setProductCount(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Weight (kg)</label>
              <input className="border px-3 py-2 rounded w-full" value={weight} onChange={e => setWeight(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Pickup Date</label>
              <input type="date" className="border px-3 py-2 rounded w-full" value={pickupDate} onChange={e => setPickupDate(e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Special Instructions</label>
              <textarea className="border px-3 py-2 rounded w-full" value={instructions} onChange={e => setInstructions(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setStep(2)}>Back</button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded" onClick={() => {
              if (!customerName.trim()) { alert("Please enter customer name"); return; }
              setStep(4);
            }}>Next →</button>
          </div>
        </>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <>
          <StepIndicator step={step} />
          <h2 className="text-2xl font-bold mb-6">Booking Summary</h2>

          <div className="border p-4 rounded max-w-3xl space-y-2 text-sm">
            <p><b>Customer Name:</b> {customerName}</p>
            <p><b>Pickup:</b> {pickupAddress}</p>
            <p><b>Drop:</b> {dropAddressFull}</p>
            <p><b>Agency:</b> {selectedAgency?.name} (₹{selectedAgency?.ratePerKm} per km)</p>
            <p><b>Goods:</b> {goodsType}</p>
            <p><b>Products:</b> {productCount}</p>
            <p><b>Weight:</b> {weight} kg</p>
            <p><b>Pickup Date:</b> {pickupDate}</p>
            <p><b>Instructions:</b> {instructions}</p>
          </div>

          <div className="flex gap-4 mt-6">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setStep(3)}>Back</button>
            <button className="px-6 py-2 bg-green-600 text-white rounded" onClick={handleConfirmBooking}>Confirm Booking</button>
          </div>
        </>
      )}
    </div>
  );
}