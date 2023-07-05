const puppeteer = require('puppeteer');

const scrapeData = async () => {
    const browser = await puppeteer.launch({
        headless: true
    });

    const page = await browser.newPage();

    await page.goto('https://live.house.gov/', {
        waitUntil: "networkidle0"
    });

    const body = await page.evaluate(() => {
        const activityTableReference = document.querySelectorAll('#activity-table > tbody tr');

        const activity = Array.from(activityTableReference).map((item) => {
            const dataCellReference = item.querySelectorAll('td');
            const dataCell = Array.from(dataCellReference)

            return {
                floorTime: dataCell[0].innerText,
                floorBill: dataCell[1].innerText,
                floorActivity: dataCell[2].innerText
            }
        });

        return { activity };
    });

    browser.close();

    return body;
}

scrapeData().then((res) => {
    console.log(res)
});

exports.scrapeData = scrapeData;