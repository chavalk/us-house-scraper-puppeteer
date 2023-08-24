const puppeteer = require('puppeteer');

const scrapeData = async () => {
    try {
        const browser = await puppeteer.launch({
            headless: "new"
        });
    
        const page = await browser.newPage();
    
        await page.goto('https://live.house.gov/?date=2023-07-27', {
            waitUntil: "networkidle0"
        });
    
        const body = await page.evaluate(() => {
            const activityTableReference = document.querySelectorAll('#activity-table > tbody tr');
    
            const activity = Array.from(activityTableReference).map((item) => {
                const dataCellReference = item.querySelectorAll('td');
                const dataCell = Array.from(dataCellReference);
    
                return {
                    floorTime: dataCell[0].innerText,
                    floorBill: dataCell[1].innerText,
                    floorActivity: dataCell[2].innerText
                }
            });
    
            return { activity };
        });
    
        await browser.close();
    
        return body;
    } catch (error) {
        console.error('Error occurred during scraping:', error);
        return null;
    }
    
}

scrapeData().then((res) => {
    console.log(res);
});

exports.scrapeData = scrapeData;