// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkR1psN_b0xVUhlw6IH0uS4RsdIAgzoOs",
  authDomain: "chaturmasya-demo.firebaseapp.com",
  projectId: "chaturmasya-demo",
  storageBucket: "chaturmasya-demo.firebasestorage.app",
  messagingSenderId: "671464700696",
  appId: "1:671464700696:web:e4d3ef907470df13043c6d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);