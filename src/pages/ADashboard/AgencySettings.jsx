import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../../Firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
export default function AgencySettings() {
const [showAddressModal, setShowAddressModal] = useState(false);
const [addressForm, setAddressForm] = useState({
  line: "",
  city: "",
  state: "",
  pincode: "",
});
const [agency, setAgency] = useState({
  agencyName: "",
  fullName: "",
  email: "",
  phone: "",
});
const [passwords, setPasswords] = useState({
  current: "",
  new: "",
  confirm: "",
});
const [isEditing, setIsEditing] = useState(false);
const [originalAgency, setOriginalAgency] = useState(null);
const [showConfirm, setShowConfirm] = useState(false);
const [passwordError, setPasswordError] = useState("");
const [passwordSuccess, setPasswordSuccess] = useState("");
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (!user) return;

    const ref = doc(db, "agencies", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();

      setAgency({
        agencyName: data.agencyName || "",
        fullName: data.fullName || "",
        email: data.email || user.email,
        phone: data.phone || "",
      });
    }
  });

  return () => unsubscribe();
}, []);

  return (
    <div className="space-y-8">
        {/* ===== PAGE HEADER (ADD THIS) ===== */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage agency profile, address, pricing and security
        </p>
      </div>


      {/* PROFILE */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold"> Agency Profile</h2>

          <div>
            <Label>Agency Name</Label>
           <Input
  value={agency.agencyName}
  disabled={!isEditing}
  onChange={(e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // no digits or symbols
    setAgency({ ...agency, agencyName: value });
  }}
/>

        </div>

          <div>
            <Label>Owner / Manager Name</Label>
          <Input
  value={agency.fullName}
  disabled={!isEditing}
  onChange={(e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // remove digits & symbols
    setAgency({ ...agency, fullName: value });
  }}
/>




          </div>

          <div>
            <Label>E-mail</Label>
            <Input value={agency.email} disabled />
          </div>

          <div>
            <Label>Phone Number</Label>
           <Input
  value={agency.phone}
  disabled={!isEditing}
  maxLength={10}
  inputMode="numeric"
  pattern="[0-9]*"
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ""); // remove non-digits
    if (value.length <= 10) {
      setAgency({ ...agency, phone: value });
    }
  }}
