/**
 * Test script for Aquapolis scraper
 * Runs the scraper logic directly to verify extraction
 */

const { scrapeAquapolisCategory } = require('../src/scrapers/aquapolis');

// Mock Puppeteer import since we are running in node script context where import might be tricky without babel
// But wait, the scraper uses ES modules (import/export). 
// We need to run this with `node` but the project seems to be using ES modules (Next.js).
// Let's try to use dynamic import() in a self-executing async function or just use the API route test approach.

// Actually, since the project is Next.js, running a standalone script that imports from 'src' might fail if package.json type isn't module.
// Let's check package.json first or just try to run it.
// If it fails, we can create a temporary CommonJS wrapper or just use the API.

async function runTest() {
    console.log('Starting Aquapolis Scraper Test...');

    // Test URL: Heat pumps
    const url = 'https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/teplovye-nasosy.html';

    try {
        // We need to import the module dynamically because it's an ES module
        // and we are likely running in a CommonJS environment or need to handle the path alias '@/' if used (but I didn't use aliases in the scraper file itself).
        // However, the scraper imports 'puppeteer'.

        // Let's try to import the file we just created.
        // Note: We need to use the absolute path or relative path correctly.
        const scraper = await import('../src/scrapers/aquapolis.js');

        console.log(`Scraping URL: ${url}`);
        const products = await scraper.scrapeAquapolisCategory(url);

        console.log('\n--- Results ---');
        console.log(`Found ${products.length} products.`);

        if (products.length > 0) {
            console.log('First 5 products:');
            products.slice(0, 5).forEach((p, i) => {
                console.log(`${i + 1}. ${p.name} | ${p.price} RUB | ${p.url}`);
            });
        } else {
            console.log('No products found. Check selectors.');
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

runTest();
