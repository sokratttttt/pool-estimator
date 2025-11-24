/**
 * Финальный отладочный скрипт - ищем цены в полноэкранном режиме
 */

async function finalDebug() {
    console.log('🔍 Поиск цен в полноэкранном режиме...\n');

    try {
        const puppeteer = await import('puppeteer');

        const browser = await puppeteer.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        const url = 'https://xenozone.ru/katalog/oborudovanie-iz-nerzhaveyushhej-stali/vodopodogrev/gorizontalnye-teploobmenniki/';
        console.log(`📄 URL: ${url}\n`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Делаем скриншот в полноэкранном режиме
        await page.screenshot({ path: 'fullscreen-debug.png', fullPage: false });
        console.log('📸 Скриншот: fullscreen-debug.png\n');

        // Ищем ВСЕ текстовые узлы с числами
        const priceData = await page.evaluate(() => {
            const results = [];

            // Ищем все элементы с текстом, содержащим числа
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let node;
            while (node = walker.nextNode()) {
                const text = node.textContent.trim();
                // Ищем числа с пробелами (формат цены)
                if (/\d[\d\s]{3,}/.test(text)) {
                    const parent = node.parentElement;
                    results.push({
                        text: text.substring(0, 50),
                        tag: parent?.tagName,
                        class: parent?.className,
                        hasRuble: text.includes('₽') || text.includes('Р') || text.includes('P')
                    });
                }
            }

            return results.slice(0, 20);
        });

        console.log('💰 Найденные числовые значения:');
        console.log('─'.repeat(80));
        priceData.forEach((item, i) => {
            console.log(`${i + 1}. "${item.text}"`);
            console.log(`   Tag: <${item.tag}> Class: "${item.class}"`);
            console.log(`   Есть символ валюты: ${item.hasRuble ? '✅' : '❌'}`);
            console.log('');
        });
        console.log('─'.repeat(80));

        // Ищем конкретно элементы с ценами (по скриншоту видно, что они есть)
        const specificPrices = await page.evaluate(() => {
            // Пробуем разные селекторы
            const selectors = [
                '.price',
                '.product-price',
                '[class*="price"]',
                '[class*="cost"]',
                'span:contains("₽")',
                'div:contains("₽")'
            ];

            const found = [];

            // Ищем все элементы, содержащие цифры и валюту
            document.querySelectorAll('*').forEach(el => {
                const text = el.textContent;
                if (text && text.length < 50 && /\d+\s*[₽РP]/.test(text)) {
                    found.push({
                        text: text.trim(),
                        tag: el.tagName,
                        class: el.className,
                        id: el.id
                    });
                }
            });

            return found.slice(0, 15);
        });

        console.log('\n💵 Элементы с форматом цены:');
        console.log('─'.repeat(80));
        specificPrices.forEach((item, i) => {
            console.log(`${i + 1}. "${item.text}"`);
            console.log(`   <${item.tag}> class="${item.class}" id="${item.id}"`);
            console.log('');
        });
        console.log('─'.repeat(80));

        await browser.close();
        console.log('\n✅ Проверьте fullscreen-debug.png');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

finalDebug();
