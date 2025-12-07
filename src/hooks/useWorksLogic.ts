'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { works, workCategories, calculateAutoWorks } from '@/data/works';

interface WorkItem {
    id: string;
    name: string;
    description?: string;
    price?: number;
    pricePerM3?: number;
    pricePerM2?: number;
    pricePerHour?: number;
    pricePerM?: number;
    unit?: string;
    category?: string;
    autoCalculate?: boolean;
    formula?: (dimensions: Record<string, number>, selection?: unknown) => number;
    quantity?: number;
    total?: number;
}

export function useWorksLogic(selection: Record<string, unknown>, updateSelection: (key: string, value: unknown) => void) {
    const [selectedWorks, setSelectedWorks] = useState<Record<string, WorkItem>>((selection.works as Record<string, WorkItem>) || {});
    const [editingWork, setEditingWork] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    // Auto-calculate works when dimensions change
    useEffect(() => {
        const autoWorks = calculateAutoWorks(selection);
        const merged = { ...autoWorks, ...selectedWorks };
        // Only update if there are changes to avoid infinite loop
        if (JSON.stringify(merged) !== JSON.stringify(selectedWorks)) {
            setSelectedWorks(merged as Record<string, WorkItem>);
        }
    }, [selection.dimensions, selection.bowl, selection, selectedWorks]);

    const calculateWorkTotal = useCallback((work: WorkItem, quantity: number) => {
        if (work.pricePerM3) return Math.ceil(quantity * work.pricePerM3);
        if (work.pricePerM2) return Math.ceil(quantity * work.pricePerM2);
        if (work.pricePerHour) return Math.ceil(quantity * work.pricePerHour);
        if (work.pricePerM) return Math.ceil(quantity * work.pricePerM);
        return work.price || 0;
    }, []);

    const toggleWork = useCallback((workId: string, work: WorkItem) => {
        setSelectedWorks(prev => {
            const newWorks = { ...prev };
            if (newWorks[workId]) {
                delete newWorks[workId];
            } else {
                // Add work with calculated or default values
                if (work.autoCalculate && work.formula) {
                    const dimensions = (selection.dimensions || selection.bowl) as Record<string, number>;
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

    const startEdit = useCallback((workId: string, currentQuantity: number) => {
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
        return Object.values(selectedWorks).reduce((sum: number, w: WorkItem) => sum + (w.total || 0), 0);
    }, [selectedWorks]);

    const categoryTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        Object.keys(workCategories).forEach(cat => {
            totals[cat] = Object.values(selectedWorks)
                .filter((w: WorkItem) => w.category === cat)
                .reduce((sum: number, w: WorkItem) => sum + (w.total || 0), 0);
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
