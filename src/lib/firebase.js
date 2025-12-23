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
// In your firebase.js connection logic
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  // Local emulator connections
  connectDatabaseEmulator(db, "127.0.0.1", 9001);
  //connectAuthEmulator(auth, "http://127.0.0.1:9099");
} else if (window.location.hostname.startsWith("192.168.")) { // Network IP range
  // Connect to network IP emulators
  connectDatabaseEmulator(db, "192.168.88.232", 9001);
  //connectAuthEmulator(auth, `http://192.168.88.232:9099`);
}

export { db };