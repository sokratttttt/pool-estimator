import os
import time
import json
import re
import logging
import concurrent.futures
from urllib.parse import urljoin, urlparse
import pandas as pd
import requests
from bs4 import BeautifulSoup

# Selenium imports
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("scraper.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AquapolisOptimizedScraper:
    def __init__(self, headless=True, max_workers=3):
        self.base_url = "https://aquapolis.ru"
        self.headless = headless
        self.max_workers = max_workers
        self.session = requests.Session()
        self.driver = None
        self.categories = {}
        self.all_products = []
        self.output_dir = 'aquapolis_data'
        
        # Headers mimicking a real browser
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://aquapolis.ru/'
        }
        self.session.headers.update(self.headers)

    def setup_selenium(self):
        """Инициализация Selenium для обхода защиты и получения cookies"""
        logger.info("🔧 Запуск Selenium для инициализации сессии...")
        options = Options()
        if self.headless:
            options.add_argument('--headless=new')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument(f'user-agent={self.headers["User-Agent"]}')
        
        try:
            self.driver = webdriver.Chrome(
                service=Service(ChromeDriverManager().install()),
                options=options
            )
            
            # Маскировка webdriver
            self.driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
                'source': "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
            })
            
            # Заходим на главную, чтобы получить cookies и пройти проверки
            logger.info("🌍 Открываем главную страницу...")
            self.driver.get(self.base_url)
            time.sleep(5) # Ждем прохождения Cloudflare/DDOS-GUARD если есть
            
            # Переносим cookies в requests session
            selenium_cookies = self.driver.get_cookies()
            for cookie in selenium_cookies:
                self.session.cookies.set(cookie['name'], cookie['value'])
            
            logger.info(f"✅ Сессия инициализирована. Получено {len(selenium_cookies)} cookies.")
            
        except Exception as e:
            logger.error(f"❌ Ошибка Selenium: {e}")
            raise e

    def get_soup(self, url):
        """Получение BeautifulSoup объекта страницы через requests"""
        try:
            response = self.session.get(url, timeout=15)
            if response.status_code == 200:
                return BeautifulSoup(response.text, 'html.parser')
            else:
                logger.warning(f"⚠ Ошибка запроса {url}: Status {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"❌ Ошибка загрузки {url}: {e}")
            return None

    def parse_sitemap(self):
        """Сбор категорий с карты сайта или меню"""
        logger.info("📂 Сбор категорий...")
        
        # Попробуем через карту сайта
        map_url = f"{self.base_url}/map.html"
        soup = self.get_soup(map_url)
        
        if not soup:
            logger.warning("⚠ Не удалось загрузить карту сайта, пробуем главную...")
            soup = self.get_soup(self.base_url)
            
        if not soup:
            logger.error("❌ Не удалось получить доступ к сайту.")
            return False

        # Ищем ссылки на категории
        links = soup.find_all('a', href=True)
        count = 0
        
        skip_words = ['login', 'register', 'cart', 'checkout', 'contact', 'about', 'blog', 'news', 'tel:', 'mailto:']
        
        for link in links:
            href = link['href']
            text = link.get_text(strip=True)
            
            if not href.startswith('http'):
                href = urljoin(self.base_url, href)
                
            if self.base_url not in href:
                continue
                
            if any(s in href.lower() for s in skip_words):
                continue
                
            # Собираем все похожее на категории товаров
            if text and len(text) > 2 and '.html' in href:
                if href not in self.categories.values():
                    self.categories[text] = href
                    count += 1

        logger.info(f"📊 Найдено {count} потенциальных категорий.")
        return count > 0

    def parse_product_card(self, card):
        """Парсинг карточки товара из HTML"""
        try:
            product = {}
            
            # Название
            name_tag = card.find(['a', 'div', 'h3', 'h4'], class_=re.compile(r'name|title|header', re.I))
            if not name_tag:
                name_tag = card.find('a')
            
            if name_tag:
                product['name'] = name_tag.get_text(strip=True)
                if name_tag.name == 'a':
                    product['url'] = urljoin(self.base_url, name_tag['href'])
                elif name_tag.find('a'):
                    product['url'] = urljoin(self.base_url, name_tag.find('a')['href'])
            
            if not product.get('name'):
                return None

            # Цена
            price_tag = card.find(class_=re.compile(r'price|cost|sum', re.I))
            if price_tag:
                price_text = price_tag.get_text(strip=True)
                price_match = re.search(r'(\d[\d\s]*[.,]?\d*)', price_text)
                if price_match:
                    product['price'] = price_match.group(1).replace(' ', '').replace('\xa0', '')
            
            # Картинка
            img_tag = card.find('img')
            if img_tag:
                src = img_tag.get('src') or img_tag.get('data-src') or img_tag.get('data-original')
                if src:
                    product['image'] = urljoin(self.base_url, src)
            
            # Наличие
            stock_tag = card.find(class_=re.compile(r'stock|availability', re.I))
            if stock_tag:
                product['in_stock'] = stock_tag.get_text(strip=True)
            else:
                product['in_stock'] = 'Уточняйте'

            return product
        except Exception as e:
            return None

    def process_category(self, category_name, category_url):
        """Обработка одной категории (пагинация + товары)"""
        logger.info(f"📦 Обработка: {category_name}")
        products = []
        page = 1
        
        while True:
            page_url = f"{category_url}?p={page}" if page > 1 else category_url
            soup = self.get_soup(page_url)
            
            if not soup:
                break
                
            # Поиск карточек товаров
            product_cards = soup.find_all(class_=re.compile(r'product-item|catalog-item|item-card|products-grid__item', re.I))
            
            # Если не нашли по классам, ищем по структуре
            if not product_cards:
                potential_cards = soup.find_all('div')
                product_cards = []
                for div in potential_cards:
                    if div.find('img') and div.find(string=re.compile(r'\d+\s*(?:руб|₽)')):
                        product_cards.append(div)
                        
            if not product_cards:
                if page == 1:
                    logger.debug(f"  ⚠ Нет товаров в {category_name}")
                break
                
            logger.info(f"  📄 Стр. {page}: найдено {len(product_cards)} товаров")
            
            new_products_count = 0
            for card in product_cards:
                product = self.parse_product_card(card)
                if product and product.get('name'):
                    product['category'] = category_name
                    products.append(product)
                    new_products_count += 1
            
            if new_products_count == 0:
                break
                
            # Проверка пагинации
            next_link = soup.find('a', class_=re.compile(r'next|forward'), href=True)
            pagination = soup.find(class_=re.compile(r'pagination|pager'))
            
            if not next_link and not pagination:
                break
                
            if page > 50:
                break
                
            page += 1
            time.sleep(0.5)
            
        return products

    def run(self):
        """Основной цикл запуска"""
        start_time = time.time()
        
        try:
            # 1. Инициализация
            self.setup_selenium()
            
            # 2. Сбор категорий
            if not self.parse_sitemap():
                logger.error("Не удалось собрать категории. Завершение.")
                return
            
            # 3. Парсинг категорий (параллельно)
            logger.info(f"🚀 Начинаем парсинг {len(self.categories)} категорий в {self.max_workers} потока(ов)...")
            
            target_categories = list(self.categories.items())
            
            with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                future_to_cat = {
                    executor.submit(self.process_category, name, url): name 
                    for name, url in target_categories
                }
                
                for future in concurrent.futures.as_completed(future_to_cat):
                    cat_name = future_to_cat[future]
                    try:
                        cat_products = future.result()
                        if cat_products:
                            self.all_products.extend(cat_products)
                            logger.info(f"  ✅ {cat_name}: собрано {len(cat_products)} товаров")
                    except Exception as e:
                        logger.error(f"  ❌ Ошибка в категории {cat_name}: {e}")

            # 4. Сохранение результатов
            self.save_results()
            
        finally:
            if self.driver:
                self.driver.quit()
                
        duration = time.time() - start_time
        logger.info(f"🏁 Готово! Время выполнения: {duration:.2f} сек. Всего товаров: {len(self.all_products)}")

    def save_results(self):
        """Сохранение в Excel и JSON"""
        if not self.all_products:
            logger.warning("Нет данных для сохранения.")
            return

        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

        # Excel
        df = pd.DataFrame(self.all_products)
        excel_path = os.path.join(self.output_dir, 'aquapolis_full.xlsx')
        
        # Упорядочиваем колонки
        cols = ['name', 'price', 'in_stock', 'category', 'url', 'image']
        for c in df.columns:
            if c not in cols:
                cols.append(c)
        
        # Переименование для красоты
        ru_cols = {
            'name': 'Название',
            'price': 'Цена',
            'in_stock': 'Наличие',
            'category': 'Категория',
            'url': 'Ссылка',
            'image': 'Изображение'
        }
        
        try:
            df = df.reindex(columns=cols)
            df.rename(columns=ru_cols, inplace=True)
            df.to_excel(excel_path, index=False)
            logger.info(f"💾 Данные сохранены в {excel_path}")
        except Exception as e:
            logger.error(f"Ошибка сохранения Excel: {e}")
            df.to_csv(os.path.join(self.output_dir, 'aquapolis_dump.csv'), index=False)

if __name__ == "__main__":
    print("="*50)
    print("🚀 AQUAPOLIS OPTIMIZED SCRAPER")
    print("="*50)
    
    # Проверка зависимостей
    try:
        import requests
        import bs4
    except ImportError:
        print("⚠ Установка недостающих библиотек...")
        os.system("pip install requests beautifulsoup4 pandas openpyxl selenium webdriver-manager")
        print("✅ Библиотеки установлены. Перезапустите скрипт.")
        exit()

    scraper = AquapolisOptimizedScraper(headless=True, max_workers=5)
    scraper.run()