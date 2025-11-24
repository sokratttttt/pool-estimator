/**
 * Расширенный отладочный скрипт с скриншотом
 */

async function advancedDebug() {
    console.log('🔍 Расширенный анализ страницы...\n');

    try {
        const puppeteer = await import('puppeteer');
        const fs = await import('fs/promises');

        const browser = await puppeteer.default.launch({
            headless: false, // Показываем браузер для отладки
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        const url = 'https://xenozone.ru/katalog/oborudovanie-iz-nerzhaveyushhej-stali/vodopodogrev/gorizontalnye-teploobmenniki/';
        console.log(`📄 Загрузка: ${url}\n`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Ждем дольше для загрузки JS
        console.log('⏳ Ожидание загрузки контента (5 сек)...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Делаем скриншот
        console.log('📸 Создание скриншота...');
        await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
        console.log('✅ Скриншот сохранен: debug-screenshot.png\n');

        // Ищем ВСЕ элементы с символом рубля
        const priceElements = await page.evaluate(() => {
            const allElements = document.querySelectorAll('*');
            const withRuble = [];

            allElements.forEach(el => {
                const text = el.textContent;
                if (text && text.includes('₽') && text.length < 200) {
                    withRuble.push({
                        tag: el.tagName,
                        class: el.className,
                        id: el.id,
                        text: text.trim().substring(0, 100)
                    });
                }
            });

            return withRuble.slice(0, 10); // Первые 10
        });

        console.log('💰 Элементы с символом ₽:');
        console.log('─'.repeat(80));
        priceElements.forEach((el, i) => {
            console.log(`${i + 1}. <${el.tag}> class="${el.class}"`);
            console.log(`   ${el.text}`);
            console.log('');
        });
        console.log('─'.repeat(80));

        // Ищем все ссылки на товары
        const products = await page.evaluate(() => {
            const links = document.querySelectorAll('a.card-item-product__title');
            return Array.from(links).map(link => ({
                name: link.textContent.trim(),
                href: link.href
            }));
        });

        console.log(`\n📦 Найдено товаров: ${products.length}`);
        if (products.length > 0) {
            console.log('\nПервые 3 товара:');
            products.slice(0, 3).forEach((p, i) => {
                console.log(`${i + 1}. ${p.name}`);
            });
        }

        console.log('\n⏸️  Браузер остается открытым 10 секунд для проверки...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        await browser.close();
        console.log('\n✅ Готово! Проверьте debug-screenshot.png');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    }
}

advancedDebug();
