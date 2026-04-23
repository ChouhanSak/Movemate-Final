const admin = require("firebase-admin");

// JSON file ka naam yahin same hona chahiye
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 🔴 SITE MANAGER UID (aapne sahi dala hua hai)
const uid = "CtZAJ12EG2dMfcvYdcGXB2mWT633";

async function setClaim() {
  try {
    await admin.auth().setCustomUserClaims(uid, {
      siteManagers: true,
    });
    console.log("✅ Site manager claim set ho gaya");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

setClaim();
