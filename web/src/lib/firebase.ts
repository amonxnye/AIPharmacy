import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDlU_a7WHQol8yaXH-BXbpZbm8SssuvJK0",
  authDomain: "aipharamcy.firebaseapp.com",
  projectId: "aipharamcy",
  storageBucket: "aipharamcy.firebasestorage.app",
  messagingSenderId: "983016840228",
  appId: "1:983016840228:web:611029ab98d90e90694cb1",
  measurementId: "G-R3KXDGR7TG",
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Analytics is only available in the browser
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics };
