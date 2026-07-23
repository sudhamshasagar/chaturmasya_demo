const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();

exports.registerWebsiteVisit = onCall(async () => {
  try {
    const visitorRef = db.collection("siteStats").doc("visitors");

    await visitorRef.set(
        {
          totalVisits: FieldValue.increment(1),
          lastVisitAt: FieldValue.serverTimestamp(),
        },
        {merge: true},
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error registering website visit:", error);

    throw new HttpsError(
        "internal",
        "Unable to register website visit.",
    );
  }
});