/>
     </div>

          {!isEditing ? (
  <Button
    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
    onClick={() => {
      setOriginalAgency(agency); // save old data
      setIsEditing(true);
    }}
  >
    Edit Profile
  </Button>
) : (
  <div className="flex gap-3">
    {/*  Cancel */}
    <Button
      variant="outline"
      onClick={() => {
        setAgency(originalAgency);
        setIsEditing(false);
        setShowConfirm(false);
      }}
    >
      Cancel
    </Button>

    {/*  Confirm */}
    <Button
      variant="outline"
    className="border-green-600 text-green-600 hover:bg-green-50"
      onClick={() => setShowConfirm(true)}
    >
      Confirm Update
    </Button>

    {/* Save */}
    <Button
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
      disabled={!showConfirm}
      onClick={async () => {
        const user = auth.currentUser;
        if (!user) return;

        await updateDoc(doc(db, "agencies", user.uid), {
          agencyName: agency.agencyName,
          fullName: agency.fullName,
          phone: agency.phone,
        });

        alert("Agency profile updated ✅");
        setIsEditing(false);
        setShowConfirm(false);
      }}
    >
      Save Profile
    </Button>
  </div>
)}


        </CardContent>
      </Card>

      {/* ADDRESS */}
      <Card>
              <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                   Address
                  </h2>
      
                  {/* Address 1 */}
                  <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border">
                  <div>
                      <p className="font-medium">Flat 101, Sunrise Apartments</p>
                      <p className="text-sm text-gray-600">
                      Mumbai, Maharashtra - 400001
                      </p>
                  </div>
                  <Button
                      variant="ghost"
                      onClick={() => {
                          setAddressForm({
                          line: "Flat 101, Sunrise Apartments",
                          city: "Mumbai",
                          state: "Maharashtra",
                          pincode: "400001",
                          });
                          setShowAddressModal(true);
                      }}
                      >
                      Edit
                  </Button>
      
                  </div>
      
                  {/* Address 2 */}
                  <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border">
                  <div>
                      <p className="font-medium">House 23, Green Park Colony</p>
                      <p className="text-sm text-gray-600">
                      Delhi, Delhi - 110016
                      </p>
                  </div>
                  <Button
                      variant="ghost"
                      onClick={() => {
                          setAddressForm({
                          line: "House 23, Green Park Colony",
                          city: "Delhi",
                          state: "Delhi",
                          pincode: "110016",
                          });
                          setShowAddressModal(true);
                      }}
                      >
                      Edit
                  </Button>
      
                  </div>
              </CardContent>
              </Card>
      {/* SECURITY */}
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Security</h2>

        {/* Current Password */}
        <div>
          <Label>Current Password</Label>
          <Input
            type="password"
            placeholder="Enter current password"
            value={passwords.current}
            onChange={(e) =>
              setPasswords({ ...passwords, current: e.target.value })
            }
          />
        </div>

        {/* New Password */}
        <div>
          <Label>New Password</Label>
          <Input
            type="password"
            placeholder="Enter new password"
            value={passwords.new}
            onChange={(e) =>
              setPasswords({ ...passwords, new: e.target.value })
            }
          />
        </div>

        {/* Confirm Password */}
        <div>
          <Label>Confirm New Password</Label>
          <Input
            type="password"
            placeholder="Re-enter new password"
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords({ ...passwords, confirm: e.target.value })
            }
          />
        </div>

        {passwordError && (
          <p className="text-red-500 text-sm">{passwordError}</p>
        )}
        {passwordSuccess && (
          <p className="text-green-600 text-sm">{passwordSuccess}</p>
        )}

        <Button
          variant="outline"
          className="border-green-600 text-green-600"
          onClick={async () => {
            setPasswordError("");
            setPasswordSuccess("");

            const user = auth.currentUser;
            if (!user) return;

            if (passwords.new !== passwords.confirm) {
              setPasswordError("New Password do not match with confirm password");
              return;
            }

            try {
              const credential = EmailAuthProvider.credential(
                user.email,
                passwords.current
              );

              await reauthenticateWithCredential(user, credential);
              await updatePassword(user, passwords.new);

              setPasswordSuccess("Password updated successfully 🔒");
              setPasswords({ current: "", new: "", confirm: "" });
            } catch {
              setPasswordError("Current password is incorrect");
            }
          }}
        >
          Change Password
        </Button>
      </CardContent>
    </Card>
    {showAddressModal && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
    <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative">

      {/* Close */}
      <button
        className="absolute top-4 right-4 text-gray-500"
        onClick={() => setShowAddressModal(false)}
      >
        ✕
      </button>
      <h2 className="text-2xl font-semibold text-purple-600 mb-4">
        Edit Address
      </h2>

      <div className="mb-4">
        <Label>Address Line</Label>
        <Input
          className="!border !border-gray-300 rounded-lg bg-white !ring-0 focus:!border-gray-400"
          value={addressForm.line}
          onChange={(e) =>
            setAddressForm({ ...addressForm, line: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label>City</Label>
          <Input
             className="!border !border-gray-300 rounded-lg bg-white !ring-0 focus:!border-gray-400"
            value={addressForm.city}
            onChange={(e) =>
              setAddressForm({ ...addressForm, city: e.target.value })
            }
          />
        </div>

        <div>
          <Label>State</Label>
          <Input
             className="!border !border-gray-300 rounded-lg bg-white !ring-0 focus:!border-gray-400"
            value={addressForm.state}
            onChange={(e) =>
              setAddressForm({ ...addressForm, state: e.target.value })
            }
          />
        </div>
      </div>

      <div className="mb-6">
        <Label>Pincode</Label>
        <Input
           className="!border !border-gray-300 rounded-lg bg-white !ring-0 focus:!border-gray-400"
          value={addressForm.pincode}
          onChange={(e) =>
            setAddressForm({ ...addressForm, pincode: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setShowAddressModal(false)}>
          Cancel
        </Button>
       <Button
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          onClick={() => setShowAddressModal(false)}
        >
          Update Address
        </Button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}