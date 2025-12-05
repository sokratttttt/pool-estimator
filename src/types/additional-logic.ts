export interface AdditionalItem {
    id: string;
    category: 'accessory' | 'service' | 'consumable' | 'warranty' | 'other' | string;
    name: string;
    description?: string;
    price: number;
    taxable: boolean;
    mandatory: boolean; // required for order
    quantity?: number; // recommended quantity
}

export interface AdditionalLogicConfig {
    autoAddItems: boolean; // automatically add recommended items
    showRecommendations: boolean;
    maxSuggestions: number;
    budgetThreshold: number; // threshold for premium items
}

export interface Recommendation {
    itemId: string;
    reason: string;
    priority: 'low' | 'medium' | 'high';
    estimatedUsage?: number; // calculated quantity
    compatibility?: string[]; // compatible with items
}

export interface AdditionalItemFilters {
    category?: string;
    priceRange?: { min: number; max: number };
    search?: string;
}

export interface BundleOffer {
    id: string;
    name: string;
    items: string[];
    discountPrice: number;
    savings: number;
}

export interface AdditionalLogicSummary {
    totalItems: number;
    totalCost: number;
    categories: string[];
}

export interface EstimateData {
    // Basic estimate data needed for recommendations
    poolType?: string;
    volume?: number;
    budget?: number;
}

export interface UseAdditionalLogicReturn {
    // State
    additionalItems: AdditionalItem[];
    selectedItems: AdditionalItem[];
    recommendations: Recommendation[];
    config: AdditionalLogicConfig;

    // Items
    addItem: (itemId: string, quantity?: number) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    toggleOption: (option: AdditionalItem) => void; // Legacy support

    // Recommendations
    getRecommendations: (estimateData: EstimateData) => Recommendation[];
    applyRecommendations: (recommendationIds: string[]) => void;
    dismissRecommendation: (recommendationId: string) => void;

    // Grouping & Filtering
    getItemsByCategory: (category: string) => AdditionalItem[];
    filterItems: (filters: AdditionalItemFilters) => AdditionalItem[];
    categories: string[]; // Legacy support
    optionsByCategory: Record<string, AdditionalItem[]>; // Legacy support
    selectedIds: string[]; // Legacy support

    // Calculations
    calculateAdditionalTotal: () => number;
    calculateWithAdditions: (baseTotal: number) => number;
    getSavingsBundle: () => BundleOffer | null;

    // Config
    updateConfig: (updates: Partial<AdditionalLogicConfig>) => void;
    resetToDefaults: () => void;

    // Export/Import
    exportSelection: () => { success: boolean; data: any };
    importSelection: (data: unknown) => { isValid: boolean; errors: string[] };

    // Utils
    validateSelection: () => { isValid: boolean; errors: string[] };
    getSummary: () => AdditionalLogicSummary;
}
