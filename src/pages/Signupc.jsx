import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { User as UserIcon } from "lucide-react";
import Swal from "sweetalert2"; // 📌 Added for popups
import { useNavigate } from "react-router-dom";
const ONLY_ALPHABETS_REGEX = /^[A-Za-z\s]*$/;
const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
];
export default function Signupc({ userType, onBack }) {
const verifyKycWithBackend = async (imageUrl, fullName, docType) => {
  const res = await fetch("http://localhost:5000/verify-kyc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageUrl,
      name: fullName,
      docType,
    }),
  });
  if (!res.ok) {
    throw new Error("Backend KYC failed");
  }
  return await res.json();
};
  const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "movemate_upload");
  const res = await fetch(
   "https://api.cloudinary.com/v1_1/dlh1uo28j/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await res.json();
  return data.secure_url;
};
  useEffect(() => {
    console.log("✅ SignUpForm mounted", { userType });
  }, [userType]);
const navigate = useNavigate();
const [showStateDropdown, setShowStateDropdown] = useState(false);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    pinCode: "",
    city: "",
    state:"",
     kycFile: null,
  kycType: "",
  });
  const passwordMismatch =
  formData.confirmPassword.length > 0 &&
  formData.password !== formData.confirmPassword;
 const handleChange = (field, value) => {

  // Numbers block for Name, City, State
  if (["fullName", "city", "state"].includes(field)) {
    if (!ONLY_ALPHABETS_REGEX.test(value)) return;
  }

  if (field === "phone") value = value.replace(/\D/g, "").slice(0, 10);
  if (field === "pinCode") value = value.replace(/\D/g, "").slice(0, 6);

  setFormData((prev) => ({ ...prev, [field]: value }));
};

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    //  VALIDATION FOR STEP 1
    if (step === 1) {
      if (!formData.fullName.trim()) {
        Swal.fire({ icon: "error", title: "Full Name Missing", text: "Full Name cannot be empty!" });
        return;
      }
      if (!formData.state.trim()) {
      Swal.fire({ icon: "error", title: "State Missing", text: "Please select your state." });
     return;
     }
      if (!validateEmail(formData.email)) {
        Swal.fire({ icon: "error", title: "Invalid Email", text: "Please enter a valid email address." });
        return;
      }
      if (formData.phone.length !== 10) {
        Swal.fire({ icon: "error", title: "Invalid Phone", text: "Phone number must be 10 digits." });
        return;
      }
      if (!formData.password || !formData.confirmPassword) {
        Swal.fire({ icon: "error", title: "Password Missing", text: "Please fill both password fields." });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        Swal.fire({ icon: "error", title: "Password Mismatch", text: "Passwords do not match!" });
        return;
      }
      if (!formData.address.trim()) {
        Swal.fire({ icon: "error", title: "Address Missing", text: "Please enter your complete address." });
        return;
      }
      if (!formData.city.trim()) {
        Swal.fire({ icon: "error", title: "City Missing", text: "Please enter your city." });
        return;
      }
      if (formData.pinCode.length !== 6) {
        Swal.fire({ icon: "error", title: "Invalid PIN Code", text: "PIN Code must be 6 digits." });
        return;
      }
      setStep(2);
      return;
    }
    //  VALIDATION FOR STEP 2 (KYC)
  if (step === 2) {

  if (!formData.kycFile) {
    Swal.fire({
  icon: "error",
  title: "Upload KYC Document",
  text: "Please upload Aadhaar or PAN card image!"
});

    return;
  }

  try {
    setLoading(true);

    //  Upload Aadhaar to Cloudinary
    const kycUrl = await uploadToCloudinary(formData.kycFile);

    //  Call backend OCR for auto verification
    const kycResult = await verifyKycWithBackend(
  kycUrl,
  formData.fullName,
  formData.kycType
);
// ❗ Safety check (VERY IMPORTANT)
if (!kycResult || !kycResult.status) {
  throw new Error("eKYC verification failed");
}

    //  Create user in Firebase
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );
    const uid = userCredential.user.uid;

   await setDoc(doc(db, "customers", uid), {
  fullName: formData.fullName,
  email: formData.email,
  phone: formData.phone,
  userType: "customer",
  state: formData.state,
  address: formData.address,   
  city: formData.city,          
  pinCode: formData.pinCode,   

kyc: {
  status: kycResult.status,
  extracted: {
    nameFromDoc: kycResult.extracted?.nameFromDoc || null,
    dob: kycResult.extracted?.dob || null,
    gender: kycResult.extracted?.gender || null,
    maskedAadhaar: kycResult.extracted?.maskedAadhaar || null,
    ageBand: kycResult.extracted?.ageBand || null,
  },

  note: kycResult.note || null,
  review: {
    reviewedBy: null,
    reviewedAt: null,
    reason: null
  }
},
kycUrl: kycUrl,
createdAt: new Date(),
});


    Swal.fire({
      icon: "success",
      title: "Registration Successful!",
      text:
  kycResult.status === "AUTO_VERIFIED"
    ? "eKYC Auto Verified Successfully"
    : "eKYC sent for Manual Review"

    }).then(() => navigate("/customer-dashboard"));

    setLoading(false);
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Signup Failed", text: err.message });
    setLoading(false);
  }
}
  }

  const kycDocuments = [
    { name: "Aadhar Card", desc: "Government issued ID proof" },
  ];
  
  const slugId = (name) => name.replace(/\s+/g, "-").toLowerCase();

 const isAnyDocUploaded = !!formData.kycFile;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <button
  onClick={() => step === 1 ? navigate("/select-user") : setStep(1)}
  className="self-start mb-4 text-black font-semibold hover:underline"
