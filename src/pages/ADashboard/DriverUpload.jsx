// src/pages/DriverUpload.jsx
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useEffect, useState, useRef } from "react";

export default function DriverUpload() {
  const { token } = useParams();

  const [valid, setValid] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const CLOUD_NAME = "dlh1uo28j";
  const UPLOAD_PRESET = "MoveMate_upload";

  /* ---------------- CLOUDINARY UPLOAD ---------------- */
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error?.message || "Upload failed");
    }

    return data.secure_url;
  };

  /* ---------------- HANDLE UPLOAD ---------------- */
  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    if (files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    try {
      setUploading(true);

      const imageUrls = [];

      for (const file of files) {
        const url = await uploadToCloudinary(file);
        imageUrls.push(url);
      }

      for (const url of imageUrls) {
        await updateDoc(doc(db, "bookings", bookingId), {
          driverPhotos: arrayUnion(url),
        });
      }

      await updateDoc(doc(db, "driver_upload_links", token), {
        used: true,
        uploadedAt: serverTimestamp(),
      });

      setSuccess(true);
      stopCamera();
    } catch (err) {
      console.error(err);
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- CAMERA FUNCTIONS ---------------- */
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // back camera
        audio: false,
      });

      setStream(mediaStream);
      setCameraOn(true);
    } catch (err) {
      console.error(err);
      alert("Camera access denied or not available");
    }
  };

  useEffect(() => {
    if (cameraOn && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraOn, stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setStream(null);
  };

  const capturePhoto = () => {
    if (files.length >= 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], `camera-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        setFiles((prev) => [...prev, file]);
      },
      "image/jpeg",
      0.8
    );
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------------- TOKEN VALIDATION ---------------- */
  useEffect(() => {
    const checkToken = async () => {
      try {
        const ref = doc(db, "driver_upload_links", token);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("Invalid upload link");
          return;
        }

        const data = snap.data();

        if (data.used) {
          setError("This link has already been used");
          return;
        }

        if (data.expiresAt.toDate() < new Date()) {
          setError("This link has expired");
          return;
        }

        setBookingId(data.bookingId);
        setValid(true);
      } catch (err) {
        console.error(err);
        setError("Something went wrong");
      }
    };

    checkToken();

    return () => stopCamera();
  }, [token]);

  /* ---------------- UI STATES ---------------- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-semibold text-red-600">{error}</h2>
        </div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h2 className="text-lg font-medium text-gray-700">
            Checking upload link…
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">
          Upload Delivery Photos
        </h2>

        {success ? (
          <div className="text-center text-green-600 font-semibold">
            ✅ Photos uploaded successfully.
            <br />
            You may close this page.
          </div>
        ) : (
          <>
            {/* Gallery Upload */}
            <input
              type="file"
              multiple
              accept="image/*"
              id="fileInput"
              className="hidden"
              disabled={uploading}
              onChange={(e) =>
                setFiles((prev) => [
                  ...prev,
                  ...Array.from(e.target.files).slice(0, 5 - prev.length),
                ])
              }
            />

            <button
              type="button"
              onClick={() => document.getElementById("fileInput").click()}
              disabled={uploading}
              className="w-full bg-gray-200 p-3 rounded-lg"
            >
              📁 Choose Photos
            </button>

            {/* Camera Section */}
            <div className="space-y-3">
              {!cameraOn ? (
                <button
                  onClick={startCamera}
                  disabled={uploading}
                  className="w-full bg-green-600 text-white p-3 rounded-lg"
                >
                  📷 Open Camera
                </button>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={capturePhoto}
                      className="flex-1 bg-blue-600 text-white p-3 rounded-lg"
                    >
                      📸 Capture
                    </button>

                    <button
                      onClick={stopCamera}
                      className="flex-1 bg-red-500 text-white p-3 rounded-lg"
                    >
                      ❌ Close
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-100 p-2 rounded-md text-sm"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 font-semibold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full h-12 rounded-lg text-white bg-blue-600"
            >
              {uploading ? "Uploading..." : "Upload Photos"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}