// src/pages/customer-dashboard/ManageCustomer.jsx

import React, { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Eye, Users, CheckCircle, AlertTriangle } from "lucide-react";
import Swal from "sweetalert2";

export default function ManageCustomer() {
  const originalCustomers = [
    { id: "CUST001", name: "Rahul Sharma", verified: true, status: "Active" },
    { id: "CUST002", name: "Priya Patel", verified: true, status: "Active" },
    { id: "CUST003", name: "Amit Kumar", verified: false, status: "Blocked" },
  ];

  const [customers, setCustomers] = useState(originalCustomers);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

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
      setCustomers(originalCustomers);
      return;
    }
    const matches = originalCustomers.filter((c) =>
      c.name.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(matches);
    setCustomers(matches);
  };

  const handleSelectSuggestion = (name) => {
    setSearch(name);
    setSuggestions([]);
    const filtered = originalCustomers.filter((c) =>
      c.name.toLowerCase().includes(name.toLowerCase())
    );
    setCustomers(filtered);
  };

  const handleAction = (customer, action) => {
    if (action === "view") {
      Swal.fire({
        icon: "info",
        title: customer.name,
        html: `
          <strong>Customer ID:</strong> ${customer.id}<br/>
          <strong>Status:</strong> ${customer.status}<br/>
          <strong>Verified:</strong> ${customer.verified ? "Yes" : "No"}
        `,
      });
      return;
    }

    if (action === "block") {
      Swal.fire({
        title: "Block Customer?",
        text: `Are you sure you want to block ${customer.name}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, Block",
      }).then((r) => {
        if (r.isConfirmed) {
          const updated = customers.map((c) =>
            c.id === customer.id ? { ...c, status: "Blocked" } : c
          );
          setCustomers(updated);
          Swal.fire("Blocked!", `${customer.name} has been blocked.`, "success");
        }
      });
      return;
    }

    if (action === "unblock") {
      Swal.fire({
        title: "Unblock Customer?",
        text: `Do you want to unblock ${customer.name}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, Unblock",
      }).then((r) => {
        if (r.isConfirmed) {
          const updated = customers.map((c) =>
            c.id === customer.id ? { ...c, status: "Active" } : c
          );
          setCustomers(updated);
          Swal.fire(
            "Unblocked!",
            `${customer.name} is now active.`,
            "success"
          );
        }
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-purple-700 mb-1">
            Manage Customers
          </h2>
          <p className="text-gray-600">
            View and manage all registered customers
          </p>
        </div>

        <div className="relative w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500"
              />
              <Input
                placeholder="Search customers..."
                value={search}
                onChange={(e) => handleTyping(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-white shadow-md rounded-3xl focus:ring-2 focus:ring-purple-400 text-[15px]"
              />
            </div>
            <Button className="h-12 px-6 rounded-3xl bg-purple-600 text-white hover:bg-purple-700 shadow-md">
              Search
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="absolute left-0 top-14 w-full md:w-64 bg-white shadow-xl rounded-2xl z-10 border p-1">
              {suggestions.map((s, i) => (
                <div
                  key={i}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-600 text-white rounded-2xl">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm">Total Customers</p>
              <p className="text-3xl font-bold mt-1">{originalCustomers.length}</p>
            </div>
            <div className="bg-blue-500/30 p-3 rounded-xl">
              <Users size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-600 text-white rounded-2xl">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm">Verified</p>
              <p className="text-3xl font-bold mt-1">
                {originalCustomers.filter((c) => c.verified).length}
              </p>
            </div>
            <div className="bg-green-500/30 p-3 rounded-xl">
              <CheckCircle size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500 text-white rounded-2xl">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm">Pending KYC</p>
              <p className="text-3xl font-bold mt-1">
                {originalCustomers.filter((c) => !c.verified).length}
              </p>
            </div>
            <div className="bg-orange-400/30 p-3 rounded-xl">
              <AlertTriangle size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card className="bg-white rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-purple-700">
          <Users size={24} /> All Customers
        </div>

        <div className="space-y-3">
          {customers.map((c, index) => (
            <Card
              key={index}
              className="bg-blue-50 rounded-xl shadow-sm flex px-4 py-3"
            >
              {/* Left */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-bold">
                  {c.name.split(" ").map((w) => w[0]).join("")}
                </div>

                <div>
                  <h4 className="font-semibold text-lg">{c.name}</h4>
                  <p className="text-sm text-gray-500">#{c.id}</p>

                  <div className="flex gap-2 mt-1">
                    {c.verified && (
                      <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-1 rounded-lg">
                        ✔ Verified
                      </span>
                    )}

                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                        c.status === "Blocked"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Buttons */}
              <div className="flex items-center gap-3 ml-auto">
                <Button
                  variant="outline"
                  onClick={() => handleAction(c, "view")}
                  className="rounded-xl px-4 flex items-center gap-2 border-gray-300 hover:bg-gray-100"
                >
                  <Eye size={18} />
                  View
                </Button>

                {c.status === "Blocked" ? (
                  <Button
                    className="rounded-xl px-4 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                    onClick={() => handleAction(c, "unblock")}
                  >
                    Unblock
                  </Button>
                ) : (
                  <Button
                    className="rounded-xl px-4 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    onClick={() => handleAction(c, "block")}
                  >
                    Block
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
