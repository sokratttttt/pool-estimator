'use client';
import { useEstimate } from '@/context/EstimateContext';
import { Flame, Ban } from 'lucide-react';
import CatalogImporter from '../CatalogImporter';
import OptionCard from '../premium/OptionCard';
import { motion } from 'framer-motion';

export default function HeatingStep() {
    const { selection, updateSelection, catalog } = useEstimate();

    // Use catalog data if available, otherwise fallback to empty or initial state
    const heatingOptions = catalog?.heating || [];

    const handleSelect = (option) => {
        if (selection.heating?.id === option.id) {
            updateSelection('heating', null);
        } else {
            updateSelection('heating', option);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Система подогрева</h2>
                    <p className="text-slate-500 dark:text-slate-400">Комфортная температура воды в любое время года</p>
                </motion.div>
                <CatalogImporter type="heating" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {heatingOptions.map((option, index) => (
                    <OptionCard
                        key={option.id}
                        title={option.name}
                        description={option.description || 'Описание отсутствует'}
                        price={option.price}
                        image={option.type === 'none' ? <Ban size={40} className="text-slate-400" /> : <Flame size={40} className="text-orange-500" />}
                        selected={selection.heating?.id === option.id}
                        onClick={() => handleSelect(option)}
                        delay={index * 0.05}
                        badge={option.type === 'heat_pump' ? 'Энергоэффективно' : null}
                    />
                ))}
            </div>
        </div>
    );
}

