// src/pages/agency-dashboard/ManageAgency.jsx
import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Search,
  CheckCircle,
  AlertTriangle,
  Eye,
  Building,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";
import FilterButton from "../../components/FilterButton";
import { auth } from "../../firebase";

export default function ManageAgency() {
  /* ===================== STATE ===================== */
  const [originalAgencies, setOriginalAgencies] = useState([]);
  const [allAgencies, setAllAgencies] = useState([]);
const [agencies, setAgencies] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  /* ===================== FETCH AGENCIES ===================== */
  const fetchAgencies = async () => {
  try {
    const snapshot = await getDocs(collection(db, "agencies"));

    const formatted = snapshot.docs
      .map((d) => {
        const data = d.data();

        return {
          id: d.id,
          agencyName: data.agencyName || "-",
          fullName: data.fullName || data.agencyName || "-",
          email: data.email || "-",
          phone: data.phone || "-",
          address: data.address || "-",
          city: data.city || "-",
          state: data.state || "-",
          pinCode: data.pinCode || "-",

          // Bank details
          accountHolderName: data.bankDetails?.accountHolderName || "-",
          bankAccountNumber: data.bankDetails?.bankAccountNumber || "-",
          ifsc: data.bankDetails?.ifsc || "-",
          bankName: data.bankDetails?.bankName || "-",

          // SAME as customer
          kycUrl: data.kycUrl || null,
          kyc: data.kyc || { status: "MANUAL_REVIEW" },

          // Account status
          status: data.activity || "Active",
        };
      })
      //  Rejected agencies mat dikhao
      .filter((a) => a.kyc?.status !== "REJECTED");

    setOriginalAgencies(formatted);
    setAllAgencies(formatted);
    setAgencies(formatted);
  } catch (err) {
    console.error("Fetch agencies error:", err);
    Swal.fire("Error", "Failed to load agencies", "error");
  }
};


  /* ===================== ON LOAD ===================== */
  useEffect(() => {
    fetchAgencies();
  }, []);

  /* ===================== SEARCH HELPERS ===================== */
  const highlightMatch = (name, query) => {
    const lowerName = name.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const start = lowerName.indexOf(lowerQuery);
    if (start === -1) return name;

    return (
      <>
        {name.substring(0, start)}
        <span className="bg-yellow-200 text-black font-semibold">
          {name.substring(start, start + lowerQuery.length)}
        </span>
        {name.substring(start + lowerQuery.length)}
      </>
    );
  };

  const handleTyping = (value) => {
    setSearch(value);

    if (value.trim() === "") {
      setSuggestions([]);
      setAgencies(originalAgencies);
      return;
    }

    const matches = originalAgencies.filter((a) =>
  a.fullName.toLowerCase().includes(value.toLowerCase())
);


    setSuggestions(matches);
    setAgencies(matches);
  };
const handleSelectSuggestion = (name) => {
  setSearch(name);
  setSuggestions([]);

  const filtered = originalAgencies.filter((a) =>
    a.fullName.toLowerCase().includes(name.toLowerCase())
  );

  setAgencies(filtered);
};

  /* ===================== ACTIONS ===================== */
  const handleAgencyAction = async (agency, action) => {
  if (action === "view") {
    const kyc = agency.kyc || {};

    const htmlContent = `
      <div style="text-align:left; font-size:14px; line-height:1.6">

        <h3 style="margin-bottom:8px">Agency Details</h3>

        <table style="width:100%; border-collapse:collapse">
           <tr>
          <td style="width:35%; padding:6px"><b>Agency Name</b></td>
          <td style="padding:6px">${agency.fullName || "-"}</td>
        </tr>

        <tr>
          <td style="padding:6px"><b>Email</b></td>
          <td style="padding:6px">${agency.email || "-"}</td>
        </tr>

        <tr>
          <td style="padding:6px"><b>Phone</b></td>
          <td style="padding:6px">${agency.phone || "-"}</td>
        </tr>

        <tr>
          <td style="padding:6px"><b>Address</b></td>
          <td style="padding:6px">${agency.address || "-"}</td>
        </tr>

        <tr>
          <td style="padding:6px"><b>City</b></td>
          <td style="padding:6px">${agency.city || "-"}</td>
        </tr>

        <tr>
          <td style="padding:6px"><b>State</b></td>
          <td style="padding:6px">${agency.state || "-"}</td>
        </tr>

        <tr>
          <td style="padding:6px"><b>Pincode</b></td>
          <td style="padding:6px">${agency.pinCode || "-"}</td>
        </tr>

        <tr>
          <td style="padding:6px"><b>KYC Status</b></td>
          <td style="padding:6px">
            <b>${agency.kyc?.status || "Not Submitted"}</b>
          </td>
        </tr>

      </table>

      <hr style="margin:12px 0"/>

      <h3 style="margin-bottom:6px">Bank Details</h3>

      <table style="width:100%; border-collapse:collapse">
        <tr>
          <td style="width:35%; padding:6px"><b>Account Holder</b></td>
          <td style="padding:6px">${agency.accountHolderName || "-"}</td>
        </tr>

        <tr>
          <td style="padding:6px"><b>Account Number</b></td>
          <td style="padding:6px">${agency.bankAccountNumber || "-"}</td>
        </tr>

        <tr>
          <td style="padding:6px"><b>IFSC</b></td>
          <td style="padding:6px">${agency.ifsc || "-"}</td>
        </tr>

        <tr>
          <td style="padding:6px"><b>Bank Name</b></td>
          <td style="padding:6px">${agency.bankName || "-"}</td>
        </tr>
      </table>
<hr style="margin:12px 0"/>

<h3 style="margin-bottom:6px">KYC Documents</h3>

${
  agency.kyc?.extracted?.maskedAadhaar ||
  agency.kyc?.aadharUrl ||
  agency.kyc?.kycUrl
    ? "Aadhar Card - Uploaded"
    : "Aadhar Card - Not Uploaded"
}



    </div>
  `;

    Swal.fire({
      title: "Agency Full Details",
      html: htmlContent,
      showCloseButton: true,
      showConfirmButton: false,
      width: 600,
    });

    return;
  }

  /* =======================
     VIEW / REVIEW KYC
  ======================= */
  if (action === "viewKyc") {
    const kyc = agency.kyc || {};

    if (kyc.status === "MANUAL_REVIEW") {
      const imageUrl =
        (agency.kyc?.aadharUrl && agency.kyc.aadharUrl.trim()) ||
        (agency.kycUrl && agency.kycUrl.trim()) ||
        null;

      if (!imageUrl) {
        Swal.fire("No Document", "KYC document not uploaded", "info");
        return;
      }

      const result = await Swal.fire({
        title: "Agency KYC Review",
        width: 700,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "✅ Approve",
        denyButtonText: "❌ Reject",
        cancelButtonText: "Close",
        html: `
          <div style="text-align:left">
            <p><b>Name:</b> ${agency.fullName}</p>
            <p><b>Email:</b> ${agency.email}</p>
            <p><b>Status:</b> ${kyc.status}</p>
            <hr/>
            <img src="${imageUrl}" style="width:100%; border-radius:8px"/>
          </div>
        `,
      });

      // APPROVE
      if (result.isConfirmed) {
        await updateDoc(doc(db, "agencies", agency.id), {
          "kyc.status": "VERIFIED",
          "kyc.review.reviewedBy": `Site Manager (${auth.currentUser.uid})`,
          "kyc.review.reviewedAt": new Date(),
        });

        Swal.fire("Approved", "Agency verified", "success");
        fetchAgencies();
      }

      //  REJECT
      if (result.isDenied) {
        const { value: reason } = await Swal.fire({
          title: "Reject Reason",
          input: "select",
          inputOptions: {
            unclear: "Document unclear",
            mismatch: "Details mismatch",
            incomplete: "Incomplete document",
            other: "Other reason",
          },
          inputPlaceholder: "Select reason",
          showCancelButton: true,
          inputValidator: (v) => (!v ? "Please select a reason!" : null),
        });

        if (!reason) return;

        await updateDoc(doc(db, "agencies", agency.id), {
          "kyc.status": "REJECTED",
          "kyc.review.reason": reason,
          "kyc.review.reviewedBy": `Site Manager (${auth.currentUser.uid})`,
          "kyc.review.reviewedAt": new Date(),
        });

        Swal.fire("Rejected", "Agency rejected", "success");
        fetchAgencies();
      }

      return;
    }

    /* =======================
       VERIFIED / AUTO VERIFIED
    ======================= */
    if (["AUTO_VERIFIED", "VERIFIED"].includes(kyc.status)) {
      const ex = kyc.extracted || {};

      Swal.fire({
        title: "KYC Details",
        width: 600,
        html: `
          <table style="width:100%; text-align:left">
            <tr><td><b>Status</b></td><td>${kyc.status}</td></tr>
            <tr><td><b>Name</b></td><td>${ex.nameFromDoc || "-"}</td></tr>
            <tr><td><b>DOB</b></td><td>${ex.dob || "-"}</td></tr>
            <tr><td><b>Gender</b></td><td>${ex.gender || "-"}</td></tr>
            <tr><td><b>Masked Aadhaar</b></td><td>${ex.maskedAadhaar || "-"}</td></tr>
          </table>
        `,
      });
    }

    return;
  }

  const res = await Swal.fire({
    title: action === "block" ? "Block Agency?" : "Unblock Agency?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: action === "block" ? "Yes, Block" : "Yes, Unblock",
  });

  if (res.isConfirmed) {
    await updateDoc(doc(db, "agencies", agency.id), {
      status: action === "block" ? "Blocked" : "Active",
    });
    fetchAgencies();
  }
};
// ======== STATS COUNTS ========
const totalAgencies = originalAgencies.length;

const verifiedAgencies = originalAgencies.filter(
  (a) =>
    a.kyc?.status === "AUTO_VERIFIED" ||
    a.kyc?.status === "VERIFIED"
).length;

const pendingAgencies = originalAgencies.filter(
  (a) => a.kyc?.status === "MANUAL_REVIEW"
).length;

  /* ===================== UI ===================== */
  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-purple-700">
              Manage Agencies
            </h2>
          <p className="text-gray-500 mt-1">
            View and manage all registered agencies
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500"
              />
              <Input
                placeholder="Search agencies..."
                value={search}
                onChange={(e) => handleTyping(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-white shadow-md rounded-3xl"
              />
            </div>

            <Button className="h-12 px-6 rounded-3xl bg-purple-600 text-white">
              Search
            </Button>
          </div>

          {/* 🔹 SEARCH SUGGESTIONS (FIX ADDED) */}
          {search.trim() !== "" && suggestions.length > 0 && (
            <div className="absolute left-0 top-14 w-full md:w-64 bg-white shadow-xl rounded-2xl z-10 border p-1">
              {suggestions.map((s) => (
  <div
    key={s.id}
    onClick={() => handleSelectSuggestion(s.fullName)}
    className="p-2 pl-4 hover:bg-purple-100 cursor-pointer rounded-xl"
  >
    {highlightMatch(s.fullName, search)}
  </div>
))}

            </div>
          )}
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-600 text-white rounded-2xl">
  <CardContent className="p-6 flex items-center justify-between">
    
    {/* LEFT TEXT */}
    <div>
      <p className="text-sm">Total Agencies</p>
      <p className="text-3xl font-bold">{totalAgencies}</p>
    </div>

    {/* RIGHT ICON */}
    <Building size={25} className="opacity-80" />

  </CardContent>
</Card>

        <Card className="bg-green-600 text-white rounded-2xl">
  <CardContent className="p-6 flex items-center justify-between">
    
    <div>
      <p className="text-sm">Verified</p>
      <p className="text-3xl font-bold">{verifiedAgencies}</p>
    </div>

    <CheckCircle size={25} className="opacity-80" />

  </CardContent>
</Card>
<Card className="bg-orange-500 text-white rounded-2xl">
  <CardContent className="p-6 flex items-center justify-between">
    
    <div>
      <p className="text-sm">Pending</p>
      <p className="text-3xl font-bold">{pendingAgencies}</p>
    </div>

    <AlertTriangle size={25} className="opacity-80" />

  </CardContent>
</Card>


      </div>
{/* FILTER BUTTON */}
<div className="flex justify-end mb-4">
  <FilterButton
    allCustomers={originalAgencies}
    setCustomers={setAgencies}
  />
</div>
      {/* Agency List */}
      <Card className="bg-white rounded-2xl p-6">
                {/* All Agencies Header */}
        <div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-2 text-lg font-semibold text-purple-700">
    <Building className="w-5 h-5" />
    All Agencies
  </div>
  </div>

          
        <div className="space-y-3">
          {agencies.map((a) => (
            <Card key={a.id} className="bg-blue-50 rounded-xl px-6 py-5">
  <div className="flex justify-between items-end">

    {/* LEFT SIDE */}
    <div className="flex gap-4">
      <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-bold">
        {a.fullName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()}
      </div>

      <div>
        <h4 className="font-semibold text-lg">{a.fullName}</h4>
        <p className="text-sm text-gray-500">#{a.id.slice(0, 8)}</p>

        {/* Badges */}
        <div className="flex gap-2 mt-2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-lg ${
              a.kyc?.status === "AUTO_VERIFIED"
                ? "bg-green-100 text-green-600"
                : a.kyc?.status === "VERIFIED"
                ? "bg-blue-100 text-blue-600"
                : a.kyc?.status === "MANUAL_REVIEW"
                ? "bg-yellow-100 text-yellow-700"
                : a.kyc?.status === "REJECTED"
                ? "bg-red-100 text-red-600"
                : "bg-orange-100 text-orange-600"
            }`}
          >
            {a.kyc?.status === "AUTO_VERIFIED"
              ? "✔ Auto Verified"
              : a.kyc?.status === "VERIFIED"
              ? "✔ Verified"
              : a.kyc?.status === "MANUAL_REVIEW"
              ? "Manual Review"
              : a.kyc?.status === "REJECTED"
              ? "Rejected"
              : "Not Verified"}
          </span>

          <span
            className={`text-xs font-semibold px-3 py-1 rounded-lg ${
              a.status === "Blocked"
                ? "bg-red-100 text-red-600"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {a.status || "Active"}
          </span>
        </div>
      </div>
    </div>

    {/* RIGHT ACTIONS */}
    <div className="flex items-center gap-3 ml-auto flex-wrap">
      <Button variant="outline" onClick={() => handleAgencyAction(a, "view")} className="rounded-xl px-4 flex items-center gap-2">
        <Eye size={18} />
        View
      </Button>
{/* View KYC */}
          {["MANUAL_REVIEW", "AUTO_VERIFIED", "VERIFIED"].includes(a.kyc?.status) && (
      <Button
        variant="outline"
        onClick={() => handleAgencyAction(a, "viewKyc")}
      >
        <Users size={18} />
        View KYC
      </Button>
          )}

      <Button
        className={`${
          a.status === "Blocked" ? "bg-blue-600" : "bg-red-600"
        } text-white`}
        onClick={() =>
          handleAgencyAction(
            a,
            a.status === "Blocked" ? "unblock" : "block"
          )
        }
      >
        {a.status === "Blocked" ? "Unblock" : "Block"}
      </Button>
    </div>

  </div>
</Card>

          ))}
        </div>
      </Card>
    </div>
  );
}