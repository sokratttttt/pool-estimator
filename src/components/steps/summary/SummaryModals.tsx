'use client';
import React, { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Bookmark, Calendar, X } from 'lucide-react';
import AppleButton from '../../apple/AppleButton';
import AppleInput from '../../apple/AppleInput';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { LoadingSkeleton } from '../../ui';
import { EstimateItem, Product } from '@/types';
import { Selection } from '@/types/estimate-utils';

const GanttChart = lazy(() => import('../../GanttChart'));
const DescriptionGeneratorModal = lazy(() => import('../../DescriptionGeneratorModal'));
const CatalogSelector = lazy(() => import('../../CatalogSelector'));

interface ModalsState {
    showSaveModal: boolean;
    showTemplateModal: boolean;
    showGanttModal: boolean;
    showDescriptionModal: boolean;
    showCatalogSelector: boolean;
}

interface ModalsHandlers {
    setShowSaveModal: (show: boolean) => void;
    setShowTemplateModal: (show: boolean) => void;
    setShowGanttModal: (show: boolean) => void;
    setShowDescriptionModal: (show: boolean) => void;
    setShowCatalogSelector: (show: boolean) => void;
    handleSave: () => void;
    handleSaveAsTemplate: () => void;
    handleCatalogSelect: (item: Product) => void;
}

interface SummaryData {
    estimateName: string;
    setEstimateName: (name: string) => void;
    templateName: string;
    setTemplateName: (name: string) => void;
    templateDescription: string;
    setTemplateDescription: (desc: string) => void;
    allItems: EstimateItem[];
    selection: Selection;
}

interface SummaryModalsProps {
    modalsState: ModalsState;
    modalsHandlers: ModalsHandlers;
    data: SummaryData;
}

export default function SummaryModals({
    modalsState,
    modalsHandlers,
    data
}: SummaryModalsProps) {
    const isMobile = useMediaQuery('(max-width: 768px)');

    const {
        showSaveModal,
        showTemplateModal,
        showGanttModal,
        showDescriptionModal,
        showCatalogSelector
    } = modalsState;

    const {
        setShowSaveModal,
        setShowTemplateModal,
        setShowGanttModal,
        setShowDescriptionModal,
        setShowCatalogSelector,
        handleSave,
        handleSaveAsTemplate,
        handleCatalogSelect
    } = modalsHandlers;

    const {
        estimateName,
        setEstimateName,
        templateName,
        setTemplateName,
        templateDescription,
        setTemplateDescription,
        allItems,
        selection
    } = data;

    return (
        <>
            {/* Save Modal */}
            <AnimatePresence>
                {showSaveModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className={`bg-apple-surface shadow-2xl w-full overflow-hidden border border-apple-border ${isMobile ? 'h-full rounded-none' : 'max-w-md rounded-3xl'}`}
                        >
                            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-b border-apple-border p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                            <Save size={20} className="text-white" />
                                        </div>
                                        <h3 className="apple-heading-2">Сохранить смету</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowSaveModal(false)}
                                        className="w-8 h-8 rounded-lg hover:bg-apple-bg-secondary transition-colors flex items-center justify-center"
                                    >
                                        <X size={20} className="text-apple-text-secondary" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <AppleInput
                                    label="Название сметы"
                                    placeholder="Например: Бассейн 8x4м - Загородный дом"
                                    value={estimateName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEstimateName(e.target.value)}
                                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSave()}
                                    className="mb-6"
                                    autoFocus
                                />

                                <div className="flex gap-3">
                                    <AppleButton
                                        variant="secondary"
                                        onClick={() => setShowSaveModal(false)}
                                        className="flex-1"
                                    >
                                        Отмена
                                    </AppleButton>
                                    <AppleButton
                                        variant="primary"
                                        onClick={handleSave}
                                        className="flex-1"
                                        disabled={!estimateName.trim()}
                                    >
                                        Сохранить
                                    </AppleButton>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Template Save Modal */}
            <AnimatePresence>
                {showTemplateModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className={`bg-apple-surface shadow-2xl w-full overflow-hidden border border-apple-border ${isMobile ? 'h-full rounded-none' : 'max-w-md rounded-3xl'}`}
                        >
                            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-b border-apple-border p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            <Bookmark size={20} className="text-white" />
                                        </div>
                                        <h3 className="apple-heading-2">Сохранить как шаблон</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowTemplateModal(false)}
                                        className="w-8 h-8 rounded-lg hover:bg-apple-bg-secondary transition-colors flex items-center justify-center"
                                    >
                                        <X size={20} className="text-apple-text-secondary" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <AppleInput
                                    label="Название шаблона"
                                    placeholder="Например: Стандартный бассейн 8×4"
                                    value={templateName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemplateName(e.target.value)}
                                    className="mb-4"
                                    autoFocus
                                />
                                <AppleInput
                                    label="Описание (необязательно)"
                                    placeholder="Краткое описание конфигурации"
                                    value={templateDescription}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemplateDescription(e.target.value)}
                                    className="mb-6"
                                />

                                <div className="flex gap-3">
                                    <AppleButton
                                        variant="secondary"
                                        onClick={() => setShowTemplateModal(false)}
                                        className="flex-1"
                                    >
                                        Отмена
                                    </AppleButton>
                                    <AppleButton
                                        variant="primary"
                                        onClick={handleSaveAsTemplate}
                                        className="flex-1"
                                        disabled={!templateName.trim()}
                                    >
                                        Сохранить
                                    </AppleButton>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Gantt Chart Modal */}
            <AnimatePresence>
                {showGanttModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`bg-apple-surface shadow-2xl w-full overflow-hidden border border-apple-border ${isMobile ? 'h-full rounded-none' : 'max-w-6xl max-h-[90vh] rounded-3xl'}`}
                        >
                            <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-b border-apple-border p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                                            <Calendar size={20} className="text-white" />
                                        </div>
                                        <h3 className="apple-heading-2">График работ</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowGanttModal(false)}
                                        className="w-8 h-8 rounded-lg hover:bg-apple-bg-secondary transition-colors flex items-center justify-center"
                                    >
                                        <X size={20} className="text-apple-text-secondary" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
                                <Suspense fallback={<LoadingSkeleton type="grid" gridConfig={{ columns: 1, rows: 1 }} />}>
                                    <GanttChart items={allItems} />
                                </Suspense>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Catalog Selector */}
            <AnimatePresence>
                {showCatalogSelector && (
                    <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><LoadingSkeleton type="card" count={1} /></div>}>
                        <CatalogSelector
                            category="all"
                            onSelect={handleCatalogSelect}
                            onClose={() => setShowCatalogSelector(false)}
                        />
                    </Suspense>
                )}
            </AnimatePresence>

            {/* Description Generator Modal */}
            <Suspense fallback={null}>
                <DescriptionGeneratorModal
                    isOpen={showDescriptionModal}
                    onClose={() => setShowDescriptionModal(false)}
                    estimate={{
                        length: selection?.dimensions?.length || selection?.bowl?.length || 0,
                        width: selection?.dimensions?.width || selection?.bowl?.width || 0,
                        depth: selection?.dimensions?.depth || selection?.bowl?.depth || 1.5,
                        total: allItems.reduce((sum: number, item: EstimateItem) => sum + (item.price * item.quantity), 0),
                        selectedWorks: allItems
                    }}
                />
            </Suspense>
        </>
    );
}
