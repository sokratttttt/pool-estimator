/**
 * Тестовый скрипт для анализа aquapolis.ru
 */

async function analyzeAquapolis() {
    console.log('🔍 Анализ aquapolis.ru...\n');

    try {
        const puppeteer = await import('puppeteer');

        const browser = await puppeteer.default.launch({
            headless: false, // Показываем браузер
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        const url = 'https://aquapolis.ru';
        console.log(`📄 Загрузка: ${url}\n`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Ждем загрузки контента
        console.log('⏳ Ожидание загрузки (5 сек)...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Скриншот главной страницы
        await page.screenshot({ path: 'aquapolis-main.png' });
        console.log('📸 Скриншот: aquapolis-main.png\n');

        // Ищем ссылки на каталог
        const catalogLinks = await page.evaluate(() => {
            const links = [];
            document.querySelectorAll('a').forEach(link => {
                const text = link.textContent.trim().toLowerCase();
                const href = link.href;

                if (text.includes('каталог') || text.includes('оборудование') ||
                    href.includes('catalog') || href.includes('oborudovanie')) {
                    links.push({
                        text: link.textContent.trim(),
                        href: href
                    });
                }
            });
            return links.slice(0, 20);
        });

        console.log('🔗 Найденные ссылки на каталог:');
        console.log('─'.repeat(80));
        catalogLinks.forEach((link, i) => {
            console.log(`${i + 1}. ${link.text}`);
            console.log(`   ${link.href}\n`);
        });
        console.log('─'.repeat(80));

        console.log('\n⏸️  Браузер остается открытым 15 секунд...');
        await new Promise(resolve => setTimeout(resolve, 15000));

        await browser.close();
        console.log('\n✅ Готово!');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

analyzeAquapolis();
