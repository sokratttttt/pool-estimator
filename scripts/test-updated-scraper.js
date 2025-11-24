/**
 * Тест обновленного парсера aquapolis
 */

async function testUpdatedScraper() {
    console.log('🔍 Тест обновленного парсера Aquapolis...\n');

    const { scrapeAquapolisCategory } = await import('../src/scrapers/aquapolis.js');

    const url = 'https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/teploobmeniki.html';

    const products = await scrapeAquapolisCategory(url);

    console.log(`\n✅ Результат: ${products.length} товаров\n`);

    if (products.length > 0) {
        console.log('📦 Первые 5 товаров:\n');
        products.slice(0, 5).forEach((p, i) => {
            console.log(`${i + 1}. ${p.name}`);
            console.log(`   Цена: ${p.price.toLocaleString('ru-RU')} ₽`);
            console.log(`   URL: ${p.url}\n`);
        });
    }
}

testUpdatedScraper();
