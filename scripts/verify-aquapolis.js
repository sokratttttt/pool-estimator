const fs = require('fs');
const path = require('path');

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    console.log(message);
    try {
        fs.appendFileSync(path.join(__dirname, 'debug.log'), logMessage);
    } catch (e) {
        console.error('Log write failed:', e);
    }
}

log('Script started');

let puppeteer;
try {
    log('Requiring puppeteer...');
    puppeteer = require('puppeteer');
    log('Puppeteer required successfully');
} catch (e) {
    log(`Failed to require puppeteer: ${e.message}`);
    process.exit(1);
}

async function runTest() {
    log('Starting Debug Test...');
    let browser;

    try {
        log('Launching browser...');
        browser = await puppeteer.launch({
            headless: "new", // Use new headless mode
            dumpio: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--disable-blink-features=AutomationControlled' // Hide automation
            ]
        });
        log('Browser launched');

        const page = await browser.newPage();

        // Set realistic headers
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        log('Page created');

        // Test 2: Aquapolis
        log('Test 2: Loading Aquapolis...');
        const url = 'https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/teplovye-nasosy.html';

        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
        log('Test 2: Initial page loaded');

        // Check if we hit the challenge page
        const isChallenge = await page.$('.gorizontal-vertikal');
        if (isChallenge) {
            log('Detected challenge page. Waiting for redirect...');
            try {
                // Wait for the real content to load
                await page.waitForSelector('.catalog-item, .product-item, .item', { timeout: 60000 });
                log('Redirect successful, content loaded');
            } catch (e) {
                log('Timed out waiting for content after redirect');
            }
        } else {
            log('No challenge detected, checking for content...');
            try {
                await page.waitForSelector('.catalog-item, .product-item, .item', { timeout: 30000 });
                log('Content loaded');
            } catch (e) {
                log('Content selector not found');
            }
        }

        const title = await page.title();
        log(`Page Title: ${title}`);

        const content = await page.content();
        log(`Content Length: ${content.length}`);

        fs.writeFileSync(path.join(__dirname, 'debug-page.html'), content);
        log('HTML content saved to debug-page.html');

        // Check for specific text indicating block
        if (content.includes('403 Forbidden') || content.includes('Access Denied') || content.includes('captcha')) {
            log('BLOCKED: Detected blocking message');
        }

        await page.screenshot({ path: 'debug-aquapolis.png', fullPage: true });
        log('Screenshot saved');

    } catch (error) {
        log(`Error: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
            log('Browser closed');
        }
    }
}

runTest();

