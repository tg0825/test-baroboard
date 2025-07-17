// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQBeprdzHGRgTmwdD3mF5yoZh74W6iHbU",
  authDomain: "baroboard.firebaseapp.com",
  projectId: "baroboard",
  storageBucket: "baroboard.firebasestorage.app",
  messagingSenderId: "521700051274",
  appId: "1:521700051274:web:ee9ea49e0295eefff099b3"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

// Initialize Analytics (only in browser environment)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Export Firebase services
export { app, db, auth, analytics };
export default app;