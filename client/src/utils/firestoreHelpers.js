// src/utils/firestoreHelpers.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; // path depends on your project; adjust if needed

/**
 * Get settings stored for a user (users/<uid>/settings)
 */
export async function getUserSettings(uid) {
  if (!uid) return null;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return data.settings || null;
}

/**
 * Save / merge user settings (stores under users/<uid>.settings)
 * Example: saveUserSettings(uid, { budget: 1.2 })
 */
export async function saveUserSettings(uid, settings = {}) {
  if (!uid) throw new Error("Missing uid");
  const ref = doc(db, "users", uid);
  await setDoc(ref, { settings }, { merge: true });
  return true;
}


/**
 * Export user data (returns object URL)
 * For simplicity, we build a JSON and create a blob URL. For production, you could upload to storage.
 */
export async function exportUserData(uid) {
  if (!uid) throw new Error("Missing uid");
  // Fetch user doc
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const userDoc = snap.exists() ? snap.data() : null;

  // Build JSON object - in future you can also call getMyExpenses() via contract and include on-chain data
  const payload = {
    exportedAt: new Date().toISOString(),
    user: userDoc,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  return url;
}