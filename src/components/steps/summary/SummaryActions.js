'use client';
import { motion } from 'framer-motion';
import { Edit2, Save, FileSpreadsheet, FileText, Plus, Bookmark, MessageCircle, Calendar, Sparkles } from 'lucide-react';
import AppleButton from '../../apple/AppleButton';

export default function SummaryActions({
    onAction,
    loadingStates,
    isEditing
}) {
    const {
        setShowCatalogSelector,
        setIsEditing,
        setShowSaveModal,
        setShowTemplateModal,
        setShowDescriptionModal,
        handleExportContract,
        handleExportProposal,
        handleSendWhatsApp,
        setShowGanttModal,
        handleExportExcel,
        handleExportPDF
    } = onAction;

    const { isExporting } = loadingStates;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
            <div>
                <h2 className="apple-heading-2">Детальная смета</h2>
                <p className="apple-body-secondary">Итоговый расчет стоимости вашего бассейна</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <AppleButton
                    variant="primary"
                    onClick={() => setShowCatalogSelector(true)}
                    icon={<Plus size={18} />}
                    size="sm"
                >
                    Из каталога
                </AppleButton>
                <AppleButton
                    variant={isEditing ? "primary" : "secondary"}
                    onClick={() => setIsEditing(!isEditing)}
                    icon={isEditing ? <Save size={18} /> : <Edit2 size={18} />}
                    size="sm"
                >
                    {isEditing ? 'Готово' : 'Редактировать'}
                </AppleButton>
                <AppleButton
                    variant="secondary"
                    onClick={() => setShowSaveModal(true)}
                    icon={<Save size={18} />}
                    size="sm"
                >
                    Сохранить
                </AppleButton>
                <AppleButton
                    variant="secondary"
                    onClick={() => setShowTemplateModal(true)}
                    icon={<Bookmark size={18} />}
                    size="sm"
                >
                    Шаблон
                </AppleButton>
                <AppleButton
                    variant="secondary"
                    onClick={() => setShowDescriptionModal(true)}
                    icon={<Sparkles size={18} />}
                    size="sm"
                >
                    ✨ Описание
                </AppleButton>
                <AppleButton
                    variant="secondary"
                    onClick={handleExportContract}
                    icon={<FileText size={18} />}
                    size="sm"
                    loading={isExporting}
                >
                    Договор
                </AppleButton>
                <AppleButton
                    variant="primary"
                    onClick={handleExportProposal}
                    icon={<FileText size={18} />}
                    size="sm"
                    loading={isExporting}
                >
                    КП 2.0
                </AppleButton>
                <AppleButton
                    variant="secondary"
                    onClick={handleSendWhatsApp}
                    icon={<MessageCircle size={18} />}
                    size="sm"
                >
                    WhatsApp
                </AppleButton>
                <AppleButton
                    variant="secondary"
                    onClick={() => setShowGanttModal(true)}
                    icon={<Calendar size={18} />}
                    size="sm"
                >
                    График работ
                </AppleButton>
                <AppleButton
                    variant="secondary"
                    onClick={handleExportExcel}
                    icon={<FileSpreadsheet size={18} />}
                    size="sm"
                    loading={isExporting}
                >
                    Excel
                </AppleButton>
                <AppleButton
                    variant="secondary"
                    onClick={handleExportPDF}
                    icon={<FileText size={18} />}
                    size="sm"
                    loading={isExporting}
                >
                    PDF
                </AppleButton>
            </div>
        </motion.div>
    );
}
