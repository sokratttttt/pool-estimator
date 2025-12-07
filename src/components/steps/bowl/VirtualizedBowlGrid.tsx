'use client';

import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Waves } from 'lucide-react';
import OptionCard from '../../premium/OptionCard';

import { Bowl } from '@/types';

interface BowlDimensions {
    length?: string | number;
    width?: string | number;
    depth?: string | number;
}

interface VirtualizedBowlGridProps {
    bowls?: Bowl[];
    onSelect?: (bowl: Bowl) => void;
    selectedId?: string;
    getDimensions: (bowl: Bowl) => BowlDimensions;
    getManufacturer: (bowl: Bowl) => string;
    columns?: number;
    estimateHeight?: number;
}

/**
 * Виртуализированный grid для чаш
 * Использует @tanstack/react-virtual для эффективного рендеринга больших списков
 */
export default function VirtualizedBowlGrid({
    bowls = [],
    onSelect,
    selectedId,
    getDimensions,
    getManufacturer,
    columns = 3,
    estimateHeight = 340,
}: VirtualizedBowlGridProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    // Группируем чаши в строки
    const rows = useMemo(() => {
        const result: Bowl[][] = [];
        for (let i = 0; i < bowls.length; i += columns) {
            result.push(bowls.slice(i, i + columns));
        }
        return result;
    }, [bowls, columns]);

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => estimateHeight,
        overscan: 2,
    });

    // Если мало элементов - не виртуализируем
    if (bowls.length <= columns * 2) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bowls.map((bowl, index) => (
                    <BowlCard
                        key={bowl.id}
                        bowl={bowl}
                        index={index}
                        onSelect={onSelect}
                        selectedId={selectedId}
                        getDimensions={getDimensions}
                        getManufacturer={getManufacturer}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            ref={parentRef}
            className="h-[70vh] overflow-auto"
            style={{ contain: 'strict' }}
        >
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                        <div
                            key={virtualRow.key}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full px-1">
                                {row.map((bowl, colIndex) => (
                                    <BowlCard
                                        key={bowl.id}
                                        bowl={bowl}
                                        index={virtualRow.index * columns + colIndex}
                                        onSelect={onSelect}
                                        selectedId={selectedId}
                                        getDimensions={getDimensions}
                                        getManufacturer={getManufacturer}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Вспомогательный компонент для карточки чаши
function BowlCard({
    bowl,
    index,
    onSelect,
    selectedId,
    getDimensions,
    getManufacturer,
}: {
    bowl: Bowl;
    index: number;
    onSelect?: (bowl: Bowl) => void;
    selectedId?: string;
    getDimensions: (bowl: Bowl) => BowlDimensions;
    getManufacturer: (bowl: Bowl) => string;
}) {
    const dims = getDimensions(bowl);
    const depthValue = dims.depth ? parseFloat(String(dims.depth)) : 1.5;
    const length = dims.length ? parseFloat(String(dims.length)) : 0;
    const width = dims.width ? parseFloat(String(dims.width)) : 0;
    const volume = bowl.volume || (length * width * depthValue).toFixed(1);

    return (
        <OptionCard
            title={bowl.name}
            description={`${dims.length || '?'} × ${dims.width || '?'} × ${dims.depth || '?'}м • ${volume}м³`}
            price={bowl.price}
            image={typeof bowl.image === 'string' ? bowl.image : (bowl.image_url || <Waves size={64} className="text-cyan-600" />)}
            selected={selectedId === bowl.id}
            onClick={() => onSelect?.(bowl)}
            badge={getManufacturer(bowl)}
            delay={Math.min(index * 0.03, 0.3)} // Ограничиваем delay для больших списков
        />
    );
}
