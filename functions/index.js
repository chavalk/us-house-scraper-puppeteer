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
// Import the scraper.js file from the current functions folder
const scraper = require("./scraper");
// Import the Firebase Admin SDK to access Firestore
const admin = require("firebase-admin");

// Initialize Firebase application
admin.initializeApp();

// Access databse in Firebase
const db = admin.firestore();

const getToday = () => {
    const today = new Date();
    console.log(`${today.getDate()}${today.getMonth() + 1}${today.getFullYear()}`);

    return `${today.getDate()}${today.getMonth() + 1}${today.getFullYear()}`;
};

exports.pubsub = functions
    .region("us-central1")
    .runWith({ memory: '2GB' })
    .pubsub.schedule("0 0 * * *")
    .timeZone("America/Chicago")
    .onRun(async () => {
        try {
            const scrapeData = await scraper.scrapeData();
            console.log("Scrape Data:", scrapeData);
            return db.collection('activity').doc(getToday()).set(scrapeData);
        } catch (error) {
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
