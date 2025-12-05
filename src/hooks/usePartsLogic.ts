'use client';
import { useCallback } from 'react';
import { embeddedParts as partsOptions } from '@/data/parts';

export function usePartsLogic(selection, updateSelection): any {
    const handleSelect = useCallback((option: any) => {
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
