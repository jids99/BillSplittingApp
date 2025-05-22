// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBnNs3ramzn2qXMfTX2FdGc67gmcwMKiM",
  authDomain: "billsplit-2d0f8.firebaseapp.com",
  projectId: "billsplit-2d0f8",
  storageBucket: "billsplit-2d0f8.firebasestorage.app",
  messagingSenderId: "904271053829",
  appId: "1:904271053829:web:8b8b2a7c5d1a01e6b0c86c",
  measurementId: "G-PCX4EP9SEL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// ✅ Named export
export const db = getFirestore(app);