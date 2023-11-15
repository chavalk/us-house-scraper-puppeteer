/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

//const {onRequest} = require("firebase-functions/v2/https");
//const logger = require("firebase-functions/logger");
// Import the Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers
const functions = require("firebase-functions");
// Import scraper.js file from current functions folder
const scraperUSHouseFloorActivity = require("./scraper-us-house-floor-activity");
// Import scrape-us-house-votes.js from current functions folder
const scraperUSHouseRollCallVotes = require("./scraper-us-house-roll-call-votes")
// Import the Firebase Admin SDK to access Firestore
const admin = require("firebase-admin");

// Initialize Firebase application
admin.initializeApp();

// Access databse in Firebase
const db = admin.firestore();

// Build function to get current date
const getToday = () => {
    // Get current date
    const today = new Date();

    // Return date in M/DD/YYYY format
    return `${today.getMonth() + 1}${today.getDate()}${today.getFullYear()}`;
};

// Build Firebase Cloud function to scrape US House of Representatives activity table and store the activity in the Firestore activity collection
exports.scrapeUSHouseFloorActivity = functions
    // Define region where function will be deployed
    .region("us-central1")
    // Allocate how much memory the function needs
    .runWith({ memory: '2GB' })
    // Schedule function using pubsub feature and chrome expression in Unix Crontab to run every day at midnight
    .pubsub.schedule("*/5 9-16 * * 3")
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

// Build Firebase Cloud function to scrape roll call votes in the US House of Representatives
exports.scrapeUSHouseRollCallVotes = functions
    // Define region where function will be deployed
    .region("us-central1")
    // Allocate how much memory the function needs
    .runWith({ memory: '2GB' })
    // Schedule function using pubsub feature and chrome expression in unix-cron to run every day at midnight
    .pubsub.schedule("0 0 * * *")
    // Set time zone for function to follow
    .timeZone("America/Chicago")
    // Set function to run asynchronously
    .onRun(async () => {
        try {
            // Call scrapeData function from scraper.js
            const scrapedUSHouseRollCallVotes = await scraperUSHouseRollCallVotes.scrapeUSHouseRollCallVotes();
            // for (let i = 0; i < scrapedUSHouseRollCallVotes.length; i++) {
            //     // Extract roll call number from object in array in order to use it as document id in database
            //     var rollCallNumber = scrapedUSHouseRollCallVotes[i].rollCallNumber;
            //     // Convert roll call number to string
            //     var rollCallNumberString = rollCallNumber.toString();
            //     // Make call to Firebase to create collection called activity, to create document using current date as the name of the document, and set data in document from scrapeData
            //     db.collection('votes').doc(rollCallNumberString).set(scrapedUSHouseRollCallVotes[i]);
            // }
            // Check if scrapedUSHouseRollCallVotes is returning an empty object
            if (JSON.stringify(scrapedUSHouseRollCallVotes) == '{}') {
                // Return if object is empty
                return
            } else {
                // Make call to database to save votes if object is not empty
                return db.collection('votes').doc(scrapedUSHouseRollCallVotes.id).set(scrapedUSHouseRollCallVotes);
            }
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
