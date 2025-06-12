importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyAa7nX3CxpcdXunL9IYIIChPLAhU9itrc8",
    authDomain: "shelfaware-110f0.firebaseapp.com",
    projectId: "shelfaware-110f0",
    messagingSenderId: "942954308450",
    appId: "1:942954308450:web:c8a2d4fd5e73ec4484423b"
});

initializeApp(firebaseConfig);
const text = firebase.messaging();

onBackgroundMessage(text, (payload) => {
    const { title, body } = payload.notification || {};
    self.registration.showNotification(title || "ShelfAware", {
    body: body || "",
    icon: "/logo192.png",
    data: { clickToPantry: "/pantry" }
    });
});
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data.clickToPantry || "/";
    event.waitUntil(clients.openWindow(url));
});