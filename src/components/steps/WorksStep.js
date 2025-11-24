'use client';
import { useEstimate } from '@/context/EstimateContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { works, workCategories, calculateAutoWorks } from '@/data/works';
import { Calculator, Edit2, Check, X } from 'lucide-react';

export default function WorksStep() {
    const { selection, updateSelection } = useEstimate();
    const [selectedWorks, setSelectedWorks] = useState(selection.works || {});
    const [editingWork, setEditingWork] = useState(null);
    const [editValue, setEditValue] = useState('');

    // Auto-calculate works when dimensions change
    useEffect(() => {
        const autoWorks = calculateAutoWorks(selection);
        const merged = { ...autoWorks, ...selectedWorks };
        setSelectedWorks(merged);
    }, [selection.dimensions, selection.bowl]);

    const toggleWork = (workId, work) => {
        const newWorks = { ...selectedWorks };

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

        setSelectedWorks(newWorks);
        updateSelection('works', newWorks);
    };

    const calculateWorkTotal = (work, quantity) => {
        if (work.pricePerM3) return Math.ceil(quantity * work.pricePerM3);
        if (work.pricePerM2) return Math.ceil(quantity * work.pricePerM2);
        if (work.pricePerHour) return Math.ceil(quantity * work.pricePerHour);
        if (work.pricePerM) return Math.ceil(quantity * work.pricePerM);
        return work.price || 0;
    };

    const startEdit = (workId, currentQuantity) => {
        setEditingWork(workId);
        setEditValue(currentQuantity.toString());
    };

    const saveEdit = (workId) => {
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
    };

    const cancelEdit = () => {
        setEditingWork(null);
        setEditValue('');
    };

    const getTotalByCategory = (category) => {
        return Object.values(selectedWorks)
            .filter(w => w.category === category)
            .reduce((sum, w) => sum + (w.total || 0), 0);
    };

    const getGrandTotal = () => {
        return Object.values(selectedWorks).reduce((sum, w) => sum + (w.total || 0), 0);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-2xl mx-auto mb-8"
            >
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    Строительные работы
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Выберите необходимые работы. Объемы рассчитываются автоматически
                </p>
            </motion.div>

            {/* Total Summary */}
            <div className="bg-gradient-to-r from-[#00b4d8] to-[#0096c7] rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calculator size={32} />
                        <div>
                            <div className="text-sm opacity-90">Итого работы:</div>
                            <div className="text-3xl font-bold">{getGrandTotal().toLocaleString('ru-RU')} ₽</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm opacity-90">Выбрано позиций:</div>
                        <div className="text-2xl font-bold">{Object.keys(selectedWorks).length}</div>
                    </div>
                </div>
            </div>

            {/* Work Categories */}
            {Object.entries(workCategories).map(([categoryKey, category]) => {
                const categoryWorks = works[categoryKey];
                const categoryTotal = getTotalByCategory(categoryKey);

                return (
                    <motion.div
                        key={categoryKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm"
                    >
                        {/* Category Header */}
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{category.icon}</span>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {category.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {category.description}
                                    </p>
                                </div>
                            </div>
                            {categoryTotal > 0 && (
                                <div className="text-right">
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Сумма:</div>
                                    <div className="text-xl font-bold text-[#00b4d8]">
                                        {categoryTotal.toLocaleString('ru-RU')} ₽
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Work Items */}
                        <div className="space-y-3">
                            {Object.entries(categoryWorks).map(([workKey, work]) => {
                                const isSelected = !!selectedWorks[work.id];
                                const selectedWork = selectedWorks[work.id];
                                const isEditing = editingWork === work.id;

                                return (
                                    <div
                                        key={work.id}
                                        className={`
                                            p-4 rounded-xl border-2 transition-all duration-200
                                            ${isSelected
                                                ? 'border-[#00b4d8] bg-cyan-50 dark:bg-cyan-950/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                            }
                                        `}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Checkbox */}
                                            <button
                                                onClick={() => toggleWork(work.id, work)}
                                                className={`
                                                    mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                                                    ${isSelected
                                                        ? 'border-[#00b4d8] bg-[#00b4d8]'
                                                        : 'border-slate-300 dark:border-slate-600 hover:border-[#00b4d8]'
                                                    }
                                                `}
                                            >
                                                {isSelected && (
                                                    <Check size={16} className="text-white" strokeWidth={3} />
                                                )}
                                            </button>

                                            {/* Work Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900 dark:text-white">
                                                            {work.name}
                                                        </h4>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                            {work.description}
                                                        </p>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                                                                {selectedWork.total.toLocaleString('ru-RU')} ₽
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Quantity Editor */}
                                                {isSelected && (
                                                    <div className="mt-3 flex items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                                                Объем:
                                                            </span>
                                                            {isEditing ? (
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="number"
                                                                        value={editValue}
                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                        className="w-24 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                                        step="0.1"
                                                                        autoFocus
                                                                    />
                                                                    <button
                                                                        onClick={() => saveEdit(work.id)}
                                                                        className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded"
                                                                    >
                                                                        <Check size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={cancelEdit}
                                                                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-slate-900 dark:text-white">
                                                                        {selectedWork.quantity} {work.unit}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => startEdit(work.id, selectedWork.quantity)}
                                                                        className="p-1 text-slate-400 hover:text-[#00b4d8] hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                                                        title="Редактировать"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {work.autoCalculate && (
                                                            <span className="text-xs text-[#00b4d8] bg-cyan-100 dark:bg-cyan-950/50 px-2 py-1 rounded">
                                                                Авто-расчет
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
