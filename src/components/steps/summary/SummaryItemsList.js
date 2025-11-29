'use client';
import { motion } from 'framer-motion';
import AppleCard from '../../apple/AppleCard';
import AppleInput from '../../apple/AppleInput';
import DraggableList from '../../DraggableList';

export default function SummaryItemsList({
    sections,
    allItems,
    getPrice,
    onReorder,
    isEditing,
    onPriceChange
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <AppleCard variant="flat">
                <div className="space-y-8">
                    {sections.map((section) => {
                        const sectionItems = allItems.filter(item => (item.section || item.category) === section);
                        if (sectionItems.length === 0) return null;

                        return (
                            <div key={section} className="space-y-4">
                                <h3 className="apple-heading-3 pb-2 border-b border-apple-border">
                                    {section}
                                </h3>
                                <DraggableList
                                    items={sectionItems}
                                    onReorder={(reordered) => onReorder(section, reordered)}
                                    className="space-y-2"
                                    renderItem={(item) => (
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-apple-bg-secondary transition-colors">
                                            <div className="flex-1 pr-4">
                                                <p className="apple-body font-medium">{item.name}</p>
                                                {item.quantity && (
                                                    <p className="apple-caption">
                                                        {item.quantity} {item.unit || 'шт'}
                                                    </p>
                                                )}
                                            </div>
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <AppleInput
                                                        type="number"
                                                        value={getPrice(item.id, item.total)}
                                                        onChange={(e) => onPriceChange(item.id, e.target.value)}
                                                        className="w-24 text-right"
                                                    />
                                                    <span className="apple-body">₽</span>
                                                </div>
                                            ) : (
                                                <p className="apple-body font-bold whitespace-nowrap">
                                                    {(getPrice(item.id, item.total) || 0).toLocaleString('ru-RU')} ₽
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>
                        );
                    })}
                </div>
            </AppleCard>
        </motion.div>
    );
}
