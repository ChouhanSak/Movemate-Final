import React, { useState } from "react";
import { CheckCircle, Clock, Truck, Star, ArrowLeft } from "lucide-react";

export default function TrackShipment({ onBack }) {
  const [bookingId, setBookingId] = useState("");
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Dummy sample data
  const dummyData = {
    status: "In Transit",
    timeline: [
      { label: "Booking Placed", done: true },
      { label: "In Transit", done: true },
      { label: "Delivered", done: false },
    ],
  };

  const handleTrack = () => {
    if (!bookingId.trim()) return alert("Please enter Booking ID!");
    setData(dummyData);
  };

  // ⭐ FIX: Rating toggle function
  const toggleRating = (star) => {
    if (rating === star) {
      setRating(0); // unselect logic
    } else {
      setRating(star);
    }
  };

  const handleSubmitRating = () => {
    if (rating === 0) return alert("Please select a rating first!");
    setSubmitted(true);
  };

  return (
    <div className="bg-white p-6 shadow-lg rounded-xl mt-6 w-full max-w-3xl mx-auto">

      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:underline mb-4"
      >
        <ArrowLeft size={20} /> Back to Home
      </button>

      {/* Title */}
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Truck className="text-blue-600" /> Track Shipment
      </h2>

      {/* Booking ID Input */}
      {!data && (
        <div className="mt-10 text-center">
          <p className="text-lg text-gray-600 mb-3">Enter your Booking ID</p>

          <div className="flex justify-center gap-3">
            <input
              type="text"
              placeholder="Enter Booking ID"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="border p-3 rounded-lg w-72"
            />
            <button
              onClick={handleTrack}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              Track
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {data && (
        <div className="mt-10">

          {/* Shipment Status */}
          <h3 className="text-2xl font-semibold mb-5">Shipment Status</h3>

          <div className="flex flex-col gap-6 ml-4 border-l-4 pl-6">
            {data.timeline.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                {step.done ? (
                  <CheckCircle className="text-green-600" size={28} />
                ) : (
                  <Clock className="text-gray-400" size={28} />
                )}

                <p
                  className={`text-lg ${
                    step.done ? "font-semibold text-black" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            ))}
          </div>

          {/* Current Status Box */}
          <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-lg">
              📌 <span className="font-semibold">Current Status:</span> {data.status}
            </p>
          </div>

          {/* Rating Section */}
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl mt-8">
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-yellow-700">
              ⭐ Rate Your Experience
            </h3>
            <p className="text-gray-600 mb-5">Help us improve by rating!!</p>

            {/* Rating */}
            <p className="font-medium text-gray-800 mb-2">Your Rating</p>

            <div className="flex gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => toggleRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="text-3xl cursor-pointer transition"
                >
                  {(hover || rating) >= star ? "⭐" : "☆"}
                </span>
              ))}
            </div>

            {/* Show selected rating */}
            {rating > 0 && !submitted && (
              <p className="mt-2 text-gray-600">You selected: {rating} ⭐</p>
            )}

            {/* Submit Button */}
            {rating > 0 && !submitted && (
              <button
                onClick={handleSubmitRating}
                className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                Submit Rating
              </button>
            )}

            {/* After Rating Submitted */}
            {submitted && (
              <p className="mt-4 text-green-600 font-semibold">
                ⭐ Thank you! Your rating has been submitted.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
