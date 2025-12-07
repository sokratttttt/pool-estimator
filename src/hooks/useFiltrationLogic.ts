'use client';
import { useState, useMemo, useCallback } from 'react';
import { filtrationOptions as defaultOptions } from '@/data/filtration';

interface FiltrationItem {
    id: string;
    name?: string;
    price?: number;
    flow?: number;
    [key: string]: unknown; // Index signature for compatibility
}

interface Catalog {
    filtration?: FiltrationItem[];
    [key: string]: unknown;
}

interface Selection {
    filtration?: FiltrationItem | null;
    dimensions?: {
        volume?: number;
        [key: string]: unknown;
    } | null;
    [key: string]: unknown;
}

interface TurnoverOption {
    value: number;
    label: string;
    desc: string;
}

type UpdateSelectionFn = (key: string, value: FiltrationItem | null) => void;

export function useFiltrationLogic(
    catalog: Catalog | null | undefined,
    selection: Selection,
    updateSelection: UpdateSelectionFn
) {
    const [turnoverTime, setTurnoverTime] = useState(4); // Default 4 hours

    // Memoize display options
    const displayOptions = useMemo((): FiltrationItem[] =>
        (catalog?.filtration && catalog.filtration.length > 0)
            ? catalog.filtration
            : (defaultOptions as FiltrationItem[]),
        [catalog?.filtration]);

    // Calculate required flow rate
    const volume = selection.dimensions?.volume || 0;

    const requiredFlow = useMemo(() =>
        volume > 0 ? Math.ceil(volume / turnoverTime) : 0,
        [volume, turnoverTime]);

    const handleSelect = useCallback((item: FiltrationItem) => {
        if (selection.filtration?.id === item.id) {
            updateSelection('filtration', null);
        } else {
            updateSelection('filtration', item);
        }
    }, [selection.filtration, updateSelection]);

    const turnoverOptions: TurnoverOption[] = [
        { value: 4, label: '4 часа', desc: 'Высокая нагрузка (Общественный)' },
        { value: 6, label: '6 часов', desc: 'Средняя нагрузка (Частный)' },
        { value: 8, label: '8 часов', desc: 'Низкая нагрузка' },
        { value: 12, label: '12 часов', desc: 'Эконом' },
        { value: 24, label: '24 часа', desc: 'Минимум' },
    ];

    return {
        turnoverTime,
        setTurnoverTime,
        displayOptions,
        requiredFlow,
        volume,
        handleSelect,
        turnoverOptions
    };
}
