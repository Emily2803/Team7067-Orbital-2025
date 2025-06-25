const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
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
            const start = admin.firestore.Timestamp.fromDate(wantedDate);
            const end = admin.firestore.Timestamp.fromDate(
                new Date(wantedDate.getTime() + ms)
            );

            const snapshot = await database
                .collection("pantry")
                .where("expiryDate", ">=", start)
                .where("expiryDate", "<", end)
                .get();
            
            const userIds = new Set();
            snapshot.forEach((eachDoc) => {
                const eachData = eachDoc.data();
                if (eachData.userId) userIds.add(eachData.userId);
            });

            for (const userId of userIds) {
                const loginSnap = await database
                    .collection("loginRec")
                    .where("userID", "==", userId)
                    .orderBy("loginTime", "desc")
                    .limit(1)
                    .get();

                const loginData = loginSnap.docs[0]?.data();
                const email = loginData?.email;

                if (!email) {
                    console.log(`⚠️ No email found for user ${userId}`);
                    continue;
                }

                const subject =
                    ahead === 0
                        ? "🍽️ Items Expire Today!"
                        : `🍽️ ${ahead} day${ahead > 1 ? "s" : ""} left`;

                try {
                    const response = await rs.emails.send({
                        from: "team@shelfaware.online",
                        to: email,
                        subject,
                        html: `<p>Reminder! Your pantry items are expiring in ${ahead} day(s).<br>Check ShelfAware now! </p>`,
                    });
                    console.log(`📬 Resend response for ${email}:`, response);
                } catch (err) {
                    console.error(`❌ Failed to send email to ${email}:`, err.message);
                }
            }
        }

        console.log("✅ All expiry emails sent");
        return null;
    });

    // JUST FOR MANUAL TESTING ** WILL DELETE THIS
exports.testExpiryEmails = onRequest(
  { secrets: [RESEND_API_KEY] }, // ✅ Add this line
  async (req, res) => {
    try {
      await exports.sendExpiryEmails.run();
      res.send("✅ Manually triggered expiry email job.");
    } catch (err) {
      console.error("❌ Error running expiry function:", err);
      res.status(500).send("Something went wrong.");
    }
  }
);

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
