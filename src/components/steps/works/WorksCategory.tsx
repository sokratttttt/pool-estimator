'use client';
import { motion } from 'framer-motion';
import { Check, Edit2, X } from 'lucide-react';

interface WorkItem {
    id: string;
    name: string;
    description: string;
    unit: string;
    autoCalculate?: boolean;
    icon?: React.ReactNode;
}

interface WorksCategoryProps {
    categoryKey?: string;
    category: {
        name: string;
        description: string;
        icon: React.ReactNode;
    };
    categoryWorks: Record<string, WorkItem>;
    categoryTotal: number;
    selectedWorks: Record<string, { total: number; quantity: number }>;
    editingWork: string | null;
    editValue: string;
    onEditValueChange: (value: string) => void;
    onToggleWork: (id: string, work: WorkItem) => void;
    onStartEdit: (id: string, quantity: number) => void;
    onSaveEdit: (id: string) => void;
    onCancelEdit: () => void;
}

export default function WorksCategory({
    category,
    categoryWorks,
    categoryTotal,
    selectedWorks,
    editingWork,
    editValue,
    onEditValueChange,
    onToggleWork,
    onStartEdit,
    onSaveEdit,
    onCancelEdit
}: WorksCategoryProps) {
    return (
        <motion.div
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
                {Object.entries(categoryWorks).map(([_, work]) => {
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
                                    onClick={() => onToggleWork(work.id, work)}
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
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEditValueChange(e.target.value)}
                                                            className="w-24 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                            step="0.1"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => onSaveEdit(work.id)}
                                                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            onClick={onCancelEdit}
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
                                                            onClick={() => onStartEdit(work.id, selectedWork.quantity)}
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
}
