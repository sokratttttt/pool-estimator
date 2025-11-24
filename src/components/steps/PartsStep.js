'use client';
import { embeddedParts as partsOptions } from '@/data/parts';
import { useEstimate } from '@/context/EstimateContext';
import { Layers, Wrench } from 'lucide-react';
import OptionCard from '../premium/OptionCard';
import { motion } from 'framer-motion';

export default function PartsStep() {
    const { selection, updateSelection } = useEstimate();

    const handleSelect = (option) => {
        if (selection.parts?.id === option.id) {
            updateSelection('parts', null);
        } else {
            updateSelection('parts', option);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Закладные элементы</h2>
                <p className="text-slate-500 dark:text-slate-400">Выберите материал закладных элементов чаши</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {partsOptions.map((option, index) => (
                    <OptionCard
                        key={option.id}
                        title={option.name}
                        description={`Материал: ${option.material}`}
                        price={option.items.reduce((sum, item) => sum + item.price, 0)}
                        image={<Wrench size={40} className="text-slate-500" />}
                        selected={selection.parts?.id === option.id}
                        onClick={() => handleSelect(option)}
                        delay={index * 0.05}
                        badge={option.id === 'stainless' ? 'Premium' : 'Standard'}
                    />
                ))}
            </div>
        </div>
    );
}

