// import React, { useState } from "react";
// import { CheckCircle, Clock, Truck, Star } from "lucide-react";

// export default function TrackShipment() {
//   const [bookingId, setBookingId] = useState("");
//   const [data, setData] = useState(null); // after clicking track
//   const [rating, setRating] = useState(0);

//   // Fake data – later replace with Firebase data
//   const dummyData = {
//     status: "In Transit",
//     timeline: [
//       { label: "Booking Placed", done: true },
//       { label: "Agency Assigned", done: true },
//       { label: "Shipment Picked", done: true },
//       { label: "In Transit", done: true },
//       { label: "Out for Delivery", done: false },
//       { label: "Delivered", done: false },
//     ],
//   };

//   const handleTrack = () => {
//     if (bookingId.trim() === "") return alert("Please enter Booking ID!");

//     // later: fetch from firebase  
//     setData(dummyData);
//   };

//   return (
//     <div className="bg-white p-6 shadow-lg rounded-xl mt-6">
//       {/* Title */}
//       <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
//         <Truck className="text-blue-600" /> Track Shipment
//       </h2>

//       {/* Booking ID Input */}
//       {!data && (
//         <div className="flex gap-3 items-center">
//           <input
//             type="text"
//             placeholder="Enter Booking ID"
//             value={bookingId}
//             onChange={(e) => setBookingId(e.target.value)}
//             className="border p-3 rounded-lg w-64"
//           />

//           <button
//             onClick={handleTrack}
//             className="bg-blue-600 text-white px-5 py-3 rounded-lg"
//           >
//             Track
//           </button>
//         </div>
//       )}

//       {/* Timeline Section */}
//       {data && (
//         <div className="mt-8">
//           <h3 className="text-xl font-semibold mb-4">Shipment Status</h3>

//           <div className="flex flex-col gap-6 ml-4 border-l-4 pl-6">
//             {data.timeline.map((step, index) => (
//               <div key={index} className="flex items-center gap-4">
//                 {step.done ? (
//                   <CheckCircle className="text-green-600" size={26} />
//                 ) : (
//                   <Clock className="text-gray-400" size={26} />
//                 )}

//                 <p
//                   className={`text-lg ${
//                     step.done ? "font-semibold text-black" : "text-gray-500"
//                   }`}
//                 >
//                   {step.label}
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* Current Status Box */}
//           <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-lg">
//             <p className="text-lg">
//               📌 <span className="font-semibold">Current Status:</span>{" "}
//               {data.status}
//             </p>
//           </div>

//           {/* Rating Section */}
//           <div className="mt-10">
//             <h3 className="text-xl font-semibold mb-3">Rate Your Experience</h3>

//             <div className="flex gap-2">
//               {[1, 2, 3, 4, 5].map((s) => (
//                 <Star
//                   key={s}
//                   size={36}
//                   onClick={() => setRating(s)}
//                   className={`cursor-pointer ${
//                     rating >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
//                   }`}
//                 />
//               ))}
//             </div>

//             {rating > 0 && (
//               <p className="mt-2 text-gray-600">You rated: {rating}⭐</p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
