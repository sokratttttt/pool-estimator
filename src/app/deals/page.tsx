'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { DndContext, DragOverlay, closestCorners, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import DealCard from '@/components/kanban/DealCard';
import DealStats from '@/components/kanban/DealStats';
import { Plus, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Stage {
    id: string;
    label: string;
    color: string;
    icon: string;
}

const STAGES: Stage[] = [
    { id: 'leads', label: 'Лиды', color: 'bg-gray-500', icon: '🎯' },
    { id: 'estimate_sent', label: 'Смета отправлена', color: 'bg-blue-500', icon: '📊' },
    { id: 'negotiation', label: 'Переговоры', color: 'bg-yellow-500', icon: '💬' },
    { id: 'contract', label: 'Договор', color: 'bg-orange-500', icon: '📝' },
    { id: 'installation', label: 'Монтаж', color: 'bg-purple-500', icon: '🚧' },
    { id: 'completed', label: 'Завершено', color: 'bg-green-500', icon: '✅' }
];

import type { Deal } from '@/types';

export default function DealsPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showStats, setShowStats] = useState(true);

    const fetchDeals = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('deals')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDeals(data || []);
        } catch (error) {
            console.error('Error fetching deals:', error);
            toast.error('Не удалось загрузить сделки');
        }
    }, []);

    useEffect(() => {
        fetchDeals();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('deals_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'deals'
                },
                () => {
                    fetchDeals();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchDeals]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        if (event.active.id) {
            setActiveId(event.active.id.toString());
        }
    }, []);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const dealId = active.id.toString();
        const newStage = over.id.toString();

        // Find old stage for activity log
        const oldDeal = deals.find(d => d.id === dealId);
        const oldStage = oldDeal?.stage;

        // Update locally first for instant feedback
        setDeals(prev => prev.map(deal =>
            deal.id === dealId ? { ...deal, stage: newStage } : deal
        ));

        try {
            // Update in database
            const { error } = await supabase
                .from('deals')
                .update({ stage: newStage })
                .eq('id', dealId);

            if (error) throw error;

            // Log activity
            await supabase
                .from('deal_activities')
                .insert({
                    deal_id: dealId,
                    activity_type: 'stage_change',
                    old_value: oldStage,
                    new_value: newStage,
                    description: `Сделка перемещена в "${STAGES.find(s => s.id === newStage)?.label}"`
                });

            toast.success('Сделка обновлена');
        } catch (error) {
            console.error('Error updating deal:', error);
            toast.error('Ошибка при обновлении');
            fetchDeals(); // Revert on error
        }

        setActiveId(null);
    }, [deals, fetchDeals]);

    const dealsByStage = STAGES.reduce((acc: Record<string, Deal[]>, stage: Stage) => {
        acc[stage.id] = deals.filter(deal => deal.stage === stage.id);
        return acc;
    }, {});

    const activeDeal = deals.find(d => d.id === activeId);

    const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
    const formattedValue = (totalValue / 1000000).toFixed(1);

    const handleNewDeal = useCallback(() => {
        toast.info('Функция добавления новой сделки в разработке');
    }, []);

    const toggleStats = useCallback(() => {
        setShowStats(prev => !prev);
    }, []);

    return (
        <div className="h-screen flex flex-col bg-navy-deep overflow-hidden">
            {/* Header */}
            <div className="bg-navy-light border-b border-gray-700 p-4">
                <div className="max-w-[2000px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="text-cyan-bright" size={28} />
                        <div>
                            <h1 className="text-2xl font-bold text-white">Воронка продаж</h1>
                            <p className="text-sm text-gray-400">
                                {deals.length} сделок на общую сумму {formattedValue}M ₽
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleStats}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                        >
                            {showStats ? 'Скрыть' : 'Показать'} статистику
                        </button>
                        <button
                            onClick={handleNewDeal}
                            className="px-4 py-2 bg-gradient-primary hover:opacity-90 text-white rounded-lg font-medium transition-opacity flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Новая сделка
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            {showStats && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                >
                    <DealStats deals={deals} stages={STAGES} />
                </motion.div>
            )}

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto">
                <DndContext
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="h-full p-4">
                        <div className="flex gap-4 h-full min-w-max">
                            {STAGES.map(stage => (
                                <KanbanColumn
                                    key={stage.id}
                                    stage={stage}
                                    deals={dealsByStage[stage.id] || []}
                                />
                            ))}
                        </div>
                    </div>

                    <DragOverlay>
                        {activeDeal ? (
                            <div className="rotate-3 opacity-80">
                                <DealCard deal={activeDeal} isDragging />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}