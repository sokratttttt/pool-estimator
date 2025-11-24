const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

/**
 * Универсальный скрипт для парсинга товаров с Aquapolis.ru
 * Использует Puppeteer для обхода защиты и Cheerio для извлечения данных
 */

async function scrapeAquapolisCategory(url, options = {}) {
    const {
        saveHtml = false,
        outputFile = 'aquapolis-products.json',
        timeout = 30000,
        waitForSelector = '.app-product-tile'
    } = options;

    console.log(`🚀 Начинаем парсинг: ${url}`);

    let browser;
    try {
        // Запускаем браузер
        browser = await puppeteer.launch({
            headless: false, // Показываем браузер для отладки
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        const page = await browser.newPage();

        // Устанавливаем User-Agent
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // Устанавливаем viewport
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('📄 Загружаем страницу...');

        // Переходим на страницу
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: timeout
        });

        console.log('⏳ Ожидаем загрузки товаров...');

        // Ждем появления карточек товаров
        try {
            await page.waitForSelector(waitForSelector, { timeout: 10000 });
            console.log('✅ Товары загружены');
        } catch (error) {
            console.log('⚠️  Селектор товаров не найден, продолжаем...');
        }

        // Прокручиваем страницу для загрузки всех товаров
        await autoScroll(page);

        // Получаем HTML контент
        const html = await page.content();

        // Сохраняем HTML если нужно
        if (saveHtml) {
            const htmlPath = path.join(__dirname, 'debug-page.html');
            fs.writeFileSync(htmlPath, html, 'utf-8');
            console.log(`💾 HTML сохранен в: ${htmlPath}`);
        }

        // Закрываем браузер
        await browser.close();
        browser = null;

        console.log('🔍 Парсим данные...');

        // Парсим HTML с помощью Cheerio
        const products = parseProductsFromHtml(html);

        // Сохраняем результат
        const outputPath = path.join(__dirname, '..', outputFile);
        fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf-8');

        console.log(`\n✅ Успешно извлечено ${products.length} товаров`);
        console.log(`📁 Результат сохранен в: ${outputPath}`);

        // Выводим статистику
        if (products.length > 0) {
            const prices = products.map(p => p.priceNumber).filter(p => p);
            const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            console.log('\n📊 Статистика:');
            console.log(`   Средняя цена: ${Math.round(avgPrice).toLocaleString('ru-RU')} ₽`);
            console.log(`   Минимальная цена: ${minPrice.toLocaleString('ru-RU')} ₽`);
            console.log(`   Максимальная цена: ${maxPrice.toLocaleString('ru-RU')} ₽`);

            console.log('\n📦 Примеры товаров:');
            products.slice(0, 3).forEach((product, index) => {
                console.log(`\n${index + 1}. ${product.name}`);
                console.log(`   Цена: ${product.price}`);
                console.log(`   Артикул: ${product.sku}`);
            });
        }

        return products;

    } catch (error) {
        console.error('❌ Ошибка при парсинге:', error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Автоматическая прокрутка страницы для загрузки всех товаров
 */
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

/**
 * Парсинг товаров из HTML с помощью Cheerio
 */
function parseProductsFromHtml(html) {
    const $ = cheerio.load(html);
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
        const priceNumber = priceText
            ? parseFloat(priceText.replace(/\s/g, '').replace(/&nbsp;/g, ''))
            : null;
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

    return products;
}

// Если скрипт запущен напрямую
if (require.main === module) {
    const url = process.argv[2] || 'https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/teplovye-nasosy.html';

    scrapeAquapolisCategory(url, {
        saveHtml: true,
        outputFile: 'aquapolis-products.json'
    }).catch(error => {
        console.error('Ошибка:', error);
        process.exit(1);
    });
}

module.exports = { scrapeAquapolisCategory, parseProductsFromHtml };
