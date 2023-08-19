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
            const activityTableReference = document.querySelectorAll('#activity-table > tbody tr td');

            const activity = Array.from(activityTableReference).map((item) => {
                const anchor = item.querySelector('a');
                let href;
                if (anchor !== null) {
                    href = anchor.getAttribute('href');
                }

                return {
                    link: href
                }
            });

            return { activity };
        });

        await browser.close();

        return body;
    } catch (error) {

    }
}