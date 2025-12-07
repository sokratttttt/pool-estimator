'use client';
import { useCallback } from 'react';
import { embeddedParts as partsOptions } from '@/data/parts';

interface PartOption {
    id: string;
    name?: string;
    price?: number;
    [key: string]: unknown; // Index signature for compatibility
}

interface Selection {
    parts?: PartOption | null;
    [key: string]: unknown;
}

type UpdateSelectionFn = (key: string, value: PartOption | null) => void;

export function usePartsLogic(selection: Selection, updateSelection: UpdateSelectionFn) {
    const handleSelect = useCallback((option: PartOption) => {
        if (selection.parts?.id === option.id) {
            updateSelection('parts', null);
        } else {
            updateSelection('parts', option);
        }
    }, [selection.parts, updateSelection]);

    return {
        partsOptions,
        handleSelect
    };
}
