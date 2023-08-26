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

            const filteredActivity = activity.filter(value => JSON.stringify(value) !== '{}');
            const rollCallActivity = filteredActivity.filter(value => value.link.includes('roll'));

            return rollCallActivity;
        });

        await page.goto(body[0].link, {
            waitUntil: 'networkidle0'
        });

        const votes = await page.evaluate(() => {
            const tablesReference = document.querySelectorAll('table');

            const tables = Array.from(tablesReference).map((item) => {
                const itemData = item.querySelectorAll('tbody tr td');
                const itemDataArray = Array.from(itemData);

                return {
                    item: itemDataArray[0].innerText + itemDataArray[1].innerText + itemDataArray[2]?.innerText || ''
                }
            });

            return tables;
        });

        await browser.close();

        return votes;
    } catch (error) {
        console.error('Error occurred during scraping', error);
        return null;
    }
}

scrapeData().then((res) => {
    console.log(res);
});

exports.scrapeData = scrapeData;