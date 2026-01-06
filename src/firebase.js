import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDueNuJP05NcS2AZQJNF0FpuHcCv-2icxk",
    authDomain: "gym-system-c7b7e.firebaseapp.com",
    projectId: "gym-system-c7b7e",
    storageBucket: "gym-system-c7b7e.firebasestorage.app",
    messagingSenderId: "1008783483120",
    appId: "1:1008783483120:web:4f8561e81960e5ae042235",
    measurementId: "G-9911RMY8CR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
