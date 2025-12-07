'use client';

import { Waves } from 'lucide-react';
import OptionCard from '../../premium/OptionCard';

import { Bowl } from '@/types';

interface BowlDimensions {
    length?: string | number;
    width?: string | number;
    depth?: string | number;
}

interface BowlGridProps {
    bowls?: Bowl[];
    onSelect?: (bowl: Bowl) => void;
    selectedId?: string;
    getDimensions: (bowl: Bowl) => BowlDimensions;
    getManufacturer: (bowl: Bowl) => string;
}

export default function BowlGrid({ bowls = [], onSelect, selectedId, getDimensions, getManufacturer }: BowlGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bowls.map((bowl: Bowl, index: number) => {
                const dims = getDimensions(bowl);
                const depthValue = dims.depth ? parseFloat(String(dims.depth)) : 1.5;
                const length = dims.length ? parseFloat(String(dims.length)) : 0;
                const width = dims.width ? parseFloat(String(dims.width)) : 0;
                const volume = bowl.volume || (length * width * depthValue).toFixed(1);

                return (
                    <OptionCard
                        key={bowl.id}
                        title={bowl.name}
                        description={`${dims.length || '?'} × ${dims.width || '?'} × ${dims.depth || '?'}м • ${volume}м³`}
                        price={bowl.price}
                        image={typeof bowl.image === 'string' ? bowl.image : (bowl.image_url || <Waves size={64} className="text-cyan-600" />)}
                        selected={selectedId === bowl.id}
                        onClick={() => onSelect?.(bowl)}
                        badge={getManufacturer(bowl)}
                        delay={index * 0.05}
                    />
                );
            })}
        </div>
    );
}
