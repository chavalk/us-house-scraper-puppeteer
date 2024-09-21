const functions = require("firebase-functions/v1");
const scraperUSHouseRollCallVotes = require("./scraper-us-house-roll-call-votes");
const admin = require("firebase-admin");
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

admin.initializeApp();

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

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
            // Call scraper
            const scrapedUSHouseRollCallVotes = await scraperUSHouseRollCallVotes.scrapeUSHouseRollCallVotes();
            
            // Check if scrapedUSHouseRollCallVotes is returning an empty object
            if (JSON.stringify(scrapedUSHouseRollCallVotes) == '{}') {
                // Return if object is empty
                console.log('No roll calls scraped. Object is empty. Nothing saved to database.');
                return
            } else {
                // Fetch latest roll call number from Firestore to see if it already exists in database
                const rollCallNumberExists = await db.collection('rollcall').where('rollCallNumber', '==', scrapedUSHouseRollCallVotes.votesArray[0].rollCallNumber).get();
                console.log(rollCallNumberExists.size);
                // If roll call number is found in database, function execution is terminated 
                if (rollCallNumberExists.size == 1) {
                    console.log('Most recent roll call found in database. Nothing saved to database.');
                    return
                } else {
                    console.log('Most recent roll call not found in database. Went into else statement to loop through roll calls and save them to database.');
                    // Iterate through roll call votes
                    for (i = 0; i < scrapedUSHouseRollCallVotes.votesArray.length; i++) {
                        // Save roll call votes to roll call collection in Firestore
                        await db.collection('rollcall').doc(scrapedUSHouseRollCallVotes.votesArray[i].id).set(scrapedUSHouseRollCallVotes.votesArray[i]);
                        console.log('Went into parent for loop to save roll call: ' + scrapedUSHouseRollCallVotes.votesArray[i].rollCallNumber);
                        // Iterate through yes votes to save in each representatives votes collection
                        for (j = 0; j < scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedYes.length; j++) {
                            const vote = {
                                bill: scrapedUSHouseRollCallVotes.votesArray[i].bill,
                                billTitle: scrapedUSHouseRollCallVotes.votesArray[i].billTitle,
                                billURL: scrapedUSHouseRollCallVotes.votesArray[i].billURL,
                                id: scrapedUSHouseRollCallVotes.votesArray[i].id,
                                question: scrapedUSHouseRollCallVotes.votesArray[i].question,
                                repLastName: scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedYes[j],
                                rollCallNumber: scrapedUSHouseRollCallVotes.votesArray[i].rollCallNumber,
                                timestamp: formatTimestamp(scrapedUSHouseRollCallVotes.votesArray[i].timestamp),
                                vote: 'Yes'
                            }
                            if (vote.repLastName === undefined) {
                                continue;
                            }
                            await db.collection('representatives').doc(vote.repLastName).collection('votes').doc(vote.id).set(vote);
                        }
                        
                        // Iterate through no votes to save in each representatives votes collection
                        for (j = 0; j < scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedNo.length; j++) {
                            const vote = {
                                bill: scrapedUSHouseRollCallVotes.votesArray[i].bill,
                                billTitle: scrapedUSHouseRollCallVotes.votesArray[i].billTitle,
                                billURL: scrapedUSHouseRollCallVotes.votesArray[i].billURL,
                                id: scrapedUSHouseRollCallVotes.votesArray[i].id,
                                question: scrapedUSHouseRollCallVotes.votesArray[i].question,
                                repLastName: scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedNo[j],
                                rollCallNumber: scrapedUSHouseRollCallVotes.votesArray[i].rollCallNumber,
                                timestamp: formatTimestamp(scrapedUSHouseRollCallVotes.votesArray[i].timestamp),
                                vote: 'No'
                            }
                            if (vote.repLastName === undefined) {
                                continue;
                            }
                            await db.collection('representatives').doc(vote.repLastName).collection('votes').doc(vote.id).set(vote);
                        }
                        
                        // Iterate through present votes to save in each representatives votes collection
                        for (j = 0; j < scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedPresent.length; j++) {
                            const vote = {
                                bill: scrapedUSHouseRollCallVotes.votesArray[i].bill,
                                billTitle: scrapedUSHouseRollCallVotes.votesArray[i].billTitle,
                                billURL: scrapedUSHouseRollCallVotes.votesArray[i].billURL,
                                id: scrapedUSHouseRollCallVotes.votesArray[i].id,
                                question: scrapedUSHouseRollCallVotes.votesArray[i].question,
                                repLastName: scrapedUSHouseRollCallVotes.votesArray[i].repsWhoVotedPresent[j],
                                rollCallNumber: scrapedUSHouseRollCallVotes.votesArray[i].rollCallNumber,
                                timestamp: formatTimestamp(scrapedUSHouseRollCallVotes.votesArray[i].timestamp),
                                vote: 'Present'
                            }
                            if (vote.repLastName === undefined) {
                                continue;
                            }
                            await db.collection('representatives').doc(vote.repLastName).collection('votes').doc(vote.id).set(vote);
                        }
                        
                        // Iterate through did not vote votes to save in each representatives votes collection
                        for (j = 0; j < scrapedUSHouseRollCallVotes.votesArray[i].repsWhoDidNotVote.length; j++) {
                            const vote = {
                                bill: scrapedUSHouseRollCallVotes.votesArray[i].bill,
                                billTitle: scrapedUSHouseRollCallVotes.votesArray[i].billTitle,
                                billURL: scrapedUSHouseRollCallVotes.votesArray[i].billURL,
                                id: scrapedUSHouseRollCallVotes.votesArray[i].id,
                                question: scrapedUSHouseRollCallVotes.votesArray[i].question,
                                repLastName: scrapedUSHouseRollCallVotes.votesArray[i].repsWhoDidNotVote[j],
                                rollCallNumber: scrapedUSHouseRollCallVotes.votesArray[i].rollCallNumber,
                                timestamp: formatTimestamp(scrapedUSHouseRollCallVotes.votesArray[i].timestamp),
                                vote: 'Did Not Vote'
                            }
                            if (vote.repLastName === undefined) {
                                continue;
                            }
                            await db.collection('representatives').doc(vote.repLastName).collection('votes').doc(vote.id).set(vote);
                        }
                    }
                    return
                }
            }
        } catch (error) {
            console.log('Error ocurred during function execution:', error);
            return null;
        }
    })