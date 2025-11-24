/**
 * Тест правильных URL для aquapolis.ru
 */

async function testCorrectURLs() {
    console.log('🔍 Тестирование правильных URL aquapolis.ru...\n');

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

        // Пробуем разные варианты URL
        const testURLs = [
            'https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/teploobmenniki',
            'https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/teplovye-nasosy',
            'https://aquapolis.ru/nasosnoe-oborudovanie',
            'https://aquapolis.ru/oborudovanie-dlja-bassejna/filtracionnye-ustanovki'
        ];

        for (const url of testURLs) {
            console.log(`\n${'='.repeat(80)}`);
            console.log(`📄 Тестирование: ${url}`);
            console.log('='.repeat(80));

            try {
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
                await new Promise(resolve => setTimeout(resolve, 5000));

                const pageInfo = await page.evaluate(() => {
                    const title = document.title;
                    const is404 = title.includes('не найдена') || title.includes('404');

                    // Ищем товары
                    const possibleProducts = [];

                    // Пробуем разные селекторы
                    const selectors = [
                        'div[class*="product"]',
                        'div[class*="item"]',
                        'div[class*="card"]',
                        'article',
                        'a[href*="product"]',
                        'a[href*="/p/"]'
                    ];

                    selectors.forEach(sel => {
                        const elements = document.querySelectorAll(sel);
                        if (elements.length > 0 && elements.length < 100) {
                            possibleProducts.push({
                                selector: sel,
                                count: elements.length,
                                firstClass: elements[0]?.className,
                                firstText: elements[0]?.textContent?.trim().substring(0, 100)
                            });
                        }
                    });

                    return {
                        title,
                        is404,
                        possibleProducts
                    };
                });

                if (pageInfo.is404) {
                    console.log('❌ 404 - Страница не найдена');
                } else {
                    console.log(`✅ Страница загружена: ${pageInfo.title}`);

                    if (pageInfo.possibleProducts.length > 0) {
                        console.log('\n🎯 Найдены возможные товары:');
                        pageInfo.possibleProducts.forEach(p => {
                            console.log(`  ${p.selector}: ${p.count} элементов`);
                            console.log(`    Класс: ${p.firstClass}`);
                            console.log(`    Текст: ${p.firstText}\n`);
                        });
                    } else {
                        console.log('⚠️  Товары не найдены');
                    }
                }

            } catch (error) {
                console.log(`❌ Ошибка: ${error.message}`);
            }
        }

        await browser.close();
        console.log('\n✅ Тестирование завершено');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

testCorrectURLs();
