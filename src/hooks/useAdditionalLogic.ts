'use client';
import { useState, useMemo, useCallback } from 'react';
import { additionalOptions } from '@/data/additional';
import type {
    UseAdditionalLogicReturn,
    AdditionalItem,
    AdditionalLogicConfig,
    Recommendation,
    EstimateData,
    AdditionalItemFilters,
    BundleOffer,
    AdditionalLogicSummary
} from '@/types/additional-logic';

export function useAdditionalLogic(
    catalog: Record<string, unknown>,
    selection: EstimateData,
    updateSelection: (key: string, value: unknown) => void
): UseAdditionalLogicReturn {
    // State
    const [config, setConfig] = useState<AdditionalLogicConfig>({
        autoAddItems: false,
        showRecommendations: true,
        maxSuggestions: 3,
        budgetThreshold: 100000
    });
    const [dismissedRecommendations, setDismissedRecommendations] = useState<string[]>([]);

    // Memoize selected IDs
    const selectedIds = useMemo(() =>
        selection.additional?.map((i) => i.id) || [],
        [selection.additional]);

    // Memoize display options (source of truth for available items)
    const additionalItems: AdditionalItem[] = useMemo(() => {
        const rawItems = Array.isArray(catalog?.additional) ? catalog.additional : additionalOptions;
        // Normalize items to AdditionalItem interface
        return rawItems.map((item: any) => ({
            id: item.id || '',
            name: item.name || '',
            category: item.category || 'other',
            price: typeof item.price === 'number' ? item.price : 0,
            description: item.description || '',
            taxable: item.taxable ?? true,
            mandatory: item.mandatory ?? false,
            quantity: item.quantity || 1,
            unit: item.unit || 'шт',
            installationPrice: item.installationPrice,
            // Additional fields
            section: item.section,
            total: item.total,
            source: item.source,
            catalogArticle: item.catalogArticle
        }));
    }, [catalog?.additional]);

    const selectedItems = useMemo(() =>
        additionalItems.filter(item => selectedIds.includes(item.id)),
        [additionalItems, selectedIds]
    );

    // Memoize categories
    const categories = useMemo(() =>
        [...new Set(additionalItems.map((o) => o.category))],
        [additionalItems]);

    // Group options by category
    const optionsByCategory = useMemo(() => {
        const grouped: Record<string, AdditionalItem[]> = {};
        categories.forEach((cat) => {
            grouped[cat] = additionalItems.filter((o) => o.category === cat);
        });
        return grouped;
    }, [additionalItems, categories]);

    // Actions
    const addItem = useCallback((itemId: string, quantity: number = 1) => {
        const item = additionalItems.find(i => i.id === itemId);
        if (!item) return;

        const newItem = {
            ...item,
            quantity,
            unit: item.unit || 'шт'
        };
        const newAdditional = [...(selection.additional || []), newItem];
        updateSelection('additional', newAdditional);
    }, [additionalItems, selection.additional, updateSelection]);

    const removeItem = useCallback((itemId: string) => {
        const newAdditional = selection.additional?.filter((i) => i.id !== itemId) || [];
        updateSelection('additional', newAdditional);
    }, [selection.additional, updateSelection]);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        const newAdditional = selection.additional?.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
        ) || [];
        updateSelection('additional', newAdditional);
    }, [selection.additional, updateSelection]);

    const toggleOption = useCallback((option: AdditionalItem) => {
        if (selectedIds.includes(option.id)) {
            removeItem(option.id);
        } else {
            addItem(option.id);
        }
    }, [selectedIds, removeItem, addItem]);

    // Recommendations
    const getRecommendations = useCallback((estimateData: EstimateData): Recommendation[] => {
        if (!config.showRecommendations) return [];

        // Mock logic
        const recs: Recommendation[] = [];
        if (estimateData.volume && estimateData.volume > 50) {
            recs.push({
                itemId: 'robot_cleaner',
                reason: 'Large pool volume',
                priority: 'high',
                estimatedUsage: 1
            });
        }
        return recs.filter(r => !dismissedRecommendations.includes(r.itemId));
    }, [config.showRecommendations, dismissedRecommendations]);

    const applyRecommendations = useCallback((recommendationIds: string[]) => {
        recommendationIds.forEach(id => addItem(id));
    }, [addItem]);

    const dismissRecommendation = useCallback((recommendationId: string) => {
        setDismissedRecommendations(prev => [...prev, recommendationId]);
    }, []);

    // Filtering
    const getItemsByCategory = useCallback((category: string) => {
        return additionalItems.filter(i => i.category === category);
    }, [additionalItems]);

    const filterItems = useCallback((filters: AdditionalItemFilters) => {
        return additionalItems.filter(i => {
            if (filters.category && i.category !== filters.category) return false;
            if (filters.search && !i.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
            if (filters.priceRange) {
                if (i.price < filters.priceRange.min || i.price > filters.priceRange.max) return false;
            }
            return true;
        });
    }, [additionalItems]);

    // Calculations
    const calculateAdditionalTotal = useCallback(() => {
        return selectedItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    }, [selectedItems]);

    const calculateWithAdditions = useCallback((baseTotal: number) => {
        return baseTotal + calculateAdditionalTotal();
    }, [calculateAdditionalTotal]);

    const getSavingsBundle = useCallback((): BundleOffer | null => {
        // Mock logic
        if (selectedItems.length > 3) {
            return {
                id: 'bundle_1',
                name: 'Bulk Saver',
                items: selectedItems.map(i => i.id),
                discountPrice: calculateAdditionalTotal() * 0.9,
                savings: calculateAdditionalTotal() * 0.1
            };
        }
        return null;
    }, [selectedItems, calculateAdditionalTotal]);

    // Config
    const updateConfig = useCallback((updates: Partial<AdditionalLogicConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    }, []);

    const resetToDefaults = useCallback(() => {
        setConfig({
            autoAddItems: false,
            showRecommendations: true,
            maxSuggestions: 3,
            budgetThreshold: 100000
        });
    }, []);

    // Utils
    const exportSelection = useCallback(() => {
        return { success: true, data: selectedItems };
    }, [selectedItems]);

    const importSelection = useCallback((_data: unknown) => {
        return { isValid: true, errors: [] };
    }, []);

    const validateSelection = useCallback(() => {
        const errors: string[] = [];
        // Check mandatory items
        additionalItems.filter(i => i.mandatory).forEach(i => {
            if (!selectedIds.includes(i.id)) {
                errors.push(`Missing mandatory item: ${i.name}`);
            }
        });
        return { isValid: errors.length === 0, errors };
    }, [additionalItems, selectedIds]);

    const getSummary = useCallback((): AdditionalLogicSummary => {
        return {
            totalItems: selectedItems.length,
            totalCost: calculateAdditionalTotal(),
            categories: [...new Set(selectedItems.map(i => i.category))]
        };
    }, [selectedItems, calculateAdditionalTotal]);

    return {
        additionalItems,
        selectedItems,
        recommendations: getRecommendations(selection),
        config,
        addItem,
        removeItem,
        updateQuantity,
        toggleOption,
        getRecommendations,
        applyRecommendations,
        dismissRecommendation,
        getItemsByCategory,
        filterItems,
        categories,
        optionsByCategory,
        selectedIds,
        calculateAdditionalTotal,
        calculateWithAdditions,
        getSavingsBundle,
        updateConfig,
        resetToDefaults,
        exportSelection,
        importSelection,
        validateSelection,
        getSummary
    };
}