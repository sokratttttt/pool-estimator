console.log('Start');
try {
    const puppeteer = require('puppeteer');
    console.log('Puppeteer imported');
    (async () => {
        try {
            console.log('Launching...');
            const browser = await puppeteer.launch({ headless: true });
            console.log('Launched');
            await browser.close();
            console.log('Closed');
        } catch (e) {
            console.error('Launch error:', e);
        }
    })();
} catch (e) {
    console.error('Import error:', e);
}
