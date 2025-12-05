'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { works, workCategories, calculateAutoWorks } from '@/data/works';

export function useWorksLogic(selection: any, updateSelection: (key: string, value: any) => void): any {
    const [selectedWorks, setSelectedWorks] = useState<Record<string, any>>(selection.works || {});
    const [editingWork, setEditingWork] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    // Auto-calculate works when dimensions change
    useEffect(() => {
        const autoWorks = calculateAutoWorks(selection);
        const merged = { ...autoWorks, ...selectedWorks };
        // Only update if there are changes to avoid infinite loop
        if (JSON.stringify(merged) !== JSON.stringify(selectedWorks)) {
            setSelectedWorks(merged);
        }
    }, [selection.dimensions, selection.bowl, selection]);

    const calculateWorkTotal = useCallback((work: any, quantity: any) => {
        if (work.pricePerM3) return Math.ceil(quantity * work.pricePerM3);
        if (work.pricePerM2) return Math.ceil(quantity * work.pricePerM2);
        if (work.pricePerHour) return Math.ceil(quantity * work.pricePerHour);
        if (work.pricePerM) return Math.ceil(quantity * work.pricePerM);
        return work.price || 0;
    }, []);

    const toggleWork = useCallback((workId: string, work: any) => {
        setSelectedWorks(prev => {
            const newWorks = { ...prev };
            if (newWorks[workId]) {
                delete newWorks[workId];
            } else {
                // Add work with calculated or default values
                if (work.autoCalculate && work.formula) {
                    const dimensions = selection.dimensions || selection.bowl;
                    const quantity = work.formula(dimensions, selection);
                    newWorks[workId] = {
                        ...work,
                        quantity: Math.ceil(quantity * 10) / 10,
                        total: calculateWorkTotal(work, quantity)
                    };
                } else {
                    newWorks[workId] = {
                        ...work,
                        quantity: work.quantity || 1,
                        total: work.price || 0
                    };
                }
            }
            updateSelection('works', newWorks);
            return newWorks;
        });
    }, [selection, updateSelection, calculateWorkTotal]);

    const startEdit = useCallback((workId: string, currentQuantity: any) => {
        setEditingWork(workId);
        setEditValue(currentQuantity.toString());
    }, []);

    const saveEdit = useCallback((workId: string) => {
        const work = selectedWorks[workId];
        const newQuantity = parseFloat(editValue) || 0;

        const newWorks = {
            ...selectedWorks,
            [workId]: {
                ...work,
                quantity: newQuantity,
                total: calculateWorkTotal(work, newQuantity)
            }
        };
        setSelectedWorks(newWorks);
        updateSelection('works', newWorks);
        setEditingWork(null);
    }, [selectedWorks, editValue, updateSelection, calculateWorkTotal]);

    const cancelEdit = useCallback(() => {
        setEditingWork(null);
        setEditValue('');
    }, []);

    // Memoize totals
    const grandTotal = useMemo(() => {
        return Object.values(selectedWorks).reduce((sum: any, w: any) => sum + (w.total || 0), 0);
    }, [selectedWorks]);

    const categoryTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        Object.keys(workCategories).forEach(cat => {
            totals[cat] = Object.values(selectedWorks)
                .filter((w: any) => w.category === cat)
                .reduce((sum: any, w: any) => sum + (w.total || 0), 0);
        });
        return totals;
    }, [selectedWorks]);

    return {
        selectedWorks,
        editingWork,
        editValue,
        setEditValue,
        toggleWork,
        startEdit,
        saveEdit,
        cancelEdit,
        grandTotal,
        categoryTotals,
        works,
        workCategories
    };
}
