import { useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import {doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

const firebaseConfig = {
  apiKey: "AIzaSyAa7nX3CxpcdXunL9IYIIChPLAhU9itrc8",
  authDomain: "shelfaware-110f0.firebaseapp.com",
  projectId: "shelfaware-110f0",
  messagingSenderId: "942954308450",
  appId: "1:942954308450:web:c8a2d4fd5e73ec4484423b",
};

const VAPID_KEY = "BO7JWzuL-ONtsoVDG8r5iBpnRIhPCeBO0btjHMrWt72K80-rjMyWoBmyG7db22YaBSWvR1SqsjrMSo8lvfb1Ztc"

const firebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

export default function NotificationSetup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const startNotification = async() => {
      const checkUser = auth.currentUser;
      if (!checkUser) return;

      const userData = doc(db, "users", checkUser.uid);
      const userCopy = await getDoc(userData);
      const savedToken = userCopy.data()?.fcmToken;
      if (!savedToken) { //no token yet, ask them
        const register = await navigator.serviceWorker.register(
          "/firebase-notification-sw.js");
        console.log("SW registered at scope:", register.scope);
        if (Notification.permission === "default") {
          const askPermission = await Notification.requestPermission();
          if (askPermission !== "granted") {
            console.log("Permission denied");
            return;
          }
        }

        if (Notification.permission === "granted") {
          const text = getMessaging(firebaseApp);
          const actualToken = await getToken(text, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: register,
          });
          if (actualToken) {
            await updateDoc(userData, { fcmToken: actualToken });
            console.log("Token saved in Firestore");
          } else {
            console.log("No token");
          }
        }
      } else {
        console.log("User has token alr");
      }

      const text = getMessaging(firebaseApp);
      const unsubscribe = onMessage(text, (payload) => {
        const {title, body} = payload.notification || {};
        new Notification(title || "ShelfAware", {body: body || ""});
      });
      return unsubscribe;
    };
    const clear =  startNotification();
    return () => {
      clear?.then((unsubscribe) => unsubscribe && unsubscribe());
    };
  }, []);
  return null;
  }