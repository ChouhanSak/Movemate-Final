import React, { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Edit } from "lucide-react"
import { auth, db } from "../../Firebase";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useEffect } from "react";
export default function CustomerSettings({ userData = {} }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

const [addresses, setAddresses] = useState([
  {
    line: "Flat 101, Sunrise Apartments",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  },
  {
    line: "House 23, Green Park Colony",
    city: "Delhi",
    state: "Delhi",
    pincode: "110016",
  },
]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [addressForm, setAddressForm] = useState({
    line: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [passwords, setPasswords] = useState({
  current: "",
  new: "",
  confirm: "",
});
  const [profile, setProfile] = useState({
  fullName: userData?.fullName || "",
  email: userData?.email || "",
  phone: userData?.phone || "",
});
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (!user) return;

    const ref = doc(db, "customers", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
  setProfile({
    fullName: snap.data().fullName || "",
    email: snap.data().email || user.email,
    phone: snap.data().phone || "",
  });
} else {
      await setDoc(ref, {
        fullName: user.displayName || "",
        email: user.email,
        phone: "",
        address: [],
        createdAt: serverTimestamp(),
      });
    }
  });

  return () => unsubscribe();
}, []);
const handleSaveProfile = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "customers", user.uid), {
      fullName: profile.fullName,
      phone: profile.phone,
    });

    alert("Profile updated successfully ✅");
    setIsEditing(false);
  } catch (error) {
    alert(error.message);
  }
};
const handleUpdateAddress = () => {
  const updatedAddresses = [...addresses];
  updatedAddresses[editingIndex] = addressForm;

  setAddresses(updatedAddresses);
  setShowAddressModal(false);
};
const handlePasswordUpdate = async () => {
  setPasswordError("");
  setPasswordSuccess("");

  const user = auth.currentUser;
  if (!user) return;

  //  Confirm password mismatch
  if (passwords.new !== passwords.confirm) {
    setPasswordError("* New password and confirm password do not match");
    return;
  }

  try {
    // 🔐 Re-authenticate user
    const credential = EmailAuthProvider.credential(
      user.email,
      passwords.current
    );

    await reauthenticateWithCredential(user, credential);

    //  Password verified → update
    await updatePassword(user, passwords.new);

    setPasswordSuccess("Password updated successfully ");
    setPasswords({ current: "", new: "", confirm: "" });
  } catch (error) {
    setPasswordError("* Current password does not match");
  }
};
  return (
    <div className="space-y-8">
      {/* USER PROFILE */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">👤 User Profile</h2>

          <div>
            <Label>Full Name</Label>
            <Input
            placeholder="Enter new full name"
            value={profile.fullName}
            disabled={!isEditing}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
              setProfile({ ...profile, fullName: value });
            }}
          />

          </div>
          <div>
            <Label>E-mail</Label>
            <Input
                placeholder="Enter new email"
                value={profile.email}
                disabled={!isEditing}
                />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
            placeholder="Enter new phone number"
            value={profile.phone}
            disabled={!isEditing}
            maxLength={10}
            inputMode="numeric"
            pattern="[0-9]*"
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 10) {
                setProfile({ ...profile, phone: value });
              }
            }}
          />


        </div>
{!isEditing ? (
  <Button
    onClick={() => {
      setOriginalProfile(profile);
      setIsEditing(true);
    }}
    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
  >
    <Edit className="w-4 h-4 mr-2" />
    Edit Profile
  </Button>
) : (
  <div className="flex flex-col gap-2">
    <div className="flex gap-3">
      {/*  Cancel */}
      <Button
        variant="outline"
        onClick={() => {
          setProfile(originalProfile);
          setIsEditing(false);
          setShowConfirm(false);
        }}
      >
        Cancel
      </Button>

      {/* Confirm */}
      <Button
        variant="outline"
        className="border-green-600 text-green-600 hover:bg-green-50"
        onClick={() => setShowConfirm(true)}
      >
        Confirm Update
      </Button>

      {/*  Save */}
      <Button
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        disabled={!showConfirm}
        onClick={handleSaveProfile}
      >
        Save Profile
      </Button>
    </div>

    {/* helper text */}
    {isEditing && (
      <p className="text-xs text-gray-500">
        Please confirm before saving changes
      </p>
    )}
  </div>
)}

        </CardContent>
      </Card>
      {/* ADDRESS SECTION */}
        <Card>
        <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
             Address
            </h2>

            {addresses.map((addr, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border"
            >
              <div>
                <p className="font-medium">{addr.line}</p>
                <p className="text-sm text-gray-600">
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
              </div>

              <Button
                variant="ghost"
                onClick={() => {
                  setEditingIndex(index);
                  setAddressForm(addr);
                  setShowAddressModal(true);
                }}
              >
                Edit
              </Button>
            </div>
          ))}
        </CardContent>
        </Card>


      {/* SECURITY */}
      <Card>
  <CardContent className="p-6 space-y-4">
    <h2 className="text-xl font-semibold"> Security</h2>

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
        disabled={!passwords.current}
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
        placeholder="Confirm new password"
        disabled={!passwords.new}
        value={passwords.confirm}
        onChange={(e) =>
          setPasswords({ ...passwords, confirm: e.target.value })
        }
      />
    </div>

    {/* Error Message */}
    {passwordError && (
      <p className="text-red-500 text-sm">{passwordError}</p>
    )}

    {/* ✅ Success Message */}
    {passwordSuccess && (
      <p className="text-green-600 text-sm">{passwordSuccess}</p>
    )}

    <Button
      variant="outline"
      className="border-green-600 text-green-600"
      onClick={handlePasswordUpdate}
    >
      Update Password
    </Button>
  </CardContent>
</Card>
      {/* EDIT ADDRESS MODAL */}
        {showAddressModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative">

            {/* Close Button */}
            <button
                className="absolute top-4 right-4 text-gray-500"
                onClick={() => {
                setAddressForm({ line: "", city: "", state: "", pincode: "" });
                setEditingIndex(null);
                setShowAddressModal(false);
              }}

            >
                ✕
            </button>

            <h2 className="text-2xl font-semibold text-purple-600 mb-4">
                Edit Address
            </h2>

            {/* Address Line */}
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

            {/* City & State */}
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

            {/* Pincode */}
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

            {/* Buttons */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAddressModal(false)}>
                Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  onClick={handleUpdateAddress}
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