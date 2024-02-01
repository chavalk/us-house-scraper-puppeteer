const functions = require("firebase-functions");
const scraperUSHouseFloorActivity = require("./scraper-us-house-floor-activity");
const admin = require("firebase-admin");
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

admin.initializeApp();

const db = admin.firestore();

const formatTimestamp = (date) => {
    const currentDate = new Date(date);
    return Timestamp.fromDate(currentDate)
}

exports.scrapeUSHouseFloorActivity = functions
    .region("us-central1")
    .runWith({ memory: '2GB' })
    .pubsub.schedule("*/5 8-20 * * 1-5")
    .timeZone("America/Chicago")
    .onRun(async () => {
        try {
            const scrapedUSHouseFloorActivity = await scraperUSHouseFloorActivity.scrapeUSHouseFloorActivity();
            for (let i = 0; i < scrapedUSHouseFloorActivity.activity.length; i++) {
                scrapedUSHouseFloorActivity.activity[i].timestamp = formatTimestamp(scrapedUSHouseFloorActivity.activity[i].timestamp)
                db.collection('activity').doc(scrapedUSHouseFloorActivity.id + scrapedUSHouseFloorActivity.activity[i].floorTime).set(scrapedUSHouseFloorActivity.activity[i]);
            }
            return
        } catch (error) {
            console.log('Error ocurred during function execution:', error);
            return null;
        }
    })