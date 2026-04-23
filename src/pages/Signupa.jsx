import React, { useState } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Swal from "sweetalert2"; // ⭐ POPUP ADDED
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
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
const ONLY_ALPHABETS_REGEX = /^[A-Za-z\s]*$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const isAllSameDigits = (num) => /^(\d)\1{9}$/.test(num);
const BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "IDFC First Bank",
  "Yes Bank",
  "Federal Bank",
  "AU Small Finance Bank",
  "Bandhan Bank",
];
export default function SignupAgency({ onBack }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [alphaErrors, setAlphaErrors] = useState({
  fullName: false,
  city: false,
  state: false,
  agencyName: false,
});
const [phoneStartError, setPhoneStartError] = useState(false);

  //TAN: 4 letters + 5 digits + 1 letter
const TAN_REGEX = /^[A-Z]{4}\d{5}[A-Z]$/;
//Registration Number: ONLY digits, 6–10 digits
const REGISTRATION_REGEX = /^\d{6,10}$/;
const checkDuplicateAgency = async () => {
  const agenciesRef = collection(db, "agencies");

  // ----- TAN CHECK -----
  const tanQuery = query(
    agenciesRef,
    where("tanNumber", "==", formData.tanNumber)
  );
  const tanSnap = await getDocs(tanQuery);

  if (!tanSnap.empty) {
    Swal.fire({
      icon: "error",
      title: "TAN Already Exists",
      text: "This TAN number is already registered with another agency.",
    });
    return false;
  }

  // ----- REGISTRATION CHECK -----
  const regQuery = query(
    agenciesRef,
    where("registrationNumber", "==", formData.registrationNumber)
  );
  const regSnap = await getDocs(regQuery);

  if (!regSnap.empty) {
    Swal.fire({
      icon: "error",
      title: "Registration Number Exists",
      text: "This Registration Number is already used by another agency.",
    });
    return false;
  }

  // ----- BANK ACCOUNT CHECK -----
  const accQuery = query(
    agenciesRef,
    where("bankDetails.bankAccountNumber", "==", formData.bankAccountNumber)
  );
  const accSnap = await getDocs(accQuery);

  if (!accSnap.empty) {
    Swal.fire({
      icon: "error",
      title: "Bank Account Already Used",
      text: "This bank account is already linked with another agency.",
    });
    return false;
  }

  // ----- IFSC CHECK -----
  const ifscQuery = query(
    agenciesRef,
    where("bankDetails.ifsc", "==", formData.ifsc.toUpperCase())
  );
  const ifscSnap = await getDocs(ifscQuery);

  if (!ifscSnap.empty) {
    Swal.fire({
      icon: "error",
      title: "IFSC Already Used",
      text: "This IFSC code is already registered with another agency.",
    });
    return false;
  }

  return true;
};

const verifyKycWithBackend = async (imageUrl, fullName, docType) => {
  const res = await fetch("http://localhost:5000/verify-kyc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageUrl,
      name: fullName,
      docType,
      userType: "agency",
    }),
  });

  if (!res.ok) {
    throw new Error("Backend KYC failed");
  }

  return await res.json(); //  full kycResult
};


  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agencyName: "",
    perKmRate: "",          // ADD THIS LINE for adding this charge per km
    registrationNumber: "",
    tanNumber: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    kycUploaded: {
  "Aadhar Card": null
},


    bankAccountNumber: "",
    bankName: "",
    ifsc: "",
    accountHolderName: "",
  });
  //  Password mismatch (live)
const passwordMismatch =
  formData.confirmPassword.length > 0 &&
  formData.password !== formData.confirmPassword;
  //phone validation
  const phoneInvalid =
  formData.phone.length > 0 &&
  (!PHONE_REGEX.test(formData.phone) || isAllSameDigits(formData.phone));
  // TAN validation
const tanInvalid =
  formData.tanNumber.length > 0 &&
  !TAN_REGEX.test(formData.tanNumber);

// Registration number validation
const registrationInvalid =
  formData.registrationNumber.length > 0 &&
  !REGISTRATION_REGEX.test(formData.registrationNumber);
//ifsc code validation
  const ifscInvalid =
  formData.ifsc.length > 0 &&
  !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc);
// bank account validation
const bankAccountInvalid =
  formData.bankAccountNumber.length > 0 &&
  !/^\d{9,18}$/.test(formData.bankAccountNumber);


//  Step 1 completeness check
const isStep1Complete =
  formData.fullName.trim() &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
