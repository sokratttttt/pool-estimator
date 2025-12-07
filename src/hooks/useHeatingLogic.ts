'use client';
import { useCallback } from 'react';

interface HeatingOption {
    id: string;
    name?: string;
    price?: number;
    [key: string]: unknown; // Index signature for compatibility
}

interface Catalog {
    heating?: HeatingOption[];
    [key: string]: unknown;
}

interface Selection {
    heating?: HeatingOption | null;
    [key: string]: unknown;
}

type UpdateSelectionFn = (key: string, value: HeatingOption | null) => void;

export function useHeatingLogic(
    catalog: Catalog | null | undefined,
    selection: Selection,
    updateSelection: UpdateSelectionFn
) {
    // Use catalog data if available, otherwise fallback to empty array
    const heatingOptions: HeatingOption[] = catalog?.heating || [];

    const handleSelect = useCallback((option: HeatingOption) => {
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
