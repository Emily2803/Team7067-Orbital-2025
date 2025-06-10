importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyAa7nX3CxpcdXunL9IYIIChPLAhU9itrc8",
    authDomain: "shelfaware-110f0.firebaseapp.com",
    projectId: "shelfaware-110f0",
    messagingSenderId: "942954308450",
    appId: "1:942954308450:web:c8a2d4fd5e73ec4484423b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log("[firebase-notification-sw.js] Received background message: ", payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo192.png"
};

self.registration.showNotification(notificationTitle, notificationOptions);
});