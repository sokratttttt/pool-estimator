/**
 * Детальный анализ структуры товаров на aquapolis.ru
 */

async function debugAquapolis() {
    console.log('🔍 Детальный анализ aquapolis.ru...\n');

    try {
        const puppeteer = await import('puppeteer');

        const browser = await puppeteer.default.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        const url = 'https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/';
        console.log(`📄 Загрузка: ${url}\n`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        console.log('⏳ Ожидание загрузки контента (5 сек)...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Скриншот
        await page.screenshot({ path: 'aquapolis-products.png', fullPage: true });
        console.log('📸 Скриншот: aquapolis-products.png\n');

        // Анализ структуры
        const analysis = await page.evaluate(() => {
            const results = {
                possibleSelectors: [],
                priceElements: [],
                linkElements: [],
                allClasses: new Set()
            };

            // Собираем все уникальные классы
            document.querySelectorAll('*').forEach(el => {
                if (el.className && typeof el.className === 'string') {
                    el.className.split(' ').forEach(cls => {
                        if (cls) results.allClasses.add(cls);
                    });
                }
            });

            // Ищем элементы с ценами
            document.querySelectorAll('*').forEach(el => {
                const text = el.textContent;
                if (text && text.match(/\d+\s*₽/) && text.length < 100) {
                    results.priceElements.push({
                        tag: el.tagName,
                        class: el.className,
                        text: text.trim().substring(0, 50)
                    });
                }
            });

            // Ищем ссылки на товары
            document.querySelectorAll('a').forEach(link => {
                const href = link.href;
                const text = link.textContent.trim();

                if (text.length > 10 && text.length < 100 &&
                    (href.includes('teploobmennik') || href.includes('nasos') ||
                        href.includes('product') || href.includes('item'))) {
                    results.linkElements.push({
                        text: text.substring(0, 50),
                        href: href,
                        class: link.className
                    });
                }
            });

            // Пробуем найти контейнеры товаров
            const selectors = [
                '.product',
                '.item',
                '[class*="product"]',
                '[class*="item"]',
                '[class*="card"]',
                'article'
            ];

            selectors.forEach(sel => {
                const elements = document.querySelectorAll(sel);
                if (elements.length > 0) {
                    results.possibleSelectors.push({
                        selector: sel,
                        count: elements.length,
                        firstClass: elements[0]?.className
                    });
                }
            });

            results.allClasses = Array.from(results.allClasses).filter(cls =>
                cls.includes('product') || cls.includes('item') ||
                cls.includes('card') || cls.includes('catalog')
            );

            return results;
        });

        console.log('🎯 Возможные селекторы товаров:');
        console.log('─'.repeat(80));
        analysis.possibleSelectors.forEach(item => {
            console.log(`${item.selector} - найдено: ${item.count}`);
            console.log(`  Класс: ${item.firstClass}\n`);
        });
        console.log('─'.repeat(80));

        console.log('\n💰 Элементы с ценами (первые 5):');
        console.log('─'.repeat(80));
        analysis.priceElements.slice(0, 5).forEach((item, i) => {
            console.log(`${i + 1}. <${item.tag}> class="${item.class}"`);
            console.log(`   ${item.text}\n`);
        });
        console.log('─'.repeat(80));

        console.log('\n🔗 Ссылки на товары (первые 5):');
        console.log('─'.repeat(80));
        analysis.linkElements.slice(0, 5).forEach((item, i) => {
            console.log(`${i + 1}. ${item.text}`);
            console.log(`   ${item.href}`);
            console.log(`   class="${item.class}"\n`);
        });
        console.log('─'.repeat(80));

        console.log('\n📋 Релевантные классы:');
        console.log(analysis.allClasses.slice(0, 20).join(', '));

        console.log('\n\n⏸️  Браузер остается открытым 15 секунд...');
        await new Promise(resolve => setTimeout(resolve, 15000));

        await browser.close();
        console.log('\n✅ Готово! Проверьте aquapolis-products.png');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

debugAquapolis();
