// Import Puppeteer
const puppeteer = require('puppeteer');

// Build function to scrape roll call votes from US House floor actvity table
const scrapeUSHouseRollCallVotes = async () => {
    try {
        // Launch Puppeteer browser
        const browser = await puppeteer.launch({
            headless: "new"
        });

        // Open new page in Puppeteer browser
        const page = await browser.newPage();

        // Navigate to main US House of Representatives floor activity page in Puppeteer browser
        await page.goto('https://live.house.gov', {
            waitUntil: "networkidle0"
        });

        // Scrape house session date displayed in floor activity page
        const houseSessionDate = await page.evaluate(() => {
            // Scrape text content of class containing date
            const date = document.querySelector('.display-date').textContent;
            // Split date into array
            const dateComponents = date.split(/, | /);
            // Store month name from array in new variable
            const monthName = dateComponents[1];
            // Store day from array in new variable
            const day = dateComponents[2];
            // Store year from array in new variable
            const year = dateComponents[3];
            // Create array with all months of the year
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            // Convert month name to month number
            const month = months.indexOf(monthName) + 1;
            // Return date in MM/DD/YYYY format
            return month + day + year;
        });

        // Get hyperlinks for roll call votes from US House of Representatives floor activity table
        const rollCallLinks = await page.evaluate(() => {
            // Get all data cells from US House of Representatives floor activity table
            const activityTableReference = document.querySelectorAll('#activity-table > tbody tr td');

            // Create array of data cells from US House of Representatives floor activity table and iterate through them to extract all hyperlinks
            const activity = Array.from(activityTableReference).map((item) => {
                // Get anchor tag from hyperlink in data cell
                const anchor = item.querySelector('a');

                // Create variable to store href from achor tag
                let href;

                // Make sure anchor tag is not null before assigning href attribute to href variable
                if (anchor !== null) {
                    href = anchor.getAttribute('href');
                }

                // Return href in object
                return {
                    link: href
                }
            });

            // Filter out any empty objects from activity array
            const filteredActivity = activity.filter(value => JSON.stringify(value) !== '{}');

            // Filter out any hyperlinks that are not for a roll call
            const rollCallLinks = filteredActivity.filter(value => value.link.includes('roll'));

            // Return rollCallActivity array
            return rollCallLinks;
        });

        // Create empty votes array in order for it to be accessible to be returned when votes exist
        let votes = []

        // Check if there are any votes existing. If there are no votes, an empty object is returned. If there are votes, the votes are scraped from the page.
        if (rollCallLinks.length === 0) {
            return {}
        } else {
            // Loop through all roll call links in order to scrape the votes for each one
            for (let i = 0; i < rollCallLinks.length; i++) {
                // Navigate to roll call page of first index in rollCallActivity array
                await page.goto(rollCallLinks[i].link, {
                    waitUntil: 'networkidle0'
                });

                // Get votes for roll call of first index in rollCallActivity array
                const vote = await page.evaluate(() => {
                    // Scrape h2 to be able to determine if the votes have been posted to the roll call page
                    const voteNotAvailable = document.querySelector('h2');
                    // Check h2 to determine if the roll call page is ready for the votes to be scraped
                    if (voteNotAvailable == null) {
                        // Scrape roll call number title fromm roll call page
                        const rollCallNumberTitle = document.querySelector('font').textContent;
                        // Split the roll call numer title by space
                        const rollCallNumberTitleParts = rollCallNumberTitle.split(' ');
                        // Extract the roll call number from the array
                        const rollCallNumberString = rollCallNumberTitleParts[6];
                        // Convert roll call number from string to integer
                        const rollCallNumber = parseInt(rollCallNumberString, 10);
                        // Scrape bill from roll call page
                        const bill = document.querySelector('body').childNodes[6].textContent
                        // Scrape time from roll call page
                        const time = document.querySelector('body').childNodes[7].textContent
                        // Scrape roll call question from roll call page
                        const question = document.querySelector('body').childNodes[11].textContent
                        // Remove spaces from question scraped from roll call page
                        const formattedQuestion = question.replace(/\s+/, '')
                        // Scrape bill title from roll call page
                        const billTitle = document.querySelector('body').childNodes[15].textContent
                        // Get all tables in roll call page
                        const tablesReference = document.querySelectorAll('table');

                        // Convert tables reference to array and iterate through them to extract data cells
                        const tables = Array.from(tablesReference).map((item) => {
                            // Gett all data cells from table
                            const itemData = item.querySelectorAll('tbody tr td');

                            // Put data cells in an array
                            const itemDataArray = Array.from(itemData);
                            // Create empty string to store concatenation from array
                            let itemDataArrayString = '';
                            // Concatenate all rep names in a string
                            for (let i = 0; i < itemDataArray.length; i++) {
                                itemDataArrayString += itemDataArray[i].innerText;
                            }
                            // Return concatenated string
                            return {
                                item: itemDataArrayString
                            }
                        });

                        // Remove first index from tables array since it references total votes table
                        tables.splice(0, 1);

                        // Reformat first table to have house members last name separated by a comma
                        tables[0].item = tables[0].item.replaceAll('\n', ', ');
                        const yesVotes = tables[0].item.split(', ')

                        // Reformat second table to have house members last name separated by a comma
                        tables[1].item = tables[1].item.replaceAll('\n', ', ');
                        const noVotes = tables[1].item.split(', ')

                        // Reformat third table to have house members last name separated by a comma
                        tables[2].item = tables[2].item.replaceAll('\n', ', ');
                        const notVoting = tables[2].item.split(', ')

                        // Return correctly formatted tables
                        return {
                            id: time,
                            bill: bill,
                            time: time,
                            rollCallNumber: rollCallNumber,
                            question: formattedQuestion,
                            billTitle: billTitle,
                            yesVotes: yesVotes,
                            noVotes: noVotes,
                            notVoting: notVoting
                        }
                    } else {
                        return {}
                    }
                });
                // Push each vote to the votes array
                votes.push(vote);
            }
        }

        // Close Puppeteer browser
        await browser.close();

        // Return votes array and id
        return { votes, id: houseSessionDate };
    } catch (error) {
        // Catch error and send to console if error is thrown
        console.error('Error occurred during scraping', error);
        return null;
    }
}

// Call scrapeUSHouseVotes function
scrapeUSHouseRollCallVotes()
    .then((res) => {
        console.log(res);
    });

// Export scrapeUSHouseVotes function
exports.scrapeUSHouseRollCallVotes = scrapeUSHouseRollCallVotes;