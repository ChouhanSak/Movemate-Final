// addUsers.js
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc, doc, serverTimestamp } from "firebase/firestore";

// 🔹 Firebase config (same hi rakho)
const firebaseConfig = {
  apiKey: "AIzaSyCYcuxh-IapS587Cc-gkThWaooXBylO51w",
  authDomain: "movemate-ytmp.firebaseapp.com",
  projectId: "movemate-ytmp",
  storageBucket: "movemate-ytmp.appspot.com",
  messagingSenderId: "635156463816",
  appId: "1:635156463816:web:b464e61dde9a942bf565fd",
  measurementId: "G-QZ6S6YKQDR",
  databaseURL: "https://movemate-ytmp-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Function to add user (ONLY email + password)
async function addUser(email, password) {
  try {
    // 1️⃣ Create user in Firebase Auth
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCred.user.uid;

    // 2️⃣ Store user in Firestore
    await setDoc(doc(db, "siteManagers", uid), {
      email,
      createdAt: serverTimestamp(),
    });

    console.log(`✅ User added successfully: ${email}`);
  } catch (error) {
    console.error("❌ Error adding user:", error.message);
  }
}

// 🔹 Add user
addUser("admin1@movemate.com", "Secure123");
