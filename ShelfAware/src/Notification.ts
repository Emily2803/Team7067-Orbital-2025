import { useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAa7nX3CxpcdXunL9IYIIChPLAhU9itrc8",
  authDomain: "shelfaware-110f0.firebaseapp.com",
  projectId: "shelfaware-110f0",
  messagingSenderId: "942954308450",
  appId: "1:942954308450:web:c8a2d4fd5e73ec4484423b",
};

const VAPID_KEY = "BO7JWzuL-ONtsoVDG8r5iBpnRIhPCeBO0btjHMrWt72K80-rjMyWoBmyG7db22YaBSWvR1SqsjrMSo8lvfb1Ztc"

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const messaging = getMessaging();

function NotificationSetup() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-notification-sw.js')
        .then((registration) => {
         window.Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration,
              }).then((currentToken) => {
                if (currentToken) {
                    console.log("🎯 FCM Token:", currentToken);
                    onMessage(messaging, (payload) => {
                        console.log('📬 Foreground notification:', payload);
                        const { title, body } = payload.notification || {};
                        new Notification(title || 'New Notification', {
                            body: body || 'You have a new message!',
                        });
                    });
                } else {
                  console.warn("⚠️ No token received.");
                }
              }).catch((err) => {
                console.error("❌ Error getting token:", err);
              });
            } else {
              console.warn("❌ Notification permission denied.");
            }
          });
        });
    }
  }, []);

  return null;
}

export default NotificationSetup;