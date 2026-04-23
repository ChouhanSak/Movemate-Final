import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export const createDriverUploadLink = async (bookingId) => {
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + 20 * 60 * 1000) // 20 minutes
  );

  const ref = await addDoc(collection(db, "driver_upload_links"), {
    bookingId,
    expiresAt,
    used: false,
    createdAt: Timestamp.now(),
  });

  return ref.id; // 👈 TOKEN
};
