'use client';
import { motion } from 'framer-motion';
import { useEstimate } from '@/context/EstimateContext';
import { additionalOptions } from '@/data/additional';
import { Check, Plus } from 'lucide-react';
import OptionCard from '../premium/OptionCard';

export default function AdditionalStep() {
    const { selection, updateSelection, catalog } = useEstimate();
    const selectedIds = selection.additional?.map(i => i.id) || [];

    // Use catalog data if available
    const displayOptions = catalog?.additional?.length > 0 ? catalog.additional : additionalOptions;

    const toggleOption = (option) => {
        let newAdditional;
        if (selectedIds.includes(option.id)) {
            newAdditional = selection.additional.filter(i => i.id !== option.id);
        } else {
            newAdditional = [...(selection.additional || []), option];
        }
        updateSelection('additional', newAdditional);
    };

    // Group by category
    const categories = [...new Set(displayOptions.map(o => o.category))];

    return (
        <div className="space-y-8 pb-20">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Дополнительные опции</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Выберите оборудование для комфорта и развлечений
                </p>
            </motion.div>

            {categories.map(category => (
                <div key={category}>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 px-2 border-l-4 border-cyan-500 pl-3">
                        {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {displayOptions.filter(o => o.category === category).map((option, index) => {
                            const isSelected = selectedIds.includes(option.id);
                            return (
                                <OptionCard
                                    key={option.id}
                                    title={option.name}
                                    description={option.description}
                                    price={option.price}
                                    image={isSelected ? <Check size={64} className="text-green-500" /> : <Plus size={64} className="text-cyan-500" />}
                                    selected={isSelected}
                                    onClick={() => toggleOption(option)}
                                    badge={isSelected ? 'Выбрано' : null}
                                    delay={index * 0.05}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
