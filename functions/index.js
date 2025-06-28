const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { Resend } = require("resend");
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

admin.initializeApp();
const database = admin.firestore();

const shelfBtn = 
    `background-color: #4CAF50; 
    color: white; 
    padding: 12px 20px; 
    text-align: center; 
    text-decoration: none; 
    display: inline-block; 
    border-radius: 6px; 
    font-weight: bold;`;

exports.sendExpiryEmails = onSchedule(
    { schedule: "every day 08:00",
      timeZone: "Asia/Singapore",
      secrets: [RESEND_API_KEY],
    }, async () => {
        const rs = new Resend(RESEND_API_KEY.value());
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const ms = 60 * 60 * 24 * 1000;
        const endingDate = new Date(todayDate.getTime() + 4 * ms);

        const start = admin.firestore.Timestamp.fromDate(todayDate);
        const end = admin.firestore.Timestamp.fromDate(endingDate)

        const snapshot = await database
            .collection("pantry")
            .where("expiryDate", ">=", start)
            .where("expiryDate", "<", end)
            .get();
        
        const userItems = new Map();
            
        snapshot.forEach((eachDoc) => {
            const eachData = eachDoc.data();
            if (!eachData.userId || !eachData.name || !eachData.expiryDate) return;
            const userLs = userItems.get(eachData.userId) || [];
                const expiryDate = eachData.expiryDate.toDate();
                const daysLeft = Math.ceil((expiryDate - todayDate) / ms);
                userLs.push({
                name: eachData.name,
                expiryDate: expiryDate.toDateString(),
                daysLeft
            });
            userItems.set(eachData.userId, userLs);
        });
        for (const [userId, items ] of userItems.entries()) {
            const userDoc = await database.collection("users").doc(userId).get();
            if (!userDoc.exists || userDoc.data().notificationsEnabled === false) {
                console.log(`Skipping user ${userId} - notifications disabled.`);
                continue;
            }
            
            const loginSnap = await database
                .collection("loginRec")
                .where("userID", "==", userId)
                .orderBy("loginTime", "desc")
                .limit(1)
                .get();

                const loginData = loginSnap.docs[0]?.data();
                const email = loginData?.email;
                const name = loginData?.displayName || "ShelfAware User";

                if (!email) {
                    console.log(`⚠️ No email found for user ${userId}`);
                    continue;
                }

                const listItem = items
                    .map((eachItem) => 
                        `<li>${eachItem.name} expires on ${eachItem.expiryDate} 
                            (${eachItem.daysLeft === 0 
                                ? "expiring today"
                                : `${eachItem.daysLeft} day${eachItem.daysLeft > 1 ? "s" : ""} left`
                            })</li>`
                ).join("");

                const content = 
                    `<p>Dear ${name} 👋🏼,</p>
                    <p>The pantry items listed below are expiring soon 🕘</p>
                    <ul>${listItem}</ul>
                    <p>Click below to check on your pantry now:</p>
                    <p>
                        <a href="https://shelfaware-110f0.web.app/" target="_blank" 
                            style="${shelfBtn}">
                            Go to ShelfAware
                        </a>
                    </p>
                    <p> Best Regards,<br/>ShelfAware Team 🧚🏼</p>
                    <hr style="margin-top: 30px; border: none; border-top: 1px solid #ccc;" />
                    <div style="text-align: center; font-size: 13px; color: #888;">
                        <p style="margin: 4px 0;">Built with 🧡 for students, communities, and fridge space everywhere.</p>
                        <p style="margin: 4px 0;">© 2025 ShelfAware. All rights reserved.</p>
                    </div>`;
                    
                try {
                    const response = await rs.emails.send({
                        from: "ShelfAware Team <team@shelfaware.online>",
                        to: email,
                        subject: "📣 Urgent❗️Your Pantry Items Are Expiring!",
                        html: content,
                    });
                    console.log(`📬 Resend response for ${email}:`, response);
                } catch (err) {
                    console.error(`❌ Failed to send email to ${email}:`, err.message);
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
