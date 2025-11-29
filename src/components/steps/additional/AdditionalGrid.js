'use client';
import { Check, Plus } from 'lucide-react';
import OptionCard from '../../premium/OptionCard';

export default function AdditionalGrid({ categories, optionsByCategory, selectedIds, onToggle }) {
    return (
        <div className="space-y-8">
            {categories.map(category => (
                <div key={category}>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 px-2 border-l-4 border-cyan-500 pl-3">
                        {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {optionsByCategory[category]?.map((option, index) => {
                            const isSelected = selectedIds.includes(option.id);
                            return (
                                <OptionCard
                                    key={option.id}
                                    title={option.name}
                                    description={option.description}
                                    price={option.price}
                                    image={isSelected ? <Check size={64} className="text-green-500" /> : <Plus size={64} className="text-cyan-500" />}
                                    selected={isSelected}
                                    onClick={() => onToggle(option)}
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
