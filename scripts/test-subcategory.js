/**
 * Тест подкатегории теплообменников
 */

async function testSubcategory() {
    console.log('🔍 Тест подкатегории теплообменников...\n');

    try {
        const puppeteer = await import('puppeteer');

        const browser = await puppeteer.default.launch({
            headless: false, // Показываем браузер
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        const url = 'https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/teploobmeniki.html';
        console.log(`📄 Загрузка: ${url}\n`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        console.log('⏳ Ожидание загрузки (10 сек)...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Скриншот
        await page.screenshot({ path: 'aquapolis-subcategory.png' });
        console.log('📸 Скриншот: aquapolis-subcategory.png\n');

        // Поиск товаров
        const analysis = await page.evaluate(() => {
            const products = [];

            // Ищем все карточки товаров
            document.querySelectorAll('*').forEach(el => {
                const text = el.textContent;
                const hasPrice = /\d+\s*(₽|руб)/i.test(text);
                const hasProductName = text.length > 20 && text.length < 300;
                const hasImage = el.querySelector('img') !== null;

                if (hasPrice && hasProductName && hasImage) {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 150 && rect.width < 500 && rect.height > 200 && rect.height < 700) {
                        products.push({
                            tag: el.tagName,
                            class: el.className,
                            width: Math.round(rect.width),
                            height: Math.round(rect.height),
                            text: text.substring(0, 200)
                        });
                    }
                }
            });

            return {
                products,
                title: document.title
            };
        });

        console.log(`Заголовок: ${analysis.title}`);
        console.log(`\n✅ Найдено карточек товаров: ${analysis.products.length}\n`);

        if (analysis.products.length > 0) {
            console.log('📦 Первые 5 карточек:\n');
            analysis.products.slice(0, 5).forEach((p, i) => {
                console.log(`${i + 1}. <${p.tag}> class="${p.class}"`);
                console.log(`   Размер: ${p.width}x${p.height}px`);
                console.log(`   Текст: ${p.text}\n`);
            });

            // Находим общий класс
            const classes = analysis.products.map(p => p.class.split(' '));
            const firstClasses = classes[0] || [];
            const commonClasses = firstClasses.filter(cls =>
                classes.every(c => c.includes(cls))
            );

            if (commonClasses.length > 0) {
                console.log('\n🎯 ОБЩИЙ КЛАСС ТОВАРОВ:');
                console.log(`.${commonClasses[0]}`);
            }
        }

        console.log('\n⏸️  Браузер остается открытым 20 секунд...');
        await new Promise(resolve => setTimeout(resolve, 20000));

        await browser.close();
        console.log('\n✅ Готово!');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

testSubcategory();
