// Import Puppeteer
const puppeteer = require('puppeteer');

// Build function to scrape activity from the US House floor activity table
const scrapeUSHouseFloorActivity = async () => {
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
    
        // Get text in table rows from US House of Representatives floor activity table
        const body = await page.evaluate(() => {
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
                    floorActivity: dataCell[2].innerText
                }
            });
    
            // Return activity array inside of object
            return { activity };
        });
    
        // Close Puppeteer browser
        await browser.close();
    
        // Return activity array inside of object
        return body;
    } catch (error) {
        // Catch error and send to console if error is thrown
        console.error('Error occurred during scraping:', error);
        return null;
    }
    
}

// Call scrapeData function
scrapeUSHouseFloorActivity()
// .then((res) => {
//     console.log(res);
// });

// Export scrapeData function
exports.scrapeUSHouseFloorActivity = scrapeUSHouseFloorActivity;