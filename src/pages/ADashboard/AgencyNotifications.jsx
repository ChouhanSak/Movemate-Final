import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { useEffect, useState, useRef } from "react";

export default function AgencyNotifications({ agencyId }) {
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!agencyId) return;

    // 5 days pehle ki date
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const q = query(
      collection(db, "notifications"),
      where("agencyId", "==", agencyId),
      where("createdAt", ">=", fiveDaysAgo),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(list);
    });

    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        // Agar dropdown style hai to show/hide handle karna
        // setShowNotifications(false);
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      unsub();
      window.removeEventListener("click", handleClickOutside);
    };
  }, [agencyId]);

  return (
    <div
      ref={notifRef}
      className="w-80 max-h-96 overflow-y-auto bg-white shadow-xl rounded-xl p-4"
    >
      <h3 className="font-semibold mb-3">Notifications</h3>

      {notifications.length === 0 && (
        <p className="text-sm text-gray-400">No notifications</p>
      )}

      {notifications.map(n => (
        <div
          key={n.id}
          className={`p-2 rounded mb-2 text-sm ${
            n.read ? "bg-gray-100" : "bg-purple-50"
          }`}
        >
          🔔 {n.message}
        </div>
      ))}
    </div>
  );
}