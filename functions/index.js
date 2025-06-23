const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { Resend } = require("resend");
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

admin.initializeApp();
const database = admin.firestore();

exports.sendExpiryEmails = onSchedule(
    { schedule: "every day 08:00",
      timeZone: "Asia/Singapore",
      secrets: [RESEND_API_KEY],
    }, async () => {
        const rs = new Resend(RESEND_API_KEY.value());
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const ms = 60 * 60 * 24 * 1000;

        const daysLs = [0, 1, 2, 3];
        for (const ahead of daysLs) {
            const wantedDate = new Date(todayDate.getTime() + ahead * ms);
            const timestamp = admin.firestore.Timestamp.fromDate(wantedDate);
            const snapshot = await database
                .collection("pantry")
                .where("expiryDate", "==", timestamp)
                .get();
            
            const user = new Set();
            snapshot.forEach((eachDoc) => {
                const eachData = eachDoc.data();
                if (eachData.userId) user.add(eachData.userId);
            });

            for (const id of user) {
                const userDoc = await database.collection("users").doc(id).get();
                const userData = userDoc.data();
                if (!userData?.email) continue;

                const subject =
                    ahead === 0
                        ? "🍽️ Items Expire Today!"
                        : `🍽️ ${ahead} day${ahead > 1 ? "s" : ""} left`;

                await rs.emails.send({
                    from: "reminder@shelfaware.app",
                    to: userData.email,
                    subject,
                    html: `<p>Reminder: Your pantry items are expiring in ${ahead} day(s).<br>Check ShelfAware to save them! 🥕</p>`,
                });
                console.log(`✅ Sent email to ${userData.email}`);
            }
        }
        console.log("✅ All expiry emails sent.");
        return null;
    });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
