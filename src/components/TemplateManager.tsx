'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTemplates } from '@/context/TemplateContext';
import { useEstimate } from '@/context/EstimateContext';
import { Save, FolderOpen, Trash2, X, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Template } from '@/types/template';

interface TemplateManagerProps {
    onClose?: () => void;
    embedded?: boolean;
}

export default function TemplateManager({ onClose, embedded = false }: TemplateManagerProps) {
    const { templates, saveTemplate, deleteTemplate } = useTemplates();
    const { selection, setSelection } = useEstimate();
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');

    const handleSave = () => {
        if (!templateName.trim()) {
            toast.error('Введите название шаблона');
            return;
        }

        saveTemplate(templateName, templateDescription, selection);
        toast.success('Шаблон сохранен');
        setShowSaveModal(false);
        setTemplateName('');
        setTemplateDescription('');
    };

    const handleLoad = (template: Template) => {
        setSelection(template.config as unknown as Parameters<typeof setSelection>[0]);
        toast.success(`Загружен шаблон: ${template.name}`);
        if (onClose) onClose();
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Удалить шаблон "${name}"?`)) {
            deleteTemplate(id);
            toast.success('Шаблон удален');
        }
    };

    const Content = (
        <div className={`flex flex-col h-full ${embedded ? '' : 'bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-hidden'}`}>
            {/* Header - only show if not embedded */}
            {!embedded && (
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Шаблоны смет</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-slate-500" />
                    </button>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setShowSaveModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00b4d8] text-white rounded-lg hover:bg-[#0096c7] transition-colors"
                >
                    <Save size={18} />
                    Сохранить текущую конфигурацию
                </button>
            </div>

            {/* Templates List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                {templates.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Нет сохраненных шаблонов</p>
                        <p className="text-sm mt-2">Создайте первый шаблон для быстрого доступа</p>
                    </div>
                ) : (
                    templates.map((template: Template, index: number) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                        {template.name}
                                    </h3>
                                    {template.description && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                            {template.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                                        <span>
                                            {new Date(template.createdAt).toLocaleDateString('ru-RU')}
                                        </span>
                                        {template.config.material && (
                                            <span className="px-2 py-1 bg-[#00b4d8]/10 text-[#00b4d8] rounded">
                                                {template.config.material.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleLoad(template)}
                                        className="p-2 text-[#00b4d8] hover:bg-[#00b4d8]/10 rounded-lg transition-colors"
                                        title="Загрузить"
                                    >
                                        <FolderOpen size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template.id, template.name)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                        title="Удалить"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Save Modal */}
            <AnimatePresence>
                {showSaveModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full"
                        >
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                Сохранить шаблон
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Название *
                                    </label>
                                    <input
                                        type="text"
                                        value={templateName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemplateName(e.target.value)}
                                        placeholder="Например: Бюджетный 6x3"
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8] bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Описание
                                    </label>
                                    <textarea
                                        value={templateDescription}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTemplateDescription(e.target.value)}
                                        placeholder="Краткое описание конфигурации"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8] bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowSaveModal(false)}
                                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 px-4 py-2 bg-[#00b4d8] text-white rounded-lg hover:bg-[#0096c7] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} />
                                        Сохранить
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    // Return with conditional wrapper
    if (embedded) {
        return Content;
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {Content}
            </motion.div>
        </div>
    );
}
