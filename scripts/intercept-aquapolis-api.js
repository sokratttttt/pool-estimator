/**
 * Перехват и анализ API запросов aquapolis.ru
 */

async function interceptAquapolisAPI() {
    console.log('🔍 Перехват API запросов aquapolis.ru...\n');

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

        // Перехватываем все JSON ответы
        const jsonResponses = [];
        page.on('response', async (response) => {
            try {
                const url = response.url();
                const contentType = response.headers()['content-type'] || '';

                if (contentType.includes('json')) {
                    const data = await response.json();
                    jsonResponses.push({
                        url: url,
                        status: response.status(),
                        data: data
                    });
                    console.log(`📡 JSON: ${url.substring(0, 80)}...`);
                }
            } catch (e) {
                // Ignore parsing errors
            }
        });

        const url = 'https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/';
        console.log(`📄 Загрузка: ${url}\n`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        console.log('\n⏳ Ожидание всех API запросов (10 сек)...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));

        await browser.close();

        console.log(`\n✅ Перехвачено ${jsonResponses.length} JSON ответов\n`);

        // Анализируем каждый ответ
        jsonResponses.forEach((resp, i) => {
            console.log(`\n${'='.repeat(80)}`);
            console.log(`Ответ ${i + 1}: ${resp.url}`);
            console.log(`Status: ${resp.status}`);
            console.log(`${'='.repeat(80)}`);

            // Проверяем структуру данных
            if (Array.isArray(resp.data)) {
                console.log(`📦 Массив из ${resp.data.length} элементов`);
                if (resp.data.length > 0) {
                    console.log('\nПервый элемент:');
                    console.log(JSON.stringify(resp.data[0], null, 2).substring(0, 500));
                }
            } else if (typeof resp.data === 'object') {
                console.log('📦 Объект с ключами:', Object.keys(resp.data).join(', '));

                // Ищем массивы товаров внутри объекта
                for (const [key, value] of Object.entries(resp.data)) {
                    if (Array.isArray(value) && value.length > 0) {
                        console.log(`\n  Массив "${key}": ${value.length} элементов`);
                        if (value[0] && typeof value[0] === 'object') {
                            console.log(`  Ключи элемента:`, Object.keys(value[0]).join(', '));

                            // Проверяем, есть ли поля товара
                            const item = value[0];
                            if (item.name || item.title || item.price || item.cost) {
                                console.log('\n  🎯 ПОХОЖЕ НА ТОВАРЫ!');
                                console.log('  Пример:');
                                console.log(JSON.stringify(item, null, 2).substring(0, 400));
                            }
                        }
                    }
                }
            }
        });

        // Сохраняем все ответы в файл для детального изучения
        await fs.writeFile(
            'aquapolis-api-responses.json',
            JSON.stringify(jsonResponses, null, 2)
        );

        console.log(`\n\n✅ Все ответы сохранены в aquapolis-api-responses.json`);

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

interceptAquapolisAPI();
