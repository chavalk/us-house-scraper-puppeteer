/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const scraper = require("./scraper");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const getToday = () => {
    const today = new Date();

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
            await db.collection('activity').doc(getToday()).set(scrapeData);
        } catch (error) {
            throw new Error(error);
        }
    })

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
