// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAa7nX3CxpcdXunL9IYIIChPLAhU9itrc8",
  authDomain: "shelfaware-110f0.firebaseapp.com",
  projectId: "shelfaware-110f0",
  storageBucket: "shelfaware-110f0.firebasestorage.app",
  messagingSenderId: "942954308450",
  appId: "1:942954308450:web:c8a2d4fd5e73ec4484423b",
  measurementId: "G-W0CEQ8WBJH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;