// import React, { useState, useEffect } from "react";

// import UserTypeSelector from "./pages/UserTypeSelector";
// import LoginForm from "./pages/LoginForm";
// import Signupc from "./pages/Signupc";
// import Signupa from "./pages/Signupa";
// import SiteManagerLogin from "./pages/Sitemanagerlogin";

// import TermsAndConditions from "./pages/Terms";
// import PrivacyPolicy from "./pages/Privacy";

// export default function App() {
//   const [mode, setMode] = useState(null); // signin | signup
//   const [selectedType, setSelectedType] = useState(null); // customer | agency | sitemanager
//   const [defaultMode, setDefaultMode] = useState("signup");

//   // page = home | terms | privacy
//   const [page, setPage] = useState("home");

//   // sitemanager URL check
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     if (urlParams.get("page") === "sitemanager") {
//       setSelectedType("sitemanager");
//       setMode("signin");
//     }
//   }, []);

//   const handleTypeSelect = (type) => {
//     setSelectedType(type);
//     setMode(defaultMode);
//   };

//   const handleBack = () => {
//     setSelectedType(null);
//     setMode(null);
//     setDefaultMode("signup");
//   };

//   const handleLoginSuccess = (userData) => {
//     alert(`Login successful: ${userData?.fullName || "User"}`);
//   };

//   // Static pages
//   if (page === "terms") return <TermsAndConditions setPage={setPage} />;
//   if (page === "privacy") return <PrivacyPolicy setPage={setPage} />;

//   return (
//     <>
//       {/* HEADER */}
//       <header className="flex justify-between items-center px-10 py-6 bg-white shadow-sm">
//         <h1
//           className="text-2xl font-bold text-purple-700 cursor-pointer"
//           onClick={() => {
//             setPage("home");
//             setMode(null);
//             setSelectedType(null);
//           }}
//         >
//           MoveMate
//         </h1>

//         <div className="flex items-center gap-4">
//           {selectedType !== "sitemanager" && mode === "signin" && (
//             <>
//               <span className="text-sm text-gray-600">
//                 Don’t have an account?
//               </span>
//               <button
//                 className="px-6 py-2 bg-purple-600 text-white rounded-xl"
//                 onClick={() => {
//                   setDefaultMode("signup");
//                   setMode("signup");
//                 }}
//               >
//                 Sign Up
//               </button>
//             </>
//           )}

//           {selectedType !== "sitemanager" && mode === "signup" && (
//             <>
//               <span className="text-sm text-gray-600">
//                 Already have an account?
//               </span>
//               <button
//                 className="px-6 py-2 bg-purple-600 text-white rounded-xl"
//                 onClick={() => {
//                   setDefaultMode("signin");
//                   setMode("signin");
//                 }}
//               >
//                 Sign In
//               </button>
//             </>
//           )}
//         </div>
//       </header>

//       {/* MAIN */}
//       <main className="flex-grow px-10 py-16">
//         {/* HOME PAGE */}
//         {!mode && !selectedType && (
//           <div className="text-center mt-20">
//             <h2 className="text-4xl font-bold text-gray-800 mb-4">
//               Simplify Your Moving Experience with MoveMate
//             </h2>
//             <p className="text-gray-600 mb-8">
//               Connect customers, transport agencies, and site managers seamlessly.
//             </p>

//             <button
//               onClick={() => {
//                 setDefaultMode("signup");
//                 setMode("signup");
//               }}
//               className="bg-purple-600 text-white px-6 py-3 rounded-xl"
//             >
//               Get Started
//             </button>

//             {/* Footer links */}
//             <div className="mt-10 text-center text-gray-600">
//               <button
//                 className="hover:underline mr-4"
//                 onClick={() => setPage("terms")}
//               >
//                 Terms & Conditions
//               </button>
//               <button
//                 className="hover:underline"
//                 onClick={() => setPage("privacy")}
//               >
//                 Privacy Policy
//               </button>
//             </div>
//           </div>
//         )}

//         {/* USER TYPE SELECT */}
//         {mode && !selectedType && (
//           <UserTypeSelector onSelect={handleTypeSelect} setPage={setPage} />
//         )}

//         {/* SIGNUP */}
//         {selectedType && mode === "signup" && selectedType !== "sitemanager" && (
//           <>
//             {selectedType === "customer" && (
//               <Signupc onBack={handleBack} setPage={setPage} />
//             )}
//             {selectedType === "agency" && (
//               <Signupa onBack={handleBack} setPage={setPage} />
//             )}
//           </>
//         )}

//         {/* LOGIN */}
//         {selectedType && mode === "signin" && selectedType !== "sitemanager" && (
//           <LoginForm
//             userType={selectedType}
//             onBack={handleBack}
//             setPage={setPage}
//             onSwitchToSignup={() => {
//               setDefaultMode("signup");
//               setMode("signup");
//             }}
//             onLoginSuccess={handleLoginSuccess}
//           />
//         )}

//         {/* SITE MANAGER LOGIN */}
//         {selectedType === "sitemanager" && mode === "signin" && (
//           <SiteManagerLogin
//             onBack={handleBack}
//             onLoginSuccess={handleLoginSuccess}
//             setPage={setPage}
//           />
//         )}
//       </main>
//     </>
//   );
// }


// import { Routes, Route } from "react-router-dom";
// import UserTypeSelector from "./pages/UserTypeSelector";
// import LoginForm from "./pages/LoginForm";
// import Signupc from "./pages/Signupc";
// import Signupa from "./pages/Signupa";
// import SiteManagerLogin from "./pages/Sitemanagerlogin";
// import TermsAndConditions from "./pages/Terms";
// import PrivacyPolicy from "./pages/Privacy";

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<UserTypeSelector />} />
//       <Route path="/login/:type" element={<LoginForm />} />
//       <Route path="/signup/customer" element={<Signupc />} />
//       <Route path="/signup/agency" element={<Signupa />} />
//       <Route path="/sitemanager/login" element={<SiteManagerLogin />} />
//       <Route path="/terms" element={<TermsAndConditions />} />
//       <Route path="/privacy" element={<PrivacyPolicy />} />
//     </Routes>
//   );
// }



// // src/App.jsx
// import React, { useState } from "react";

// // PAGES
// import Dashboard from "./pages/CustomerDashboard/Dashboard";
// import NewBooking from "./pages/CustomerDashboard/NewBooking";
// import TrackShipment from "./pages/CustomerDashboard/Trackshipment";

// export default function App() {
//   const [page, setPage] = useState("dashboard"); // default

//   return (
//     <>
//       {/* ------------------ DASHBOARD ------------------ */}
//       {page === "dashboard" && (
//         <Dashboard
//           onNewBooking={() => setPage("newBooking")}
//           onTrack={() => setPage("trackShipment")}
//         />
//       )}

//       {/* ------------------ NEW BOOKING PAGE ------------------ */}
//       {page === "newBooking" && (
//         <NewBooking
//           onBack={() => setPage("dashboard")} // <-- Pass the prop here
//         />
//       )}

//       {/* ------------------ TRACK SHIPMENT PAGE ------------------ */}
//       {page === "trackShipment" && (
//         <TrackShipment
//           onBack={() => setPage("dashboard")}
//         />
//       )}
//     </>
//   );
// }
// // App.jsx
// // App.jsx


// import React from "react";
// import AgencyDashboard from "./pages/ADashboard/AgencyDashboard";

// export default function App() {
//   return <AgencyDashboard />; // NOT <ManageVehicle />
// }

// import React from "react";
// import SiteManager from "./pages/SitemanagerDashboard/SiteManager";

// export default function App() {
//   return <SiteManager />; // NOT <ManageVehicle />
// }

// App.jsx
// import React from "react";
// import Dashboard from "./pages/CustomerDashboard/Dashboard";

// export default function App() {
//   return <Dashboard />;
// }
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header1";

import HomePage from "./pages/HomePage";
import UserTypeSelector from "./pages/UserTypeSelector";
import Signupc from "./pages/Signupc";
import Signupa from "./pages/Signupa";
import LoginForm from "./pages/LoginForm";
import ForgotPassword from "./pages/ForgotPassword";
import CustomerDashboard from "./pages/CustomerDashboard/Dashboard";
import AgencyDashboard from "./pages/ADashboard/AgencyDashboard";

import SiteManagerLogin from "./pages/Sitemanagerlogin";
import SiteManager from "./pages/SitemanagerDashboard/SiteManager";
import ContactSupport from "./pages/ContactSupport";
import TermsAndConditions from "./pages/Terms";
import PrivacyPolicy from "./pages/Privacy";

export default function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/select-user" element={<UserTypeSelector />} />

        <Route path="/login/customer" element={<LoginForm userType="customer" />} />
        <Route path="/login/agency" element={<LoginForm userType="agency" />} />
        <Route path="/forgot-password/:userType" element={<ForgotPassword />} />
        <Route path="/signup/customer" element={<Signupc />} />
        <Route path="/signup/agency" element={<Signupa />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
<Route path="/agency-dashboard" element={<AgencyDashboard />} />


        <Route path="/sitemanager" element={<SiteManagerLogin />} />
        <Route path="/site-manager-dashboard" element={<SiteManager />} />
        <Route path="/contact" element={<ContactSupport />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}







