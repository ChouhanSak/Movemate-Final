// // src/components/SignupSiteManager.jsx
// import React, { useState } from "react";
// import { ArrowLeft, ShieldCheck } from "lucide-react";
// import { db, auth } from "../Firebase"; // your firebase.js
// import { collection, doc, setDoc } from "firebase/firestore";
// import { createUserWithEmailAndPassword } from "firebase/auth";

// export default function SignupSiteManager({ onBack }) {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     managerId: "",
//     role: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // ✅ Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email)) {
//       alert("❌ Please enter a valid email address!");
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       alert("❌ Passwords do not match!");
//       return;
//     }

//     setLoading(true);

//     try {
//       // 1️⃣ Create user in Firebase Auth
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         formData.email,
//         formData.password
//       );
//       const user = userCredential.user;

//       // 2️⃣ Store Site Manager info in Firestore with UID as document ID
//       await setDoc(doc(db, "siteManagers", user.uid), {
//         uid: user.uid,
//         fullName: formData.fullName,
//         email: formData.email,
//         managerId: formData.managerId,
//         role: formData.role,
//         createdAt: new Date(),
//       });

//       alert("🎉 Site Manager Registered Successfully!");
//       setFormData({
//         fullName: "",
//         email: "",
//         password: "",
//         confirmPassword: "",
//         managerId: "",
//         role: "",
//       });

//       onBack(); // go back to previous screen
//     } catch (error) {
//       console.error("❌ Firebase Error:", error);
//       alert("Error: " + error.message);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-100 p-6">
//       <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8 relative">
//         {/* Back Button */}
//         <button
//           onClick={onBack}
//           className="flex items-center mb-4 text-gray-700 font-semibold hover:underline"
//         >
//           <ArrowLeft className="w-5 h-5 mr-1" /> Back
//         </button>

//         {/* Title with Icon */}
//         <div className="flex items-center justify-center gap-2 mb-6">
//           {/* Title with Icon inside the box */}
// <h2 className=" w-full max-w-2xl text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 text-center rounded-lg mb-6 flex items-center justify-center gap-2">
//   <ShieldCheck size={28} className="text-white" />
//   Site Manager Registration
// </h2>

//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-5">
//           {/* Full Name */}
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">Full Name</label>
//             <input
//               type="text"
//               placeholder="Enter your full name"
//               className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={formData.fullName}
//               onChange={(e) => handleChange("fullName", e.target.value)}
//               required
//             />
//           </div>

//           {/* Email */}
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">Email Address</label>
//             <input
//               type="email"
//               placeholder="Enter your email address"
//               className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={formData.email}
//               onChange={(e) => handleChange("email", e.target.value)}
//               required
//             />
//           </div>

//           {/* Password */}
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">Password</label>
//             <input
//               type="password"
//               placeholder="Enter password"
//               className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={formData.password}
//               onChange={(e) => handleChange("password", e.target.value)}
//               required
//             />
//           </div>

//           {/* Confirm Password */}
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">Confirm Password</label>
//             <input
//               type="password"
//               placeholder="Re-enter password"
//               className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={formData.confirmPassword}
//               onChange={(e) => handleChange("confirmPassword", e.target.value)}
//               required
//             />
//           </div>

//           {/* Manager ID */}
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">Site Manager ID</label>
//             <input
//               type="text"
//               placeholder="Enter your Site Manager ID"
//               className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={formData.managerId}
//               onChange={(e) => handleChange("managerId", e.target.value)}
//               required
//             />
//           </div>

//           {/* Role */}
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">Role</label>
//             <select
//               value={formData.role}
//               onChange={(e) => handleChange("role", e.target.value)}
//               className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             >
//               <option value="" disabled>Select your role</option>
//               <option value="financial">Financial</option>
            
//               <option value="manager">Manager</option>
//             </select>
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md transition"
//           >
//             {loading ? "Registering..." : "Register"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
