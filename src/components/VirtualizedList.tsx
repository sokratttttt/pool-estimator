'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';

interface VirtualizedListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    itemHeight?: number;
    className?: string;
    overscan?: number;
}

/**
 * Виртуализированный список для оптимизации рендеринга
 * Используется для истории смет, списков клиентов и т.д.
 */
export default function VirtualizedList<T extends { id?: string | number }>({
    items,
    renderItem,
    itemHeight = 80,
    className = '',
    overscan = 5,
}: VirtualizedListProps<T>) {
    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => itemHeight,
        overscan,
    });

    const virtualItems = virtualizer.getVirtualItems();

    if (items.length === 0) {
        return null;
    }

    return (
        <div
            ref={parentRef}
            className={`overflow-auto ${className}`}
            style={{ height: '100%', maxHeight: 'calc(100vh - 250px)' }}
        >
            <div
                style={{
                    height: virtualizer.getTotalSize(),
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualItems.map((virtualRow) => {
                    const item = items[virtualRow.index];
                    return (
                        <motion.div
                            key={virtualRow.key}
                            data-index={virtualRow.index}
                            ref={virtualizer.measureElement}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            {renderItem(item, virtualRow.index)}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
