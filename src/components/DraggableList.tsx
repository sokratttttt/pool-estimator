'use client';
import { useState } from 'react';
import { GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface DraggableListProps<T> {
    items?: T[];
    onReorder?: (items: T[]) => void;
    renderItem?: (item: T, index: number) => React.ReactNode;
    className?: string;
}

export default function DraggableList<T extends { id?: string | number }>({ items = [], onReorder, renderItem, className = '' }: DraggableListProps<T>) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // e.dataTransfer.setData('text/html', e.currentTarget); 
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (index !== draggedIndex) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const newItems = [...items];
        const [removed] = newItems.splice(draggedIndex, 1);
        newItems.splice(dropIndex, 0, removed);

        if (onReorder) {
            onReorder(newItems);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className={className}>
            {items.map((item: T, index: number) => (
                <motion.div
                    key={item.id || index}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, index)}
                    onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent<HTMLDivElement>, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e as unknown as React.DragEvent<HTMLDivElement>, index)}
                    onDragEnd={handleDragEnd}
                    className={`
                        group relative cursor-move transition-all
                        ${draggedIndex === index ? 'opacity-50 scale-95' : 'opacity-100'}
                        ${dragOverIndex === index ? 'border-t-2 border-cyan-500 pt-2' : ''}
                    `}
                >
                    <div className="flex items-start gap-3">
                        {/* Drag Handle */}
                        <div className="flex-shrink-0 pt-3 opacity-40 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                            <GripVertical size={20} className="text-apple-text-secondary" />
                        </div>

                        {/* Item Content */}
                        <div className="flex-1">
                            {renderItem ? renderItem(item, index) : null}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
