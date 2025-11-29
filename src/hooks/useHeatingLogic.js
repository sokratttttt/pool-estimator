'use client';
import { useCallback } from 'react';

export function useHeatingLogic(catalog, selection, updateSelection) {
    // Use catalog data if available, otherwise fallback to empty array
    const heatingOptions = catalog?.heating || [];

    const handleSelect = useCallback((option) => {
        if (selection.heating?.id === option.id) {
            updateSelection('heating', null);
        } else {
            updateSelection('heating', option);
        }
    }, [selection.heating, updateSelection]);

    return {
        heatingOptions,
        handleSelect
    };
}
