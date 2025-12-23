import React, { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { userType } = useParams(); // customer / agency

  const handleReset = async () => {
    if (!email) {
      alert("Please enter your registered email");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent to your email 📧\nCheck Inbox / Spam");
      navigate(
        userType === "customer"
          ? "/login/customer"
          : "/login/agency"
      );
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        
        {/* Heading */}
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Forgot Password?
        </h2>
        <p className="text-sm text-center text-gray-500 mt-2 mb-6">
          Enter your registered email and we’ll send you a reset link.
        </p>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition"
        >
          {loading ? "Sending link..." : "Send Reset Link"}
        </button>

        {/* Back to login */}
        <p className="text-center text-sm mt-6 text-gray-600">
          Remembered your password?{" "}
          <button
            className="text-blue-600 font-medium hover:underline"
            onClick={() =>
              navigate(
                userType === "customer"
                  ? "/login/customer"
                  : "/login/agency"
              )
            }
          >
            Back to Login
          </button>
        </p>

        {/* Footer note */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Make sure to check your spam folder as well.
        </p>
      </div>
    </div>
  );
}
