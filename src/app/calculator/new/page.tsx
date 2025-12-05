'use client';

import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { POOL_TEMPLATES, type PoolTemplate } from '@/data/pool-templates';
import { useRouter } from 'next/navigation';
import { Zap, FileText, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import AppleCard from '@/components/apple/AppleCard';

export default function NewEstimatePage() {
    const router = useRouter();

    const handleTemplateSelect = (template: PoolTemplate) => {
        // Сохраняем выбранный шаблон в localStorage
        localStorage.setItem('mos-pool-selected-template', JSON.stringify(template));
        router.push('/calculator/dimensions');
    };

    const handleQuickStart = (type: 'simple' | 'standard' | 'premium') => {
        let templateId = '';
        switch (type) {
            case 'simple': templateId = 'rect_6x3_skim'; break;
            case 'standard': templateId = 'rect_8x4_skim'; break;
            case 'premium': templateId = 'overflow_10x5'; break;
        }
        const template = POOL_TEMPLATES.find(t => t.id === templateId);
        if (template) handleTemplateSelect(template);
    };

    const handleCustomStart = () => {
        localStorage.removeItem('mos-pool-selected-template');
        router.push('/calculator/dimensions');
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-white mb-2">Создание новой сметы</h1>
                <p className="text-gray-400">
                    Выберите способ создания для максимальной эффективности
                </p>
            </motion.div>

            {/* Quick Start Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Zap size={20} className="text-yellow-400" />
                    <h2 className="text-xl font-semibold text-white">Быстрый старт</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Simple Pool */}
                    <button
                        onClick={() => handleQuickStart('simple')}
                        className="group p-6 bg-navy-light/50 border border-white/10 rounded-xl hover:border-cyan-500/50 hover:bg-navy-light transition-all text-left"
                    >
                        <div className="text-3xl mb-3">🏠</div>
                        <h3 className="text-lg font-semibold text-white mb-2">Простой бассейн</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Для частного дома, дачи. Скиммерный 6×3м
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                            <span className="flex items-center gap-1">
                                <Clock size={12} /> 2-3 недели
                            </span>
                            <span>≈ 450,000 ₽</span>
                        </div>
                        <div className="flex items-center gap-1 text-cyan-400 text-sm font-medium group-hover:gap-2 transition-all">
                            Начать <ArrowRight size={14} />
                        </div>
                    </button>

                    {/* Standard Pool */}
                    <button
                        onClick={() => handleQuickStart('standard')}
                        className="group p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 rounded-xl hover:border-cyan-500 transition-all text-left relative overflow-hidden"
                    >
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-cyan-500 text-[10px] font-bold rounded text-black">
                            ПОПУЛЯРНЫЙ
                        </div>
                        <div className="text-3xl mb-3">🏊</div>
                        <h3 className="text-lg font-semibold text-white mb-2">Стандартный бассейн</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Для загородного дома. Скиммерный 8×4м
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                            <span className="flex items-center gap-1">
                                <Clock size={12} /> 3-4 недели
                            </span>
                            <span>≈ 850,000 ₽</span>
                        </div>
                        <div className="flex items-center gap-1 text-cyan-400 text-sm font-medium group-hover:gap-2 transition-all">
                            Начать <ArrowRight size={14} />
                        </div>
                    </button>

                    {/* Premium Pool */}
                    <button
                        onClick={() => handleQuickStart('premium')}
                        className="group p-6 bg-navy-light/50 border border-white/10 rounded-xl hover:border-amber-500/50 hover:bg-navy-light transition-all text-left"
                    >
                        <div className="text-3xl mb-3">🌟</div>
                        <h3 className="text-lg font-semibold text-white mb-2">Премиум бассейн</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Переливной 10×5м с подсветкой
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                            <span className="flex items-center gap-1">
                                <Clock size={12} /> 4-6 недель
                            </span>
                            <span>≈ 1,500,000 ₽</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 text-sm font-medium group-hover:gap-2 transition-all">
                            Начать <ArrowRight size={14} />
                        </div>
                    </button>
                </div>
            </motion.div>

            {/* Template Selector */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 mb-4">
                    <FileText size={20} className="text-cyan-bright" />
                    <h2 className="text-xl font-semibold text-white">Все шаблоны</h2>
                </div>

                <TemplateSelector
                    onSelect={handleTemplateSelect}
                    isModal={false}
                    defaultCategory="popular"
                    className="bg-navy-light/30 rounded-xl p-4"
                />
            </motion.div>

            {/* Custom Start */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <AppleCard variant="flat">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white font-semibold mb-1">Начать с нуля</h3>
                            <p className="text-sm text-gray-400">
                                Для нестандартных проектов — полный контроль над всеми параметрами
                            </p>
                        </div>
                        <button
                            onClick={handleCustomStart}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
                        >
                            Пустой проект →
                        </button>
                    </div>
                </AppleCard>
            </motion.div>
        </div>
    );
}
