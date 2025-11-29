'use client';
import { useCallback } from 'react';
import { materials } from '@/data/materials';

export function useMaterialLogic(selection, updateSelection) {
    const handleSelect = useCallback((material) => {
        updateSelection('material', material);
        updateSelection('bowl', null);
        updateSelection('dimensions', null);
    }, [updateSelection]);

    return {
        materials,
        handleSelect
    };
}
