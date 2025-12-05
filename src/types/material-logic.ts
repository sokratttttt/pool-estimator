/**
 * Material Logic Types
 * Types for material selection and logic hook
 */

export interface MaterialCategory {
    id: string;
    name: string;
    description: string;
    unit: 'м²' | 'м³' | 'кг' | 'шт' | 'рулон';
    properties: string[];
}

export interface Material {
    id: string;
    categoryId: string;
    name: string;
    brand: string;
    model?: string;
    specifications: {
        thickness?: number; // mm
        density?: number; // kg/m³
        strength?: number; // MPa
        color?: string;
        warranty?: number; // years
    };
    prices: {
        retail: number;
        wholesale: number;
        minimal: number;
    };
    stock: {
        available: number;
        reserved: number;
        expectedDelivery?: string; // ISO date string
    };
    compatibility: string[]; // IDs of compatible materials
    basePricePerCubicMeter?: number; // For polypropylene
}

export interface MaterialFilters {
    category?: string;
    priceRange?: { min: number; max: number };
    properties?: Record<string, unknown>;
    inStock?: boolean;
    compatibleWith?: string; // ID of material
}

export interface ComparisonResult {
    materials: Material[];
    differences: Record<string, {
        name: string;
        values: Record<string, unknown>;
    }>;
}

export interface CalculationResult {
    quantity: number;
    waste: number;
    totalArea: number;
    totalPrice: number;
}

export interface UseMaterialLogicReturn {
    // State
    materials: Material[];
    categories: MaterialCategory[];
    selectedMaterial: Material | null;
    isLoading: boolean;
    error: string | null;

    // Search & Filter
    searchMaterials: (query: string, filters?: MaterialFilters) => Material[];
    filterByCategory: (categoryId: string) => Material[];
    filterByProperty: (property: string, value: unknown) => Material[];
    handleSelect: (material: Material) => void;

    // Selection
    selectMaterial: (materialId: string) => void;
    compareMaterials: (materialIds: string[]) => ComparisonResult;
    calculateCoverage: (materialId: string, area: number) => CalculationResult;

    // Cart / Estimate
    addToEstimate: (materialId: string, quantity: number) => void;
    removeFromEstimate: (materialId: string) => void;
    updateQuantity: (materialId: string, quantity: number) => void;

    // Calculations
    calculateTotal: (materialIds: string[], quantities: Record<string, number>) => number;
    calculateWaste: (materialId: string, area: number, complexity: number) => number;
    getBestPrice: (materialId: string, quantity: number) => number;

    // Recommendations
    getRecommendations: (baseMaterialId: string) => Material[];
    getAlternativeMaterials: (materialId: string, budgetLimit?: number) => Material[];

    // Utils
    exportMaterialsList: (materialIds: string[]) => Promise<{ success: boolean; url?: string }>;
    printMaterialSpec: (materialId: string) => void;
}
