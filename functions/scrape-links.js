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

        
    } catch (error) {

    }
}