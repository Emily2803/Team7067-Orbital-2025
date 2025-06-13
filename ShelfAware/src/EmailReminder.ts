import "dotenv/config";
import { Resend } from "resend";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert("serviceAccount.json"),
    });
}

const db = admin.firestore();
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) throw new Error("RESEND_API_KEY is not set in .env");

const resend = new Resend(apiKey);

async function sendExpiryEmails(): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;

  for (const daysAhead of [3, 2, 1, 0]) {
    const targetDate = new Date(today.getTime() + daysAhead * msPerDay);
    const timestamp = admin.firestore.Timestamp.fromDate(targetDate);

    const snapshot = await db
      .collection("pantry")
      .where("expiryDate", "==", timestamp)
      .get();

const userIds: Set<string> = new Set();
snapshot.forEach((doc) => {
  const data = doc.data() as { userId?: string };
  if (data.userId) {
    userIds.add(data.userId);
  }
});

for (const uid of userIds) {
  const userDoc = await db.collection("users").doc(uid).get();
  const userData = userDoc.data() as { email?: string };
  if (!userData?.email) continue;

      const subject =
        daysAhead === 0
          ? "🍽️ Items Expire Today!"
          : `🍽️ ${daysAhead} day${daysAhead > 1 ? "s" : ""} left`;

      await resend.emails.send({
        from: "reminder@shelfaware.app",
        to: userData.email,
        subject,
        html: `<p>Reminder: Your pantry items are expiring in ${daysAhead} day(s).<br>Check ShelfAware to save them! 🥕</p>`,
      });

      console.log(`✅ Sent email to ${userData.email}`);
    }
  }

  console.log("✅ All expiry emails sent.");
}

sendExpiryEmails().catch(console.error);

export {};
