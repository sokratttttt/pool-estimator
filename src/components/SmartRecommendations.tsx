'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, TrendingUp, Shield, Droplet, ThermometerSun } from 'lucide-react';
import type { Dimensions, Product } from '@/types';

// Локальный интерфейс для Selection (чтобы не зависеть от контекста)
interface Selection {
    filtration?: { flowRate?: number; id?: string; name?: string; price?: number };
    heating?: { id?: string; name?: string; price?: number };
    additional?: Array<{ id?: string; category?: string; name?: string; price?: number; quantity?: number }>;
}

interface Recommendation {
    id: string;
    type: 'upgrade' | 'upsell' | 'bundle' | 'safety';
    title: string;
    reason: string;
    price: number;
    icon: React.ReactNode;
    product?: Product;
    onApply: () => void;
}

interface SmartRecommendationsProps {
    selection: Selection;
    dimensions: Dimensions;
    volume: number;
    onAddItem: (item: Product) => void;
    className?: string;
}

/**
 * Умные рекомендации на основе текущей конфигурации
 */
export default function SmartRecommendations({
    selection,
    dimensions,
    volume,
    onAddItem,
    className = '',
}: SmartRecommendationsProps) {
    const recommendations = useMemo<Recommendation[]>(() => {
        const recs: Recommendation[] = [];

        // 1. Рекомендация по фильтрации
        if (selection.filtration) {
            const requiredFlow = volume / 4; // 4 часа оборот
            const currentFlow = (selection.filtration as { flowRate?: number }).flowRate || 0;

            if (currentFlow < requiredFlow) {
                recs.push({
                    id: 'filtration-upgrade',
                    type: 'upgrade',
                    title: 'Увеличить мощность фильтрации',
                    reason: `Для ${volume}м³ рекомендуем ${Math.ceil(requiredFlow)}м³/ч`,
                    price: 15000,
                    icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
                    onApply: () => {
                        // Логика применения
                    },
                });
            }
        }

        // 2. Рекомендация покрывала
        const hasPoolCover = selection.additional?.some(
            (item) => (item as { category?: string }).category === 'covers'
        );
        if (!hasPoolCover) {
            recs.push({
                id: 'pool-cover',
                type: 'safety',
                title: 'Защитное покрывало',
                reason: 'Безопасность детей и чистота воды',
                price: 25000,
                icon: <Shield className="w-5 h-5 text-green-500" />,
                onApply: () => {
                    onAddItem({
                        id: 'cover-standard',
                        name: 'Защитное покрывало',
                        category: 'covers',
                        price: 25000,
                    } as Product);
                },
            });
        }

        // 3. Рекомендация подогрева для больших бассейнов
        if (volume > 40 && !selection.heating) {
            recs.push({
                id: 'heating-recommend',
                type: 'upsell',
                title: 'Система подогрева',
                reason: `Для комфортного купания в ${volume}м³`,
                price: 85000,
                icon: <ThermometerSun className="w-5 h-5 text-orange-500" />,
                onApply: () => {
                    // Логика добавления подогрева
                },
            });
        }

        // 4. Рекомендация противотока для длинных бассейнов
        if ((dimensions.length || 0) >= 8) {
            const hasCounterCurrent = selection.additional?.some(
                (item) => (item as { id?: string }).id?.includes('counter')
            );
            if (!hasCounterCurrent) {
                recs.push({
                    id: 'counter-current',
                    type: 'upsell',
                    title: 'Противоток для плавания',
                    reason: 'Бесконечный бассейн в ограниченном пространстве',
                    price: 120000,
                    icon: <Droplet className="w-5 h-5 text-cyan-500" />,
                    onApply: () => {
                        onAddItem({
                            id: 'counter-current-pro',
                            name: 'Противоток Pahlen JetSwim',
                            category: 'accessories',
                            price: 120000,
                        } as Product);
                    },
                });
            }
        }

        return recs.slice(0, 3); // Максимум 3 рекомендации
    }, [selection, dimensions, volume, onAddItem]);

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                p-4 bg-gradient-to-r from-amber-50 to-orange-50 
                dark:from-amber-900/20 dark:to-orange-900/20
                rounded-2xl border border-amber-200 dark:border-amber-800
                ${className}
            `}
        >
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                    Рекомендации для вас
                </h4>
            </div>

            <div className="space-y-2">
                <AnimatePresence>
                    {recommendations.map((rec, index) => (
                        <motion.div
                            key={rec.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ x: 4, scale: 1.01 }}
                            onClick={rec.onApply}
                            className="
                                flex items-center justify-between p-3
                                bg-white/80 dark:bg-slate-800/80
                                rounded-xl cursor-pointer
                                hover:shadow-md transition-all
                                border border-transparent hover:border-amber-300
                            "
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm">
                                    {rec.icon}
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-slate-900 dark:text-white">
                                        {rec.title}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {rec.reason}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                    +{rec.price.toLocaleString('ru-RU')} ₽
                                </span>
                                <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600">
                                    <Plus className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
