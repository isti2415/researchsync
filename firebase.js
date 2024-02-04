import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAQSiTTOChxQZd8GgXk__aRFW2G-DFDg8E",
  authDomain: "researchsync-4b73c.firebaseapp.com",
  databaseURL:
    "https://researchsync-4b73c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "researchsync-4b73c",
  storageBucket: "researchsync-4b73c.appspot.com",
  messagingSenderId: "278971190167",
  appId: "1:278971190167:web:e82fef3b344cd43de392d2",
  measurementId: "G-ZSP6TLNMR2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };