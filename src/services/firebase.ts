import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "my-wedding-db.firebaseapp.com",
    projectId: "my-wedding-db",
    storageBucket: "my-wedding-db.firebasestorage.app",
    messagingSenderId: "774512887690",
    appId: "1:774512887690:web:932b27c24da04de02b6a73",
    measurementId: "G-W8JVCC7X25"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
