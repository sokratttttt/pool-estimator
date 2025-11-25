'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DealCard from './DealCard';

export default function KanbanColumn({ stage, deals }) {
    const { setNodeRef } = useDroppable({
        id: stage.id
    });

    const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);

    return (
        <div className="flex flex-col w-80 h-full bg-gray-800 rounded-lg border border-gray-700">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{stage.icon}</span>
                        <h3 className="font-bold text-white">{stage.label}</h3>
                    </div>
                    <span className="px-2 py-1 bg-gray-700 text-white text-sm rounded-full">
                        {deals.length}
                    </span>
                </div>
                <p className="text-sm text-gray-400">
                    {(totalValue / 1000000).toFixed(1)}M ₽
                </p>
            </div>

            {/* Cards */}
            <div
                ref={setNodeRef}
                className="flex-1 overflow-y-auto p-3 space-y-3"
            >
                <SortableContext
                    items={deals.map(d => d.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {deals.map(deal => (
                        <DealCard key={deal.id} deal={deal} />
                    ))}
                </SortableContext>

                {deals.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        Перетащите сделку сюда
                    </div>
                )}
            </div>
        </div>
    );
}
