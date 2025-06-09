
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAa7nX3CxpcdXunL9IYIIChPLAhU9itrc8",
  authDomain: "shelfaware-110f0.firebaseapp.com",
  projectId: "shelfaware-110f0",
  storageBucket: "shelfaware-110f0.appspot.com",
  messagingSenderId: "942954308450",
  appId: "1:942954308450:web:c8a2d4fd5e73ec4484423b",
  measurementId: "G-W0CEQ8WBJH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db , storage};