/**
 * Финальная попытка с Aquapolis - максимальные задержки и отладка
 */

async function finalAquapolisAttempt() {
    console.log('🔍 Финальная попытка парсинга Aquapolis...\n');

    try {
        const puppeteer = await import('puppeteer');

        const browser = await puppeteer.default.launch({
            headless: true, // Попробуем headless
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--window-size=1920,1080',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        const page = await browser.newPage();

        // Маскируемся под реального пользователя
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Убираем признаки автоматизации
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        });

        const url = 'https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/teploobmeniki.html';
        console.log(`📄 Загрузка: ${url}\n`);

        await page.goto(url, {
            waitUntil: 'networkidle0', // Ждем ВСЕ запросы
            timeout: 60000
        });

        console.log('⏳ Ожидание 15 секунд для полной загрузки...');
        await new Promise(resolve => setTimeout(resolve, 15000));

        // Проверяем наличие элементов
        const debug = await page.evaluate(() => {
            return {
                vCards: document.querySelectorAll('.v-card').length,
                allDivs: document.querySelectorAll('div').length,
                bodyText: document.body.textContent.substring(0, 500),
                hasPrice: document.body.textContent.includes('₽')
            };
        });

        console.log('🔍 Отладочная информация:');
        console.log(`  .v-card элементов: ${debug.vCards}`);
        console.log(`  Всего div: ${debug.allDivs}`);
        console.log(`  Есть символ ₽: ${debug.hasPrice}`);
        console.log(`  Текст страницы: ${debug.bodyText}\n`);

        // Пробуем извлечь товары
        const products = await page.evaluate(() => {
            const items = [];
            const cards = document.querySelectorAll('.v-card');

            console.log(`Найдено карточек: ${cards.length}`);

            cards.forEach((card, index) => {
                const text = card.textContent;
                console.log(`Карточка ${index}: ${text.substring(0, 100)}`);

                // Ищем цену
                const priceMatch = text.match(/(\d[\d\s]+)\s*₽/);
                if (priceMatch) {
                    console.log(`  Найдена цена: ${priceMatch[0]}`);

                    items.push({
                        text: text.substring(0, 200),
                        price: parseInt(priceMatch[1].replace(/\s/g, ''))
                    });
                }
            });

            return items;
        });

        console.log(`\n✅ Извлечено товаров: ${products.length}\n`);

        if (products.length > 0) {
            console.log('📦 Товары:');
            products.forEach((p, i) => {
                console.log(`${i + 1}. Цена: ${p.price} ₽`);
                console.log(`   ${p.text}\n`);
            });
        }

        await browser.close();
        console.log('\n✅ Готово!');

        return products.length;

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        return 0;
    }
}

finalAquapolisAttempt().then(count => {
    if (count > 0) {
        console.log(`\n🎉 УСПЕХ! Найдено ${count} товаров!`);
    } else {
        console.log('\n❌ Товары не найдены. Aquapolis требует другого подхода.');
    }
});
