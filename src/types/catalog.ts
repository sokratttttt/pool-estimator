export interface Product {
    id: string;
    name: string;
    description?: string;
    category: string;
    price: number;
    unit?: string;
    sku?: string;
    imageUrl?: string;
    image?: string;
    inStock?: boolean;
    manufacturer?: string;
    type?: string;
    specifications?: Record<string, string | number>;
    created_at?: string;
    updated_at?: string;
}

export interface CatalogData {
    bowls: Product[];
    heating: Product[];
    filtration: Product[];
    parts: Product[];
    additional: Product[];
    accessories: Product[];
    chemicals: Product[];
    [key: string]: Product[]; // Позволяет динамический доступ к категориям
}

export interface CatalogContextType {
    catalog: CatalogData;
    setCatalog: React.Dispatch<React.SetStateAction<CatalogData>>;
    isLoadingCatalog: boolean;
    updateCatalog: (type: string, newItems: Product[]) => void;
    products: Product[];
    getProductsByCategory: (category: string) => Product[];
    updateProduct: (productId: string, updates: Partial<Product>) => void;
    deleteProduct: (productId: string) => void;
    addProduct: (product: Omit<Product, 'id'>) => void;
}
