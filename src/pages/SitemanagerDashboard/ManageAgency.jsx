// src/pages/agency-dashboard/ManageAgency.jsx

import React, { useState } from "react";
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
  const originalAgencies = [
    { id: "AGN001", name: "Swift Logistics", status: "Verified", activity: "Active", rating: 4.8 },
    { id: "AGN002", name: "Express Transport Co", status: "Verified", activity: "Active", rating: 4.6 },
    { id: "AGN003", name: "FastMove Carriers", status: "Pending", activity: "Active", rating: 4.2 },
    { id: "AGN004", name: "QuickShip Logistics", status: "Verified", activity: "Active", rating: 4.9 },
    { id: "AGN005", name: "Reliable Movers", status: "Rejected", activity: "Blocked", rating: 3.8 },
  ];

  const [agencies, setAgencies] = useState(originalAgencies);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Highlight matched text
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

  const handleAction = (agency, action) => {
    if (action === "view") {
      Swal.fire({
        icon: "info",
        title: "Agency Details",
        html: `
          <strong>${agency.name}</strong><br/>
          Code: ${agency.id}<br/>
          Status: ${agency.status}<br/>
          Activity: ${agency.activity}<br/>
          Rating: ${agency.rating}
        `,
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
      }).then((r) => {
        if (r.isConfirmed) {
          const updated = agencies.map((a) =>
            a.id === agency.id ? { ...a, activity: "Blocked" } : a
          );
          setAgencies(updated);
          Swal.fire("Blocked!", `${agency.name} has been blocked.`, "success");
        }
      });
      return;
    }

    if (action === "unblock") {
      Swal.fire({
        title: "Unblock Agency?",
        text: `Do you want to unblock ${agency.name}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, Unblock",
      }).then((r) => {
        if (r.isConfirmed) {
          const updated = agencies.map((a) =>
            a.id === agency.id ? { ...a, activity: "Active" } : a
          );
          setAgencies(updated);
          Swal.fire("Unblocked!", `${agency.name} is now active.`, "success");
        }
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-purple-700 mb-1">
            Manage Agencies
          </h2>
          <p className="text-gray-600">View and manage all registered agencies</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500"
              />
              <Input
                placeholder="Search agencies..."
                value={search}
                onChange={(e) => handleTyping(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-white shadow-md rounded-3xl focus:ring-2 focus:ring-purple-400 text-[15px]"
              />
            </div>

            <Button className="h-12 px-6 rounded-3xl bg-purple-600 text-white hover:bg-purple-700 shadow-md">
              Search
            </Button>
          </div>

          {/* Suggestions */}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-600 text-white rounded-2xl">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm">Total Agencies</p>
              <p className="text-3xl font-bold mt-1">{originalAgencies.length}</p>
            </div>
            <div className="bg-blue-500/30 p-3 rounded-xl">
              <Building className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-600 text-white rounded-2xl">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm">Verified</p>
              <p className="text-3xl font-bold mt-1">
                {originalAgencies.filter((a) => a.status === "Verified").length}
              </p>
            </div>
            <div className="bg-green-500/30 p-3 rounded-xl">
              <CheckCircle size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-600 text-white rounded-2xl">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm">Active Agencies</p>
              <p className="text-3xl font-bold mt-1">
                {originalAgencies.filter((a) => a.activity === "Active").length}
              </p>
            </div>
            <div className="bg-purple-500/30 p-3 rounded-xl">
              <AlertTriangle size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agency List */}
      <Card className="bg-white rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-purple-700">
          <Building className="w-5 h-5" /> All Agencies
        </div>

        <div className="space-y-3">
          {agencies.map((a, index) => (
            <Card
              key={index}
              className="bg-blue-50 rounded-xl shadow-sm flex px-4 py-3"
            >

              {/* LEFT */}
              <div className="flex items-start gap-4 flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-bold">
                  {a.name.split(" ").map((w) => w[0]).join("")}
                </div>

                <div>
                  <h4 className="font-semibold text-lg">{a.name}</h4>
                  <p className="text-sm text-gray-500">#{a.id}</p>

                  <div className="flex gap-2 mt-1">
                    {a.status === "Verified" && (
                      <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-1 rounded-lg">
                        ✔ Verified
                      </span>
                    )}

                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                        a.activity === "Blocked"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {a.activity}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3 ml-auto">

                {/* VIEW BUTTON */}
                <Button
                  variant="outline"
                  className="rounded-xl px-4 flex items-center gap-2 border-gray-300 hover:bg-gray-100"
                  onClick={() => handleAction(a, "view")}
                >
                  <Eye size={18} />
                  View
                </Button>

                {/* BLOCK / UNBLOCK */}
                {a.activity === "Blocked" ? (
                  <Button
                    variant="ghost"
                    className="rounded-xl px-4 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition"
                    onClick={() => handleAction(a, "unblock")}
                  >
                    Unblock
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="rounded-xl px-4 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition"
                    onClick={() => handleAction(a, "block")}
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
