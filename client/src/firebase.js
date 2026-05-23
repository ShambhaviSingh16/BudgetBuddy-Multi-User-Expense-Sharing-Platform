// Replace these values with your Firebase config
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSKx9M0be7poslE-6Wsl3oWpEj0oOm3-E",
  authDomain: "budgetbuddy-ac5cf.firebaseapp.com",
  projectId: "budgetbuddy-ac5cf",
  storageBucket: "budgetbuddy-ac5cf.appspot.com",
  messagingSenderId: "610641791492",
  appId: "1:610641791492:web:a7722e4ac947c734b5c351",
  measurementId: "G-W0VM826CG9"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);