// src/pages/customer-dashboard/ManageCustomer.jsx
import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { auth } from "../../firebase";
import FilterButton from "../../components/FilterButton";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Eye, Users, CheckCircle, AlertTriangle } from "lucide-react";
import Swal from "sweetalert2";

export default function ManageCustomer() {
  const [allCustomers, setAllCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  /* ---------------- FETCH CUSTOMERS ---------------- */
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
  try {
    const snapshot = await getDocs(collection(db, "customers"));
    const formatted = snapshot.docs
  .map((d) => {
    const data = d.data();
    return {
      id: d.id,
      fullName: data.fullName || "-",
      email: data.email || "-",
      phone: data.phone || "-",
      address: data.address || "-",
      city: data.city || "-",
      state: data.state || "-", 
      pinCode: data.pinCode || "-",
      status: data.status || "Active",
      kyc: data.kyc || {},
      kycUrl: data.kycUrl || null,
    };
  })
  .filter((c) => c.kyc?.status !== "REJECTED"); //  correct
    setAllCustomers(formatted); // fixed
    setCustomers(formatted);
  } catch (err) {
    console.error("Fetch customers error:", err); // for debugging
    Swal.fire("Error", "Failed to load customers", "error");
  }
};
useEffect(() => {
  const fetchCustomers = async () => {
    const snapshot = await getDocs(collection(db, "customers"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAllCustomers(data);
    setCustomers(data); // initially show all
  };

  fetchCustomers();
}, []);

  /* ---------------- SEARCH ---------------- */
  const handleSearch = (query = search) => {
  setSearch(query);

  if (!query.trim()) {
    setSuggestions([]);
    setCustomers(allCustomers);
    return;
  }

  const filtered = allCustomers.filter((c) =>
    c.fullName.toLowerCase().includes(query.toLowerCase())
  );

  setCustomers(filtered);
  setSuggestions(filtered.slice(0, 10));
};

  /* ---------------- ACTIONS ---------------- */

 const handleAction = async (customer, action) => {
  if (action === "view") {
  const kyc = customer.kyc || {};

const htmlContent = `
  <div style="text-align:left; font-size:14px; line-height:1.6">

    <h3 style="margin-bottom:8px">Customer Details</h3>

    <table style="width:100%; border-collapse:collapse">
      <tr>
        <td style="width:35%; padding:6px"><b>Name</b></td>
        <td style="padding:6px">${customer.fullName}</td>
      </tr>

      <tr>
        <td style="padding:6px"><b>Email</b></td>
        <td style="padding:6px">${customer.email}</td>
      </tr>

      <tr>
        <td style="padding:6px"><b>Phone</b></td>
        <td style="padding:6px">${customer.phone}</td>
      </tr>

     <tr>
  <td style="width:35%; padding:6px; color:#555"><b>Address</b></td>
  <td style="padding:6px; color:#222">
    ${customer.address || "-"}
  </td>
</tr>

<tr>
  <td style="padding:6px; color:#555"><b>City</b></td>
  <td style="padding:6px; color:#222">
    ${customer.city || "-"}
  </td>
</tr>

<tr>
  <td style="padding:6px; color:#555"><b>State</b></td>
  <td style="padding:6px; color:#222">
    ${customer.state || "-"}
  </td>
</tr>

<tr>
  <td style="padding:6px; color:#555"><b>Pincode</b></td>
  <td style="padding:6px; color:#222">
    ${customer.pinCode || "-"}
  </td>
</tr>


      <tr>
        <td style="padding:6px"><b>KYC Status</b></td>
        <td style="padding:6px">
          <b>${kyc.status || "Not Submitted"}</b>
        </td>
      </tr>
    </table>

    <hr style="margin:12px 0"/>

    <h3 style="margin-bottom:6px">KYC Document</h3>

${
  customer.kycUrl
    ? `<span style="font-weight:500">Aadhar - <span style="color:green; font-weight:600">Uploaded</span></span>`
    : `<span style="color:#999">Aadhar - Not Uploaded</span>`
}

  </div>
`;


    Swal.fire({
      title: "Customer Full Details",
      html: htmlContent,
      showCloseButton: true,
      showConfirmButton: false,
      width: 600,
    });

    return;
  }
  if (action === "viewKyc") {
  const kyc = customer.kyc || {};
  if (kyc.status === "MANUAL_REVIEW") {
  const imageUrl = (customer.kyc?.aadharUrl && customer.kyc.aadharUrl.trim()) || 
                 (customer.kycUrl && customer.kycUrl.trim()) || 
                 null;

  // Agar image nahi hai
  if (!imageUrl) {
    Swal.fire("No Document", "KYC document not uploaded", "info");
    return; // function yahi ruk jaayega, result undefined nahi hoga
  }
const result = await Swal.fire({
    title: "Customer KYC Review",
    width: 700,
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: " Approve",
    denyButtonText: "❌ Reject",
    cancelButtonText: "Close",
    html: `
      <div style="text-align:left">
        <p><b>Name:</b> ${customer.fullName}</p>
        <p><b>Email:</b> ${customer.email}</p>
        <p><b>Status:</b> ${kyc.status || "MANUAL_REVIEW"}</p>
        <hr/>
        <img 
          src="${imageUrl}" 
          style="width:100%; border-radius:8px;" 
          alt="Aadhar Document" 
        />
      </div>
    `,
  });



 // APPROVE
if (result.isConfirmed) {
await updateDoc(doc(db, "customers", customer.id), {
  "kyc.status": "VERIFIED",
  "kyc.review.reviewedBy": `Site Manager (${auth.currentUser.uid})`,
  "kyc.review.reviewedAt": new Date(),
});


  Swal.fire("Approved", "Customer verified", "success");
  fetchCustomers();
}

//  REJECT
if (result.isDenied) {
  const { value: reason } = await Swal.fire({
  title: "Reject Reason",
  input: 'select',  // ✅ must be 'select'
  inputOptions: {
    unclear: "Document unclear",
    mismatch: "Details mismatch",
    incomplete: "Incomplete document",
    other: "Other reason",
  },
  inputPlaceholder: "Select reason",
  showCancelButton: true,
  inputValidator: (value) => {
    if (!value) return "Please select a reason!";
  }
});

  if (!reason) return;

  await updateDoc(doc(db, "customers", customer.id), {
  "kyc.status": "REJECTED",
  "kyc.review.reason": reason,
  "kyc.review.reviewedBy": `Site Manager (${auth.currentUser.uid})`, // fixed
  "kyc.review.reviewedAt": new Date(),
});

  Swal.fire("Rejected", "Customer rejected", "success");
  fetchCustomers();
}

  return;
}
 if (["AUTO_VERIFIED", "VERIFIED"].includes(kyc.status)) {
    const ex = kyc.extracted || {};

   Swal.fire({
  title: "KYC Details",
  width: 600,
  html: `
    <div style="text-align:left; font-size:14px; line-height:1.6">

      <table style="width:100%; border-collapse:collapse">
        <tr>
          <td style="width:35%; padding:6px; color:#555"><b>Status</b></td>
          <td style="padding:6px; color:#222">${kyc.status}</td>
        </tr>

        <tr>
          <td style="padding:6px; color:#555"><b>Name from Aadhaar</b></td>
          <td style="padding:6px; color:#222">${ex.nameFromDoc || "-"}</td>
        </tr>

        <tr>
          <td style="padding:6px; color:#555"><b>DOB</b></td>
          <td style="padding:6px; color:#222">${ex.dob || "-"}</td>
        </tr>

        <tr>
          <td style="padding:6px; color:#555"><b>Gender</b></td>
          <td style="padding:6px; color:#222">${ex.gender || "-"}</td>
        </tr>

        <tr>
          <td style="padding:6px; color:#555"><b>Masked Aadhaar</b></td>
          <td style="padding:6px; color:#222">${ex.maskedAadhaar || "-"}</td>
        </tr>

        <tr>
          <td style="padding:6px; color:#555"><b>Age Band</b></td>
          <td style="padding:6px; color:#222">${ex.ageBand || "-"}</td>
        </tr>

      </table>

    </div>
  `,
});

  }

  return;
}
  // Block / Unblock logic remains the same
  const res = await Swal.fire({
    title: action === "block" ? "Block Customer?" : "Unblock Customer?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: action === "block" ? "Yes, Block" : "Yes, Unblock",
  });

  if (res.isConfirmed) {
    await updateDoc(doc(db, "customers", customer.id), {
      status: action === "block" ? "Blocked" : "Active",
    });
    fetchCustomers();
  }
};


  /* ---------------- COUNTS ---------------- */
  const totalCustomers = allCustomers.length;
 const verifiedCount = allCustomers.filter(
  (c) => ["AUTO_VERIFIED", "VERIFIED"].includes(c.kyc?.status)
).length;

//  Pending = MANUAL_REVIEW
const pendingKyc = allCustomers.filter(
  (c) => c.kyc?.status === "MANUAL_REVIEW"
).length;

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-purple-700">
            Manage Customers
          </h2>
          <p className="text-gray-600">
            View and manage all registered customers
          </p>
        </div>

        {/* SEARCH (FIXED UI) */}
        <div className="flex gap-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500"
            />
            <Input
  placeholder="Search customers..."
  value={search}
  onChange={(e) => handleSearch(e.target.value)}
  className="h-12 pl-10 pr-4 w-64 rounded-xl shadow-sm"
/>
{suggestions.length > 0 && (
  <ul className="absolute mt-1 bg-white border border-gray-300 rounded-lg w-64 shadow-lg z-10 max-h-60 overflow-auto">
    {suggestions.map((c) => {
      const startIndex = c.fullName.toLowerCase().indexOf(search.toLowerCase());
      const endIndex = startIndex + search.length;

      return (
        <li
          key={c.id}
          className="px-4 py-2 cursor-pointer hover:bg-purple-100"
          onClick={() => {
            setSearch(c.fullName);
            setSuggestions([]);
            setCustomers([c]); // select the clicked suggestion
          }}
        >
          {startIndex >= 0 ? (
            <>
              {c.fullName.substring(0, startIndex)}
              <span className="bg-yellow-200">
                {c.fullName.substring(startIndex, endIndex)}
              </span>
              {c.fullName.substring(endIndex)}
            </>
          ) : (
            c.fullName
          )}
        </li>
      );
    })}
  </ul>
)}

          </div>
         <Button
  onClick={() => handleSearch(search)}
  className="h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
>
  Search
</Button>

        </div>
      </div>

      {/* STATS CARDS */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <Card className="bg-blue-600 text-white rounded-2xl">
    <CardContent className="p-6 flex justify-between items-center">
      <div>
        <p className="text-sm">Total Customers</p>
        <p className="text-3xl font-bold">{totalCustomers}</p>
      </div>
      <Users size={26} />
    </CardContent>
  </Card>

  <Card className="bg-green-600 text-white rounded-2xl">
    <CardContent className="p-6 flex justify-between items-center">
      <div>
        <p className="text-sm">Verified</p>
        <p className="text-3xl font-bold">{verifiedCount}</p>
      </div>
      <CheckCircle size={26} />
    </CardContent>
  </Card>

  <Card className="bg-orange-500 text-white rounded-2xl">
    <CardContent className="p-6 flex justify-between items-center">
      <div>
        <p className="text-sm">Pending KYC</p>
        <p className="text-3xl font-bold">{pendingKyc}</p>
      </div>
      <AlertTriangle size={26} />
    </CardContent>
  </Card>
</div>

<div className="flex justify-end mb-4">
  <FilterButton allCustomers={allCustomers} setCustomers={setCustomers} />
</div>

      {/* CUSTOMER LIST (UNCHANGED UI) */}
      <Card className="bg-white rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-purple-700">
          <Users size={24} /> All Customers
        </div>

        <div className="space-y-4">
  {customers.map((c) => {
    const kycStatus = c.kyc?.status || "NOT_SUBMITTED";

const isAutoVerified = kycStatus === "AUTO_VERIFIED";




    return (
      <Card key={c.id} className="bg-blue-50 rounded-xl flex px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-bold">
            {c.fullName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="font-semibold text-lg">{c.fullName}</h4>
            <p className="text-sm text-gray-500">#{c.id.slice(0, 8)}</p>

            <div className="flex gap-2 mt-2 flex-wrap">
              {/* Verification Badge */}
              <span
  className={`text-xs font-semibold px-3 py-1 rounded-lg ${
    c.kyc?.status === "AUTO_VERIFIED"
      ? "bg-green-100 text-green-600"
      : c.kyc?.status === "VERIFIED"
      ? "bg-blue-100 text-blue-600"
      : c.kyc?.status === "MANUAL_REVIEW"
      ? "bg-yellow-100 text-yellow-700"
      : c.kyc?.status === "REJECTED"
      ? "bg-red-100 text-red-600"
      : "bg-orange-100 text-orange-600"
  }`}
>
  {c.kyc?.status === "AUTO_VERIFIED"
    ? "✔ Auto Verified"
    : c.kyc?.status === "VERIFIED"
    ? "✔ Verified"
    : c.kyc?.status === "MANUAL_REVIEW"
    ? "Manual Review"
    : c.kyc?.status === "REJECTED"
    ? "Rejected"
    : "Not Verified"}
</span>


              {/* Status */}
              <span
  className={`text-xs font-semibold px-3 py-1 rounded-lg ${
    c.status === "Blocked"
      ? "bg-red-100 text-red-600"
      : "bg-purple-100 text--700" // Active ke liye green
  }`}
>
  {c.status || "Active"}
</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 ml-auto flex-wrap">
          {/* View Info */}
          <Button
            variant="outline"
            onClick={() => handleAction(c, "view")}
            className="rounded-xl px-4 flex items-center gap-2"
          >
            <Eye size={18} />
            View
          </Button>

          {/* View KYC */}
          {["MANUAL_REVIEW", "AUTO_VERIFIED", "VERIFIED"].includes(kycStatus) && (
            <Button
              variant="outline"
              className="rounded-xl px-4 flex items-center gap-2"
              onClick={() => handleAction(c, "viewKyc")}
            >
              <Users size={18} />
              View KYC
            </Button>
          )}
          
          {/* Block/Unblock */}
          {c.status === "Blocked" ? (
            <Button
              className="rounded-xl px-4 bg-blue-600 text-white"
              onClick={() => handleAction(c, "unblock")}
            >
              Unblock
            </Button>
          ) : (
            <Button
              className="rounded-xl px-4 bg-red-600 text-white"
              onClick={() => handleAction(c, "block")}
            >
              Block
            </Button>
          )}
        </div>
      </Card>
    );
  })}
</div>

      </Card>
    </div>
  );
}