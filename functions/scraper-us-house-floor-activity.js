const puppeteer = require('puppeteer');

const scrapeUSHouseFloorActivity = async () => {
    try {
        const browser = await puppeteer.launch({
            headless: "new"
        });
    
        const page = await browser.newPage();
    
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
    
        // Get text in table rows from US House of Representatives floor activity table
        const activity = await page.evaluate(() => {
            // Scrape date displayed at the top of floor activity page
            const date = document.querySelector('.display-date').textContent;
            // Get all table rows from US House of Representatives floor activity table
            const activityTableReference = document.querySelectorAll('#activity-table > tbody tr');
    
            // Create array of all table rows from US House of Representatives floor activity table and iterate through them to extract all data cells from each row
            const activity = Array.from(activityTableReference).map((item) => {
                // Get all data cells from each row in US House of Representatives floor activity table
                const dataCellReference = item.querySelectorAll('td');

                // Create array from all data cells in each row of US House of Representatives floor activity table
                const dataCell = Array.from(dataCellReference);
    
                // Return text from each of the data cells in object format
                return {
                    floorTime: dataCell[0].innerText,
                    floorBill: dataCell[1].innerText,
                    floorActivity: dataCell[2].innerText,
                    id: dataCell[0].innerText + ' ' + date
                }
            });
    
            // Return activity array inside of object
            return activity;
        });
    
        // Close Puppeteer browser
        await browser.close();
    
        // Return activity array inside of object
        return { activity, id: houseSessionDate };
    } catch (error) {
        // Catch error and send to console if error is thrown
        console.error('Error occurred during scraping:', error);
        return null;
    }
    
}

// Call scrapeData function
scrapeUSHouseFloorActivity()
.then((res) => {
    console.log(res);
});

// Export scrapeData function
exports.scrapeUSHouseFloorActivity = scrapeUSHouseFloorActivity;