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
} from "lucide-react";
import Swal from "sweetalert2";

export default function ManageAgency() {
  /* ===================== STATE ===================== */
  const [originalAgencies, setOriginalAgencies] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
const handleApprove = async (agency) => {
  const confirm = await Swal.fire({
    title: "Approve Agency?",
    text: "Agency will be able to accept bookings",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Approve",
  });

  if (!confirm.isConfirmed) return;

  await updateDoc(doc(db, "agencies", agency.id), {
    kycStatus: "VERIFIED",
    kycVerifiedAt: new Date(),
  });

  Swal.fire("Approved", "Agency verified successfully", "success");
  fetchAgencies(); // 🔁 refresh list
};
const handleReject = async (agency) => {
  const { value: reason } = await Swal.fire({
    title: "Reject Agency",
    input: "text",
    inputLabel: "Reason",
    inputPlaceholder: "Document unclear",
    showCancelButton: true,
  });

  if (!reason) return;

  await updateDoc(doc(db, "agencies", agency.id), {
    kycStatus: "REJECTED",
    rejectionReason: reason,
  });

  Swal.fire("Rejected", "Agency rejected", "success");
  fetchAgencies();
};
const viewKycDocument = async (agency) => {
  const result = await Swal.fire({
    title: "KYC Verification",
    width: 650,
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: "✅ Approve",
    denyButtonText: "❌ Reject",
    cancelButtonText: "Close",
    html: `
      <div style="text-align:left">
        <p><b>Agency:</b> ${agency.name}</p>
        <p><b>Agency ID:</b> ${agency.id}</p>
        <p><b>Status:</b> ${agency.kycStatus}</p>
        <hr/>
        <img 
  src="${agency.kycDocumentUrl}" 
  style="width:100%; border-radius:8px;" 
  alt="KYC Document"
/>
      </div>
    `,
  });

  // ✅ APPROVE
  if (result.isConfirmed) {
  await updateDoc(doc(db, "agencies", agency.id), {
    kycStatus: "VERIFIED",
    verifiedBy: "MANUAL", 
    kycVerifiedAt: new Date(),
    featureAllowed: true // ✅ enable agency to accept bookings
  });

  Swal.fire("Approved", "Agency verified successfully", "success");
  fetchAgencies(); // Refresh ManageAgency page
}


  // ❌ REJECT
  if (result.isDenied) {
    const { value: reason } = await Swal.fire({
      title: "Reject Reason",
      input: "text",
      inputPlaceholder: "Document unclear",
      showCancelButton: true,
    });

    if (!reason) return;

    await updateDoc(doc(db, "agencies", agency.id), {
      kycStatus: "REJECTED",
      rejectionReason: reason,
    });

    Swal.fire("Rejected", "Agency rejected", "success");
    fetchAgencies();
  }
};


  /* ===================== FETCH AGENCIES ===================== */
  const fetchAgencies = async () => {
    try {
      const snapshot = await getDocs(collection(db, "agencies"));

     const formatted = snapshot.docs.map((d) => {
  const data = d.data();
  return {
    id: d.id,
    name: data.agencyName,
    fullName: data.fullName || data.agencyName || "-",  // add full name
    email: data.email || "-",
    phone: data.phone || "-",
    address: data.address || "-",
    city: data.city || "-",
    state: data.state || "-",
    pinCode: data.pinCode || "-",
    accountHolderName: data.accountHolderName || "-",
    bankAccountNumber: data.bankAccountNumber || "-",
    ifsc: data.ifsc || "-",
    bankName: data.bankName || "-",
    kycStatus: data.kycStatus || "MANUAL_REVIEW",
    verifiedBy: data.verifiedBy || "AUTO",
activity: data.activity || "Active",
   kycDocumentUrl: data.kycDocumentUrl ? data.kycDocumentUrl.trim() : null,
    kycUploaded: data.kycUploaded || {},
  };
});

      setOriginalAgencies(formatted);
      setAgencies(formatted);
    } catch (error) {
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
      a.name.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(matches);
    setAgencies(matches);
  };

  const handleSelectSuggestion = (name) => {
    setSearch(name);
    setSuggestions([]);

    const filtered = originalAgencies.filter((a) =>
      a.name.toLowerCase().includes(name.toLowerCase())
    );

    setAgencies(filtered);
  };

  /* ===================== ACTIONS ===================== */
  const handleAction = (agency, action) => {
   if (action === "view") {
  Swal.fire({
    title: "Agency Full Details",
    width: 700,
    html: `
      <div style="text-align:left">

        <h3>🏢 Basic Info</h3>
        <p><b>Name:</b> ${agency.fullName || "-"}</p>
        <p><b>Email:</b> ${agency.email || "-"}</p>
        <p><b>Phone:</b> ${agency.phone || "-"}</p>

        <hr/>

        <h3>📍 Address</h3>
        <p>${agency.address || "-"}</p>
        <p>${agency.city || ""}, ${agency.state || ""}</p>
        <p>Pincode: ${agency.pinCode || "-"}</p>

        <hr/>

        <h3>🏦 Bank Details</h3>
        <p><b>Account Holder:</b> ${agency.accountHolderName || "-"}</p>
        <p><b>Account No:</b> ${agency.bankAccountNumber || "-"}</p>
        <p><b>IFSC:</b> ${agency.ifsc || "-"}</p>
        <p><b>Bank:</b> ${agency.bankName || "-"}</p>

        <hr/>

        <h3>🪪 KYC Status</h3>
        <p>${agency.kycStatus}</p>

        <hr/>

        <h3>📄 KYC Documents</h3>
        <p><b>Aadhar Card:</b> ${
          agency.kycUploaded?.["Aadhar Card"]
            ? `<a href="${agency.kycUploaded["Aadhar Card"]}" target="_blank">View</a>`
            : "Not uploaded"
        }</p>
        <p><b>PAN Card:</b> ${
          agency.kycUploaded?.["PAN Card"]
            ? `<a href="${agency.kycUploaded["PAN Card"]}" target="_blank">View</a>`
            : "Not uploaded"
        }</p>

      </div>
    `,
    showCloseButton: true,
  });
  return;
}


    if (action === "block") {
      Swal.fire({
        title: "Block Agency?",
        text: `Are you sure you want to block ${agency.name}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, Block",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await updateDoc(doc(db, "agencies", agency.id), {
              activity: "Blocked",
            });

            Swal.fire(
              "Blocked!",
              `${agency.name} has been blocked successfully.`,
              "success"
            );
          } catch (error) {
            Swal.fire("Error", "Failed to block agency", "error");
          }
        }
      });
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
            <h2 className="text-[32px] font-extrabold text-purple-600 leading-tight">
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
                  onClick={() => handleSelectSuggestion(s.name)}
                  className="p-2 pl-4 hover:bg-purple-100 cursor-pointer rounded-xl"
                >
                  {highlightMatch(s.name, search)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-600 text-white rounded-2xl">
          <CardContent className="p-6">
            <p className="text-sm">Total Agencies</p>
            <p className="text-3xl font-bold">{originalAgencies.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-600 text-white rounded-2xl">
          <CardContent className="p-6">
            <p className="text-sm">Verified</p>
            <p className="text-3xl font-bold">
              {originalAgencies.filter((a) => a.kycStatus === "VERIFIED").length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-600 text-white rounded-2xl">
          <CardContent className="p-6">
            <p className="text-sm">Active Agencies</p>
            <p className="text-3xl font-bold">{originalAgencies.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Agency List */}
      <Card className="bg-white rounded-2xl p-6">
                {/* All Agencies Header */}
        <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-purple-700">
          <Building className="w-5 h-5" />
          All Agencies
        </div>

        <div className="space-y-3">
          {agencies.map((a) => (
            <Card key={a.id} className="bg-blue-50 rounded-xl flex px-4 py-3">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  {a.name[0]}
                </div>

                <div>
                  <h4 className="font-semibold">{a.name}</h4>
                  <p className="text-sm text-gray-500">#{a.id}</p>

                  <div className="flex gap-2 mt-1">
                   {/* AUTO VERIFIED */}
{a.kycStatus === "VERIFIED" && a.verifiedBy === "AUTO" && (
  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
    ✔ Auto Verified
  </span>
)}

{/* MANUAL VERIFIED */}
{a.kycStatus === "VERIFIED" && a.verifiedBy === "MANUAL" && (
  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
    ✔ Verified
  </span>
)}

{a.kycStatus === "REJECTED" && (
  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
    ❌ Rejected
  </span>
)}


                    {a.kycStatus === "VERIFIED" && a.activity !== "Blocked" && (
  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
    Active
  </span>
)}
{a.activity === "Blocked" && (
  <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
    Blocked
  </span>
)}

                  </div>
                </div>
              </div>

              <div className="ml-auto flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleAction(a, "view")}
                >
                  <Eye size={16} /> View
                </Button>
               {/* View KYC Button */}
{a.kycStatus === "MANUAL_REVIEW" && (
  <Button
    variant="outline"
    className="border-purple-600 text-purple-600"
    onClick={() => {
      // 🔹 Check if KYC document exists in kycUploaded object
      const kycDocUrl =
        a.kycUploaded?.["Aadhar Card"] || a.kycUploaded?.["PAN Card"];

      if (!kycDocUrl || kycDocUrl.trim() === "") {
        Swal.fire(
          "No Document",
          "KYC document not uploaded yet.",
          "info"
        );
        return;
      }

      // ✅ Call viewKycDocument with proper URL
      viewKycDocument({ ...a, kycDocumentUrl: kycDocUrl });
    }}
  >
    View KYC
  </Button>
)}
                <Button
                  variant="ghost"
                  className="border border-red-600 text-red-600"
                  onClick={() => handleAction(a, "block")}
                >
                  Block
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}