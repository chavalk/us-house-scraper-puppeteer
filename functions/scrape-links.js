const puppeteer = require('puppeteer');

const scrapeData = async () => {
    try {
        const browser = await puppeteer.launch({
            headless: "new"
        });
    } catch (error) {
        
    }
}