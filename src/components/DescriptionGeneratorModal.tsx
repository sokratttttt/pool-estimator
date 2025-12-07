'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Sparkles } from 'lucide-react';
import { generateVariations, EstimateData } from '@/lib/descriptionGenerator';
import { toast } from 'sonner';

// Define types locally for now if not available globally, or use object/Record if structure varies
interface DescriptionGeneratorModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    estimate?: EstimateData;
    text?: string;
}

export default function DescriptionGeneratorModal({ isOpen, onClose, estimate }: DescriptionGeneratorModalProps) {
    const [activeTab, setActiveTab] = useState('formal');
    const [descriptions, setDescriptions] = useState<Record<string, string> | null>(null);

    const handleGenerate = () => {
        try {
            if (!estimate) {
                toast.error('Нет данных для генерации');
                return;
            }
            const variations = generateVariations(estimate);
            setDescriptions(variations);
            toast.success('Описание сгенерировано!');
        } catch (error) {
            console.error('Error generating description:', error);
            toast.error('Ошибка генерации');
        }
    };

    const handleCopy = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success('Скопировано в буфер обмена!');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                    className="bg-navy-deep border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Sparkles size={28} />
                                <div>
                                    <h2 className="text-2xl font-bold">AI Генератор описаний</h2>
                                    <p className="text-purple-100 text-sm">Создайте продающее описание за секунду</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                        {!descriptions ? (
                            <div className="text-center py-12">
                                <Sparkles size={64} className="mx-auto text-purple-500 mb-4" />
                                <h3 className="text-xl font-semibold mb-2 text-white">Готовы создать описание?</h3>
                                <p className="text-gray-400 mb-6">
                                    AI проанализирует ваш проект и создаст 4 варианта описания
                                </p>
                                <button
                                    onClick={() => handleGenerate()}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-glow"
                                >
                                    ✨ Сгенерировать описания
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Tabs */}
                                <div className="flex gap-2 mb-6 border-b border-white/10">
                                    {[
                                        { key: 'formal', label: '📄 Официальное', desc: 'Для договоров' },
                                        { key: 'casual', label: '💬 Дружеское', desc: 'Для WhatsApp' },
                                        { key: 'technical', label: '🔧 Техническое', desc: 'Спецификация' },
                                        { key: 'short', label: '📱 Короткое', desc: 'Для SMS' }
                                    ].map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`px-4 py-3 rounded-t-lg font-medium transition-colors text-left ${activeTab === tab.key
                                                ? 'bg-purple-500/20 text-purple-300 border-b-2 border-purple-500'
                                                : 'text-gray-400 hover:bg-white/5'
                                                }`}
                                        >
                                            <div>{tab.label}</div>
                                            <div className="text-xs opacity-70">{tab.desc}</div>
                                        </button>
                                    ))}
                                </div>

                                {/* Description */}
                                <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-4 relative">
                                    <button
                                        onClick={() => handleCopy(descriptions[activeTab])}
                                        className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                        title="Копировать"
                                    >
                                        <Copy size={20} className="text-gray-300" />
                                    </button>

                                    <pre className="whitespace-pre-wrap font-sans text-gray-200 leading-relaxed">
                                        {descriptions[activeTab]}
                                    </pre>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleGenerate()}
                                        className="flex-1 px-4 py-2 bg-white/5 text-purple-300 border border-purple-500/30 rounded-lg font-medium hover:bg-purple-500/10 transition-colors"
                                    >
                                        🔄 Пересоздать
                                    </button>
                                    <button
                                        onClick={() => handleCopy(descriptions[activeTab])}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-glow"
                                    >
                                        📋 Копировать текущее
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
