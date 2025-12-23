import { initializeApp } from "firebase/app";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";

// ------------------------------------------------------------------
// FIREBASE CONFIGURATION
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyD5LI4eLFw1wa87wgO4IIP8tVvcsAMbqAE",
  authDomain: "poulty-farm-app.firebaseapp.com",
  // Inferred databaseURL from projectId. Standard format for default RTDB instance.
  databaseURL: "https://poulty-farm-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "poulty-farm-app",
  storageBucket: "poulty-farm-app.firebasestorage.app",
  messagingSenderId: "201523486473",
  appId: "1:201523486473:web:66001abec4a057e83c3dd8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const db = getDatabase(app);

// ------------------------------------------------------------------
// EMULATOR CONFIGURATION (Development Only)
// ------------------------------------------------------------------
// Check if running locally. This is a safe way to connect to emulators only during development.
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  // Connect to the Realtime Database Emulator
  // Default port is 9000, but check what your emulator is using when you run 'firebase emulators:start'
  connectDatabaseEmulator(db, "127.0.0.1", 9000);
  console.log("✅ Firebase is connected to LOCAL Emulators (Database: 127.0.0.1:9000)");
} else {
  console.log("✅ Firebase is connected to LIVE project.");
}

export { db };