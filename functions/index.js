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
    .pubsub.schedule("*/5 8-20 * * 1-5")
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
                    console.log('Did not write to database');
                    return
                } else {
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
                        console.log('Wrote yes votes');
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
                        console.log('Wrote no votes');
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
                        console.log('Wrote present votes');
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
                        console.log('Wrote did not vote votes');
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