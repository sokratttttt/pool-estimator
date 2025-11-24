"""
Скрипт для импорта каталога оборудования в Supabase

Загружает все товары из public/data/catalog.json в таблицу equipment_catalog
"""

import json
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import time

# Загружаем переменные окружения
load_dotenv()

# Настройки Supabase
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

# Размер batch для импорта (не больше 1000 за раз)
BATCH_SIZE = 100

def main():
    print("=" * 80)
    print("🚀 ИМПОРТ КАТАЛОГА ОБОРУДОВАНИЯ В SUPABASE")
    print("=" * 80)
    
    # Проверяем переменные окружения
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Ошибка: NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY должны быть установлены!")
        print("   Добавьте их в файл .env.local")
        return
    
    print(f"\n📡 Подключение к Supabase...")
    print(f"   URL: {SUPABASE_URL}")
    
    # Создаем клиент Supabase
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Подключение установлено")
    except Exception as e:
        print(f"❌ Ошибка подключения: {e}")
        return
    
    # Загружаем JSON каталог
    catalog_path = "public/data/catalog.json"
    
    if not os.path.exists(catalog_path):
        print(f"❌ Файл {catalog_path} не найден!")
        print("   Запустите сначала: python import_catalog.py")
        return
    
    print(f"\n📖 Загружаем данные из {catalog_path}...")
    
    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog_data = json.load(f)
    
    items = catalog_data.get('items', [])
    total_items = len(items)
    
    print(f"✅ Загружено {total_items} товаров")
    
    # Очищаем таблицу (опционально)
    print(f"\n🗑️  Очистка существующих данных...")
    try:
        supabase.table('equipment_catalog').delete().neq('id', 0).execute()
        print("✅ Таблица очищена")
    except Exception as e:
        print(f"⚠️  Предупреждение при очистке: {e}")
        print("   Возможно таблица пустая или не существует")
    
    # Подготовка данных для импорта
    print(f"\n📦 Подготовка данных для импорта...")
    
    equipment_items = []
    for item in items:
        equipment_item = {
            'article': item['article'],
            'name': item['name'],
            'price': float(item['price']),
            'category': item.get('category', ''),
            'subcategory': item.get('subcategory', '')
        }
        equipment_items.append(equipment_item)
    
    # Импортируем batch-ами
    print(f"\n⬆️  Импорт товаров в Supabase...")
    print(f"   Размер batch: {BATCH_SIZE}")
    print(f"   Всего batches: {(total_items + BATCH_SIZE - 1) // BATCH_SIZE}")
    
    imported_count = 0
    failed_count = 0
    
    for i in range(0, total_items, BATCH_SIZE):
        batch = equipment_items[i:i + BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        
        print(f"\n   📤 Batch {batch_num}: {len(batch)} товаров...", end=' ')
        
        try:
            result = supabase.table('equipment_catalog').insert(batch).execute()
            imported_count += len(batch)
            print(f"✅ Успешно!")
            
            # Небольшая задержка чтобы не перегружать API
            time.sleep(0.5)
            
        except Exception as e:
            failed_count += len(batch)
            print(f"❌ Ошибка: {e}")
            
            # Если batch не прошел, пробуем по одному
            print(f"      🔄 Пробуем импортировать товары по одному...")
            for item in batch:
                try:
                    supabase.table('equipment_catalog').insert([item]).execute()
                    imported_count += 1
                    failed_count -= 1
                except Exception as item_error:
                    print(f"         ❌ Не удалось импортировать {item['article']}: {item_error}")
    
    # Итоги
    print("\n" + "=" * 80)
    print("📊 РЕЗУЛЬТАТЫ ИМПОРТА")
    print("=" * 80)
    print(f"✅ Успешно импортировано: {imported_count} товаров")
    
    if failed_count > 0:
        print(f"❌ Не удалось импортировать: {failed_count} товаров")
    
    print(f"\n📈 Процент успеха: {(imported_count / total_items * 100):.1f}%")
    
    # Проверяем результат
    print(f"\n🔍 Проверка импорта...")
    try:
        result = supabase.table('equipment_catalog').select('*', count='exact').limit(1).execute()
        db_count = result.count if hasattr(result, 'count') else 0
        print(f"✅ В базе данных: {db_count} товаров")
    except Exception as e:
        print(f"⚠️  Не удалось проверить: {e}")
    
    print("\n" + "=" * 80)
    print("🎉 ИМПОРТ ЗАВЕРШЕН!")
    print("=" * 80)
    print("\nТеперь вы можете использовать каталог в приложении!")
    print("Каталог доступен по адресу: /catalog")

if __name__ == "__main__":
    main()
