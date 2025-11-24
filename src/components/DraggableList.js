'use client';
import { useState } from 'react';
import { GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DraggableList({ items, onReorder, renderItem, className = '' }) {
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (index !== draggedIndex) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const newItems = [...items];
        const [removed] = newItems.splice(draggedIndex, 1);
        newItems.splice(dropIndex, 0, removed);

        onReorder(newItems);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className={className}>
            {items.map((item, index) => (
                <motion.div
                    key={item.id || index}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
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
                            {renderItem(item, index)}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
