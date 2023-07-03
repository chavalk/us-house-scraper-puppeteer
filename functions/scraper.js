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
        // const imgReference = document.querySelector('#mp-otd #mp-otd-img img');
        // const listReference = document.querySelectorAll('#mp-otd > ul li');
        const tableReference = document.querySelectorAll('#activity-table > tbody tr');

        // let imgSource = imgReference.getAttribute('src');

        return tableReference;
    });

    browser.close();

    return body;
}

scrapeData().then((res) => {
    console.log(res);
});

exports.scrapeData = scrapeData;