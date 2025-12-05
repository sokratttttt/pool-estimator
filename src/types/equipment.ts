import { Product } from './catalog';

export interface EquipmentItem extends Product {
    article?: string;
    subcategory?: string;
}

export interface EquipmentCatalog {
    items: EquipmentItem[];
    categories: string[];
}

export interface EquipmentCatalogContextType {
    // Данные
    catalog: EquipmentCatalog;
    items: EquipmentItem[];
    categories: string[];
    filteredItems: EquipmentItem[];

    // Состояние
    loading: boolean;
    error: string | null;
    searchQuery: string;
    selectedCategory: string;

    // Функции поиска
    setSearchQuery: (query: string) => void;
    setSelectedCategory: (category: string) => void;
    getItemById: (id: string) => EquipmentItem | undefined;
    getItemByArticle: (article: string) => EquipmentItem | undefined;

    // Утилиты
    itemsCount: number;
    filteredCount: number;
    refreshCatalog: () => Promise<void>;
}