PHONE_REGEX.test(formData.phone) &&
!isAllSameDigits(formData.phone) &&  formData.password.length >= 6 &&
  !passwordMismatch &&
  formData.agencyName.trim() &&
  formData.perKmRate &&
  Number(formData.perKmRate) > 0 &&

  REGISTRATION_REGEX.test(formData.registrationNumber) &&
  TAN_REGEX.test(formData.tanNumber) &&
  formData.address.trim() &&
  formData.city.trim() &&
  formData.state.trim() &&
formData.pinCode.length === 6 && formData.pinCode !== "000000" &&
  !Object.values(alphaErrors).some(Boolean);
  const fetchCityStateFromPincode = async (pin) => {
  if (pin.length !== 6 || pin === "000000") return;

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();

    if (data[0].Status === "Success") {
      const postOffice = data[0].PostOffice[0];

      setFormData((prev) => ({
        ...prev,
        city: postOffice.District,
        state: postOffice.State,
      }));
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid PIN Code",
        text: "Please enter a valid Indian PIN code.",
      });

      setFormData((prev) => ({
        ...prev,
        city: "",
        state: "",
      }));
    }
  } catch (err) {
    console.error(err);
  }
};
  const handleChange = (field, value) => {
   const alphaOnlyFields = ["fullName", "city", "state", "agencyName"];

  if (alphaOnlyFields.includes(field)) {
    const isValid = ONLY_ALPHABETS_REGEX.test(value);
    setAlphaErrors((prev) => ({ ...prev, [field]: !isValid }));
  } 
if (field === "phone") {
  value = value.replace(/\D/g, "");

  if (value.length === 1 && !/[6-9]/.test(value)) {
    setPhoneStartError(true);
    return;
  } else {
    setPhoneStartError(false);
  }

  value = value.slice(0, 10);
}
if (field === "pinCode") {
  value = value.replace(/\D/g, "").slice(0, 6);

  if (value.length === 6 && value !== "000000") {
    fetchCityStateFromPincode(value);
  }
}
  if (field === "registrationNumber" )
   value = value.replace(/\D/g, "").slice(0, 10);
  if (field === "tanNumber")
    value = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
  if (field === "ifsc") value = value.toUpperCase();

  if (field === "email") value = value.trim();
  setFormData((prev) => ({ ...prev, [field]: value }));
};

  const slugId = (name) => name.replace(/\s+/g, "-").toLowerCase();

 const kycOptions = [
  { name: "Aadhar Card", desc: "Owner Aadhaar (person filling the form)" },
];

  /* ---------------- CLOUDINARY UPLOAD ---------------- */
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "movemate_upload");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dlh1uo28j/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const result = await res.json();
    if (!result.secure_url) throw new Error("Upload failed");
    return result.secure_url;
  };

  /* ---------------- KYC FILE HANDLER ---------------- */
  const handleFileChange = async (docName, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
  Swal.fire({
    icon: "error",
    title: "File Too Large",
    text: "Maximum file size allowed is 5MB",
  });
  return;
}
    Swal.fire({
      title: "Uploading document...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const imageUrl = await uploadToCloudinary(file);

      setFormData((prev) => ({
        ...prev,
        kycUploaded: {
          ...prev.kycUploaded,
          [docName]: imageUrl, //  URL saved
        },
      }));

      Swal.close();
      Swal.fire("Uploaded", "Document uploaded successfully", "success");
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "Image upload failed", "error");
    }
  };
  const isKycUploaded =
    Object.values(formData.kycUploaded).filter((f) => f).length > 0;

  const isBankFilled =
    formData.bankAccountNumber.trim().match(/^\d{9,18}$/) &&
    formData.bankName.trim().length > 0 &&
    formData.ifsc.trim().toUpperCase().match(/^[A-Z]{4}0[A-Z0-9]{6}$/) &&
    formData.accountHolderName.trim().length > 0;

