'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEstimate } from '@/context/EstimateContext';
import { useTemplates } from '@/context/TemplateContext';
import type { Template } from '@/types/template';
import { Save, Trash2, Plus, FileText, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import AppleCard from '@/components/apple/AppleCard';
import AppleButton from '@/components/apple/AppleButton';
import { motion } from 'framer-motion';

export default function TemplatesPage() {
    const router = useRouter();
    const { selection, setSelection } = useEstimate();
    const { templates, saveTemplate, deleteTemplate } = useTemplates();
    const [templateName, setTemplateName] = useState('');
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    // Сохранение текущей сметы как шаблон
    const saveAsTemplate = () => {
        if (!templateName.trim()) {
            toast.error('Введите название шаблона');
            return;
        }

        saveTemplate(templateName, '', selection as import('@/types/estimate-utils').Selection);
        setTemplateName('');
        setShowSaveDialog(false);
    };

    // Загрузка шаблона
    const loadTemplate = (template: Template) => {
        const config = template.config as typeof selection | undefined;
        if (config) {
            setSelection(config);
            localStorage.setItem('pool-estimate-selection', JSON.stringify(config));
            toast.success(`Шаблон "${template.name}" загружен`);

            // Navigate to calculator
            router.push('/calculator?step=summary');
        } else {
            toast.error('Неверный формат шаблона');
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                        Шаблоны смет
                    </h1>
                    <p className="text-gray-400">
                        Сохраняйте часто используемые конфигурации для быстрого доступа
                    </p>
                </div>
                <AppleButton
                    variant="primary"
                    icon={<Plus size={20} />}
                    onClick={() => setShowSaveDialog(true)}
                >
                    Сохранить текущую смету
                </AppleButton>
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <AppleCard variant="premium">
                        <h3 className="text-lg font-bold text-white mb-4">
                            Сохранить как шаблон
                        </h3>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={templateName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemplateName(e.target.value)}
                                placeholder="Название шаблона..."
                                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-bright"
                                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && saveAsTemplate()}
                            />
                            <AppleButton variant="primary" onClick={saveAsTemplate}>
                                <Save size={20} />
                                Сохранить
                            </AppleButton>
                            <AppleButton variant="secondary" onClick={() => setShowSaveDialog(false)}>
                                Отмена
                            </AppleButton>
                        </div>
                    </AppleCard>
                </motion.div>
            )}

            {/* Templates Grid */}
            {templates.length === 0 ? (
                <AppleCard variant="flat" className="text-center py-12">
                    <FileText size={64} className="mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">
                        Нет сохраненных шаблонов
                    </h3>
                    <p className="text-gray-400 mb-6">
                        Создайте смету и сохраните её как шаблон для быстрого доступа
                    </p>
                    <AppleButton
                        variant="primary"
                        icon={<Plus size={20} />}
                        onClick={() => setShowSaveDialog(true)}
                    >
                        Создать первый шаблон
                    </AppleButton>
                </AppleCard>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {templates.map(template => (
                        <motion.div key={template.id} variants={item}>
                            <AppleCard variant="glass" className="h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white text-lg mb-1">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {new Date(template.createdAt).toLocaleDateString('ru-RU')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteTemplate(template.id)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} className="text-red-400" />
                                    </button>
                                </div>

                                {/* Description */}
                                {template.description && (
                                    <p className="text-sm text-gray-400 mb-4">{template.description}</p>
                                )}

                                {/* Template Info */}
                                <div className="space-y-2 mb-4 text-sm text-gray-300">
                                    {(() => {
                                        const cfg = template.config as { material?: { name: string }; bowl?: { name: string }; dimensions?: { length: number; width: number; depth: number } } | undefined;
                                        return (
                                            <>
                                                {cfg?.material && (
                                                    <div>
                                                        <span className="text-gray-500">Материал:</span>{' '}
                                                        {cfg.material.name}
                                                    </div>
                                                )}
                                                {cfg?.bowl && (
                                                    <div>
                                                        <span className="text-gray-500">Чаша:</span>{' '}
                                                        {cfg.bowl.name}
                                                    </div>
                                                )}
                                                {cfg?.dimensions && (
                                                    <div>
                                                        <span className="text-gray-500">Размеры:</span>{' '}
                                                        {cfg.dimensions.length}x
                                                        {cfg.dimensions.width}x
                                                        {cfg.dimensions.depth}м
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>

                                <AppleButton
                                    variant="primary"
                                    icon={<ArrowRight size={18} />}
                                    onClick={() => loadTemplate(template)}
                                    className="w-full"
                                >
                                    Использовать шаблон
                                </AppleButton>
                            </AppleCard>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
