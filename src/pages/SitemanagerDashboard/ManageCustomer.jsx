// src/pages/customer-dashboard/ManageCustomer.jsx
import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

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
    const snapshot = await getDocs(collection(db, "customers"));
    const list = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    setAllCustomers(list);
    setCustomers(list);
  };

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
      Swal.fire({
        icon: "info",
        title: customer.fullName,
        html: `
          <strong>Customer ID:</strong> #${customer.id.slice(0, 8)}<br/>
          <strong>Status:</strong> ${customer.status || "Active"}<br/>
          <strong>Verified:</strong> ${customer.verified ? "Yes" : "No"}
        `,
      });
      return;
    }

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
  const verifiedCount = allCustomers.filter((c) => c.verified).length;
  const pendingKyc = allCustomers.filter((c) => !c.verified).length;

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

      {/* STATS CARDS (RESTORED) */}
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

      {/* CUSTOMER LIST (UNCHANGED UI) */}
      <Card className="bg-white rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-purple-700">
          <Users size={24} /> All Customers
        </div>

        <div className="space-y-4">
          {customers.map((c) => {
            const status = c.status || "Active";

            return (
              <Card
                key={c.id}
                className="bg-blue-50 rounded-xl shadow-sm flex px-6 py-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-bold">
                    {c.fullName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg">{c.fullName}</h4>
                    <p className="text-sm text-gray-500">
                      #{c.id.slice(0, 8)}
                    </p>

                    <div className="flex gap-2 mt-2">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-lg ${
                          c.verified
                            ? "bg-green-100 text-green-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {c.verified ? "✔ Verified" : "Not Verified"}
                      </span>

                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-lg ${
                          status === "Blocked"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  <Button
                    variant="outline"
                    onClick={() => handleAction(c, "view")}
                    className="rounded-xl px-4 flex items-center gap-2"
                  >
                    <Eye size={18} />
                    View
                  </Button>

                  {status === "Blocked" ? (
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
