'use client';
import { materials } from '@/data/materials';
import { useEstimate } from '@/context/EstimateContext';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle2, Info, Layers, Sparkles } from 'lucide-react';
import AppleCard from '../apple/AppleCard';

export default function MaterialStep() {
    const { selection, updateSelection } = useEstimate();

    const handleSelect = (material) => {
        updateSelection('material', material);
        updateSelection('bowl', null);
        updateSelection('dimensions', null);
    };

    // Image mapping for materials
    const materialImages = {
        'concrete': '',
        'composite': '',
    };

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-2xl mx-auto mb-10"
            >
                <h2 className="apple-heading-2 mb-4">
                    Выберите тип бассейна
                </h2>
                <p className="apple-body-secondary">Основа вашего будущего проекта</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {materials.map((material, index) => (
                    <motion.div
                        key={material.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <AppleCard
                            hover
                            onClick={() => handleSelect(material)}
                            className={`cursor-pointer transition-all ${selection.material?.id === material.id
                                ? 'ring-2 ring-apple-primary shadow-lg'
                                : ''
                                }`}
                        >
                            {/* Image */}
                            <div className="relative h-48 bg-apple-bg-secondary rounded-lg mb-4 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-apple-primary">
                                        {material.id === 'concrete' ? (
                                            <Layers size={40} strokeWidth={1} />
                                        ) : (
                                            <Sparkles size={40} strokeWidth={1} />
                                        )}
                                    </div>
                                </div>
                                {selection.material?.id === material.id && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-3 right-3 bg-green-500 rounded-full p-2"
                                    >
                                        <CheckCircle2 size={24} className="text-white" />
                                    </motion.div>
                                )}
                            </div>

                            {/* Content */}
                            <h3 className="apple-heading-3 mb-2">{material.name}</h3>
                            <p className="apple-body-secondary mb-4">{material.description}</p>

                            {/* Features */}
                            <div className="space-y-2 mb-4">
                                {material.features?.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="apple-caption">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Price Range */}
                            {material.priceRange && (
                                <div className="pt-4 border-t border-apple-border">
                                    <p className="apple-caption mb-1">Стоимость от:</p>
                                    <p className="apple-heading-3 text-apple-primary">
                                        {material.priceRange}
                                    </p>
                                </div>
                            )}
                        </AppleCard>
                    </motion.div>
                ))}
            </div>

            {/* Info Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="max-w-3xl mx-auto mt-12"
            >
                <AppleCard variant="flat">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Info size={24} className="text-apple-primary" />
                            </div>
                        </div>
                        <div>
                            <h4 className="apple-heading-3 mb-2">Как выбрать?</h4>
                            <p className="apple-body-secondary mb-3">
                                Бетонные бассейны подходят для индивидуальных проектов с уникальными формами и размерами.
                                Композитные чаши — это готовое решение с быстрой установкой и минимальным обслуживанием.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-apple-bg-secondary rounded-lg p-4">
                                    <h5 className="font-semibold mb-2">🏗️ Бетонный</h5>
                                    <ul className="space-y-1 apple-caption">
                                        <li>• Любые формы и размеры</li>
                                        <li>• Долговечность 50+ лет</li>
                                        <li>• Требует отделки</li>
                                    </ul>
                                </div>
                                <div className="bg-apple-bg-secondary rounded-lg p-4">
                                    <h5 className="font-semibold mb-2">✨ Композитный</h5>
                                    <ul className="space-y-1 apple-caption">
                                        <li>• Быстрая установка (1-2 дня)</li>
                                        <li>• Гладкая поверхность</li>
                                        <li>• Готовые размеры</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </AppleCard>
            </motion.div>
        </div>
    );
}
