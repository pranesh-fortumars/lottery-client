import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// NEW Primary Database Configuration
const primaryConfig = {
  apiKey: "AIzaSyABQ-O6Bfbm8dE2z5zZhSl5--nFefSrzQ4",
  authDomain: "studio-5255428477-b76d2.firebaseapp.com",
  projectId: "studio-5255428477-b76d2",
  storageBucket: "studio-5255428477-b76d2.firebasestorage.app",
  messagingSenderId: "460063714650",
  appId: "1:460063714650:web:b2f439a903c5b23e4ad763"
};

// OLD Secondary Database Configuration (Read-only backup)
const secondaryConfig = {
  apiKey: "AIzaSyDspQUM5ih87vrKeVXGkFqi1YypHlbcZlM",
  authDomain: "lottery-application-136.firebaseapp.com",
  databaseURL: "https://lottery-application-136-default-rtdb.firebaseio.com",
  projectId: "lottery-application-136",
  storageBucket: "lottery-application-136.firebasestorage.app",
  messagingSenderId: "1040005504976",
  appId: "1:1040005504976:web:94290a16e22610a0ece3d5",
  measurementId: "G-KMCWVS30BJ"
};

// Initialize Primary App (Default)
const app = !getApps().length ? initializeApp(primaryConfig) : getApp();
const auth = getAuth(app);

// Optimized for Capacitor/Mobile: Force Long Polling to prevent 400/Aborted errors
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});
const rtdb = getDatabase(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Secondary App
const secondaryApp = initializeApp(secondaryConfig, "secondary");
const secondaryDb = getFirestore(secondaryApp);
const secondaryAuth = getAuth(secondaryApp);

export { app, auth, db, rtdb, analytics, secondaryApp, secondaryDb, secondaryAuth };
