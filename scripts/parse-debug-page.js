const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Читаем HTML файл
const htmlPath = path.join(__dirname, 'debug-page.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

// Загружаем HTML в cheerio
const $ = cheerio.load(html);

// Массив для хранения данных о продуктах
const products = [];

// Находим все карточки товаров
$('.app-product-tile').each((index, element) => {
    const $card = $(element);

    // Извлекаем название товара
    const titleElement = $card.find('.app-product-tile__title');
    const name = titleElement.text().trim();

    // Извлекаем URL товара
    const linkElement = $card.find('a[href*="/"]').first();
    const relativeUrl = linkElement.attr('href');
    const url = relativeUrl ? `https://aquapolis.ru${relativeUrl}` : '';

    // Извлекаем цену
    const priceValueElement = $card.find('.c-amount__value');
    const priceCurrencyElement = $card.find('.c-amount__currency');
    const priceText = priceValueElement.text().trim();
    const currency = priceCurrencyElement.text().trim();

    // Очищаем цену от неразрывных пробелов и преобразуем в число
    const priceNumber = priceText ? parseFloat(priceText.replace(/\s/g, '').replace(/&nbsp;/g, '')) : null;
    const price = priceNumber ? `${priceNumber} ${currency}` : null;

    // Извлекаем URL изображения
    const imgElement = $card.find('.c-product-picture img').first();
    const imageUrl = imgElement.attr('src') || imgElement.attr('data-nuxt-pic') || '';

    // Извлекаем артикул
    const skuElement = $card.find('.app-product-tile__sku');
    const skuText = skuElement.text().trim();
    const sku = skuText.replace('Артикул', '').trim();

    // Добавляем товар в массив, если есть название
    if (name) {
        products.push({
            name,
            url,
            price,
            priceNumber,
            currency,
            imageUrl,
            sku
        });
    }
});

// Сохраняем результат в JSON файл
const outputPath = path.join(__dirname, '..', 'aquapolis-products-parsed.json');
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf-8');

console.log(`✅ Извлечено ${products.length} товаров`);
console.log(`📁 Результат сохранен в: ${outputPath}`);

// Выводим первые 3 товара для проверки
console.log('\n📦 Примеры извлеченных товаров:');
products.slice(0, 3).forEach((product, index) => {
    console.log(`\n${index + 1}. ${product.name}`);
    console.log(`   Цена: ${product.price}`);
    console.log(`   URL: ${product.url}`);
    console.log(`   Артикул: ${product.sku}`);
});
