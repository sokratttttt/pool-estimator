/**
 * Продвинутый анализ aquapolis.ru с перехватом сети
 */

async function advancedAquapolisDebug() {
    console.log('🔍 Продвинутый анализ aquapolis.ru...\n');

    try {
        const puppeteer = await import('puppeteer');

        const browser = await puppeteer.default.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        // Перехватываем сетевые запросы
        const apiRequests = [];
        page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('api') || url.includes('json') || url.includes('product')) {
                try {
                    const contentType = response.headers()['content-type'];
                    if (contentType && contentType.includes('json')) {
                        apiRequests.push({
                            url: url,
                            status: response.status(),
                            type: contentType
                        });
                    }
                } catch (e) {
                    // Ignore
                }
            }
        });

        const url = 'https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/';
        console.log(`📄 Загрузка: ${url}\n`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        console.log('⏳ Ожидание динамической загрузки (10 сек)...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Скриншот после загрузки
        await page.screenshot({ path: 'aquapolis-loaded.png' });
        console.log('📸 Скриншот: aquapolis-loaded.png\n');

        // Детальный анализ DOM
        const domAnalysis = await page.evaluate(() => {
            const results = {
                productContainers: [],
                images: [],
                prices: [],
                titles: [],
                allText: []
            };

            // Ищем изображения товаров
            document.querySelectorAll('img').forEach(img => {
                const alt = img.alt;
                const src = img.src;
                if ((alt && alt.length > 5) || src.includes('product') || src.includes('item')) {
                    results.images.push({
                        alt: alt,
                        src: src.substring(0, 100),
                        parent: img.parentElement?.tagName,
                        parentClass: img.parentElement?.className
                    });
                }
            });

            // Ищем все элементы с текстом, похожим на названия товаров
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let node;
            while (node = walker.nextNode()) {
                const text = node.textContent.trim();
                // Ищем текст, похожий на название товара
                if (text.length > 10 && text.length < 150 &&
                    (text.includes('Теплообменник') || text.includes('Насос') ||
                        text.includes('кВт') || text.includes('м³'))) {
                    const parent = node.parentElement;
                    results.titles.push({
                        text: text.substring(0, 80),
                        tag: parent?.tagName,
                        class: parent?.className,
                        id: parent?.id
                    });
                }

                // Ищем цены
                if (text.match(/\d+\s*₽/) || text.match(/\d+\s*руб/)) {
                    results.prices.push({
                        text: text.trim(),
                        tag: node.parentElement?.tagName,
                        class: node.parentElement?.className
                    });
                }
            }

            // Ищем возможные контейнеры товаров по структуре
            const testSelectors = [
                'div[class*="product"]',
                'div[class*="item"]',
                'div[class*="card"]',
                'div[class*="catalog"]',
                'li[class*="product"]',
                'li[class*="item"]',
                'article'
            ];

            testSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0 && elements.length < 100) {
                    const first = elements[0];
                    const hasImage = first.querySelector('img') !== null;
                    const hasLink = first.querySelector('a') !== null;
                    const textLength = first.textContent.trim().length;

                    if (hasImage || hasLink || (textLength > 20 && textLength < 500)) {
                        results.productContainers.push({
                            selector: selector,
                            count: elements.length,
                            hasImage: hasImage,
                            hasLink: hasLink,
                            firstClass: first.className,
                            firstId: first.id,
                            textSample: first.textContent.trim().substring(0, 100)
                        });
                    }
                }
            });

            return results;
        });

        console.log('🎯 Возможные контейнеры товаров:');
        console.log('─'.repeat(80));
        domAnalysis.productContainers.slice(0, 10).forEach(item => {
            console.log(`${item.selector} - ${item.count} элементов`);
            console.log(`  Изображение: ${item.hasImage ? '✓' : '✗'} | Ссылка: ${item.hasLink ? '✓' : '✗'}`);
            console.log(`  Класс: ${item.firstClass}`);
            console.log(`  Текст: ${item.textSample}\n`);
        });
        console.log('─'.repeat(80));

        console.log('\n📸 Изображения товаров (первые 5):');
        console.log('─'.repeat(80));
        domAnalysis.images.slice(0, 5).forEach((item, i) => {
            console.log(`${i + 1}. ${item.alt}`);
            console.log(`   Parent: <${item.parent}> class="${item.parentClass}"\n`);
        });
        console.log('─'.repeat(80));

        console.log('\n📝 Названия товаров (первые 5):');
        console.log('─'.repeat(80));
        domAnalysis.titles.slice(0, 5).forEach((item, i) => {
            console.log(`${i + 1}. ${item.text}`);
            console.log(`   <${item.tag}> class="${item.class}"\n`);
        });
        console.log('─'.repeat(80));

        console.log('\n💰 Цены (первые 5):');
        console.log('─'.repeat(80));
        domAnalysis.prices.slice(0, 5).forEach((item, i) => {
            console.log(`${i + 1}. ${item.text}`);
            console.log(`   <${item.tag}> class="${item.class}"\n`);
        });
        console.log('─'.repeat(80));

        console.log('\n🌐 API запросы:');
        console.log('─'.repeat(80));
        if (apiRequests.length > 0) {
            apiRequests.forEach((req, i) => {
                console.log(`${i + 1}. ${req.url}`);
                console.log(`   Status: ${req.status} | Type: ${req.type}\n`);
            });
        } else {
            console.log('API запросы не обнаружены');
        }
        console.log('─'.repeat(80));

        console.log('\n⏸️  Браузер остается открытым 20 секунд для проверки...');
        await new Promise(resolve => setTimeout(resolve, 20000));

        await browser.close();
        console.log('\n✅ Готово!');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    }
}

advancedAquapolisDebug();
