'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Phone, Mail, Calendar } from 'lucide-react';

import type { Deal } from '@/types';

interface DealCardProps {
    deal: Deal;
    isDragging?: boolean;
}

export default function DealCard({ deal, isDragging = false }: DealCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging
    } = useSortable({ id: deal.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1
    };

    // Calculate days in current stage
    const daysInStage = deal.updated_at ? Math.floor(
        (new Date().getTime() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    ) : 0;

    // Color coding for stuck deals
    const isStuck = daysInStage > 7;
    const borderColor = isStuck ? 'border-l-red-500' : 'border-l-blue-500';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-gray-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-gray-650 transition-colors border-l-4 ${borderColor} ${isDragging ? 'shadow-2xl' : 'shadow-md'
                }`}
        >
            <h4 className="font-semibold text-white mb-2 line-clamp-2">
                {deal.title}
            </h4>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                    <span className="font-medium">{deal.client_name}</span>
                </div>

                {deal.pool_size && (
                    <div className="text-gray-400 text-xs">
                        {deal.pool_type} • {deal.pool_size}
                    </div>
                )}

                {deal.value && (
                    <div className="flex items-center justify-between">
                        <span className="text-green-400 font-bold">
                            {((deal.value || 0) / 1000000).toFixed(1)}M ₽
                        </span>
                        <span className="text-xs text-gray-400">
                            {deal.probability}%
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-gray-600">
                    {deal.client_phone && (
                        <button className="p-1 hover:bg-gray-600 rounded transition-colors">
                            <Phone size={14} className="text-gray-400" />
                        </button>
                    )}
                    {deal.client_email && (
                        <button className="p-1 hover:bg-gray-600 rounded transition-colors">
                            <Mail size={14} className="text-gray-400" />
                        </button>
                    )}
                    <div className="flex-1" />
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        {daysInStage}д
                    </div>
                </div>
            </div>
        </div>
    );
}
