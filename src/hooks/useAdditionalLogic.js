'use client';
import { useMemo } from 'react';
import { additionalOptions } from '@/data/additional';

export function useAdditionalLogic(catalog, selection, updateSelection) {
    // Memoize selected IDs
    const selectedIds = useMemo(() =>
        selection.additional?.map(i => i.id) || [],
        [selection.additional]);

    // Memoize display options
    const displayOptions = useMemo(() =>
        catalog?.additional?.length > 0 ? catalog.additional : additionalOptions,
        [catalog?.additional]);

    // Memoize categories to avoid recalculation
    const categories = useMemo(() =>
        [...new Set(displayOptions.map(o => o.category))],
        [displayOptions]);

    // Pre-group options by category to avoid O(N*M) filtering in render
    const optionsByCategory = useMemo(() => {
        const grouped = {};
        categories.forEach(cat => {
            grouped[cat] = displayOptions.filter(o => o.category === cat);
        });
        return grouped;
    }, [displayOptions, categories]);

    const toggleOption = (option) => {
        let newAdditional;
        if (selectedIds.includes(option.id)) {
            newAdditional = selection.additional.filter(i => i.id !== option.id);
        } else {
            newAdditional = [...(selection.additional || []), option];
        }
        updateSelection('additional', newAdditional);
    };

    return {
        categories,
        optionsByCategory,
        selectedIds,
        toggleOption
    };
}
