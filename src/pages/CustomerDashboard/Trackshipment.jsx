import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc
} from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { CheckCircle, Clock, Truck } from "lucide-react";
import { db } from "../../firebase";
import { runTransaction } from "firebase/firestore";
export default function TrackShipment({ onBack, fromSidebar = false}) {
  const location = useLocation();
const navigate = useNavigate();
const handleBack = () => {
  if (location.state?.from === "all-bookings") {
    navigate("/customer-dashboard", {
      state: { page: "all" }
    });
  } else {
    navigate("/customer-dashboard"); // fallback (overview)
  }
};
const queryParams = new URLSearchParams(location.search);
const bookingIdFromURL = queryParams.get("bookingId");
const [bookingId, setBookingId] = useState(bookingIdFromURL || "");
  const [ratingLoading, setRatingLoading] = useState(false);
const [disputeLoading, setDisputeLoading] = useState(false);
  
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [comment, setComment] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
const [stream, setStream] = useState(null);
const videoRef = React.useRef(null);
const canvasRef = React.useRef(null);
const CLOUD_NAME = "dlh1uo28j";
const UPLOAD_PRESET = "MoveMate_upload";

  // Dispute states
 const [disputeFiles, setDisputeFiles] = useState([]);
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);
  React.useEffect(() => {
  if (cameraOpen && videoRef.current && stream) {
    videoRef.current.srcObject = stream;
  }
}, [cameraOpen, stream]);
React.useEffect(() => {
  return () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
  };
}, [stream]);
const removeDisputeImage = (indexToRemove) => {
  setDisputeFiles((prev) =>
    prev.filter((_, index) => index !== indexToRemove)
  );
};
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  const data = await res.json();
  console.log("☁️ Cloudinary response:", data);

  if (!res.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
};

const openCamera = async () => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });

    setStream(mediaStream);
    setCameraOpen(true);
  } catch (err) {
    alert("Camera access denied or not available");
    console.error(err);
  }
};

  const fixRatings = async () => {
  const snap = await getDocs(collection(db, "ratings"));

  for (const r of snap.docs) {
    const data = r.data();

    if (data.agencyId) continue; // already fixed

    if (!data.bookingId) continue;

    const bookingSnap = await getDoc(doc(db, "bookings", data.bookingId));
    if (!bookingSnap.exists()) continue;

    await updateDoc(doc(db, "ratings", r.id), {
      agencyId: bookingSnap.data().agencyId,
    });
  }

  console.log("DONE: agencyId added to all ratings");
};
const checkIfAlreadyRated = async (bookingId) => {
  const ratingRef = doc(db, "ratings", bookingId);
  const snap = await getDoc(ratingRef);
  return snap.exists(); // true = already rated
};

