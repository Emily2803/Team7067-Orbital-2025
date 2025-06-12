import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

// Initialize Admin SDK
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// HTTP-triggered function to send expiry reminders
export const remindExpiry = onRequest(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;

  for (const daysAhead of [3, 2, 1, 0]) {
    const targetTs = admin.firestore.Timestamp.fromDate(
      new Date(today.getTime() + daysAhead * msPerDay)
    );
    const snap = await db
      .collection("pantry")
      .where("expiryDate", "==", targetTs)
      .get();

    const userIds = new Set<string>();
    snap.forEach((docSnap) => {
      const data = docSnap.data() as {userId: string};
      userIds.add(data.userId);
    });

    for (const uid of userIds) {
      const userDoc = await db.collection("users").doc(uid).get();
      const token = userDoc.data()?.fcmToken;
      if (!token) continue;

      const titleText = daysAhead === 0
        ? "🍽️ Expires today!"
        : `🍽️ ${daysAhead} day${daysAhead > 1 ? "s" : ""} left`;

      await messaging.send({
        token,
        notification: {
          title: titleText,
          body: "Tap to check your pantry and save your food."
        },
        data: { click_action: "/pantry" }
      });
    }
  }

  res.status(200).send("Expiry reminders sent");
});