>
  ← Back
</button>


      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center flex items-center justify-center gap-3">
          <UserIcon size={28} />
          <h2 className="text-2xl font-bold">Create Customer Account</h2>
        </div>

        <div className="p-8">
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full p-3 border rounded-lg"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
              </div>

               {/* Email + Phone */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div>
      <label className="block text-sm font-medium mb-1">Email</label>
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full px-3 py-2.5 border rounded-lg text-sm"
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Phone</label>
      <input
        type="tel"
        placeholder="10-digit phone"
        className="w-full px-3 py-2.5 border rounded-lg text-sm"
        value={formData.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
      />
    </div>
  </div>

              {/* Password */}
              <div>
                <label className="block font-medium mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  className="w-full p-3 border rounded-lg"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block font-medium mb-1">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  className="w-full p-3 border rounded-lg"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                />
              </div>

              {/* Address */}
              <div>
                <label className="block font-medium mb-1">Address</label>
                <textarea
                  placeholder="Enter your address"
                  className="w-full p-3 border rounded-lg"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>

 {/* City + State */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block font-medium mb-1">City</label>
    <input
      placeholder="Enter your city"
      className="w-full p-3 border rounded-lg"
      value={formData.city}
      onChange={(e) => handleChange("city", e.target.value)}
    />
  </div>

  <div>
  <label className="block font-medium mb-1">State</label>

  <div className="relative">
    <input
      type="text"
      placeholder="Select State"
      className="w-full p-3 border rounded-lg bg-white"
      value={formData.state}
      onChange={(e) => {
        handleChange("state", e.target.value);
        setShowStateDropdown(true);
      }}
      onFocus={() => setShowStateDropdown(true)}
      onBlur={() => setTimeout(() => setShowStateDropdown(false), 150)}
    />

    {showStateDropdown && (
      <div className="absolute left-0 top-full mt-1 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
        {STATES.filter((s) =>
          s.toLowerCase().includes(formData.state.toLowerCase())
        ).map((state) => (
          <div
            key={state}
            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
            onMouseDown={() => {
              handleChange("state", state);
              setShowStateDropdown(false);
            }}
          >
            {state}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
</div>


{/* PIN Code */}
<div>
  <label className="block font-medium mb-1">PIN Code</label>
  <input
    placeholder="6-digit PIN code"
    className="w-full p-3 border rounded-lg"
    value={formData.pinCode}
    onChange={(e) => handleChange("pinCode", e.target.value)}
  />
</div>

              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg">
               Next
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-bold text-center mb-2">Customer eKYC Verification</h2>
              <p className="text-sm text-gray-500 text-center mb-4">Upload your document</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {kycDocuments.map((doc) => {
                  const id = slugId(doc.name);
                  return (
                    <div key={doc.name} className="flex justify-between items-center bg-gray-100 p-4 rounded-lg border">
                      <div>
                        <p className="font-semibold">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.desc}</p>
                      </div>

                     <div className="space-x-2 flex items-center gap-2">
  <input
    type="file"
    id={id}
    className="hidden"
    accept="image/*"
    onChange={(e) => {
      if (e.target.files && e.target.files.length > 0) {
        setFormData((prev) => ({
          ...prev,
          kycFile: e.target.files[0], // actual file
          kycType: doc.name,          //  Aadhaar / PAN / Voter
        }));
      }
    }}
  />

                        <label htmlFor={id} className="px-3 py-1 bg-blue-600 text-white rounded cursor-pointer">
                          Upload
                        </label>

                        {formData.kycFile && formData.kycType === doc.name && (
  <span className="text-green-600 font-semibold">✔ Uploaded</span>
)}

                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-between mt-6">
                  <button type="button" onClick={() => setStep(1)} className="px-5 py-2 border rounded-lg">
                    Previous
                  </button>

                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-lg text-white ${
                      isAnyDocUploaded ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!isAnyDocUploaded}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}