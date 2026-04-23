import React, { useState, useEffect } from "react";
import { Plus, X, User, Trash2 } from "lucide-react";
import { auth, db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  onSnapshot,updateDoc
} from "firebase/firestore";
import Swal from "sweetalert2";
import { onAuthStateChanged } from "firebase/auth";
import EmptyState from "../../components/EmptyState";

export default function ManageDriver() {
  const [editDriver, setEditDriver] = useState(null);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [agency, setAgency] = useState(null);
const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: ""
  });
const filteredDrivers = drivers.filter((d) =>
  d.driverName.toLowerCase().includes(search.toLowerCase())
);
  const [message, setMessage] = useState("");

  const getStatusStyle = (status) => {
    if (status === "Available") return "bg-green-100 text-green-700";
    if (status === "Not Available") return "bg-gray-200 text-gray-700";
    return "bg-yellow-100 text-yellow-700";
  };

  // DELETE DRIVER
  const handleDeleteDriver = async (driverId, name) => {

    const result = await Swal.fire({
      title: `Delete ${name}?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (!result.isConfirmed) return;

    await deleteDoc(doc(db, "drivers", driverId));

    setDrivers(drivers.filter((d) => d.id !== driverId));

    Swal.fire("Deleted!", "Driver deleted successfully.", "success");
  };
const handleEditDriver = (driver) => {
  setEditDriver(driver);

  setForm({
    name: driver.driverName,
    phone: driver.phone
  });

  setShowAddDriver(true);
};
  // ADD DRIVER
  const handleAddDriver = async () => {

    if (!agency) {
      setMessage("Agency loading...");
      return;
    }

    if (!form.name || !form.phone) {
  setMessage("All fields are mandatory!");
  setTimeout(() => setMessage(""), 3000);
  return;
}

const nameRegex = /^[A-Za-z\s]+$/;
if (!nameRegex.test(form.name)) {
  setMessage("Driver name should contain only letters");
  setTimeout(() => setMessage(""), 3000);
  return;
}

const phoneRegex = /^[6-9]\d{9}$/;

if (!phoneRegex.test(form.phone)) {
  setMessage("Enter valid phone number");
  return;
}

if (/^(\d)\1{9}$/.test(form.phone)) {
  setMessage("Invalid phone number");
  return;
}

    try {
      const q = query(
  collection(db, "drivers"),
  where("agencyId", "==", auth.currentUser.uid),
  where("driverName", "==", form.name),
  where("phone", "==", form.phone)
);

const snap = await getDocs(q);

if (!snap.empty && !editDriver) {
  setMessage("Driver with same name and phone already exists");
  setTimeout(() => setMessage(""), 3000);
  return;
}
      if (editDriver) {

  await updateDoc(doc(db, "drivers", editDriver.id), {
    driverName: form.name,
    phone: form.phone
  });

  setEditDriver(null);
  setShowAddDriver(false);

  setForm({
    name: "",
    phone: ""
  });

  setMessage("Driver updated successfully!");
  setTimeout(() => setMessage(""), 3000);

  return;
}

      const docRef = await addDoc(collection(db, "drivers"), {

  agencyId: auth.currentUser.uid,
  agencyName: agency.agencyName,

  driverName: form.name,
  phone: form.phone,

  status: "Available",

  createdAt: serverTimestamp()

});

      setDrivers([
        ...drivers,
        {
          id: docRef.id,
          driverName: form.name,
          phone: form.phone,
          status: "Available"
        }
      ]);

      setShowAddDriver(false);

      setForm({
        name: "",
        phone: ""
      });

      setMessage("Driver added successfully!");

      setTimeout(() => setMessage(""), 4000);

    } catch (err) {
      console.error(err);
      setMessage("Error adding driver");
    }
  };

  // LOAD DRIVERS
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (user) => {

      if (!user) return;

      const agencyRef = doc(db, "agencies", user.uid);
      const agencySnap = await getDoc(agencyRef);

      if (agencySnap.exists()) setAgency(agencySnap.data());

      const q = query(
        collection(db, "drivers"),
        where("agencyId", "==", user.uid)
      );

      const unsubDrivers = onSnapshot(q, (snap) => {

        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));

        setDrivers(list);
      });

      return () => unsubDrivers();
    });

    return () => unsub();

  }, []);

  return (
    <div className="p-6 bg-white min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">Driver Management</h1>

        <div className="flex items-center gap-6 ml-auto">

         <input
      type="text"
      placeholder="Search driver..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    />

        <button
          onClick={() => setShowAddDriver(true)}
          className="flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(90deg, #3b82f6, #a855f7)" }}
        >
          <Plus className="w-5 h-5" /> Add Driver
        </button>

      </div>
       </div>

      <p className="text-gray-500 mb-8">Manage your drivers</p>

      {/* DRIVER LIST */}

      {drivers.length === 0 ? (

        <div className="flex items-center justify-center min-h-[60vh]">

          <EmptyState
            title="No drivers added yet"
            description="Add your first driver to start accepting bookings."
          />

        </div>

      ) : (

        <div className="bg-gray-50 rounded-xl shadow overflow-hidden">

  {/* TOP STATS */}
  <div className="px-6 py-4 bg-white border-b text-sm text-gray-600 flex gap-6">
    <span className="font-medium">Total Drivers: {drivers.length}</span>

    <span className="text-green-600">
      Available: {drivers.filter(d => d.status === "Available").length}
    </span>

    <span className="text-gray-600">
      On Trip: {drivers.filter(d => d.status === "Not Available").length}
    </span>
  </div>

  {/* TABLE HEADER */}
  <div className="grid grid-cols-5 bg-gray-100 text-gray-600 text-sm font-semibold px-6 py-3">
    <div>Driver Info</div>
    <div>Contact</div>
    <div>Driver ID</div>
    <div className="text-center">Status</div>
    <div className="text-right">Actions</div>
  </div>

  {/* TABLE BODY */}
  {filteredDrivers.map((d) => (
    <div
      key={d.id}
      className="grid grid-cols-5 items-center px-6 py-4 border-t hover:bg-gray-50 transition"
    >
      
      {/* DRIVER INFO */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-3 rounded-full">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold">{d.driverName}</p>
        </div>
      </div>

      {/* CONTACT */}
      <div className="text-gray-600">{d.phone}</div>

      {/* DRIVER ID */}
      <div className="text-gray-500">{d.id}</div>

      {/* STATUS */}
      <div className="flex justify-center">
  <span
    className={`px-3 py-1 text-xs rounded-full font-semibold ${getStatusStyle(d.status)}`}
  >
    {d.status}
  </span>
</div>

      {/* ACTIONS */}
      <div className="flex justify-end items-center gap-2">

  <button
  onClick={() => handleEditDriver(d)}
  className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 transition"
>
  Edit
</button>

  <button
    onClick={() => handleDeleteDriver(d.id, d.driverName)}
    className="p-2 border rounded-md text-red-500 hover:bg-red-50 transition"
  >
    <Trash2 className="w-4 h-4" />
  </button>

</div>

    </div>
  ))}

</div>

      )}

      {/* ADD DRIVER MODAL */}

      {showAddDriver && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">

          <div className="bg-white rounded-xl w-[420px] p-6 shadow-2xl">

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-xl font-semibold">
  {editDriver ? "Edit Driver" : "Add New Driver"}
</h2>

              <X
                className="w-6 h-6 cursor-pointer text-gray-500 hover:text-gray-800"
                onClick={() => setShowAddDriver(false)}
              />

            </div>

            <div className="space-y-4">

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Driver Name
                </label>

                <input
  type="text"
  className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
  placeholder="Driver name"
  value={form.name}
  onChange={(e) => {
    const value = e.target.value;

    // only letters and space allowed
    if (/^[A-Za-z\s]*$/.test(value)) {
      setForm({ ...form, name: value });
    }
  }}
/>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Phone Number
                </label>

                <input
  type="text"
  className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
  placeholder="9876543210"
  value={form.phone}
  maxLength={10}
  onChange={(e) => {
    const value = e.target.value;

    // only numbers allowed and max 10 digits
    if (/^\d{0,10}$/.test(value)) {
      setForm({ ...form, phone: value });
    }
  }}
/>
              </div>
              {message && (
                <p className="text-red-500 text-sm">{message}</p>
              )}

              <button
  className="w-full py-2 text-white font-medium rounded-lg mt-4 shadow-md hover:shadow-lg transition-all"
  style={{ background: "linear-gradient(90deg, #3b82f6, #a855f7)" }}
  onClick={handleAddDriver}
>
  {editDriver ? "Update Driver" : "Save Driver"}
</button>

            </div>

          </div>

        </div>

      )}

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-xl text-white font-medium bg-green-600">
          {message}
        </div>
      )}

    </div>
  );
}