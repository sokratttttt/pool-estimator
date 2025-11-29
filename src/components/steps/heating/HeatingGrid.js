'use client';
import { Flame, Ban } from 'lucide-react';
import OptionCard from '../../premium/OptionCard';

export default function HeatingGrid({ options, selection, onSelect }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {options.map((option, index) => (
                <OptionCard
                    key={option.id}
                    title={option.name}
                    description={option.description || 'Описание отсутствует'}
                    price={option.price}
                    image={option.type === 'none' ? <Ban size={40} className="text-slate-400" /> : <Flame size={40} className="text-orange-500" />}
                    selected={selection?.id === option.id}
                    onClick={() => onSelect(option)}
                    delay={index * 0.05}
                    badge={option.type === 'heat_pump' ? 'Энергоэффективно' : null}
                />
            ))}
        </div>
    );
}
