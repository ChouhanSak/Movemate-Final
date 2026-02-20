// src/pages/customer/NewBooking.jsx
import React, { useState, useEffect,useRef } from "react";
import { db } from "../../Firebase";
import { collection, addDoc, serverTimestamp, query, onSnapshot } from "firebase/firestore";
import { auth } from "../../Firebase";
import { getCoordinates } from "../../utils/osmUtils";
import { calculateDistance } from "../../utils/distanceUtils";
import { doc, getDoc } from "firebase/firestore";
import { searchAddress } from "../../utils/osmSearch";
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
const [sortedAgencies, setSortedAgencies] = useState([]);
  // STEP 1 - Pickup & Drop
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [dropStreet, setDropStreet] = useState("");
  const [dropCity, setDropCity] = useState("");
  const [dropStateName, setDropStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
const [distance, setDistance] = useState(null);
const [distanceLoading, setDistanceLoading] = useState(false);
const [kycStatus, setKycStatus] = useState("");
const [pickupQuery, setPickupQuery] = useState("");
const [pickupSuggestions, setPickupSuggestions] = useState([]);
const [dropQuery, setDropQuery] = useState("");
const [dropSuggestions, setDropSuggestions] = useState([]);
const pickupRef = useRef(null);
// INPUT VALIDATIONS (STEP 3)

const handleCustomerNameChange = (e) => {
  const value = e.target.value;
  if (/^[a-zA-Z\s]*$/.test(value)) {
    setCustomerName(value);
  }
};

const handleProductCountChange = (e) => {
  const value = e.target.value.replace(/\D/g, "");
  setProductCount(value);
};

const handleWeightChange = (e) => {
  const value = e.target.value;
  if (/^\d*\.?\d*$/.test(value)) {
    setWeight(value);
  }
};

useEffect(() => {
  const handleClickOutside = (e) => {
    if (pickupRef.current && !pickupRef.current.contains(e.target)) {
      setPickupSuggestions([]); //  yahi se box band hoga
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);
// useEffect(() => {
//   const delay = setTimeout(async () => {
//     const results = await searchAddress(pickupQuery);
//     setPickupSuggestions(results);
//   }, 400); // debounce

//   return () => clearTimeout(delay);
// }, [pickupQuery]);
// useEffect(() => {
//   const delay = setTimeout(async () => {
//     const results = await searchAddress(dropQuery);
//     setDropSuggestions(results);
//   }, 400);

//   return () => clearTimeout(delay);
// }, [dropQuery]);
useEffect(() => {
  const fetchKyc = async () => {
    if (!auth.currentUser) return;

    const snap = await getDoc(
      doc(db, "customers", auth.currentUser.uid)
    );

    if (snap.exists()) {
      setKycStatus(snap.data().kycStatus);
    }
  };

  fetchKyc();
}, []);

const isSameAddress = () => {
  return (
    street.trim().toLowerCase() === dropStreet.trim().toLowerCase() &&
    city.trim().toLowerCase() === dropCity.trim().toLowerCase() &&
    stateName.trim().toLowerCase() === dropStateName.trim().toLowerCase()
  );
};

useEffect(() => {
  if (step !== 4) return;
  if (distance) return; // already calculated

  const calcDistance = async () => {
    try {
      setDistanceLoading(true);

      let start, end;

      if (city.toLowerCase() === dropCity.toLowerCase()) {
        // Same city → use full street-level address
        start = await getCoordinates(`${street}, ${city}, ${stateName}`);
        end = await getCoordinates(`${dropStreet}, ${dropCity}, ${dropStateName}`);
      } else {
        // Different city → use city-level for reliability
        start = await getCoordinates(`${city}, ${stateName}`);
        end = await getCoordinates(`${dropCity}, ${dropStateName}`);
      }

      // If street-level fails, fallback to city-level
      if (!start || !end) {
        console.warn("Street-level geocoding failed, using city-level fallback");
        start = await getCoordinates(`${city}, ${stateName}`);
        end = await getCoordinates(`${dropCity}, ${dropStateName}`);
      }

      let km = 0;
      if (start && end) {
        km = await calculateDistance(start, end);
        if (km < 0.5) km = 3; // minimum distance
      }

      setDistance(Number(km.toFixed(2)));
    } catch (e) {
      console.error("Distance calculation failed:", e);
      setDistance(null); // fallback message will show
    } finally {
      setDistanceLoading(false);
    }
  };

  calcDistance();
}, [step, street, city, stateName, dropStreet, dropCity, dropStateName]);


  // STEP 2 - Agencies
const [selectedAgency, setSelectedAgency] = useState(null);
const [agencies, setAgencies] = useState([]);
const [loadingAgencies, setLoadingAgencies] = useState(true);

// 🔍 NEW: search text
const [searchAgency, setSearchAgency] = useState("");
const [agreed, setAgreed] = useState(false);
const today = new Date();
today.setDate(today.getDate() + 2); //  current date + 2 days

const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0"); // month 0-indexed
const dd = String(today.getDate()).padStart(2, "0");

const minDate = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD format


  // STEP 3 - Booking details
  const [customerName, setCustomerName] = useState("");
  const [goodsType, setGoodsType] = useState("");
  const [productCount, setProductCount] = useState("");
  const [weight, setWeight] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [timeSlot, setTimeSlot] = useState(""); // Step 3 me time slot select ke liye
   const isStep3Valid =
  customerName.trim() &&
  goodsType &&
  productCount &&
  weight &&
  pickupDate &&
  timeSlot;
  //  DYNAMIC AGENCIES FROM FIRESTORE
 useEffect(() => {
  setLoadingAgencies(true);

  const q = query(collection(db, "agencies"));

  const unsub = onSnapshot(
    q,
    (snap) => {
      console.log("AGENCIES SNAPSHOT:", snap.docs.length);

      const allAgencies = snap.docs
  .map(d => ({
    uid: d.id,
    name: d.data().agencyName || "Agency Name",
    rating: d.data().averageRating || 0,
    address: d.data().address || "N/A",
    city: d.data().city || "",
    state: d.data().state || "",
    phone: d.data().phone || "N/A",
    ratePerKm: d.data().perKmRate || 10,
    kycStatus: d.data().kyc?.status || "NOT_SUBMITTED",
  }))
  .filter(a => a.kycStatus !== "MANUAL_REVIEW"); //  filter out manual review agencies

      setAgencies(allAgencies);
      setLoadingAgencies(false); //  spinner band
    },
    (error) => {
      console.error("🔥 Firestore error:", error);
      setLoadingAgencies(false); // spinner band EVEN ON ERROR
    }
  );

  return () => unsub();
}, []);
useEffect(() => {
  const sortByDistance = async () => {
    if (!city || agencies.length === 0) {
      setSortedAgencies(agencies);
      return;
    }

    try {
      const userLoc = await getCoordinates(`${city}, ${stateName}`);

      const agenciesWithDistance = await Promise.all(
        agencies.map(async (a) => {
          const agencyLoc = await getCoordinates(`${a.city}`);
          let km = Infinity;

          if (userLoc && agencyLoc) {
            km = await calculateDistance(userLoc, agencyLoc);
          }

          return { ...a, distanceFromUser: km };
        })
      );

      agenciesWithDistance.sort(
        (a, b) => a.distanceFromUser - b.distanceFromUser
      );

      setSortedAgencies(agenciesWithDistance);
    } catch (err) {
      console.error("Sorting error:", err);
      setSortedAgencies(agencies);
    }
  };

  sortByDistance();
}, [city, stateName, agencies]);
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
//   if (kycStatus !== "VERIFIED" && kycStatus !== "AUTO_VERIFIED") {
//   Swal.fire({
//     icon: "warning",
//     title: "KYC Not Verified",
//     text: "You cannot place a booking until your KYC is verified.",
//   });
//   return;
// }
  if (!selectedAgency) {
    alert("Please select an agency");
    return;
  }
  if (!distance || distance === "N/A") {
    alert("Distance is still calculating, please wait");
    return;
  }
if (
  street.trim().toLowerCase() === dropStreet.trim().toLowerCase() &&
  city.trim().toLowerCase() === dropCity.trim().toLowerCase() &&
  stateName.trim().toLowerCase() === dropStateName.trim().toLowerCase()
) {
  alert("❌ Pickup and Drop address cannot be the same");
  return;
}
  try {
    // 1 Create booking
    const bookingRef = await addDoc(collection(db, "bookings"), {
      customerId: auth.currentUser.uid,
      customerName,
      pickupAddress: { street, city, state: stateName },
      dropAddress: { street: dropStreet, city: dropCity, state: dropStateName },
      pincode,
      phone,
      agencyId: selectedAgency.uid,
      agencyName: selectedAgency.name,
      goodsType,
      productCount,
      weight,
      pickupDate,
      timeSlot,
      instructions,
      distance: distance,      // ← auto calculated distance
  price: null,             // ← agency baad me set karegi
  status: "pending",

  createdAt: serverTimestamp(),
      
    });


    //  Notification after booking is created
    await addDoc(collection(db, "notifications"), {
  userId: selectedAgency.uid,
  agencyId: selectedAgency.uid,
  userType: "agency",                     // for agency only
  title: "New Booking Request",
  message: `New booking from ${customerName}`,
  bookingId: bookingRef.id,
  read: false,
  createdAt: serverTimestamp(),
     
});


      alert("✅ Booking Confirmed! Please wait for the agency to respond.");

      // Reset form
      setStep(1);
      setStreet(""); setCity(""); setStateName("");
      setDropStreet(""); setDropCity(""); setDropStateName("");
      setPincode(""); setPhone("");
      setSelectedAgency(null);
      setCustomerName(""); setGoodsType(""); setProductCount("");
      setWeight(""); setPickupDate(""); setInstructions("");setDistance(null);
setDistanceLoading(false);
setAgreed(false);
    } catch (error) {
      console.error(error);
      alert("❌ Booking failed");
    }
  };
const filteredAgencies = sortedAgencies.filter(a => {
  const userState = stateName.trim().toLowerCase();
  const agencyState = (a.state || "").trim().toLowerCase();

  if (!userState) return false;

  return agencyState === userState;
});
  return (
    <div className="max-w-7xl mx-auto bg-white p-6 rounded shadow pb-20">

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <StepIndicator step={step} />
          <h1 className="text-2xl font-bold mb-6">Book New Transport</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
           {/* Pickup Address */}
<div className="relative">
  <div className="relative" ref={pickupRef}></div>
  <label className="block text-sm font-medium mb-1">Pickup Address</label>

  {/* Street / Area */}
  <input
    className="border px-3 py-2 rounded w-full mb-2"
    placeholder="Street / Area / Landmark"
    value={street}
    onChange={(e) => {
      setStreet(e.target.value);
      setPickupQuery(e.target.value); // triggers suggestions
    }}
  />

  {/* City */}
  <input
    className="border px-3 py-2 rounded w-full mb-2"
    placeholder="City"
    value={city}
    onChange={(e) => setCity(e.target.value)} // now user can type
  />

  {/* State */}
  <input
    className="border px-3 py-2 rounded w-full mb-2"
    placeholder="State"
    value={stateName}
    onChange={(e) => setStateName(e.target.value)} // now user can type
  />

  {/* Suggestions dropdown */}
  {/* {pickupSuggestions.length > 0 && (
    <div className="absolute top-full left-0 right-0 border rounded bg-white shadow max-h-48 overflow-y-auto z-50">
      {pickupSuggestions.map((s, i) => (
        <div
          key={i}
          className="px-3 py-2 hover:bg-purple-100 cursor-pointer text-sm"
          onClick={() => {
            // Auto-fill street, city, state
            setStreet(s.address.road || "");
            setCity(s.address.city || s.address.town || "");
            setStateName(s.address.state || "");
            // Clear query and suggestions
            setPickupQuery("");
            setPickupSuggestions([]);
          }}
        >
          {s.label}
        </div>
      ))}
    </div>
  )} */}
</div>

{/* Drop Address */}
<div className="relative">
  <div className="relative" ref={pickupRef}></div>
  <label className="block text-sm font-medium mb-1">Delivery Address</label>

  {/* Street / Area */}
  <input
    className="border px-3 py-2 rounded w-full mb-2"
    placeholder="Street / House No"
    value={dropStreet}
    onChange={(e) => {
      setDropStreet(e.target.value);
      setDropQuery(e.target.value); // triggers suggestions
    }}
  />

  {/* City */}
  <input
    className="border px-3 py-2 rounded w-full mb-2"
    placeholder="City"
    value={dropCity}
    onChange={(e) => setDropCity(e.target.value)} // user can type
  />

  {/* State */}
  <input
    className="border px-3 py-2 rounded w-full mb-2"
    placeholder="State"
    value={dropStateName}
    onChange={(e) => setDropStateName(e.target.value)} // user can type
  />

  {/* Suggestions dropdown */}
  {/* {dropSuggestions.length > 0 && (
    <div className="absolute top-full left-0 right-0 border rounded bg-white shadow max-h-48 overflow-y-auto z-50">
      {dropSuggestions.map((s, i) => (
        <div
          key={i}
          className="px-3 py-2 hover:bg-purple-100 cursor-pointer text-sm"
          onClick={() => {
            setDropStreet(s.address.road || "");
            setDropCity(s.address.city || s.address.town || "");
            setDropStateName(s.address.state || "");
            setDropQuery("");
            setDropSuggestions([]);
          }}
        >
          {s.label}
        </div>
      ))}
    </div>
  )} */}
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

          <button
  className="mt-8 px-6 py-2 bg-purple-600 text-white rounded"
  onClick={() => {
    if (!isStep1Valid) {
      alert("Fill all details correctly");
      return;
    }

    if (isSameAddress()) {
      alert("❌ Pickup and Drop address cannot be the same");
      return;
    }

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
          <div className="flex justify-between items-center mb-6 max-w-3xl">
  <h2 className="text-2xl font-bold">Select Agency</h2>

  <input
    type="text"
    placeholder="Search agency / city / address..."
    value={searchAgency}
    onChange={(e) => setSearchAgency(e.target.value)}
    className="border px-3 py-2 rounded w-72 text-sm focus:ring-2 focus:ring-purple-500"
  />
</div>
{searchAgency && (
  <p className="text-xs text-gray-500 mt-2">
    Showing results for "{searchAgency}"
  </p>
)}

{!loadingAgencies && filteredAgencies.length === 0 && (
  <p className="text-gray-500 text-sm mt-6">
    No agency found for your search
  </p>
)}


          {loadingAgencies ? (
            <div className="text-center py-12 text-gray-400">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading agencies...</p>
            </div>
          ) : agencies.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No agencies available yet</div>
          ) : (
            <div className="space-y-4 max-w-3xl">
              {filteredAgencies.map(a => (
                <div key={a.uid} className="border p-4 rounded cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                  onClick={() => { setSelectedAgency(a); setStep(3); }}
                >
                  <div>
                    <h3 className="font-semibold">{a.name}</h3>
                    <p className="text-sm text-gray-600">📍{a.address}, {a.city}</p>
                    <p className="text-sm text-gray-500">
                    📞 {a.phone}
                     </p>
                    <p className="text-yellow-500">
  ⭐ {a.rating > 0 ? a.rating.toFixed(1) : "No ratings yet"}
</p>
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
           <input
            className="border px-3 py-2 rounded w-full"
            placeholder="Enter customer full name"
            value={customerName}
            onChange={handleCustomerNameChange}
          />

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
                <input
                  className="border px-3 py-2 rounded w-full"
                  placeholder="Enter number of products"
                  value={productCount}
                  onChange={handleProductCountChange}
                />
            </div>

            {/* Total Weight */}
<div>
  <label className="block text-sm font-medium mb-1">Total Weight (kg)</label>
  <input
  className="border px-3 py-2 rounded w-full"
  placeholder="Enter total weight in kg"
  value={weight}
  onChange={handleWeightChange}
/>
</div>

{/* Pickup Date & Time — NEXT LINE */}
<div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
  
  <div>
    <label className="block text-sm font-medium mb-1">Pickup Date</label>
    <input
      type="date"
      className="border px-3 py-2 rounded w-full"
      value={pickupDate}
      min={minDate}
      onChange={(e) => setPickupDate(e.target.value)}
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">Pickup Time Slot</label>
    <select
      className="border px-3 py-2 rounded w-full"
      value={timeSlot}
      onChange={(e) => setTimeSlot(e.target.value)}
    >
      <option value="">Select time slot</option>
      <option>08:00 AM - 10:00 AM</option>
      <option>10:00 AM - 12:00 PM</option>
      <option>12:00 PM - 02:00 PM</option>
      <option>02:00 PM - 04:00 PM</option>
      <option>04:00 PM - 06:00 PM</option>
      <option>06:00 PM - 08:00 PM</option>
    </select>
  </div>

</div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Special Instructions</label>
              <textarea className="border px-3 py-2 rounded w-full" value={instructions} onChange={e => setInstructions(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-4 mt-6 mb-24">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setStep(2)}>Back</button>
            <button
  className={`px-4 py-2 rounded text-white ${
    isStep3Valid ? "bg-purple-600" : "bg-gray-400 cursor-not-allowed"
  }`}
  disabled={!isStep3Valid}
  onClick={() => setStep(4)}
>
  Next →
</button>

          </div>
        </>
      )}

      {/* STEP 4 */}
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
      <p><b>Pickup Time:</b> {timeSlot}</p>
      <p><b>Instructions:</b> {instructions}</p>
      <p>
  <b>Total Distance:</b>{" "}
  {distanceLoading ? (
    <span className="text-gray-400">Calculating...</span>
  ) : (
    <span className="text-purple-600 font-semibold">
      {distance && distance !== "N/A"
        ? `${distance} km`
        : "Agency will confirm distance"}
    </span>
  )}
</p>

    </div>

    {/* Checkbox */}
    <div className="mt-4 flex items-center gap-2">
      <input
        type="checkbox"
        id="agree"
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
        className="w-4 h-4"
      />
      <label htmlFor="agree" className="text-sm text-gray-700">
        I confirm that my shipment contains no prohibited or illegal items.
      </label>
    </div>

    {/* Buttons */}
    <div className="flex gap-4 mt-6 mb-24">
      <button
        className="px-4 py-2 bg-gray-200 rounded"
        onClick={() => setStep(3)}
      >
        Back
      </button>
      <button
        className={`px-6 py-2 rounded text-white ${
          agreed ? "bg-green-600" : "bg-gray-400 cursor-not-allowed"
        }`}
        disabled={!agreed}
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