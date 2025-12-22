// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7Ob8BX47j2W5mzxO-d5NlnMlyA-6JDRc",
  authDomain: "aromawarap.firebaseapp.com",
  projectId: "aromawarap",
  storageBucket: "aromawarap.firebasestorage.app",
  messagingSenderId: "784780067396",
  appId: "1:784780067396:web:2be7b30e2c0257a80e7211",
  measurementId: "G-9D24PK2TRW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };


