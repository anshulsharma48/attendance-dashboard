import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAmajzAam0S7Ief28lwNgFn9s6RoZixp0s",
  authDomain: "attendance-tracker-a6756.firebaseapp.com",
  projectId: "attendance-tracker-a6756",
  storageBucket: "attendance-tracker-a6756.firebasestorage.app",
  messagingSenderId: "861754591796",
  appId: "1:861754591796:web:f0d3c45217acb1328ad861"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage=getStorage(app);
