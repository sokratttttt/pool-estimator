const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const ExcelJS = require('exceljs');

// Полный список категорий (138 категорий)
const CATEGORIES = {
    "Бассейны и СПА": "https://aquapolis.ru/bassejny-i-razvlechenija.html",
    "Бассейны": "https://aquapolis.ru/bassejny-i-razvlechenija/pools.html",
    "Уход за бассейном": "https://aquapolis.ru/bassejny-i-razvlechenija/uhod-za-basseinom.html",
    "- Пылесосы для бассейна": "https://aquapolis.ru/bassejny-i-razvlechenija/uhod-za-basseinom/pylesosy.html",
    "Шезлонги, кресла для бассейна": "https://aquapolis.ru/bassejny-i-razvlechenija/ulichnaja-mebel.html",
    "Аксессуары": "https://aquapolis.ru/bassejny-i-razvlechenija/aksessuary-dlja-bassejnov.html",
    "- Душ для бассейна": "https://aquapolis.ru/bassejny-i-razvlechenija/aksessuary-dlja-bassejnov/dushi.html",
    "- Аксессуары для уборки бассейна": "https://aquapolis.ru/bassejny-i-razvlechenija/aksessuary-dlja-bassejnov/uborka-bassejna.html",
    "- Градусники для бассейнов": "https://aquapolis.ru/bassejny-i-razvlechenija/aksessuary-dlja-bassejnov/gradusniki-dlja-bassejnov.html",
    "- Ремонтный комплект для бассейна": "https://aquapolis.ru/bassejny-i-razvlechenija/aksessuary-dlja-bassejnov/remontnyj-komplekt.html",
    "- Прочие аксессуары": "https://aquapolis.ru/bassejny-i-razvlechenija/aksessuary-dlja-bassejnov/prochie-aksessuary.html",
    "- Дозаторы химии": "https://aquapolis.ru/bassejny-i-razvlechenija/aksessuary-dlja-bassejnov/dozatory.html",
    "- Ограждение для бассейна": "https://aquapolis.ru/bassejny-i-razvlechenija/aksessuary-dlja-bassejnov/ograzhdenie-dlja-bassejna.html",
    "- Противоскользящие покрытия": "https://aquapolis.ru/bassejny-i-razvlechenija/aksessuary-dlja-bassejnov/protivoskolzyaschie-pokritiya.html",
    "- Садовая мебель": "https://aquapolis.ru/bassejny-i-razvlechenija/aksessuary-dlja-bassejnov/sadovaya-mebel.html",
    "Аквафитнес и отдых на воде": "https://aquapolis.ru/bassejny-i-razvlechenija/akvafitnes-i-otdyh-na-vode.html",
    "Разделительные дорожки для бассейна": "https://aquapolis.ru/bassejny-i-razvlechenija/razdelitelnye-dorozhki.html",
    "Накрытия на бассейн": "https://aquapolis.ru/bassejny-i-razvlechenija/nakrytija-na-bassejn.html",
    "- Теплосберегающее покрытие": "https://aquapolis.ru/bassejny-i-razvlechenija/nakrytija-na-bassejn/soljarnoe-pokrytie.html",
    "- Покрытия на бассейн": "https://aquapolis.ru/bassejny-i-razvlechenija/nakrytija-na-bassejn/pokrytija-na-bassejn.html",
    "- Покрытие под бассейн": "https://aquapolis.ru/bassejny-i-razvlechenija/nakrytija-na-bassejn/pokrytie-pod-bassejn.html",
    "- Наматывающее устройство": "https://aquapolis.ru/bassejny-i-razvlechenija/nakrytija-na-bassejn/namatyvajushhee-ustrojstvo.html",
    "- Ролеты": "https://aquapolis.ru/bassejny-i-razvlechenija/nakrytija-na-bassejn/rolety.html",
    "- Батутные накрытия": "https://aquapolis.ru/bassejny-i-razvlechenija/nakrytija-na-bassejn/batutnye-nakrytija.html",
    "Стартовые платформы": "https://aquapolis.ru/bassejny-i-razvlechenija/startovye-platformy.html",
    "Туманообразование": "https://aquapolis.ru/bassejny-i-razvlechenija/tumanoobrazovanie.html",
    "Аквапарки": "https://aquapolis.ru/bassejny-i-razvlechenija/vodnye-gorki.html",
    "Оборудование для бассейнов": "https://aquapolis.ru/oborudovanie-dlja-bassejna.html",
    "Насосы для бассейнов": "https://aquapolis.ru/oborudovanie-dlja-bassejna/nasosy.html",
    "Фильтры для бассейна": "https://aquapolis.ru/oborudovanie-dlja-bassejna/filtry-i-filtracionnye-ustanovki.html",
    "Фильтрационные установки": "https://aquapolis.ru/oborudovanie-dlja-bassejna/filtracionnye-ustanovki.html",
    "Оборудование для нагрева воды": "https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody.html",
    "- Тепловые насосы для бассейна": "https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/teplovye-nasosy.html",
    "- Теплообменники": "https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/teploobmeniki.html",
    "- Электронагреватели": "https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-nagreva-vody/elektronagrevateli.html",
    "Оборудование для дезинфекции воды": "https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-dezinfekcii-vody.html",
    "- Дозирующие насосы": "https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-dezinfekcii-vody/dozirujuschie-nasosy.html",
    "- Хлоргенераторы": "https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-dezinfekcii-vody/hlorgeneratory.html",
    "- Бесхлорные системы": "https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-dezinfekcii-vody/beshlornye-sistemy.html",
    "- Ультрафиолетовые установки": "https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-dezinfekcii-vody/ultrafioletovye-ustanovki.html",
    "- Озонаторы": "https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-dezinfekcii-vody/ozonator.html",
    "Компрессоры для бассейнов": "https://aquapolis.ru/oborudovanie-dlja-bassejna/kompressory.html",
    "Осушители воздуха": "https://aquapolis.ru/oborudovanie-dlja-bassejna/osushiteli-vozduha.html",
    "Станции контроля и управления бассейном": "https://aquapolis.ru/oborudovanie-dlja-bassejna/stancii-kontrolja.html",
    "Противотоки для бассейнов": "https://aquapolis.ru/oborudovanie-dlja-bassejna/oborudovanie-dlja-vstrechnogo-techenija.html",
    "Картриджи и песок для фильтров": "https://aquapolis.ru/oborudovanie-dlja-bassejna/pesok-dlja-filtrov.html",
    "Подъемники для людей с инвалидностью в бассейн": "https://aquapolis.ru/oborudovanie-dlja-bassejna/podemniki-dlja-invalidov.html",
    "Собственное производство фильтров": "https://aquapolis.ru/oborudovanie-dlja-bassejna/filtr-aquaviva.html",
    "Запчасти": "https://aquapolis.ru/zapchasti-i-rashodnye-materialy.html",
    "Запчасти для насосов": "https://aquapolis.ru/zapchasti-i-rashodnye-materialy/zapchasti-i-rashodnye-materialy-dlja-nasosov.html",
    "Запчасти для фильтров и фильтрационных установок": "https://aquapolis.ru/zapchasti-i-rashodnye-materialy/dlja-filtrov-i-filtracionnyh-ustanovok.html",
    "Запчасти для водных пылесосов": "https://aquapolis.ru/zapchasti-i-rashodnye-materialy/dlja-pylesosov.html",
    "Запчасти для дезинфицирующего оборудования": "https://aquapolis.ru/zapchasti-i-rashodnye-materialy/dlja-dezinficirujuschego-oborudovanija.html",
    "Запчасти для дозирующих насосов": "https://aquapolis.ru/zapchasti-i-rashodnye-materialy/dlja-dozirujuschih-nasosov.html",
    "Запчасти для осушителей воздуха": "https://aquapolis.ru/zapchasti-i-rashodnye-materialy/dlja-osushitelej-i-teplovyh-nasosov.html",
    "Запчасти для теплообменников и электронагревателей": "https://aquapolis.ru/zapchasti-i-rashodnye-materialy/dlja-teploobmennikov-i-jelektronagrevatelej.html",
    "Запчасти для саун, парогенераторов Coasts и электрокаменок": "https://aquapolis.ru/zapchasti-i-rashodnye-materialy/dlja-saun-parogeneratorov-i-jelektrokamenok.html",
    "Запчасти для противотоков и аттракционов": "https://aquapolis.ru/zapchasti-i-rashodnye-materialy/dlja-protivotokov-i-atrakcionov.html",
    "Запчасти для прожекторов и осветительного оборудования бассейнов": "https://aquapolis.ru/zapchasti-i-rashodnye-materialy/dlja-prozhektorov-i-osvetitelnogo-oborudovanija.html",
    "Запчасти для лестниц и поручней бассейнов": "https://aquapolis.ru/zapchasti-i-rashodnye-materialy/dlja-lestnic.html",
    "Запчасти для закладных элементов бассейнов": "https://aquapolis.ru/zapchasti-i-rashodnye-materialy/dlja-zakladnyh-jelementov.html",
    "Запчасти для спа-бассейнов": "https://aquapolis.ru/zapchasti-i-rashodnye-materialy/dlja-spa-bassejnov.html",
    "Запчасти для тепловых насосов": "https://aquapolis.ru/zapchasti-i-rashodnye-materialy/dlja-teplovyh-nasosov.html",
    "Распродажа": "https://aquapolis.ru/rasprodazha.html",
    "Шезлонги и мебель": "https://aquapolis.ru/rasprodazha/shezlongi-i-mebel.html",
    "Насосы для бассейна": "https://aquapolis.ru/rasprodazha/nasosy-dlya-bassejna.html",
    "Форсунки и насадки": "https://aquapolis.ru/rasprodazha/forsunki-i-nasadki.html",
    "Отделочные материалы": "https://aquapolis.ru/rasprodazha/otdelochnye-materialy.html",
    "Мозаика и фриз для бассейна": "https://aquapolis.ru/rasprodazha/mozaika-i-friz-dlya-bassejna.html",
    "Плитка для бассейна": "https://aquapolis.ru/rasprodazha/plitka-dlya-bassejna.html",
    "Роботы пылесосы для бассейна": "https://aquapolis.ru/rasprodazha/roboty-pylesosy-dlya-bassejna.html",
    "Панель управления фильтрацией": "https://aquapolis.ru/rasprodazha/panel-upravleniya-filtraciej.html",
    "Освещение бассейна": "https://aquapolis.ru/rasprodazha/osveshchenie-bassejna.html",
    "Закладные для бассейна": "https://aquapolis.ru/rasprodazha/zakladnye-dlya-bassejna.html",
    "Дренажные насосы": "https://aquapolis.ru/rasprodazha/drenazhnye-nasosy.html",
    "Центробежные насосы": "https://aquapolis.ru/rasprodazha/centrobezhnye-nasosy.html",
    "Аксессуары для бассейна": "https://aquapolis.ru/rasprodazha/aksessuary-dlya-bassejna.html",
    "Трубопроводные системы ПВХ": "https://aquapolis.ru/truby-i-fitingi.html",
    "Трубы ПВХ": "https://aquapolis.ru/truby-i-fitingi/truby-pvh.html",
    "Фитинги ПВХ": "https://aquapolis.ru/truby-i-fitingi/fitingi-pvh.html",
    "Трубы ПВХ для наружной канализации": "https://aquapolis.ru/truby-i-fitingi/truby-pvh-dlja-naruzhnoj-kanalizacii.html",
    "Фитинги для наружной канализации": "https://aquapolis.ru/truby-i-fitingi/fitingi-dlja-naruzhnoj-kanalizacii.html",
    "Запорная арматура ПВХ": "https://aquapolis.ru/truby-i-fitingi/zapornaja-armatura-pvh.html",
    "Клей и праймер для ПВХ": "https://aquapolis.ru/truby-i-fitingi/klej-i-prajmer.html",
    "Муфтовые компенсаторы": "https://aquapolis.ru/truby-i-fitingi/kompensatory.html",
    "Форсунки для бассейна": "https://aquapolis.ru/zakladnye-detali/forsunki.html",
    "Скиммеры для бассейнов": "https://aquapolis.ru/zakladnye-detali/skimmera.html",
    "Донные сливы для бассейна": "https://aquapolis.ru/zakladnye-detali/donnye-slivy.html",
    "Переливные системы": "https://aquapolis.ru/zakladnye-detali/perelivnye-sistemy.html",
    "Другие закладные и аксессуары": "https://aquapolis.ru/zakladnye-detali/drugie-zakladnye-i-aksessuary.html",
    "Закладные для гидро и аэромассажа": "https://aquapolis.ru/zakladnye-detali/gidro-i-ajeromassazh.html",
    "Лайнер": "https://aquapolis.ru/stroitelstvo-bassejnov/lajnery.html",
    "Бортовая плитка": "https://aquapolis.ru/stroitelstvo-bassejnov/bortovaja-plitka.html",
    "Мозаика для бассейна": "https://aquapolis.ru/stroitelstvo-bassejnov/mozaika.html",
    "Копинговый камень": "https://aquapolis.ru/stroitelstvo-bassejnov/bortovoj-kamen-i-plita.html",
    "Строительные смеси для бассейнов": "https://aquapolis.ru/stroitelstvo-bassejnov/stroitelnye-smesi.html",
    "Террасная доска ДПК": "https://aquapolis.ru/stroitelstvo-bassejnov/terrasnaa-doska-dkp.html",
    "Инструменты для сварки ПВХ": "https://aquapolis.ru/stroitelstvo-bassejnov/instrumenty-dlya-svarki-pvh.html",
    "Насосное оборудование": "https://aquapolis.ru/nasosnoe-oborudovanie.html",
    "Насосы для колодцев": "https://aquapolis.ru/nasosnoe-oborudovanie/nasosy-dlya-kolodtsev.html",
    "Канализационные насосы": "https://aquapolis.ru/nasosnoe-oborudovanie/kanalizacionnye-nasosy.html",
    "Циркуляционные насосы": "https://aquapolis.ru/nasosnoe-oborudovanie/cirkulyacionnie.html",
    "Насосные станции": "https://aquapolis.ru/nasosnoe-oborudovanie/nasosnye-stantsii-dlya-doma-i-dachi.html",
    "Горизонтальные многоступенчатые насосы": "https://aquapolis.ru/nasosnoe-oborudovanie/nasosy-mnogostupenchatye-gorizontalnye.html",
    "Вертикальные многоступенчатые насосы": "https://aquapolis.ru/nasosnoe-oborudovanie/vertikalnye-mnogostupenchatye-nasosy.html",
    "Промышленные циркуляционные насосы": "https://aquapolis.ru/nasosnoe-oborudovanie/promyshlennye-cirkulyacionnye-nasosy.html",
    "Детские товары": "https://aquapolis.ru/detskie-tovary.html",
    "Детские бассейны": "https://aquapolis.ru/detskie-tovary/detskie-bassejny.html",
    "Надувные матрасы и круги для аквапарков": "https://aquapolis.ru/detskie-tovary/naduvnye-matrasy-i-krugi.html",
    "Оборудование для саун": "https://aquapolis.ru/sauny.html",
    "Парогенераторы": "https://aquapolis.ru/sauny/parogeneratory.html",
    "Аксессуары и запчасти": "https://aquapolis.ru/sauny/aksessuary-i-zapchasti.html",
    "Освещение для бассейнов": "https://aquapolis.ru/osveschenie-dlja-bassejnov.html",
    "Светодиодные прожекторы": "https://aquapolis.ru/osveschenie-dlja-bassejnov/svetodiodnye-prozhektory.html",
    "Светодиодные лампы": "https://aquapolis.ru/osveschenie-dlja-bassejnov/svetodiodnye-lampy.html",
    "Галогенные лампы": "https://aquapolis.ru/osveschenie-dlja-bassejnov/galogenovye-lampy.html",
    "Пульты управления": "https://aquapolis.ru/osveschenie-dlja-bassejnov/pulty-upravleniya.html",
    "Закладные": "https://aquapolis.ru/osveschenie-dlja-bassejnov/zakladnye.html",
    "Лестницы и поручни для бассейна": "https://aquapolis.ru/lestnicy-i-poruchni.html",
    "Водопады для бассейнов": "https://aquapolis.ru/vodopady.html",
    "Химия для бассейна": "https://aquapolis.ru/sredstva-po-uhodu-za-vodoi.html",
    "Тепловые насосы для дома": "https://aquapolis.ru/teplovye-nasosy-dlja-doma.html",
    "Пергола металлическая": "https://aquapolis.ru/pergola-metallicheskaya.html"
};

