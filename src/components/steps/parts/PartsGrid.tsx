'use client';
import { Wrench } from 'lucide-react';
import OptionCard from '../../premium/OptionCard';

interface PartsOption {
    id: string;
    name: string;
    material: string;
    items: { price: number }[];
}

interface PartsGridProps {
    options?: PartsOption[];
    selection?: PartsOption;
    onSelect?: (item: PartsOption) => void;
}

export default function PartsGrid({ options = [], selection, onSelect }: PartsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {options.map((option: PartsOption, index: number) => (
                <OptionCard
                    key={option.id}
                    title={option.name}
                    description={`Материал: ${option.material}`}
                    price={option.items.reduce((sum: number, item: { price: number }) => sum + item.price, 0)}
                    image={<Wrench size={40} className="text-slate-500" />}
                    selected={selection?.id === option.id}
                    onClick={() => onSelect?.(option)}
                    delay={index * 0.05}
                    badge={option.id === 'stainless' ? 'Premium' : 'Standard'}
                />
            ))}
        </div>
    );
}
