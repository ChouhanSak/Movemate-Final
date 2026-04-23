import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

export const auth = getAuth(app);
export const db = getFirestore(app);