const capturePhoto = () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  canvas.toBlob((blob) => {
    if (!blob) return;

    if (disputeFiles.length >= 5) {
      alert("Max 5 images allowed");
      return;
    }

    const file = new File([blob], `capture-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    setDisputeFiles((prev) => [...prev, file]);
  }, "image/jpeg");

  stopCamera();
};
const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
  setStream(null);
  setCameraOpen(false);
};

const addRating = async (bookingId, rating, comment) => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      alert("Booking not found");
      return;
    }

    const agencyId = bookingSnap.data().agencyId;
    const agencyRef = doc(db, "agencies", agencyId);

    // Rating doc ID == bookingId (enforces one rating per booking)
    const ratingRef = doc(db, "ratings", bookingId);

    await runTransaction(db, async (transaction) => {

      const existingRating = await transaction.get(ratingRef);
      if (existingRating.exists()) {
        throw new Error("ALREADY_RATED");
      }

      const agencySnap = await transaction.get(agencyRef);

      let count = 0;
      let avg = 0;

      if (agencySnap.exists()) {
        const d = agencySnap.data();
        count = d.ratingCount || 0;
        avg = d.averageRating || 0;
      }

      const newCount = count + 1;
      const newAvg = Number(((avg * count + rating) / newCount).toFixed(1));

      transaction.set(ratingRef, {
        bookingId,
        agencyId,
        rating,
        comment,
        createdAt: new Date(),
      });

      transaction.set(
        agencyRef,
        { ratingCount: newCount, averageRating: newAvg },
        { merge: true }
      );
    });

    console.log("Rating saved & agency updated correctly!");
  } catch (err) {
  console.error("🔥 Rating Error:", err);
  alert(err.message || "Rating failed");
}

};



  // Timeline logic based on status
  const getTimelineFromStatus = (status) => {
    switch (status) {
      case "BOOKING_PLACED":
        return [
          { label: "Booking Placed", done: true },
          { label: "In Transit", done: false },
          { label: "Delivered", done: false },
        ];
      case "IN_TRANSIT":
        return [
          { label: "Booking Placed", done: true },
          { label: "In Transit", done: true },
          { label: "Delivered", done: false },
        ];
      case "COMPLETED":
        return [
          { label: "Booking Placed", done: true },
          { label: "In Transit", done: true },
          { label: "Delivered", done: true },
        ];
      default:
        return [
          { label: "Booking Placed", done: false },
          { label: "In Transit", done: false },

          { label: "Delivered", done: false },
        ];
    }
  };

  // Track shipment by document ID
  const handleTrack = async () => {
    if (!bookingId.trim()) return alert("Please enter Booking ID!");

    try {
      const docRef = doc(db, "bookings", bookingId); // using document ID
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return alert("No booking found with this ID");
      }

      const booking = docSnap.data();
      console.log("STATUS FROM FIRESTORE:", booking.status);
     setData({
  status: booking.status,
  timeline: getTimelineFromStatus(booking.status),
  completedAt: booking.completedAt
    ? booking.completedAt.toDate()
    : null,
    canRaiseDispute: booking.canRaiseDispute
});
      const alreadyRated = await checkIfAlreadyRated(bookingId);
      setSubmitted(alreadyRated);

    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    }
  };

  // Rating handlers
  const toggleRating = (star) => {
    setRating(rating === star ? 0 : star);
  };

 const handleSubmitRating = async () => {
  if (!bookingId.trim()) {
    return alert("Booking ID missing. Please track shipment first.");
  }

  //  Restriction 1: status COMPLETED hona chahiye
  if (data.status !== "COMPLETED") {
    return alert("Rating can be submitted only after delivery is completed.");
  }

  if (rating === 0) {
    return alert("Please select a rating first!");
  }

  //  Restriction 2: ek hi baar rating
  const alreadyRated = await checkIfAlreadyRated(bookingId);
  if (alreadyRated) {
    return alert("You have already rated this booking.");
  }

  try {
    setRatingLoading(true); 

    await addRating(bookingId, rating, comment);

    setSubmitted(true);
  } catch (err) {
    console.error(err);
    alert("Rating failed");
  } finally {
    setRatingLoading(false);
  }
};
const handleDisputeFileChange = (e) => {
  const files = Array.from(e.target.files);

  if (files.length + disputeFiles.length > 5) {
    alert("You can upload maximum 5 images");
    return;
  }

  setDisputeFiles((prev) => [...prev, ...files]);
};
  const handleSubmitDispute = async () => {
    console.log("🔥 Submit Dispute clicked");
  if (disputeFiles.length === 0) {
    alert("Please upload at least one image!");
    return;
  }

  if (!disputeDescription.trim()) {
    alert("Please enter a description!");
    return;
  }

  try {
    setDisputeLoading(true);
    // Upload images to Cloudinary
    console.log("📁 Files before upload:", disputeFiles);
    const uploadedImages = [];

    for (const file of disputeFiles) {
      const uploaded = await uploadToCloudinary(file);
      uploadedImages.push(uploaded); 
      // { url, publicId }
    }
    //  Save URLs in Firestore
    await addDoc(collection(db, "disputes"), {
      bookingId,
      description: disputeDescription,
      images: uploadedImages,
      status: "OPEN",
      createdAt: new Date(),
    });

    //  Reset UI
    setDisputeFiles([]);
    setDisputeDescription("");
    setDisputeSubmitted(true);

  } catch (error) {
    console.error(error);
    alert("Dispute submission failed");
  }
   finally {
    setDisputeLoading(false); 
  }
};

  

  return (
    <div className="bg-white p-6 shadow-lg rounded-xl mt-6 w-full max-w-3xl mx-auto">
      {!fromSidebar && (
        <button
          onClick={handleBack}
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Back
        </button>
      )}

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
              placeholder="Enter Booking ID (Document ID)"
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

      {/* Timeline & Status */}
      {data && (
        <div className="mt-10">
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

          {/* Current Status */}
          <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-lg">
              📌 <span className="font-semibold">Current Status:</span>{" "}
              {[...data.timeline].reverse().find((step) => step.done)?.label ||
                "Pending"}
            </p>
          </div>
          {/* ✅ Completed Date (ADD HERE) */}
{data.status === "COMPLETED" && data.completedAt && (
  <div className="mt-3 text-green-700 font-medium">
    ✅ Completed At: {data.completedAt.toLocaleString()}
  </div>
)}
          {/* Rating Section */}
{data.status === "COMPLETED" && (
  <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl mt-8">
    <h3 className="text-2xl font-semibold flex items-center gap-2 text-yellow-700">
      ⭐ Rate Your Experience
    </h3>

    {!submitted && (
      <>
        <p className="text-gray-600 mb-5">Help us improve by rating!</p>
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

        <div className="mt-4">
          <p className="font-medium text-gray-800 mb-1">
            Add a Comment (optional)
          </p>
          <textarea
            placeholder="Write your feedback here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {rating > 0 && (
          <button
  onClick={handleSubmitRating}
  disabled={ratingLoading}
  className={`mt-4 px-6 py-3 rounded-lg text-white ${
    ratingLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
  }`}
>
  {ratingLoading ? "Submitting..." : "Submit Rating"}
</button>
        )}
      </>
    )}

    {submitted && (
      <p className="mt-4 text-green-600 font-semibold">
        ⭐ Thank you! Your rating has been submitted.
      </p>
    )}
  </div>
)}
          {/* Dispute Section */}
          {data.timeline[data.timeline.length - 1].done && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl mt-8">
              <h3 className="text-2xl font-semibold flex items-center gap-2 text-red-600">
                ⚠️ Raise a Dispute
              </h3>
              {!data.canRaiseDispute && (
  <p className="text-red-600 font-medium mb-3">
    ⚠️ Dispute is disabled because you confirmed delivery without uploading photos.
  </p>
)}
              <p className="text-gray-600 mb-5">
                If there is any issue with your delivery, you can upload a photo
                and describe the defect.
              </p>

              {!disputeSubmitted && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
  <p className="text-gray-600 flex-1">
    Upload photos (max 5)
  </p>

 <button
  onClick={openCamera}
  disabled={!data.canRaiseDispute}
  className={`p-3 rounded-full ${
    data.canRaiseDispute
      ? "bg-gray-200 hover:bg-gray-300"
      : "bg-gray-300 cursor-not-allowed"
  }`}
>
  📷
</button>
 <label
    htmlFor="dispute-upload"
    className="bg-gray-200 hover:bg-gray-300 p-3 rounded-full cursor-pointer"
    title="Upload from device"
  >
    📁
  </label>
</div>

<input
  type="file"
  accept="image/*"
  capture="environment"
  multiple
  id="dispute-upload"
  onChange={handleDisputeFileChange}
  className="hidden"
  disabled={!data.canRaiseDispute}
/>

                  <textarea
  disabled={!data.canRaiseDispute}
  placeholder="Describe the defect or issue"
  value={disputeDescription}
  onChange={(e) => setDisputeDescription(e.target.value)}
  className="border p-2 rounded-lg mt-2 w-full h-24 resize-none"
/>
                 {disputeFiles.length > 0 && (
  <div className="grid grid-cols-3 gap-3 mt-3">
    {disputeFiles.map((file, index) => (
      <div key={index} className="relative">
        <img
          src={URL.createObjectURL(file)}
          alt={`Dispute ${index + 1}`}
          className="w-32 h-32 object-cover rounded-lg border"
        />

        <button
          onClick={() => removeDisputeImage(index)}
          className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
          title="Remove image"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
)}
                  <button
  onClick={() => {
    if (!data.canRaiseDispute) {
      alert("You cannot raise a dispute because you confirmed delivery without uploading proof photos.");
      return;
    }

    handleSubmitDispute();
  }}
  disabled={disputeLoading}
  className={`mt-3 px-6 py-3 rounded-lg text-white ${
    disputeLoading ? "bg-gray-400" : "bg-red-600"
  }`}
>
  {disputeLoading ? "Submitting..." : "Submit Dispute"}
</button>
                </div>
              )}

              {disputeSubmitted && (
                <p className="mt-3 text-green-600 font-semibold">
                  ✅ Dispute submitted successfully!
                </p>
              )}
            </div>
          )}
        </div>
      )}
      {/* LIVE CAMERA MODAL */}
{cameraOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded-lg w-80">
      <video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  className="w-full rounded"
/>


      <canvas ref={canvasRef} className="hidden" />

      <div className="flex justify-between mt-3">
        <button
          onClick={capturePhoto}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Capture
        </button>

        <button
          onClick={stopCamera}
          className="bg-red-500 text-white px-4 py-2 rounded"
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