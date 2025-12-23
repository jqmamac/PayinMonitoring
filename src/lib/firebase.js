import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// ------------------------------------------------------------------
// FIREBASE CONFIGURATION
// Please replace the placeholders below with your actual Firebase config keys.
// You can find these in your Firebase Console -> Project Settings.
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyD5LI4eLFw1wa87wgO4IIP8tVvcsAMbqAE",
  authDomain: "poulty-farm-app.firebaseapp.com",
  projectId: "poulty-farm-app",
  storageBucket: "poulty-farm-app.firebasestorage.app",
  messagingSenderId: "201523486473",
  appId: "1:201523486473:web:66001abec4a057e83c3dd8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and export it
export const db = getDatabase(app);