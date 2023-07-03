const puppeteer = require('puppeteer');

const scrapeData = async () => {
    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto('https://live.house.gov/', {
        waitUntil: "networkidle0"
    });

    const body = await page.evaluate(() => {
        const tableReference = document.querySelectorAll('#activity-table > tbody tr');

        const table = Array.from(tableReference).map((item) => {
            return {
                text: item.innerText
            }
        });

        return table;
    });

    browser.close();

    return body;
}

scrapeData().then((res) => {
    console.log(res);
});

exports.scrapeData = scrapeData;