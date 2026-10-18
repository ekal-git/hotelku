import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Ganti isi di bawah dengan config dari Firebase Console (Project settings > Your apps > Web app)
const firebaseConfig = {
  apiKey: "AIzaSyDDtdwbdYbYTbVmuu9DNodYmDYXbmVWlsE",
  authDomain: "hotelku-d5e45.firebaseapp.com",
  projectId: "hotelku-d5e45",
  storageBucket: "hotelku-d5e45.firebasestorage.app",
  messagingSenderId: "162207063398",
  appId: "1:162207063398:web:8ee2f8f1858d09282bbca7"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
