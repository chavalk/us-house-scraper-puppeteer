const puppeteer = require('puppeteer');

const scrapeUSHouseRollCallVotes = async () => {
    try {
        const browser = await puppeteer.launch({
            headless: "new"
        });

        const page = await browser.newPage();

        await page.goto('https://live.house.gov/', {
            waitUntil: "networkidle0"
        });

        const rollCallActivityTableLinks = await page.evaluate(() => {
            const activityTableCells = document.querySelectorAll('#activity-table > tbody tr td');

            const activityTableLinks = Array.from(activityTableCells).map((link) => {
                const anchorTag = link.querySelector('a');

                let hrefAttribute;

                if (anchorTag !== null) {
                    hrefAttribute = anchorTag.getAttribute('href');
                };

                return {
                    activityTableLink: hrefAttribute
                };
            });

            const filterEmptyActivityTableLinks = activityTableLinks.filter(value => JSON.stringify(value) !== '{}');

            const filterRollCallActivityTableLinks = filterEmptyActivityTableLinks.filter(value => value.activityTableLink.includes('roll'));

            return filterRollCallActivityTableLinks;
        });

        let votesArray = [];

        if (rollCallActivityTableLinks.length === 0) {
            return {};
        } else {
            for (let i = 0; i < rollCallActivityTableLinks.length; i++) {
                await page.goto(rollCallActivityTableLinks[i].activityTableLink, {
                    waitUntil: 'networkidle0'
                });

                const votes = await page.evaluate(() => {
                    const checkIfVotesPosted = document.querySelector('h2');

                    if (checkIfVotesPosted == null) {
                        // Scrape roll call number title from roll call page and reformat it
                        const rollCallNumberTitle = document.querySelector('font').textContent;
                        const rollCallNumberTitleParts = rollCallNumberTitle.split(' ');
                        const rollCallNumberString = rollCallNumberTitleParts[6];
                        const rollCallNumber = parseInt(rollCallNumberString, 10);

                        // Scrape roll call bill number and reformat it for better readability by users
                        const bill = document.querySelector('body').childNodes[6].textContent;
                        const parts = bill.split(' ');
                        const reformattedBill = `${parts[0]}.${parts[1]}. ${parts.slice(2).join(' ')}`;

                        // Create bill URL by extracting the bill number from the bill
                        const regex = /\d+/;
                        const match = bill.match(regex);
                        const billNumber = parseInt(match[0], 10);
                        const billURL = `https://www.congress.gov/bill/118th-congress/house-bill/${billNumber}`;

                        // Scrape roll call date and time and reformat it to comply to Firestore timestamp format
                        const dataAndTime = document.querySelector('body').childNodes[7].textContent;
                        const datePattern = /(\d+)-(\w+)-(\d{4})/;
                        const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)/;
                        const dateMatch = dataAndTime.match(datePattern);
                        const timeMatch = dataAndTime.match(timePattern);
                        const day = dateMatch[1];
                        const month = dateMatch[2];
                        const year = dateMatch[3];
                        let hour = parseInt(timeMatch[1]);
                        const minute = timeMatch[2];
                        const period = timeMatch[3];
                        if (period === 'PM' && hour < 12) {
                            hour += 12;
                        }
                        if (period === 'AM' && hour === 12) {
                            hour = 0;
                        }
                        const hourFormatted = hour.toString().padStart(2, '0');
                        const monthMap = {
                            Jan: '01',
                            Feb: '02',
                            Mar: '03',
                            Apr: '04',
                            May: '05',
                            Jun: '06',
                            Jul: '07',
                            Aug: '08',
                            Sep: '09',
                            Oct: '10',
                            Nov: '11',
                            Dec: '12'
                        };
                        const monthNumber = monthMap[month];
                        const formattedDate = `${month} ${day}, ${year}`;
                        const formattedTime = `${hourFormatted}:${minute}:00`;
                        const timestamp = `${formattedDate} ${formattedTime}`;

                        // Scrape roll call question from roll call page and reformat it to remove spaces from question
                        const question = document.querySelector('body').childNodes[11].textContent;
                        const formattedQuestion = question.replace(/\s+/, '');

                        // Scrape bill title and format it to remove space at beginning of string
                        const billTitle = document.querySelector('body').childNodes[15].textContent;
                        const formattedBillTitle = billTitle.trimStart();

                        const voteTables = document.querySelectorAll('table');

                        const voteTablesArray = Array.from(voteTables).map((table) => {
                            const voteTablesCells = table.querySelectorAll('tbody tr td');
                            const voteTablesCellsArray = Array.from(voteTablesCells);

                            let voteTablesCellsString = '';
                            for (let i = 0; i < voteTablesCellsArray.length; i++) {
                                voteTablesCellsString += voteTablesCellsArray[i].innerText;
                            }

                            return voteTablesCellsString;
                        });

                        voteTablesArray.splice(0, 1);

                        voteTablesArray[0] = voteTablesArray[0].replaceAll('\n', ', ');
                        const repsWhoVotedYesArray = voteTablesArray[0].split(', ');
                        const filteredRepsWhoVotedYesArray = repsWhoVotedYesArray.filter(value => value !== '');

                        voteTablesArray[1] = voteTablesArray[1].replaceAll('\n', ', ');
                        const repsWhoVotedNoArray = voteTablesArray[1].split(', ');
                        const filteredRepsWhoVotedNoArray = repsWhoVotedNoArray.filter(value => value !== '');

                        voteTablesArray[2] = voteTablesArray[2].replaceAll('\n', ', ');

                        let repsWhoVotedPresentArray = [];
                        let repsWhoDidNotVoteArray = [];
                        let filteredRepsWhoVotedPresentArray = [];
                        let filteredRepsWhoDidNotVoteArray = [];

                        if (voteTablesArray.length == 4) {
                            repsWhoVotedPresentArray = voteTablesArray[2].split(', ');
                            filteredRepsWhoVotedPresentArray = repsWhoVotedPresentArray.filter(value => value !== '');
                            voteTablesArray[3] = voteTablesArray[3].replaceAll('\n', ', ');
                            repsWhoDidNotVoteArray = voteTablesArray[3].split(', ');
                            filteredRepsWhoDidNotVoteArray = repsWhoDidNotVoteArray.filter(value => value !== '');
                        } else {
                            repsWhoDidNotVoteArray = voteTablesArray[2].split(', ');
                            filteredRepsWhoDidNotVoteArray = repsWhoDidNotVoteArray.filter(value => value !== '');
                        }

                        return {
                            bill: reformattedBill,
                            billTitle: formattedBillTitle,
                            billURL: billURL,
                            id: timestamp,
                            question: formattedQuestion,
                            repsWhoVotedYes: filteredRepsWhoVotedYesArray,
                            repsWhoVotedNo: filteredRepsWhoVotedNoArray,
                            repsWhoVotedPresent: filteredRepsWhoVotedPresentArray,
                            repsWhoDidNotVote: filteredRepsWhoDidNotVoteArray,
                            rollCallNumber: rollCallNumber,
                            timestamp: timestamp
                        }
                    } else {
                        return {}
                    }
                });

                votesArray.push(votes);
            }
        }

        await browser.close()

        return { votesArray }
    } catch (error) {
        console.error('Error occurred during scraping', error);
        return null;
    }
}

scrapeUSHouseRollCallVotes()
.then((res) => {
    console.log(res);
});

exports.scrapeUSHouseRollCallVotes = scrapeUSHouseRollCallVotes;