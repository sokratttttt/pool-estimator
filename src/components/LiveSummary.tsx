'use client';
import { useEstimate } from '@/context/EstimateContext';
import { generateEstimateItems, calculateTotal } from '@/utils/estimateUtils';
import type { EstimateItem } from '@/types';
import { FileText, FileSpreadsheet, X, ChevronLeft, Loader2 } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface LiveSummaryProps {
    onExportPDF?: (items: EstimateItem[], total: number) => Promise<void>;
    onExportExcel?: (items: EstimateItem[], total: number) => Promise<void>;
}

export default function LiveSummary({ onExportPDF, onExportExcel }: LiveSummaryProps) {
    const { selection } = useEstimate();
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState({ pdf: false, excel: false });

    // Мемоизация тяжелых вычислений
    const items = useMemo(() => {
        return generateEstimateItems(selection);
    }, [selection]);

    const total = useMemo(() => {
        return calculateTotal(items);
    }, [items]);

    // Animated price counter
    const AnimatedPrice = ({ value }: { value: number }) => {
        return (
            <motion.span
                key={value}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold text-[#00b4d8]"
            >
                {(value || 0).toLocaleString('ru-RU')} ₽
            </motion.span>
        );
    };

    // Мемоизация callback функций
    const handleExportPDF = useCallback(async () => {
        setIsExporting(prev => ({ ...prev, pdf: true }));
        try {
            if (onExportPDF) await onExportPDF(items as EstimateItem[], total);
            toast.success('✅ PDF успешно экспортирован!', {
                description: `Смета на ${(total || 0).toLocaleString('ru-RU')} ₽ сохранена`,
                duration: 3000,
            });
        } catch (error) {
            toast.error('❌ Ошибка экспорта PDF', {
                description: (error instanceof Error ? error.message : 'Unknown error'),
                duration: 5000,
            });
        } finally {
            setIsExporting(prev => ({ ...prev, pdf: false }));
        }
    }, [items, total, onExportPDF]);

    const handleExportExcel = useCallback(async () => {
        setIsExporting(prev => ({ ...prev, excel: true }));
        try {
            if (onExportExcel) await onExportExcel(items as EstimateItem[], total);
            toast.success('✅ Excel успешно экспортирован!', {
                description: `Смета на ${(total || 0).toLocaleString('ru-RU')} ₽ сохранена`,
                duration: 3000,
            });
        } catch (error) {
            toast.error('❌ Ошибка экспорта Excel', {
                description: (error instanceof Error ? error.message : 'Unknown error'),
                duration: 5000,
            });
        } finally {
            setIsExporting(prev => ({ ...prev, excel: false }));
        }
    }, [items, total, onExportExcel]);

    // Helper to render section if items exist
    interface RenderSectionProps {
        title: string;
        sectionItems?: EstimateItem[];
    }

    const renderSection = ({ title, sectionItems }: RenderSectionProps) => {
        if (!sectionItems || sectionItems.length === 0) return null;
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</h4>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {sectionItems.map((item: EstimateItem, idx: number) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex justify-between items-start mb-1.5 group"
                        >
                            <span className="text-xs text-slate-600 dark:text-slate-400 w-2/3 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                                {item.name}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                {((item.price || 0) * (item.quantity || 1)).toLocaleString()} ₽
                            </span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        );
    };

    return (
        <>
            {/* Mobile Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-50 bg-[#00b4d8] text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
                <FileText size={20} />
                <span className="font-bold">{total.toLocaleString('ru-RU')} ₽</span>
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            {/* Summary Panel */}
            <motion.div
                initial={false}
                animate={{
                    x: isOpen ? 0 : '100%'
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`
                    fixed lg:relative inset-y-0 right-0 z-50
                    h-full flex flex-col bg-white dark:bg-slate-800 
                    border-l border-slate-200 dark:border-slate-700 
                    shadow-2xl lg:shadow-xl
                    w-full sm:w-96 lg:w-80 xl:w-96
                    transition-colors duration-300
                `}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-900/80 dark:to-slate-800 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wide">
                            Смета
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Предварительный расчет</p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Material / Bowl */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Тип бассейна
                        </h4>
                        {selection.material ? (
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                {selection.material.name}
                                {selection.dimensions && (
                                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-normal mt-1">
                                        {selection.dimensions.length}x{selection.dimensions.width}x{selection.dimensions.depth}м ({selection.dimensions.volume?.toFixed(1) ?? '?'} м³)
                                    </span>
                                )}
                                {selection.bowl && (
                                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-normal mt-1">
                                        {selection.bowl.name}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 italic flex items-center gap-2">
                                <ChevronLeft size={16} className="animate-pulse" />
                                Выберите тип бассейна
                            </div>
                        )}
                    </div>

                    {renderSection({ title: 'Подогрев', sectionItems: items.filter((i: EstimateItem) => i.section === 'Подогрев') })}
                    {renderSection({ title: 'Закладные', sectionItems: items.filter((i: EstimateItem) => i.section === 'Оборудование' && i.id.startsWith('part')) })}
                    {renderSection({ title: 'Доп. опции', sectionItems: items.filter((i: EstimateItem) => i.section === 'Дополнительное оборудование') })}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Итого:</span>
                        <AnimatePresence mode="wait">
                            <AnimatedPrice value={total} />
                        </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleExportExcel}
                            disabled={isExporting.excel}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-green-200 dark:border-green-900 rounded-xl text-slate-700 dark:text-slate-200 font-medium hover:bg-green-50 dark:hover:bg-green-950 hover:border-green-300 dark:hover:border-green-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting.excel ? (
                                <Loader2 size={18} className="animate-spin text-green-600 dark:text-green-400" />
                            ) : (
                                <FileSpreadsheet size={18} className="text-green-600 dark:text-green-400" />
                            )}
                            <span className="text-sm">Excel</span>
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting.pdf}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-red-200 dark:border-red-900 rounded-xl text-slate-700 dark:text-slate-200 font-medium hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting.pdf ? (
                                <Loader2 size={18} className="animate-spin text-red-600 dark:text-red-400" />
                            ) : (
                                <FileText size={18} className="text-red-600 dark:text-red-400" />
                            )}
                            <span className="text-sm">PDF</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
