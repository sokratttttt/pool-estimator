'use client';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Copy, GripVertical } from 'lucide-react';
import AppleCard from '../../apple/AppleCard';
import { EditableCell, formatCurrency } from '@/components/editable/EditableCell';
import DraggableList from '../../DraggableList';

interface EstimateItem {
    id: string;
    name: string;
    price?: number;
    total?: number;
    quantity?: number;
    unit?: string;
    section?: string;
    category?: string;
}

interface SummaryItemsListProps {
    sections?: string[];
    allItems?: EstimateItem[];
    getPrice?: (args: { id: string; originalPrice: number }) => number;
    onReorder?: (section: string, reorderedItems: EstimateItem[]) => void;
    isEditing?: boolean;
    onPriceChange?: (id: string, value: string) => void;
    onQuantityChange?: (id: string, value: string) => void;
    onNameChange?: (id: string, value: string) => void;
    onDelete?: (id: string) => void;
    onDuplicate?: (id: string) => void;
}

export default function SummaryItemsList({
    sections = [],
    allItems = [],
    getPrice,
    onReorder,
    isEditing = false,
    onPriceChange,
    onQuantityChange,
    onNameChange,
    onDelete,
    onDuplicate
}: SummaryItemsListProps) {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const handlePriceChange = useCallback((id: string, value: string) => {
        onPriceChange?.(id, value);
    }, [onPriceChange]);

    const handleQuantityChange = useCallback((id: string, value: string) => {
        onQuantityChange?.(id, value);
    }, [onQuantityChange]);

    const handleNameChange = useCallback((id: string, value: string) => {
        onNameChange?.(id, value);
    }, [onNameChange]);

    const getItemPrice = (item: EstimateItem): number => {
        if (getPrice) {
            return getPrice({ id: item.id, originalPrice: item.total || item.price || 0 });
        }
        return item.total || item.price || 0;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <AppleCard variant="flat">
                <div className="space-y-8">
                    {sections.map((section: string) => {
                        const sectionItems = allItems.filter(
                            (item: EstimateItem) => (item.section || item.category) === section
                        );
                        if (sectionItems.length === 0) return null;

                        return (
                            <div key={section} className="space-y-4">
                                <h3 className="apple-heading-3 pb-2 border-b border-apple-border flex items-center justify-between">
                                    <span>{section}</span>
                                    <span className="text-sm text-gray-400 font-normal">
                                        {sectionItems.length} позиц.
                                    </span>
                                </h3>
                                <DraggableList
                                    items={sectionItems}
                                    onReorder={(reordered: EstimateItem[]) => onReorder?.(section, reordered)}
                                    className="space-y-1"
                                    renderItem={(item: EstimateItem) => (
                                        <div
                                            className={`group flex items-center gap-2 p-3 rounded-lg transition-colors ${hoveredItem === item.id ? 'bg-cyan-500/10' : 'hover:bg-apple-bg-secondary'
                                                }`}
                                            onMouseEnter={() => setHoveredItem(item.id)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                        >
                                            {/* Drag Handle */}
                                            <div className="cursor-grab opacity-30 group-hover:opacity-60">
                                                <GripVertical size={16} />
                                            </div>

                                            {/* Name */}
                                            <div className="flex-1 min-w-0">
                                                {isEditing ? (
                                                    <EditableCell
                                                        value={item.name}
                                                        onChange={(val) => handleNameChange(item.id, String(val))}
                                                        type="text"
                                                        className="font-medium"
                                                    />
                                                ) : (
                                                    <p className="apple-body font-medium truncate">{item.name}</p>
                                                )}
                                            </div>

                                            {/* Quantity */}
                                            <div className="w-24 text-right">
                                                {isEditing && onQuantityChange ? (
                                                    <EditableCell
                                                        value={item.quantity || 1}
                                                        onChange={(val) => handleQuantityChange(item.id, String(val))}
                                                        type="number"
                                                        className="text-sm"
                                                    />
                                                ) : (
                                                    <span className="apple-caption">
                                                        {item.quantity || 1} {item.unit || 'шт'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Price */}
                                            <div className="w-32 text-right">
                                                {isEditing ? (
                                                    <EditableCell
                                                        value={getItemPrice(item)}
                                                        onChange={(val) => handlePriceChange(item.id, String(val))}
                                                        type="currency"
                                                        className="font-bold"
                                                    />
                                                ) : (
                                                    <p className="apple-body font-bold whitespace-nowrap">
                                                        {formatCurrency(getItemPrice(item))}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            {isEditing && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {onDuplicate && (
                                                        <button
                                                            onClick={() => onDuplicate(item.id)}
                                                            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                                                            title="Дублировать"
                                                        >
                                                            <Copy size={14} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Удалить эту позицию?')) {
                                                                    onDelete(item.id);
                                                                }
                                                            }}
                                                            className="p-1.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                                                            title="Удалить"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>
                        );
                    })}
                </div>

                {allItems.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <div className="text-4xl mb-4">📋</div>
                        <p>Нет позиций в смете</p>
                        <p className="text-sm mt-1">Добавьте материалы, оборудование или работы</p>
                    </div>
                )}
            </AppleCard>
        </motion.div>
    );
}

