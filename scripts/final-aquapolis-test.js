/**
 * Финальный тест с правильным URL aquapolis.ru
 */

async function finalAquapolisTest() {
    console.log('🔍 Финальный тест aquapolis.ru...\n');

    try {
        const puppeteer = await import('puppeteer');
        const fs = await import('fs/promises');

        const browser = await puppeteer.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        const url = 'https://aquapolis.ru/oborudovanie-dlja-bassejna.html';
        console.log(`📄 Загрузка: ${url}\n`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        console.log('⏳ Ожидание загрузки (8 сек)...');
        await new Promise(resolve => setTimeout(resolve, 8000));

        // Сохраняем HTML
        const html = await page.content();
        await fs.writeFile('aquapolis-correct.html', html);

        // Скриншот
        await page.screenshot({ path: 'aquapolis-correct.png', fullPage: false });
        console.log('📸 Скриншот: aquapolis-correct.png\n');

        // Анализ товаров
        const products = await page.evaluate(() => {
            const results = [];

            // Ищем все ссылки на товары
            document.querySelectorAll('a').forEach(link => {
                const href = link.href;
                const text = link.textContent.trim();

                // Товары обычно имеют URL вида /product/ или /p/ или содержат название
                if (href && (
                    href.includes('/oborudovanie-dlja-bassejna/') ||
                    href.includes('/nasosnoe-oborudovanie/') ||
                    href.includes('/teploobmenniki/') ||
                    href.includes('/teplovye-nasosy/')
                ) && text.length > 10 && text.length < 200) {

                    // Ищем цену рядом
                    let price = null;
                    const container = link.closest('div, article, li');

                    if (container) {
                        const containerText = container.textContent;
                        const priceMatch = containerText.match(/(\d[\d\s]+)\s*(₽|руб)/i);
                        if (priceMatch) {
                            price = parseInt(priceMatch[1].replace(/\s/g, ''));
                        }
                    }

                    results.push({
                        name: text,
                        url: href,
                        price: price,
                        containerClass: container?.className,
                        linkClass: link.className
                    });
                }
            });

            return results;
        });

        console.log(`✅ Найдено товаров: ${products.length}\n`);

        if (products.length > 0) {
            console.log('📦 Первые 10 товаров:\n');
            products.slice(0, 10).forEach((p, i) => {
                console.log(`${i + 1}. ${p.name}`);
                console.log(`   Цена: ${p.price ? p.price + ' ₽' : 'не найдена'}`);
                console.log(`   URL: ${p.url.substring(0, 80)}...`);
                console.log(`   Link class: ${p.linkClass}`);
                console.log(`   Container class: ${p.containerClass}\n`);
            });

            const withPrice = products.filter(p => p.price);
            console.log(`\n💰 Товаров с ценой: ${withPrice.length}`);

            if (withPrice.length > 0) {
                console.log('\n🎯 СЕЛЕКТОРЫ НАЙДЕНЫ!');
                console.log(`Link class: ${withPrice[0].linkClass}`);
                console.log(`Container class: ${withPrice[0].containerClass}`);
            }
        } else {
            console.log('❌ Товары не найдены');
        }

        await fs.writeFile('aquapolis-products.json', JSON.stringify(products, null, 2));
        console.log('\n💾 Сохранено: aquapolis-products.json');

        await browser.close();
        console.log('\n✅ Готово!');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    }
}

finalAquapolisTest();
