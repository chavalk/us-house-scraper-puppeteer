const functions = require("firebase-functions");
const scraperUSHouseFloorActivity = require("./scraper-us-house-floor-activity");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

exports.scrapeUSHouseFloorActivity = functions
    .region("us-central1")
    .runWith({ memory: '2GB' })
    .pubsub.schedule("*/5 8-16 * * 1-5")
    .timeZone("America/Chicago")
    .onRun(async () => {
        try {
            const scrapedUSHouseFloorActivity = await scraperUSHouseFloorActivity.scrapeUSHouseFloorActivity();
            
            return db.collection('activity').doc(scrapedUSHouseFloorActivity.id).set(scrapedUSHouseFloorActivity);
        } catch (error) {
            console.log('Error ocurred during function execution:', error);
            return null;
        }
    })