const isSubmitEnabled = isKycUploaded && isBankFilled && isChecked;
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
      if (!PHONE_REGEX.test(formData.phone) || isAllSameDigits(formData.phone)) {
        Swal.fire({
          icon: "error",
          title: "Invalid Phone Number",
          text: "Please enter a valid 10-digit Indian mobile number!",
        });
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
      if (!formData.perKmRate || Number(formData.perKmRate) <= 0) {
        Swal.fire({
          icon: "error",
          title: "Invalid Rate",
          text: "Please enter a valid rate per KM!",
        });
        return;
      }


      if (formData.pinCode && formData.pinCode.length !== 6) {
        Swal.fire({ icon: "error", title: "Invalid PIN Code", text: "PIN code must be 6 digits!" });
        return;
      }
      if (!REGISTRATION_REGEX.test(formData.registrationNumber)) {
  Swal.fire({
    icon: "error",
    title: "Invalid Registration Number",
    text: "Registration number must be 6 to 10 digits",
  });
  return;
}

if (!TAN_REGEX.test(formData.tanNumber)) {
  Swal.fire({
    icon: "error",
    title: "Invalid TAN Number",
    text: "TAN format should be like ABCD12345E",
  });
  return;
}

// DUPLICATE CHECK BEFORE NEXT STEP
const isUnique = await checkDuplicateAgency();
if (!isUnique) return;

setStep(2);
return;
    }
    

    // ---------------- STEP 2 VALIDATION ----------------
   if (step === 2) {
    // 🔹 1. Get uploaded KYC URL
const uploadedEntry = Object.entries(formData.kycUploaded)
  .find(([_, url]) => url);

if (!uploadedEntry) {
  Swal.fire({
    icon: "error",
    title: "Upload KYC Document",
    text: "Please upload Aadhaar card!",
  });
  return;
}

const [docType, imageUrl] = uploadedEntry;

// 🔹 2. Bank validation
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

  // 🔹 3. Backend OCR verification (URL bhejo)
  const kycResult = await verifyKycWithBackend(
    imageUrl,
    formData.fullName,
    docType
  );

  if (!kycResult || !kycResult.status) {
    throw new Error("KYC verification failed");
  }

  // 🔹 4. Firebase Auth
  const userCred = await createUserWithEmailAndPassword(
    auth,
    formData.email,
    formData.password
  );

  const uid = userCred.user.uid;

  // 🔹 5. Firestore save
  await setDoc(doc(db, "agencies", uid), {
    fullName: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    agencyName: formData.agencyName,
    perKmRate: Number(formData.perKmRate),

    address: formData.address,
    city: formData.city,
    state: formData.state,
    pinCode: formData.pinCode,
    registrationNumber: formData.registrationNumber,
    tanNumber: formData.tanNumber,
    bankDetails: {
      bankAccountNumber: formData.bankAccountNumber,
      bankName: formData.bankName,
      ifsc: formData.ifsc,
      accountHolderName: formData.accountHolderName,
    },

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
    kycUrl: imageUrl,
    averageRating: 0,
    ratingCount: 0,
    role: "agency",
    createdAt: new Date(),
  });

  Swal.fire({
    icon: "success",
    title: "Registration Successful!",
    text:
      kycResult.status === "AUTO_VERIFIED"
        ? "KYC Auto Verified Successfully"
        : "KYC sent for Manual Review",
  }).then(() => navigate("/agency-dashboard"));

} catch (err) {
  console.error(err);
  Swal.fire({
    icon: "error",
    title: "Signup Failed",
    text: err.message,
  });
} finally {
  setLoading(false);
}
}
}
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
  // Rate per KM
