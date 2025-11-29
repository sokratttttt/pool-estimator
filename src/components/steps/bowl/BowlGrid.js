'use client';
import { motion } from 'framer-motion';
import { Waves } from 'lucide-react';
import OptionCard from '../../premium/OptionCard';

export default function BowlGrid({ bowls, onSelect, selectedId, getDimensions, getManufacturer }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bowls.map((bowl, index) => {
                const dims = getDimensions(bowl);
                const depthValue = dims.depth ? parseFloat(dims.depth) : 1.5;
                const length = dims.length ? parseFloat(dims.length) : 0;
                const width = dims.width ? parseFloat(dims.width) : 0;
                const volume = bowl.volume || (length * width * depthValue).toFixed(1);

                return (
                    <OptionCard
                        key={bowl.id}
                        title={bowl.name}
                        description={`${dims.length || '?'} × ${dims.width || '?'} × ${dims.depth || '?'}м • ${volume}м³`}
                        price={bowl.price}
                        image={bowl.image || <Waves size={64} className="text-cyan-600" />}
                        selected={selectedId === bowl.id}
                        onClick={() => onSelect(bowl)}
                        badge={getManufacturer(bowl)}
                        delay={index * 0.05}
                    />
                );
            })}
        </div>
    );
}
