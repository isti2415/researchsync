// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDm5G7DJIsJ9M8i-TciePB1wcOa-x6jLoo",
  authDomain: "netowrking-research.firebaseapp.com",
  projectId: "netowrking-research",
  storageBucket: "netowrking-research.appspot.com",
  messagingSenderId: "171257401099",
  appId: "1:171257401099:web:1c9d4b98aedaf0714a9c0e",
  measurementId: "G-LFTVWR9QZF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;