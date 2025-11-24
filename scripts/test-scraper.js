/**
 * Тестовый скрипт для отладки парсера xenozone
 * Запуск: node scripts/test-scraper.js
 */

async function testScraper() {
    console.log('🔍 Тестирование парсера xenozone...\n');

    try {
        // Динамический импорт
        const { scrapeXenozoneCategory } = await import('../src/scrapers/xenozone.js');

        const testUrl = 'https://xenozone.ru/katalog/oborudovanie-iz-nerzhaveyushhej-stali/vodopodogrev/gorizontalnye-teploobmenniki/';

        console.log(`📄 URL: ${testUrl}\n`);
        console.log('⏳ Запуск парсера...\n');

        const products = await scrapeXenozoneCategory(testUrl);

        console.log(`\n✅ Результат: найдено ${products.length} товаров\n`);

        if (products.length > 0) {
            console.log('📦 Первые 5 товаров:\n');
            products.slice(0, 5).forEach((p, i) => {
                console.log(`${i + 1}. ${p.name}`);
                console.log(`   Цена: ${p.price ? p.price.toLocaleString('ru-RU') + ' ₽' : 'не найдена'}`);
                console.log(`   URL: ${p.url}\n`);
            });
        } else {
            console.log('❌ Товары не найдены. Возможные причины:');
            console.log('   1. Селекторы устарели');
            console.log('   2. Сайт требует JavaScript');
            console.log('   3. Блокировка по User-Agent');
            console.log('   4. Timeout при загрузке\n');
        }

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error('\nStack trace:', error.stack);
    }
}

testScraper();
