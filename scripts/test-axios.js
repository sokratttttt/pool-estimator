const axios = require('axios');
const cheerio = require('cheerio');

async function testAxios() {
    console.log('Testing Axios...');
    const url = 'https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/teplovye-nasosy.html';

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        console.log(`Status: ${response.status}`);
        const $ = cheerio.load(response.data);
        const title = $('title').text();
        console.log(`Title: ${title}`);

        const products = $('.catalog-item, .product-item, .item');
        console.log(`Found ${products.length} products`);

        products.each((i, el) => {
            if (i < 3) {
                const name = $(el).find('a.product-item-link, a.name').text().trim();
                const price = $(el).find('.price-box .price, .price').text().trim();
                console.log(`Product ${i + 1}: ${name} - ${price}`);
            }
        });

    } catch (error) {
        console.error('Axios Error:', error.message);
    }
}

testAxios();
