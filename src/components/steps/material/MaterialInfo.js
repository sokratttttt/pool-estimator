'use client';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import AppleCard from '../../apple/AppleCard';

export default function MaterialInfo() {
    return (
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
    );
}
