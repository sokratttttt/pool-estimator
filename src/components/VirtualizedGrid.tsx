'use client';

import { useRef, type ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';

interface VirtualizedGridProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    itemHeight?: number;
    columns?: number;
    gap?: number;
    className?: string;
    overscan?: number;
}

/**
 * Виртуализированная сетка для оптимизации рендеринга больших списков
 * Рендерит только видимые элементы + overscan
 */
export default function VirtualizedGrid<T extends { id?: string | number }>({
    items,
    renderItem,
    itemHeight = 200,
    columns = 3,
    gap = 16,
    className = '',
    overscan = 3,
}: VirtualizedGridProps<T>) {
    const parentRef = useRef<HTMLDivElement>(null);

    // Группируем элементы по строкам
    const rows = Math.ceil(items.length / columns);

    const virtualizer = useVirtualizer({
        count: rows,
        getScrollElement: () => parentRef.current,
        estimateSize: () => itemHeight + gap,
        overscan,
    });

    const virtualRows = virtualizer.getVirtualItems();

    return (
        <div
            ref={parentRef}
            className={`overflow-auto ${className}`}
            style={{ height: '100%', maxHeight: 'calc(100vh - 300px)' }}
        >
            <div
                style={{
                    height: virtualizer.getTotalSize(),
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualRows.map((virtualRow) => {
                    const rowIndex = virtualRow.index;
                    const startIndex = rowIndex * columns;
                    const rowItems = items.slice(startIndex, startIndex + columns);

                    return (
                        <div
                            key={virtualRow.key}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <div
                                className="grid"
                                style={{
                                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                                    gap: `${gap}px`,
                                }}
                            >
                                {rowItems.map((item, colIndex) => (
                                    <motion.div
                                        key={item.id || startIndex + colIndex}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: colIndex * 0.05 }}
                                    >
                                        {renderItem(item, startIndex + colIndex)}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
