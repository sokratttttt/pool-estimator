'use client';

import { useState, useCallback, useMemo } from 'react';
import { materials as rawMaterials } from '@/data/materials';
import type {
    Material,
    MaterialCategory,
    MaterialFilters,
    UseMaterialLogicReturn,
    ComparisonResult,
    CalculationResult
} from '@/types/material-logic';

// Cast raw materials to typed array if needed, or assume they match
const typedMaterials = rawMaterials as unknown as Material[];

export function useMaterialLogic(
    _selection: unknown,
    updateSelection: (key: string, value: unknown) => void
): UseMaterialLogicReturn {
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [isLoading] = useState(false);
    const [error] = useState<string | null>(null);

    // Categories (mocked for now as they weren't in original)
    const categories: MaterialCategory[] = useMemo(() => [
        { id: 'concrete', name: 'Бетон', description: 'Бетонные чаши', unit: 'м³', properties: [] },
        { id: 'polypropylene', name: 'Полипропилен', description: 'Полипропиленовые чаши', unit: 'м²', properties: [] },
        { id: 'composite', name: 'Композит', description: 'Композитные чаши', unit: 'шт', properties: [] },
    ], []);

    const handleSelect = useCallback((material: Material) => {
        setSelectedMaterial(material);
        updateSelection('material', material);
        updateSelection('bowl', null);
        updateSelection('dimensions', null);
    }, [updateSelection]);

    const selectMaterial = useCallback((materialId: string) => {
        const material = typedMaterials.find(m => m.id === materialId);
        if (material) {
            handleSelect(material);
        }
    }, [handleSelect]);

    const searchMaterials = useCallback((query: string, filters?: MaterialFilters) => {
        return typedMaterials.filter(m => {
            const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase());
            const matchesCategory = filters?.category ? m.categoryId === filters.category : true;
            return matchesQuery && matchesCategory;
        });
    }, []);

    const filterByCategory = useCallback((categoryId: string) => {
        return typedMaterials.filter(m => m.categoryId === categoryId);
    }, []);

    const filterByProperty = useCallback((_property: string, _value: unknown) => {
        // Implementation would go here
        return typedMaterials;
    }, []);

    const compareMaterials = useCallback((materialIds: string[]): ComparisonResult => {
        const selected = typedMaterials.filter(m => materialIds.includes(m.id));
        return {
            materials: selected,
            differences: {} // Implementation needed
        };
    }, []);

    const calculateCoverage = useCallback((materialId: string, area: number): CalculationResult => {
        const material = typedMaterials.find(m => m.id === materialId);
        const price = material?.prices.retail || 0;
        return {
            quantity: area,
            waste: area * 0.05, // 5% waste
            totalArea: area * 1.05,
            totalPrice: area * 1.05 * price
        };
    }, []);

    const addToEstimate = useCallback((_materialId: string, _quantity: number) => {
        // Implementation needed
    }, []);

    const removeFromEstimate = useCallback((_materialId: string) => {
        // Implementation needed
    }, []);

    const updateQuantity = useCallback((_materialId: string, _quantity: number) => {
        // Implementation needed
    }, []);

    const calculateTotal = useCallback((materialIds: string[], quantities: Record<string, number>) => {
        return materialIds.reduce((total, id) => {
            const material = typedMaterials.find(m => m.id === id);
            const qty = quantities[id] || 0;
            return total + (material?.prices.retail || 0) * qty;
        }, 0);
    }, []);

    const calculateWaste = useCallback((_materialId: string, area: number, complexity: number) => {
        return area * (0.05 * complexity);
    }, []);

    const getBestPrice = useCallback((materialId: string, quantity: number) => {
        const material = typedMaterials.find(m => m.id === materialId);
        if (!material) return 0;
        return quantity > 100 ? material.prices.wholesale : material.prices.retail;
    }, []);

    const getRecommendations = useCallback((_baseMaterialId: string) => {
        return typedMaterials.slice(0, 3); // Mock
    }, []);

    const getAlternativeMaterials = useCallback((_materialId: string, _budgetLimit?: number) => {
        return typedMaterials.slice(0, 3); // Mock
    }, []);

    const exportMaterialsList = useCallback(async (_materialIds: string[]) => {
        return { success: true };
    }, []);

    const printMaterialSpec = useCallback((_materialId: string) => {
        window.print();
    }, []);

    return {
        materials: typedMaterials,
        categories,
        selectedMaterial,
        isLoading,
        error,
        searchMaterials,
        filterByCategory,
        filterByProperty,
        handleSelect,
        selectMaterial,
        compareMaterials,
        calculateCoverage,
        addToEstimate,
        removeFromEstimate,
        updateQuantity,
        calculateTotal,
        calculateWaste,
        getBestPrice,
        getRecommendations,
        getAlternativeMaterials,
        exportMaterialsList,
        printMaterialSpec
    };
}
