/**
 * Отладочный скрипт - выводит HTML структуру карточки товара
 */

async function debugProductCard() {
    console.log('🔍 Анализ структуры карточки товара...\n');

    try {
        const puppeteer = await import('puppeteer');

        const browser = await puppeteer.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        const url = 'https://xenozone.ru/katalog/oborudovanie-iz-nerzhaveyushhej-stali/vodopodogrev/gorizontalnye-teploobmenniki/';
        console.log(`📄 URL: ${url}\n`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForSelector('a.card-item-product__title', { timeout: 10000 });

        // Получаем HTML первой карточки товара
        const cardHTML = await page.evaluate(() => {
            const firstLink = document.querySelector('a.card-item-product__title');
            if (!firstLink) return null;

            // Поднимаемся вверх, чтобы найти контейнер карточки
            let container = firstLink;
            for (let i = 0; i < 10; i++) {
                container = container.parentElement;
                if (!container) break;

                // Проверяем, содержит ли этот элемент символ рубля
                if (container.textContent.includes('₽')) {
                    return {
                        html: container.outerHTML,
                        text: container.textContent,
                        className: container.className,
                        tagName: container.tagName
                    };
                }
            }

            return null;
        });

        if (cardHTML) {
            console.log('✅ Найден контейнер с ценой:\n');
            console.log(`Tag: <${cardHTML.tagName}>`);
            console.log(`Class: "${cardHTML.className}"\n`);
            console.log('📝 Текстовое содержимое:');
            console.log('─'.repeat(80));
            console.log(cardHTML.text.substring(0, 500));
            console.log('─'.repeat(80));
            console.log('\n🔍 HTML структура (первые 1000 символов):');
            console.log('─'.repeat(80));
            console.log(cardHTML.html.substring(0, 1000));
            console.log('─'.repeat(80));

            // Ищем цену в тексте
            const priceMatches = cardHTML.text.match(/(\d[\d\s]+)\s*₽/g);
            if (priceMatches) {
                console.log('\n💰 Найденные цены:');
                priceMatches.forEach(match => {
                    console.log(`  - ${match}`);
                });
            }
        } else {
            console.log('❌ Не удалось найти контейнер с ценой');
        }

        await browser.close();

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

debugProductCard();
