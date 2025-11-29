import { useState, useMemo, useCallback } from 'react';
import { filtrationOptions as defaultOptions } from '@/data/filtration';

export function useFiltrationLogic(catalog, selection, updateSelection) {
    const [turnoverTime, setTurnoverTime] = useState(4); // Default 4 hours

    // Memoize display options
    const displayOptions = useMemo(() =>
        (catalog?.filtration && catalog.filtration.length > 0)
            ? catalog.filtration
            : defaultOptions,
        [catalog?.filtration]);

    // Calculate required flow rate
    const volume = selection.dimensions?.volume || 0;

    const requiredFlow = useMemo(() =>
        volume > 0 ? Math.ceil(volume / turnoverTime) : 0,
        [volume, turnoverTime]);

    const handleSelect = useCallback((item) => {
        if (selection.filtration?.id === item.id) {
            updateSelection('filtration', null);
        } else {
            updateSelection('filtration', item);
        }
    }, [selection.filtration, updateSelection]);

    const turnoverOptions = [
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
