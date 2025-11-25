'use client';
import { useState, useEffect } from 'react';
import { useEstimate } from '@/context/EstimateContext';
import { useHistory } from '@/context/HistoryContext';
import { useTemplates } from '@/context/TemplateContext';
import { generateEstimateItems, calculateTotal } from '@/utils/estimateUtils';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { generateContract } from '@/utils/contractUtils';
import { generateProposal } from '@/utils/proposalUtils';
import { sendToWhatsApp } from '@/utils/whatsappUtils';
import { Edit2, Save, FileSpreadsheet, FileText, X, Plus, Bookmark, MessageCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppleButton from '../apple/AppleButton';
import AppleInput from '../apple/AppleInput';
import AppleCard from '../apple/AppleCard';
import ClientSelector from '../ClientSelector';
import CatalogSelector from '../CatalogSelector';
import DeliveryCalculator from '../DeliveryCalculator';
import PaymentSchedule from '../PaymentSchedule';
import DraggableList from '../DraggableList';
import GanttChart from '../GanttChart';
import { toast } from 'sonner';

export default function SummaryStep() {
    const { selection, updateSelection } = useEstimate();
    const { saveEstimate } = useHistory();
    const { saveTemplate } = useTemplates();
    const [isEditing, setIsEditing] = useState(false);
    const [editedPrices, setEditedPrices] = useState({});
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [estimateName, setEstimateName] = useState('');
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [showCatalogSelector, setShowCatalogSelector] = useState(false);
    const [customItems, setCustomItems] = useState([]);
    const [deliveryItem, setDeliveryItem] = useState(null);
    const [clientInfo, setClientInfo] = useState({
        name: '',
        phone: '',
        email: '',
        managerName: 'Платон',
        managerPhone: '+7 (919) 296-16-47'
    });
    const [showGanttModal, setShowGanttModal] = useState(false);

    const [allItems, setAllItems] = useState([]);

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

    const handleClientSelect = (client) => {
        setClientInfo(prev => ({
            ...prev,
            name: client.name,
            phone: client.phone || prev.phone,
            email: client.email || prev.email,
            clientId: client.id
        }));
        toast.success('Данные клиента загружены');
    };

    const totalSum = calculateTotal(allItems, editedPrices);
    const sections = ['Чаша бассейна', 'Оборудование', 'Подогрев', 'Дополнительное оборудование', 'Монтажные работы', 'Строительные работы', 'Строительные материалы'];

    const handleSave = () => {
        if (!estimateName.trim()) {
            toast.error('Введите название сметы');
            return;
        }

        const finalSelection = {
            ...selection,
            clientInfo: clientInfo
        };

        saveEstimate(estimateName, finalSelection, allItems, totalSum);
        toast.success('Смета сохранена');
        setShowSaveModal(false);
        setEstimateName('');
    };

    const handleSaveAsTemplate = () => {
        if (!templateName.trim()) {
            toast.error('Введите название шаблона');
            return;
        }

        saveTemplate(templateName, templateDescription, {
            selection,
            items: allItems,
            total: totalSum
        });

        toast.success('Шаблон сохранен');
        setShowTemplateModal(false);
        setTemplateName('');
        setTemplateDescription('');
    };

    const handleReorder = (section, reorderedItems) => {
        const otherItems = allItems.filter(item => (item.section || item.category) !== section);
        const newAllItems = [...otherItems, ...reorderedItems];
        setAllItems(newAllItems);
        toast.success('Порядок изменен');
    };

    const handleExportExcel = async () => {
        try {
            setIsExporting(true);
            await exportToExcel(allItems, totalSum, clientInfo);
            toast.success('Excel экспортирован');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            toast.error('Ошибка при экспорте в Excel');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            setIsExporting(true);
            await exportToPDF(allItems, totalSum, clientInfo);
            toast.success('PDF экспортирован');
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            toast.error('Ошибка при экспорте в PDF');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportContract = async () => {
        try {
            setIsExporting(true);
            await generateContract(clientInfo, totalSum);
            toast.success('Договор скачан');
        } catch (error) {
            console.error('Error exporting contract:', error);
            toast.error('Ошибка при скачивании договора');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportProposal = async () => {
        try {
            setIsExporting(true);
            const currentEstimate = JSON.parse(localStorage.getItem('mos-pool-current-estimate') || '{}');
            const estimateId = currentEstimate.id;
            await generateProposal(allItems, totalSum, clientInfo, estimateId);
            toast.success('Коммерческое предложение скачано');
        } catch (error) {
            console.error('Error exporting proposal:', error);
            toast.error('Ошибка при скачивании КП');
        } finally {
            setIsExporting(false);
        }
    };

    const handleSendWhatsApp = () => {
        try {
            if (!clientInfo.phone) {
                toast.error('Укажите номер телефона клиента');
                return;
            }
            sendToWhatsApp(clientInfo.phone, clientInfo, totalSum, allItems);
            toast.success('WhatsApp открыт');
        } catch (error) {
            console.error('Error sending to WhatsApp:', error);
            toast.error(error.message || 'Ошибка при открытии WhatsApp');
        }
    };

    const handleDeliveryCalculate = ({ cost, distance, address }) => {
        setDeliveryItem({
            id: 'delivery',
            name: `Доставка (${distance} км)`,
            quantity: 1,
            unit: 'услуга',
            price: cost,
            total: cost,
            category: 'Дополнительное оборудование'
        });
        toast.success(`Доставка рассчитана: ${cost} ₽`);
    };

    return (
        <div className="pb-20 space-y-6">
            {/* Header with Actions */}
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
                                        <ClientSelector onSelect={handleClientSelect} />
                                    </div>

                                    <div className="space-y-3">
                                        <AppleInput
                                            label="Имя"
                                            placeholder="Иван Иванов"
                                            value={clientInfo.name}
                                            onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                                        />
                                        <AppleInput
                                            label="Телефон"
                                            placeholder="+7 (999) 000-00-00"
                                            value={clientInfo.phone}
                                            onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-apple-border">
                                    <h4 className="text-sm font-medium text-apple-gray-500 mb-2">Менеджер</h4>
                                    <div className="space-y-3">
                                        <AppleInput
                                            label="Имя менеджера"
                                            value={clientInfo.managerName}
                                            onChange={(e) => setClientInfo({ ...clientInfo, managerName: e.target.value })}
                                        />
                                        <AppleInput
                                            label="Телефон менеджера"
                                            value={clientInfo.managerPhone}
                                            onChange={(e) => setClientInfo({ ...clientInfo, managerPhone: e.target.value })}
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
                        <DeliveryCalculator onCalculate={handleDeliveryCalculate} />
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
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <AppleCard variant="flat">
                            <div className="space-y-8">
                                {sections.map((section, sectionIndex) => {
                                    const sectionItems = allItems.filter(item => (item.section || item.category) === section);
                                    if (sectionItems.length === 0) return null;

                                    const sectionTotal = sectionItems.reduce((sum, item) => sum + getPrice(item.id, item.total), 0);

                                    return (
                                        <div key={section} className="space-y-4">
                                            <h3 className="apple-heading-3 pb-2 border-b border-apple-border">
                                                {section}
                                            </h3>
                                            <DraggableList
                                                items={sectionItems}
                                                onReorder={(reordered) => handleReorder(section, reordered)}
                                                className="space-y-2"
                                                renderItem={(item) => (
                                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-apple-bg-secondary transition-colors">
                                                        <div className="flex-1 pr-4">
                                                            <p className="apple-body font-medium">{item.name}</p>
                                                            {item.quantity && (
                                                                <p className="apple-caption">
                                                                    {item.quantity} {item.unit || 'шт'}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {isEditing ? (
                                                            <div className="flex items-center gap-2">
                                                                <AppleInput
                                                                    type="number"
                                                                    value={getPrice(item.id, item.total)}
                                                                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                                                    className="w-24 text-right"
                                                                />
                                                                <span className="apple-body">₽</span>
                                                            </div>
                                                        ) : (
                                                            <p className="apple-body font-bold whitespace-nowrap">
                                                                {(getPrice(item.id, item.total) || 0).toLocaleString('ru-RU')} ₽
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </AppleCard>
                    </motion.div>
                </div>
            </div>

            {/* Save Modal */}
            <AnimatePresence>
                {showSaveModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-apple-surface rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-apple-border"
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
                                    onChange={(e) => setEstimateName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSave()}
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
                            className="bg-apple-surface rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-apple-border"
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
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    className="mb-4"
                                    autoFocus
                                />
                                <AppleInput
                                    label="Описание (необязательно)"
                                    placeholder="Краткое описание конфигурации"
                                    value={templateDescription}
                                    onChange={(e) => setTemplateDescription(e.target.value)}
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
                            className="bg-apple-surface rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-apple-border"
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
                                <GanttChart items={allItems} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Catalog Selector */}
            <AnimatePresence>
                {showCatalogSelector && (
                    <CatalogSelector
                        category="all"
                        onSelect={(product) => {
                            const newItem = {
                                id: `custom-${Date.now()}`,
                                name: product.name,
                                quantity: 1,
                                unit: product.unit,
                                price: product.price,
                                total: product.price,
                                category: 'Дополнительное оборудование',
                            };
                            setCustomItems(prev => [...prev, newItem]);
                        }}
                        onClose={() => setShowCatalogSelector(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}