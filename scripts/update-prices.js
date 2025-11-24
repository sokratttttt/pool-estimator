const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const MAPPING_FILE = path.join(__dirname, '../src/data/product-mapping.json');
const OUTPUT_FILE = path.join(__dirname, '../src/data/prices.json');

async function fetchPrice(url, selector) {
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const $ = cheerio.load(data);
        const priceText = $(selector).first().text();

        // Clean string to get number (remove spaces, 'rub', etc.)
        const cleanPrice = priceText.replace(/[^0-9,.]/g, '').replace(',', '.');
        const price = parseFloat(cleanPrice);

        if (isNaN(price)) {
            console.warn(`Could not parse price for ${url}. Text found: "${priceText}"`);
            return null;
        }
        return price;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return null;
    }
}

async function updatePrices() {
    console.log('Starting price update...');

    if (!fs.existsSync(MAPPING_FILE)) {
        console.error('Mapping file not found!');
        return;
    }

    const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
    const currentPrices = fs.existsSync(OUTPUT_FILE) ? JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8')) : {};

    let updatedCount = 0;

    for (const item of mapping.items) {
        if (!item.url) continue;

        console.log(`Checking: ${item.name}...`);
        const newPrice = await fetchPrice(item.url, item.selector);

        if (newPrice) {
            currentPrices[item.name] = newPrice;
            console.log(`  -> New price: ${newPrice}`);
            updatedCount++;
        }

        // Be nice to the server
        await new Promise(r => setTimeout(r, 1000));
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(currentPrices, null, 2));
    console.log(`\nDone! Updated ${updatedCount} prices. Saved to src/data/prices.json`);
}

updatePrices();
