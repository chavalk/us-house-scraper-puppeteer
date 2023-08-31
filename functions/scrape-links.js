// Import Puppeteer
const puppeteer = require('puppeteer');

// Build scrapeData function
const scrapeData = async () => {
    try {
        // Launch browser
        const browser = await puppeteer.launch({
            headless: "new"
        });

        // Open new page in browser
        const page = await browser.newPage();

        // Navigate to main House floor activity page
        await page.goto('https://live.house.gov/?date=2023-07-27', {
            waitUntil: "networkidle0"
        });

        // Get links for roll call votes
        const body = await page.evaluate(() => {
            // Get all data cells from House floor activity table
            const activityTableReference = document.querySelectorAll('#activity-table > tbody tr td');

            // Create array of data cells from House floor activity table and iterate through them to extract all hyperlinks
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
            const rollCallActivity = filteredActivity.filter(value => value.link.includes('roll'));

            // Return rollCallActivity array
            return rollCallActivity;
        });

        // Navigate to roll call page of first index in rollCallActivity array
        await page.goto(body[0].link, {
            waitUntil: 'networkidle0'
        });

        // Get votes for roll call of first index in rollCallActivity array
        const votes = await page.evaluate(() => {
            // Get all tables in roll call page
            const tablesReference = document.querySelectorAll('table');

            // Convert tables reference to array and iterate through them to extract data cells
            const tables = Array.from(tablesReference).map((item) => {
                // Gett all data cells from table
                const itemData = item.querySelectorAll('tbody tr td');

                // Put data cells in an array
                const itemDataArray = Array.from(itemData);

                // Concatenate columns into one object and return it. If third row doesn't exist, return empty string
                return {
                    item: itemDataArray[0].innerText + itemDataArray[1].innerText + itemDataArray[2]?.innerText || ''
                }
            });

            // Remove first index from tables array since it references total votes table
            tables.splice(0, 1);

            // Reformat first table to have house members last name separated by a comma
            tables[0].item = tables[0].item.replaceAll('\n', ', ');

            // Reformat second table to have house members last name separated by a comma
            tables[1].item = tables[1].item.replaceAll('\n', ', ');

            // Reformat third table to have house members last name separated by a comma
            tables[2].item = tables[2].item.replaceAll('\n', ', ');

            // Return correctly formatted tables
            return tables;
        });

        // Close browser
        await browser.close();

        // Return votes array
        return votes;
    } catch (error) {
        // Catch error and send to console if error is thrown
        console.error('Error occurred during scraping', error);
        return null;
    }
}

// Call scrapeData function
scrapeData().then((res) => {
    console.log(res);
});

// Export scrapeData function
exports.scrapeData = scrapeData;