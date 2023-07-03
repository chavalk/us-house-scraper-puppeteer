const puppeteer = require('puppeteer');

const scrapeData = async () => {
    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto('https://en.wikipedia.org/wiki/Main_Page', {
        waitUntil: "domcontentloaded"
    });

    const body = await page.evaluate(() => {
        const imgReference = document.querySelector('#mp-otd #mp-otd-img img');
        const listReference = document.querySelectorAll('#mp-otd > ul li');

        let imgSource = imgReference.getAttribute('src');

        return imgSource;
    });

    browser.close();

    return body;
}

scrapeData().then((res) => {
    console.log(res);
});

exports.scrapeData = scrapeData;