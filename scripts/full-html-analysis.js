/**
 * Полный HTML анализ aquapolis.ru с сохранением структуры
 */

async function fullHTMLAnalysis() {
    console.log('🔍 Полный HTML анализ aquapolis.ru...\n');

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

        const url = 'https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/';
        console.log(`📄 Загрузка: ${url}\n`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        console.log('⏳ Ожидание полной загрузки (10 сек)...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Сохраняем полный HTML
        const html = await page.content();
        await fs.writeFile('aquapolis-full.html', html);
        console.log('💾 Сохранен: aquapolis-full.html\n');

        // Детальный анализ структуры
        const analysis = await page.evaluate(() => {
            const results = {
                productCards: [],
                allClasses: new Set(),
                suspiciousElements: []
            };

            // Собираем все классы
            document.querySelectorAll('*').forEach(el => {
                if (el.className && typeof el.className === 'string') {
                    el.className.split(' ').forEach(cls => {
                        if (cls) results.allClasses.add(cls);
                    });
                }
            });

            // Ищем элементы, которые МОГУТ быть товарами
            // Критерии: содержит изображение + текст + возможно цену
            document.querySelectorAll('*').forEach(el => {
                const hasImage = el.querySelector('img') !== null;
                const hasLink = el.querySelector('a') !== null;
                const text = el.textContent.trim();
                const hasReasonableText = text.length > 20 && text.length < 500;

                // Проверяем, есть ли цена (число + руб/₽)
                const hasPrice = /\d+\s*(руб|₽|rub)/i.test(text);

                // Проверяем, есть ли название товара (ключевые слова)
                const hasProductName = /(теплообменник|насос|фильтр|скиммер|прожектор|форсунка)/i.test(text);

                if ((hasImage || hasLink) && hasReasonableText && (hasPrice || hasProductName)) {
                    const rect = el.getBoundingClientRect();

                    results.suspiciousElements.push({
                        tag: el.tagName,
                        class: el.className,
                        id: el.id,
                        hasImage,
                        hasLink,
                        hasPrice,
                        hasProductName,
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                        textSample: text.substring(0, 150),
                        childrenCount: el.children.length
                    });
                }
            });

            // Фильтруем по размеру (товарные карточки обычно 200-500px)
            results.productCards = results.suspiciousElements.filter(el =>
                el.width > 150 && el.width < 600 &&
                el.height > 150 && el.height < 800 &&
                el.childrenCount > 2
            );

            results.allClasses = Array.from(results.allClasses);

            return results;
        });

        console.log('🎯 Найдено подозрительных элементов:', analysis.suspiciousElements.length);
        console.log('📦 Похожих на товарные карточки:', analysis.productCards.length);
        console.log('\n' + '='.repeat(80));

        if (analysis.productCards.length > 0) {
            console.log('\n✅ НАЙДЕНЫ ТОВАРНЫЕ КАРТОЧКИ:\n');
            analysis.productCards.slice(0, 5).forEach((card, i) => {
                console.log(`${i + 1}. <${card.tag}> class="${card.class}"`);
                console.log(`   Размер: ${card.width}x${card.height}px`);
                console.log(`   Изображение: ${card.hasImage ? '✓' : '✗'} | Ссылка: ${card.hasLink ? '✓' : '✗'}`);
                console.log(`   Цена: ${card.hasPrice ? '✓' : '✗'} | Название: ${card.hasProductName ? '✓' : '✗'}`);
                console.log(`   Текст: ${card.textSample}\n`);
            });

            // Находим общий класс
            const classes = analysis.productCards.map(c => c.class);
            const commonClasses = classes[0]?.split(' ').filter(cls =>
                classes.every(c => c.includes(cls))
            );

            if (commonClasses && commonClasses.length > 0) {
                console.log('🎯 ОБЩИЕ КЛАССЫ ТОВАРОВ:');
                console.log(commonClasses.join(', '));
                console.log('\n💡 РЕКОМЕНДУЕМЫЙ СЕЛЕКТОР:');
                console.log(`.${commonClasses[0]}`);
            }
        } else {
            console.log('\n❌ Товарные карточки не найдены автоматически');
            console.log('\n📋 Все подозрительные элементы:\n');
            analysis.suspiciousElements.slice(0, 10).forEach((el, i) => {
                console.log(`${i + 1}. <${el.tag}> class="${el.class}"`);
                console.log(`   ${el.width}x${el.height}px | Дети: ${el.childrenCount}`);
                console.log(`   ${el.textSample}\n`);
            });
        }

        console.log('\n' + '='.repeat(80));
        console.log('\n📋 Релевантные классы (содержат product/item/card):');
        const relevantClasses = analysis.allClasses.filter(cls =>
            /product|item|card|catalog|goods/i.test(cls)
        );
        console.log(relevantClasses.slice(0, 30).join(', '));

        // Сохраняем анализ
        await fs.writeFile('aquapolis-analysis.json', JSON.stringify(analysis, null, 2));
        console.log('\n\n💾 Анализ сохранен: aquapolis-analysis.json');

        await browser.close();
        console.log('\n✅ Готово! Проверьте aquapolis-full.html для ручного анализа');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error(error.stack);
    }
}

fullHTMLAnalysis();