class AquapolisScraper {
    constructor() {
        this.baseUrl = 'https://aquapolis.ru';
        this.allProducts = [];
        this.outputDir = 'aquapolis_data';
        this.browser = null;
        this.page = null;
    }

    async init() {
        console.log('🚀 Запуск браузера...');
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        this.page = await this.browser.newPage();
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        await this.page.setViewport({ width: 1920, height: 1080 });

        console.log('✅ Браузер запущен');
    }

    parseProductCard($, card) {
        try {
            const product = {};

            // Название - ищем везде
            let name = '';
            const nameSelectors = ['.product-name', '.item-title', '.goods-name', 'h3', 'h4', 'h2', 'a'];
            for (const sel of nameSelectors) {
                const elem = $(card).find(sel).first();
                if (elem.length) {
                    name = elem.text().trim();
                    if (name && name.length > 2) break;
                }
            }

            if (!name || name.length < 2) return null;
            product.name = name;

            // URL
            const link = $(card).find('a[href]').first();
            if (link.length) {
                const href = link.attr('href');
                if (href && !href.startsWith('#')) {
                    try {
                        product.url = href.startsWith('http') ? href : new URL(href, this.baseUrl).href;
                    } catch (e) { }
                }
            }

            // Цена
            const cardText = $(card).text();
            const priceMatch = cardText.match(/(\d[\d\s]*)[.,]?(\d*)\s*(?:руб|₽|р\.|RUB)/i);
            if (priceMatch) {
                product.price = priceMatch[1].replace(/\s/g, '') + (priceMatch[2] ? '.' + priceMatch[2] : '');
            } else {
                product.price = 'Цена не указана';
            }

            // Картинка
            const img = $(card).find('img').first();
            if (img.length) {
                const src = img.attr('src') || img.attr('data-src') || img.attr('data-lazy');
                if (src && !src.includes('placeholder') && !src.startsWith('data:')) {
                    try {
                        product.image = src.startsWith('http') ? src : new URL(src, this.baseUrl).href;
                    } catch (e) { }
                }
            }

            product.in_stock = 'Уточняйте';

            return product;

        } catch (error) {
            return null;
        }
    }

