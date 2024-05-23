const functions = require("firebase-functions");
const scraperUSHouseRollCallVotes = require("./scraper-us-house-roll-call-votes");
const admin = require("firebase-admin");
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

admin.initializeApp();

const db = admin.firestore();

const formatTimestamp = (date) => {
    const currentDate = new Date(date);
    return Timestamp.fromDate(currentDate)
}

exports.scrapeUSHouseRollCallVotes = functions
    .region("us-central1")
    .runWith({ memory: '2GB' })
    .pubsub.schedule("*/30 8-20 * * 1-5") // Run the job every 30 minutes during the hours of 8 AM to 8:59 PM Monday through Friday
    .timeZone("America/Chicago")
    .onRun(async () => {
        try {
            // Call scrapeData function from scraper.js
            const scrapedUSHouseRollCallVotes = await scraperUSHouseRollCallVotes.scrapeUSHouseRollCallVotes();
            
            // Check if scrapedUSHouseRollCallVotes is returning an empty object
            if (JSON.stringify(scrapedUSHouseRollCallVotes) == '{}') {
                // Return if object is empty
                console.log('No roll calls scraped. Object is empty. Nothing saved to database.');
                return
            } else {
                const rollCallNumberExists = await db.collection('rollcall').where('rollCallNumber', '==', scrapedUSHouseRollCallVotes.votesArray[0].rollCallNumber).get();
                console.log(rollCallNumberExists.size);
                if (rollCallNumberExists.size == 1) {
                    console.log('Most recent roll call found in database. Nothing saved to database.');
                    return
                } else {
                    console.log('Most recent roll call not found in database. Went into else statement to loop through roll calls and save them to database.');
                    for (i = 0; i < scrapedUSHouseRollCallVotes.votesArray.length; i++) {
                        db.collection('rollcall').doc(scrapedUSHouseRollCallVotes.votesArray[i].id).set(scrapedUSHouseRollCallVotes.votesArray[i]);

                        for (j = 0; j < scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedYes.length; j++) {
                            const vote = {
                                id: scrapedUSHouseRollCallVotes.votesArray[i].id + ' ' + scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedYes[j],
                                billNumber: scrapedUSHouseRollCallVotes.votesArray[i].billNumber,
                                timestamp: formatTimestamp(scrapedUSHouseRollCallVotes.votesArray[i].timestamp),
                                rollCallNumber: scrapedUSHouseRollCallVotes.votesArray[i].rollCallNumber,
                                question: scrapedUSHouseRollCallVotes.votesArray[i].question,
                                billTitle: scrapedUSHouseRollCallVotes.votesArray[i].billTitle,
                                repLastName: scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedYes[j],
                                vote: 'Yes'
                            }
                            const id = scrapedUSHouseRollCallVotes.votesArray[i].id + ' ' + scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedYes[j];
                            db.collection('votes').doc(id).set(vote);
                        }
                        
                        for (j = 0; j < scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedNo.length; j++) {
                            const vote = {
                                id: scrapedUSHouseRollCallVotes.votesArray[i].id + ' ' + scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedYes[j],
                                billNumber: scrapedUSHouseRollCallVotes.votesArray[i].billNumber,
                                timestamp: formatTimestamp(scrapedUSHouseRollCallVotes.votesArray[i].timestamp),
                                rollCallNumber: scrapedUSHouseRollCallVotes.votesArray[i].rollCallNumber,
                                question: scrapedUSHouseRollCallVotes.votesArray[i].question,
                                billTitle: scrapedUSHouseRollCallVotes.votesArray[i].billTitle,
                                repLastName: scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedYes[j],
                                vote: 'No'
                            }
                            const id = scrapedUSHouseRollCallVotes.votesArray[i].id + ' ' + scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedYes[j];
                            db.collection('votes').doc(id).set(vote);
                        }
                        
                        for (j = 0; j < scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedPresent.length; j++) {
                            const vote = {
                                id: scrapedUSHouseRollCallVotes.votesArray[i].id + ' ' + scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedYes[j],
                                billNumber: scrapedUSHouseRollCallVotes.votesArray[i].billNumber,
                                timestamp: formatTimestamp(scrapedUSHouseRollCallVotes.votesArray[i].timestamp),
                                rollCallNumber: scrapedUSHouseRollCallVotes.votesArray[i].rollCallNumber,
                                question: scrapedUSHouseRollCallVotes.votesArray[i].question,
                                billTitle: scrapedUSHouseRollCallVotes.votesArray[i].billTitle,
                                repLastName: scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedYes[j],
                                vote: 'Present'
                            }
                            const id = scrapedUSHouseRollCallVotes.votesArray[i].id + ' ' + scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedYes[j];
                            db.collection('votes').doc(id).set(vote);
                        }
                        
                        for (j = 0; j < scrapedUSHouseRollCallVotes.votesArray[i].repsWhoDidNotVote.length; j++) {
                            const vote = {
                                id: scrapedUSHouseRollCallVotes.votesArray[i].id + ' ' + scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedYes[j],
                                billNumber: scrapedUSHouseRollCallVotes.votesArray[i].billNumber,
                                timestamp: formatTimestamp(scrapedUSHouseRollCallVotes.votesArray[i].timestamp),
                                rollCallNumber: scrapedUSHouseRollCallVotes.votesArray[i].rollCallNumber,
                                question: scrapedUSHouseRollCallVotes.votesArray[i].question,
                                billTitle: scrapedUSHouseRollCallVotes.votesArray[i].billTitle,
                                repLastName: scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedYes[j],
                                vote: 'Did Not Vote'
                            }
                            const id = scrapedUSHouseRollCallVotes.votesArray[i].id + ' ' + scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedYes[j];
                            db.collection('votes').doc(id).set(vote);
                        }
                    }
                    return
                }
            }
        } catch (error) {
            // Console log error in case execution fails
            console.log('Error ocurred during function execution:', error);
            return null;
        }
    })