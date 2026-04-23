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
const [agency, setAgency] = useState({
  agencyName: "",
  fullName: "",
  email: "",
  phone: "",
});
const [address, setAddress] = useState({
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

  //for address
  setAddress({
  line: data.address || "",
  city: data.city || "",
  state: data.state || "",
  pincode: data.pincode || "",
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
    <h2 className="text-xl font-semibold">Address</h2>

    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border">
      {address.line ? (
        <>
          <p className="font-medium">{address.line}</p>
          <p className="text-sm text-gray-600">
            {address.city}, {address.state} - {address.pincode}
          </p>
        </>
      ) : (
        <p className="text-gray-500">No address found</p>
      )}
    </div>

    <p className="text-sm text-gray-400">
     Initial address at the time of registration.
    </p>
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
    </div>
  );
}