    async scrapeCategory(categoryName, categoryUrl) {
        console.log(`\n📦 ${categoryName}`);
        const products = [];

        try {
            await this.page.goto(categoryUrl, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            const html = await this.page.content();
            const $ = cheerio.load(html);

            const selectors = [
                '.product-item',
                '.catalog-item',
                '.item',
                '[data-product]',
                '.goods-item'
            ];

            let productCards = [];
            for (const selector of selectors) {
                productCards = $(selector).toArray();
                if (productCards.length > 0) {
                    console.log(`  ✓ Найдено ${productCards.length} товаров`);
                    break;
                }
            }

            if (productCards.length === 0) {
                productCards = $('div').filter((i, el) => {
                    const $el = $(el);
                    const hasImg = $el.find('img').length > 0;
                    const hasPrice = $el.text().match(/\d+\s*(?:руб|₽|р\.)/i);
                    const hasLink = $el.find('a').length > 0;
                    return hasImg && hasPrice && hasLink;
                }).toArray();

                if (productCards.length > 0) {
                    console.log(`  ✓ Найдено ${productCards.length} товаров (универсальный поиск)`);
                }
            }

            if (productCards.length === 0) {

    async run() {
                    const startTime = Date.now();

                    try {
                        await this.init();

                        const total = Object.keys(CATEGORIES).length;
                        console.log(`\n🚀 Начинаем парсинг ${total} категорий...\n`);

                        let processed = 0;

                        for (const [name, url] of Object.entries(CATEGORIES)) {
                            processed++;
                            console.log(`\n[${processed}/${total}]`);

                            const products = await this.scrapeCategory(name, url);
                            this.allProducts.push(...products);

                            await new Promise(resolve => setTimeout(resolve, 1500));
                        }

                        await this.saveResults();

                    } catch (error) {
                        console.error('❌ Критическая ошибка:', error);
                    } finally {
                        if (this.browser) {
                            await this.browser.close();
                        }

                        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                        console.log(`\n🏁 Готово! Время: ${duration}с. Товаров: ${this.allProducts.length}`);
                    }
                }

    async saveResults() {
                    if (this.allProducts.length === 0) {
                        console.log('\n⚠ Нет данных для сохранения');
                        return;
                    }

                    await fs.mkdir(this.outputDir, { recursive: true });

                    const jsonPath = path.join(this.outputDir, 'aquapolis_products.json');
                    await fs.writeFile(jsonPath, JSON.stringify(this.allProducts, null, 2), 'utf-8');
                    console.log(`\n💾 JSON: ${jsonPath}`);

                    const workbook = new ExcelJS.Workbook();
                    const worksheet = workbook.addWorksheet('Товары');

                    worksheet.columns = [
                        { header: 'Название', key: 'name', width: 50 },
                        { header: 'Цена', key: 'price', width: 15 },
                        { header: 'Категория', key: 'category', width: 40 },
                        { header: 'Ссылка', key: 'url', width: 60 },
                        { header: 'Изображение', key: 'image', width: 60 }
                    ];

                    this.allProducts.forEach(product => {
                        worksheet.addRow(product);
                    });

                    worksheet.getRow(1).font = { bold: true };
                    worksheet.getRow(1).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF0066CC' }
                    };

                    const excelPath = path.join(this.outputDir, 'aquapolis_products.xlsx');
                    await workbook.xlsx.writeFile(excelPath);
                    console.log(`💾 Excel: ${excelPath}`);

                    console.log(`\n📊 ИТОГО:`);
                    console.log(`  📂 Категорий: ${Object.keys(CATEGORIES).length}`);
                    console.log(`  📦 Товаров: ${this.allProducts.length}`);
                }
            }

            (async () => {
                console.log('═'.repeat(70));
                console.log('🏊 AQUAPOLIS SCRAPER - 123 категории');
                console.log('═'.repeat(70));

                const scraper = new AquapolisScraper();
                await scraper.run();
            })();
