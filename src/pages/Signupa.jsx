import React, { useState } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { auth, db } from "../Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Swal from "sweetalert2"; // ⭐ POPUP ADDED
import { useNavigate } from "react-router-dom";


export default function SignupAgency({ onBack }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agencyName: "",
    registrationNumber: "",
    tanNumber: "",
    address: "",
    city: "",
    pinCode: "",
    kycUploaded: {},
    bankAccountNumber: "",
    bankName: "",
    ifsc: "",
    accountHolderName: "",
  });

  const handleChange = (field, value) => {
    if (field === "phone") value = value.replace(/\D/g, "").slice(0, 10);
    if (field === "pinCode") value = value.replace(/\D/g, "").slice(0, 6);
    if (field === "registrationNumber" || field === "tanNumber")
      value = value.toUpperCase();

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (docName, file) => {
    setFormData((prev) => ({
      ...prev,
      kycUploaded: { ...prev.kycUploaded, [docName]: file },
    }));
  };

  const slugId = (name) => name.replace(/\s+/g, "-").toLowerCase();

  const kycOptions = [
    { name: "Certificate of Incorporation", desc: "Company registration certificate" },
    { name: "PAN Card of Company", desc: "Company tax identification" },
    { name: "GST Registration Certificate", desc: "GST registration certificate" },
  ];

  const isKycUploaded =
    Object.values(formData.kycUploaded).filter((f) => f).length > 0;

  const isBankFilled =
    formData.bankAccountNumber.trim().match(/^\d{9,18}$/) &&
    formData.bankName.trim().length > 0 &&
    formData.ifsc.trim().toUpperCase().match(/^[A-Z]{4}0[A-Z0-9]{6}$/) &&
    formData.accountHolderName.trim().length > 0;

  const isSubmitEnabled = isKycUploaded && isBankFilled;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ---------------- STEP 1 VALIDATION ----------------
    if (step === 1) {
      if (!formData.fullName.trim()) {
        Swal.fire({ icon: "error", title: "Full Name Missing", text: "Please enter your full name!" });
        return;
      }

      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        Swal.fire({ icon: "error", title: "Invalid Email", text: "Please enter a valid email!" });
        return;
      }

      if (formData.phone.length !== 10) {
        Swal.fire({ icon: "error", title: "Invalid Phone Number", text: "Phone number must be 10 digits!" });
        return;
      }

      if (formData.password.length < 6) {
        Swal.fire({ icon: "error", title: "Weak Password", text: "Password must be at least 6 characters!" });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        Swal.fire({ icon: "error", title: "Password Mismatch", text: "Passwords do not match!" });
        return;
      }

      if (formData.pinCode && formData.pinCode.length !== 6) {
        Swal.fire({ icon: "error", title: "Invalid PIN Code", text: "PIN code must be 6 digits!" });
        return;
      }

      setStep(2);
      return;
    }

    // ---------------- STEP 2 VALIDATION ----------------
    if (step === 2) {
      if (!isKycUploaded) {
        Swal.fire({
          icon: "error",
          title: "KYC Missing",
          text: "Please upload at least one KYC document!",
        });
        return;
      }

      if (!isBankFilled) {
        Swal.fire({
          icon: "error",
          title: "Invalid Bank Details",
          text: "Please fill all valid bank details!",
        });
        return;
      }

      try {
        setLoading(true);

        const userCred = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        const uid = userCred.user.uid;

        await setDoc(doc(db, "agencies", uid), {
          ...formData,
          createdAt: new Date(),
        });

        Swal.fire({
          icon: "success",
          title: "Registration Successful!",
          text: "Your agency account has been created.",
        });

        setLoading(false);
        onBack?.();
      } catch (error) {
        console.error("❌ Signup Error:", error);

        Swal.fire({
          icon: "error",
          title: "Signup Failed",
          text: error.message,
        });

        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border p-8 relative">

        <button
  onClick={() => (step === 1 ? navigate("/select-user") : setStep(1))}
>
  <ArrowLeft /> Back
</button>

        {/* ---------------- STEP 1 ---------------- */}
        {step === 1 && (
          <>
            <div className="flex items-center justify-center gap-3 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg shadow-lg">
              <Building2 size={28} className="text-white" />
              <h2 className="text-3xl font-bold text-white">Agency Registration</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
             {[
  // Full name (single row)
  [
    { name: "fullName", label: "Full Name", placeholder: "Enter your full name" },
  ],

  // Email + Phone (same row)
  [
    { name: "email", label: "Email Address", placeholder: "Enter your email address" },
    { name: "phone", label: "Phone Number", placeholder: "Enter 10-digit phone number" },
  ],

  // Passwords (same row)
  [
    { name: "password", label: "Password", type: "password", placeholder: "Create a password" },
  ],

  [
     { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Re-enter your password" },
  ],
  // Agency name
  [
    { name: "agencyName", label: "Agency Name", placeholder: "Enter your agency name" },
  ],

  // Registration + TAN
  [
    { name: "registrationNumber", label: "Registration Number", placeholder: "Enter registration number" },
    { name: "tanNumber", label: "TAN Number", placeholder: "Enter TAN number" },
  ],

  // Address
  [
    { name: "address", label: "Business Address", placeholder: "Enter business address" },
  ],

  // City + PIN
  [
    { name: "city", label: "City", placeholder: "Enter your city" },
    { name: "pinCode", label: "PIN Code", placeholder: "Enter 6-digit PIN code" },
  ],
].map((row, idx) => (
  <div
    key={idx}
    className={`grid gap-4 ${
      row.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
    }`}
  >
    {row.map((f) => (
      <div key={f.name}>
        <label className="block font-medium mb-1">{f.label}</label>

        {f.name === "address" ? (
          <textarea
            rows={3}
            className="w-full p-3 rounded-lg border border-gray-300"
            placeholder={f.placeholder}
            value={formData[f.name]}
            onChange={(e) => handleChange(f.name, e.target.value)}
          />
        ) : (
          <input
            type={f.type || "text"}
            placeholder={f.placeholder}
            className="w-full p-3 rounded-lg border border-gray-300"
            value={formData[f.name]}
            onChange={(e) => handleChange(f.name, e.target.value)}
          />
        )}
      </div>
    ))}
  </div>
))}

             
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md"
              >
                Continue to KYC & Bank Details
              </button>
            </form>
          </>
        )}

        {/* ---------------- STEP 2 ---------------- */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
              KYC & Bank Details
            </h2>

            {/* KYC UPLOAD */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Upload e-KYC Document</h3>
              <p className="text-gray-500 mb-2">Upload any ONE:</p>

              {kycOptions.map((doc) => {
                const id = slugId(doc.name);
                const uploaded = !!formData.kycUploaded[doc.name];

                return (
                  <div
                    key={doc.name}
                    className={`flex justify-between items-center p-4 rounded-lg border mb-2 ${
                      uploaded ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-100"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{doc.name}</p>
                      <p className="text-sm text-gray-600">{doc.desc}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id={id}
                        className="hidden"
                        onChange={(e) =>
                          handleFileChange(doc.name, e.target.files[0])
                        }
                      />
                      <label
                        htmlFor={id}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md cursor-pointer"
                      >
                        {uploaded ? "Change" : "Upload"}
                      </label>
                      {uploaded && <span className="text-green-600">✔</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BANK DETAILS */}
            <h3 className="text-lg font-semibold mb-2">🏦 Bank Details</h3>

            {[
              { name: "bankAccountNumber", label: "Bank Account Number", placeholder: "Enter bank account number" },
              { name: "bankName", label: "Bank Name", placeholder: "Enter bank name" },
              { name: "ifsc", label: "IFSC Code", placeholder: "Enter IFSC code" },
              { name: "accountHolderName", label: "Account Holder Name", placeholder: "Enter account holder's name" },
            ].map((f) => (
              <div key={f.name} className="mb-2">
                <label className="block font-medium mb-1">{f.label}</label>
                <input
                  type="text"
                  placeholder={f.placeholder}
                  className="w-full p-3 rounded-lg border border-gray-300"
                  value={formData[f.name]}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  required
                />
              </div>
            ))}

            {/* BUTTONS */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2 border rounded-lg"
              >
                Previous
              </button>

              <button
                type="submit"
                disabled={!isSubmitEnabled}
                className={`px-6 py-2 rounded-lg font-semibold text-white ${
                  isSubmitEnabled
                    ? "bg-gradient-to-r from-blue-600 to-purple-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
