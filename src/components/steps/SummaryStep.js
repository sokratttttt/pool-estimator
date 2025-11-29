'use client';
import { useState, useEffect, useMemo } from 'react';
import { useEstimate } from '@/context/EstimateContext';
import { useClientInfo } from '@/hooks/useClientInfo';
import { useEstimateExport } from '@/hooks/useEstimateExport';
import { useEstimateSave } from '@/hooks/useEstimateSave';
import { useModals } from '@/hooks/useModals';
import { useCustomItems } from '@/hooks/useCustomItems';
import { useDelivery } from '@/hooks/useDelivery';
import { generateEstimateItems, calculateTotal } from '@/utils/estimateUtils';
import { motion } from 'framer-motion';
import AppleCard from '../apple/AppleCard';
import AppleInput from '../apple/AppleInput';
import ClientSelector from '../ClientSelector';
import DeliveryCalculator from '../DeliveryCalculator';
import PaymentSchedule from '../PaymentSchedule';
import { toast } from 'sonner';

// New components
import SummaryActions from './summary/SummaryActions';
import SummaryItemsList from './summary/SummaryItemsList';
import SummaryModals from './summary/SummaryModals';

export default function SummaryStep() {
    const { selection } = useEstimate();
    const { clientInfo, updateClientInfo, selectClient } = useClientInfo();
    const { customItems, addCustomItem } = useCustomItems();
    useEffect(() => {
        const baseItems = generateEstimateItems(selection);
        const items = [...baseItems, ...customItems];
        if (deliveryItem) {
            items.push(deliveryItem);
        }
        setAllItems(items);
    }, [selection, customItems, deliveryItem]);

    const getPrice = (id, originalPrice) => {
        return editedPrices[id] !== undefined ? editedPrices[id] : originalPrice;
    };

    const handlePriceChange = (id, value) => {
        setEditedPrices(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
    };

    const sections = ['Чаша бассейна', 'Оборудование', 'Подогрев', 'Дополнительное оборудование', 'Монтажные работы', 'Строительные работы', 'Строительные материалы'];

    const handleSave = () => {
        const success = saveHook.handleSave();
        if (success) {
            modalsHook.closeSaveModal();
        }
    };

    const handleSaveAsTemplate = () => {
        const success = saveHook.handleSaveAsTemplate();
        if (success) {
            modalsHook.closeTemplateModal();
        }
    };

    const handleReorder = (section, reorderedItems) => {
        const otherItems = allItems.filter(item => (item.section || item.category) !== section);
        const newAllItems = [...otherItems, ...reorderedItems];
        setAllItems(newAllItems);
        toast.success('Порядок изменен');
    };

    return (
        <div className="pb-20 space-y-6">
            <SummaryActions
                onAction={{
                    setShowCatalogSelector: modalsHook.setShowCatalogSelector,
                    setIsEditing,
                    setShowSaveModal: modalsHook.setShowSaveModal,
                    setShowTemplateModal: modalsHook.setShowTemplateModal,
                    setShowDescriptionModal: modalsHook.setShowDescriptionModal,
                    handleExportContract: exportHook.handleExportContract,
                    handleExportProposal: exportHook.handleExportProposal,
                    handleSendWhatsApp: exportHook.handleSendWhatsApp,
                    setShowGanttModal: modalsHook.setShowGanttModal,
                    handleExportExcel: exportHook.handleExportExcel,
                    handleExportPDF: exportHook.handleExportPDF
                }}
                loadingStates={{ isExporting: exportHook.isExporting }}
                isEditing={isEditing}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Left Column - Controls (4 cols) */}
                <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-24">
                    {/* Client Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <AppleCard variant="flat" className="h-full">
                            <h3 className="apple-heading-3 mb-4">Данные для сметы</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-medium text-apple-gray-500">Заказчик</h4>
                                    </div>

                                    <div className="mb-4">
                                        <ClientSelector onSelect={selectClient} />
                                    </div>

                                    <div className="space-y-3">
                                        <AppleInput
                                            label="Имя"
                                            placeholder="Иван Иванов"
                                            value={clientInfo.name}
                                            onChange={(e) => updateClientInfo('name', e.target.value)}
                                        />
                                        <AppleInput
                                            label="Телефон"
                                            placeholder="+7 (999) 000-00-00"
                                            value={clientInfo.phone}
                                            onChange={(e) => updateClientInfo('phone', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-apple-border">
                                    <h4 className="text-sm font-medium text-apple-gray-500 mb-2">Менеджер</h4>
                                    <div className="space-y-3">
                                        <AppleInput
                                            label="Имя менеджера"
                                            value={clientInfo.managerName}
                                            onChange={(e) => updateClientInfo('managerName', e.target.value)}
                                        />
                                        <AppleInput
                                            label="Телефон менеджера"
                                            value={clientInfo.managerPhone}
                                            onChange={(e) => updateClientInfo('managerPhone', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </AppleCard>
                    </motion.div>

                    {/* Delivery */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <DeliveryCalculator onCalculate={calculateDelivery} />
                    </motion.div>

                    {/* Payment */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <PaymentSchedule totalAmount={totalSum} />
                    </motion.div>
                </div>

                {/* Right Column - Estimate (8 cols) */}
                <div className="xl:col-span-8">
                    <SummaryItemsList
                        sections={sections}
                        allItems={allItems}
                        getPrice={getPrice}
                        onReorder={handleReorder}
                        isEditing={isEditing}
                        onPriceChange={handlePriceChange}
                    />
                </div>
            </div>

            <SummaryModals
                modalsState={{
                    showSaveModal: modalsHook.showSaveModal,
                    showTemplateModal: modalsHook.showTemplateModal,
                    showGanttModal: modalsHook.showGanttModal,
                    showDescriptionModal: modalsHook.showDescriptionModal,
                    showCatalogSelector: modalsHook.showCatalogSelector
                }}
                modalsHandlers={{
                    setShowSaveModal: modalsHook.setShowSaveModal,
                    setShowTemplateModal: modalsHook.setShowTemplateModal,
                    setShowGanttModal: modalsHook.setShowGanttModal,
                    setShowDescriptionModal: modalsHook.setShowDescriptionModal,
                    setShowCatalogSelector: modalsHook.setShowCatalogSelector,
                    handleSave,
                    handleSaveAsTemplate,
                    handleCatalogSelect: addCustomItem
                }}
                data={{
                    estimateName: saveHook.estimateName,
                    setEstimateName: saveHook.setEstimateName,
                    templateName: saveHook.templateName,
                    setTemplateName: saveHook.setTemplateName,
                    templateDescription: saveHook.templateDescription,
                    setTemplateDescription: saveHook.setTemplateDescription,
                    allItems,
                    selection
                }}
            />
        </div>
    );
}