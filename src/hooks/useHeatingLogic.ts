'use client';
import { useCallback } from 'react';

export function useHeatingLogic(catalog, selection, updateSelection): any {
    // Use catalog data if available, otherwise fallback to empty array
    const heatingOptions = catalog?.heating || [];

    const handleSelect = useCallback((option: any) => {
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