[
  {
     name: "perKmRate",
    label: "Rate Per KM (₹)",
    type: "number",
    placeholder: "Enter rate per km",
    min: 1,   
  },
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
[
  { name: "pinCode", label: "PIN Code", placeholder: "Enter 6-digit PIN code" },
],

[
  { name: "city", label: "City", placeholder: "Enter your city" },
  { name: "state", label: "State", placeholder: "Enter your state" },
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
) : f.name === "city" ? (
  <input
    type="text"
    placeholder="City will be auto-filled from PIN code"
    className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100"
    value={formData.city}
    disabled
  />
) : f.name === "state" ? (
  <input
    type="text"
    placeholder="State will be auto-filled from PIN code"
    className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100"
    value={formData.state}
    disabled
  />
) : (
  <div>
    <input
      type={f.type || "text"}
      placeholder={f.placeholder}
      className={`w-full p-3 rounded-lg border ${
      ((f.name === "password" || f.name === "confirmPassword") &&
  passwordMismatch) ||
(f.name === "phone" && phoneInvalid)||
        (f.name === "tanNumber" && tanInvalid) ||
        (f.name === "registrationNumber" && registrationInvalid)
          ? "border-red-500"
          : "border-gray-300"
      }`}
      value={formData[f.name]}
      onChange={(e) => handleChange(f.name, e.target.value)}
    />

    {alphaErrors[f.name] && (
      <p className="text-sm text-red-500 mt-1">
        * Only alphabets are allowed
      </p>
    )}

    {f.name === "tanNumber" && tanInvalid && (
      <p className="text-sm text-red-500 mt-1">
        * Format is incorrect. It should be eg: ABCD12345E
      </p>
    )}

    {f.name === "registrationNumber" && registrationInvalid && (
      <p className="text-sm text-red-500 mt-1">
        * Registration number must be 6 to 10 digits
      </p>
    )}
    {f.name === "phone" && phoneInvalid && (
  <p className="text-sm text-red-500 mt-1">
    * Enter a valid 10-digit Indian mobile number
  </p>
)}
{f.name === "phone" && phoneStartError && (
  <p className="text-sm text-red-500 mt-1">
    * Mobile number must start with 6-9
  </p>
)}
  </div>
)}
  </div>
))}
  </div>
))}
              <button
                type="submit"
                disabled={!isStep1Complete}
                className={`w-full py-3 font-semibold rounded-lg shadow-md text-white ${
                  isStep1Complete
                    ? "bg-gradient-to-r from-blue-600 to-purple-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Continue to eKYC & Bank Details
              </button>
              {!isStep1Complete && (
            <p className="text-sm text-red-500 mt-2 text-center">
              * Please fill all required details to continue
            </p>
          )}

            </form>
          </>
        )}

        {/* ---------------- STEP 2 ---------------- */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
              e-KYC & Bank Details
            </h2>

            {/* KYC UPLOAD */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Upload e-KYC Document</h3>
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
              {/* Notes */}
              <div className="mt-4 p-4 bg-gray-50 border rounded-lg text-sm text-gray-600">
                <p className="font-medium mb-2">Important Instructions:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Image should be clear and readable</li>
                  <li>PDF, JPG, PNG formats allowed</li>
                  <li>Maximum file size: 5MB</li>
                  <li>Ensure Aadhaar details match entered information</li>
                </ul>
              </div>
            {/* BANK DETAILS */}
            <h3 className="text-lg font-semibold mb-2">🏦 Bank Details</h3>

              {[
      { name: "bankAccountNumber", label: "Bank Account Number", placeholder: "Enter bank account number" },
      { name: "bankName", label: "Bank Name", placeholder: "Enter bank name" },
      { name: "ifsc", label: "IFSC Code", placeholder: "Enter IFSC code" },
      { name: "accountHolderName", label: "Account Holder Name", placeholder: "Enter account holder's name" },
    ].map((f) => (
      <div key={f.name} className="mb-2 relative">
        <label className="block font-medium mb-1">{f.label}</label>

        {f.name === "bankName" ? (
          /* 🔽 Bank dropdown (already correct) */
          <div className="relative">
            <input
              type="text"
              className="w-full p-3 rounded-lg border border-gray-300"
              value={formData.bankName}
              onChange={(e) => {
                handleChange("bankName", e.target.value);
                setShowBankDropdown(true);
              }}
              onBlur={() => setTimeout(() => setShowBankDropdown(false), 150)}
            />

            {showBankDropdown && (
              <div className="absolute z-10 w-full bg-white border rounded-md shadow-md max-h-48 overflow-y-auto">
                {BANKS.filter((bank) =>
                  bank.toLowerCase().includes(formData.bankName.toLowerCase())
                ).map((bank) => (
                  <div
                  key={bank}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onMouseDown={() => {
                    handleChange("bankName", bank);
                    setShowBankDropdown(false);
                  }}
                >
                  {bank}
                </div>

                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <input
              type="text"
              className={`w-full p-3 rounded-lg border ${
                (f.name === "bankAccountNumber" && bankAccountInvalid) ||
                (f.name === "ifsc" && ifscInvalid)
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              value={formData[f.name]}
              onChange={(e) => handleChange(f.name, e.target.value)}
              required
            />

            {f.name === "bankAccountNumber" && bankAccountInvalid && (
              <p className="text-sm text-red-500 mt-1">
                * Invalid bank account number
              </p>
            )}

            {f.name === "ifsc" && ifscInvalid && (
              <p className="text-sm text-red-500 mt-1">
                * Invalid IFSC code
              </p>
            )}
          </>
        )}
      </div>
    ))}

{/* Checkbox */}
<div className="flex items-center mt-4">
  <input
    type="checkbox"
    id="aadhaarCheckAgency"
    checked={isChecked}
    onChange={(e) => setIsChecked(e.target.checked)}
    className="mr-2"
  />
  <label htmlFor="aadhaarCheckAgency" className="text-sm text-gray-700">
    I confirm that the Aadhaar card and bank details provided are correct and belong to me.
  </label>
</div>

{/* Buttons */}
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