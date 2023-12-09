// Import the Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers
const functions = require("firebase-functions");
// Import scraper.js file from current functions folder
const scraperUSHouseFloorActivity = require("./scraper-us-house-floor-activity");
// Import the Firebase Admin SDK to access Firestore
const admin = require("firebase-admin");

// Initialize Firebase application
admin.initializeApp();

// Access databse in Firebase
const db = admin.firestore();

// Build Firebase Cloud function to scrape US House of Representatives activity table and store the activity in the Firestore activity collection
exports.scrapeUSHouseFloorActivity = functions
    // Define region where function will be deployed
    .region("us-central1")
    // Allocate how much memory the function needs
    .runWith({ memory: '2GB' })
    // Schedule function using pubsub feature and chrome expression in Unix Crontab to run every day at midnight
    .pubsub.schedule("*/5 8-16 * * 1-5")
    // Set time zone for function to follow
    .timeZone("America/Chicago")
    // Set function to run asynchronously
    .onRun(async () => {
        try {
            // Call scrapeData function from scraper.js
            const scrapedUSHouseFloorActivity = await scraperUSHouseFloorActivity.scrapeUSHouseFloorActivity();
            // Make call to Firebase to create collection called activity, to create document using current date as the name of the document, and set data in document from scrapeData
            return db.collection('activity').doc(scrapedUSHouseFloorActivity.id).set(scrapedUSHouseFloorActivity);
        } catch (error) {
            // Console log error in case execution fails
            console.log('Error ocurred during function execution:', error);
            return null;
        }
    })

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
