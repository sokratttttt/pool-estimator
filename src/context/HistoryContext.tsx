'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useSync } from './SyncContext';
import { toast } from 'sonner';
import type {
    HistoryContextType,
    HistoryEntry,
    HistorySnapshot,
    HistoryAction,
    HistoryFilters,
    HistoryActionType,
    HistoryEstimate
} from '@/types/history';

const HistoryContext = createContext<HistoryContextType | null>(null);

const MAX_HISTORY_SIZE = 1000;

export function HistoryProvider({ children }: { children: React.ReactNode }) {
    const { user, isOnline } = useSync();
    const [estimates, setEstimates] = useState<HistoryEstimate[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // New state for advanced history features
    const [entries, setEntries] = useState<HistoryEntry[]>([]);
    const [snapshots, _setSnapshots] = useState<HistorySnapshot[]>([]);
    const [currentIndex, _setCurrentIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('mos-pool-history');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Limit size on load
                setEstimates(parsed.slice(0, MAX_HISTORY_SIZE));
            } catch (error) {
                console.error('Error loading history:', error);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save to localStorage whenever estimates change (memoized)
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('mos-pool-history', JSON.stringify(estimates));
        }
    }, [estimates, isInitialized]);

    // ✨ Memoized cloud update handler
    const handleCloudUpdate = useCallback((record: Record<string, unknown>) => {
        setEstimates(prev => {
            const r = record as { id: string; data: object; created_by?: string };
            const index = prev.findIndex(e => e.id === r.id);
            const newItem = { ...r.data, author: r.created_by } as HistoryEstimate;

            if (index >= 0) {
                if (JSON.stringify(prev[index]) !== JSON.stringify(newItem)) {
                    const newEstimates = [...prev];
                    newEstimates[index] = newItem;
                    return newEstimates;
                }
                return prev;
            } else {
                return [newItem, ...prev].slice(0, MAX_HISTORY_SIZE);
            }
        });
    }, []);

    // ✨ Memoized sync with cloud
    const syncWithCloud = useCallback(async () => {
        try {
            const { data: remoteEstimates, error } = await supabase
                .from('estimates')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(MAX_HISTORY_SIZE);

            if (error) throw error;

            setEstimates(prev => {
                const merged = [...prev];
                const prevIds = new Set(prev.map(e => e.id));

                if (remoteEstimates) {
                    remoteEstimates.forEach((remote: unknown) => {
                        const r = remote as { id: string; data: object; created_by?: string; created_at: string };
                        const remoteEst = {
                            ...r.data,
                            author: r.created_by,
                            created_at: r.created_at, // Ensure created_at is present
                        } as HistoryEstimate;
                        if (!prevIds.has(r.id)) {
                            merged.push(remoteEst);
                        }
                    });
                }

                return merged
                    .sort((a, b) => {
                        const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
                        const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
                        return dateB - dateA;
                    })
                    .slice(0, MAX_HISTORY_SIZE);
            });
        } catch (error) {
            console.error('Sync error:', error);
        }
    }, []);

    // ✨ Memoized save to cloud
    const saveToCloud = useCallback(async (estimate: HistoryEstimate) => {
        if (!user || !isOnline) return;

        try {
            const { error } = await supabase
                .from('estimates')
                .upsert({
                    id: estimate.id,
                    name: estimate.name,
                    client_name: estimate.client_info?.name || estimate.clientInfo?.name,
                    data: estimate,
                    total: estimate.total,
                    status: estimate.status || 'draft',
                    created_by: user.email,
                    updated_by: user.email
                });

            if (error) throw error;
        } catch (error) {
            console.error('Cloud save error:', error);
            toast.error('Не удалось сохранить в облако');
        }
    }, [user, isOnline]);

    // Sync with Cloud when User/Online changes
    useEffect(() => {
        if (user && isOnline && isInitialized) {
            syncWithCloud();

            // Subscribe to changes
            const channel = supabase
                .channel('estimates-changes')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'estimates' },
                    (payload) => {
                        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                            handleCloudUpdate(payload.new);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
        return undefined;
    }, [user, isOnline, isInitialized, syncWithCloud, handleCloudUpdate]);

    // ✨ Memoized record action
    const recordAction = useCallback(<T,>(
        action: Omit<HistoryAction<T>, 'timestamp' | 'userId'>,
        description?: string
    ) => {
        if (!isRecording) return '';

        const newEntry: HistoryEntry = {
            id: Date.now().toString(),
            action: {
                ...action,
                timestamp: new Date(),
                userId: user?.id || 'guest',
            } as HistoryAction,
            description,
            tags: [],
            isUndone: false,
            canRedo: false,
            metadata: {}
        };

        setEntries(prev => [newEntry, ...prev].slice(0, MAX_HISTORY_SIZE));
        return newEntry.id;
    }, [isRecording, user]);

    // ✨ Memoized save estimate
    const saveEstimate = useCallback((name: string, selection: unknown, items: unknown, total: number) => {
        const now = new Date().toISOString();
        const id = Date.now().toString();

        // Extract client info if possible, assuming selection object might have it
        // We cast broadly to avoid strict type checks here as selection is unknown
        const sel = selection as { clientInfo?: { name: string; phone: string; email?: string } } | null;
        const cInfo = sel?.clientInfo;

        const newEstimate: HistoryEstimate = {
            id,
            name,
            total,
            selection: selection as Record<string, unknown>,
            items: items as unknown[],
            client_info: cInfo,
            clientInfo: cInfo, // legacy
            created_at: now,
            updated_at: now,
            createdAt: now,
            updatedAt: now,
            status: 'draft',
            user_id: user?.id,
            author: user?.email || 'Guest'
        };

        setEstimates(prev => [newEstimate, ...prev].slice(0, MAX_HISTORY_SIZE));
        saveToCloud(newEstimate);

        recordAction({
            type: 'estimate_created',
            entityId: newEstimate.id,
            entityType: 'estimate',
            after: newEstimate,
            changes: ['created']
        }, `Created estimate: ${newEstimate.name}`);

        return newEstimate.id;
    }, [user, saveToCloud, recordAction]);

    // ✨ Memoized update estimate
    const updateEstimate = useCallback((id: string, updates: Partial<HistoryEstimate>) => {
        setEstimates(prev => prev.map(est => {
            if (est.id === id) {
                const now = new Date().toISOString();
                const updated = {
                    ...est,
                    ...updates,
                    updated_at: now,
                    updatedAt: now
                };
                saveToCloud(updated);

                // Record action
                recordAction({
                    type: 'estimate_updated',
                    entityId: id,
                    entityType: 'estimate',
                    before: est,
                    after: updated,
                    changes: Object.keys(updates)
                }, `Updated estimate: ${est.name}`);

                return updated;
            }
            return est;
        }));
    }, [saveToCloud, recordAction]);

    // ✨ Memoized delete estimate
    const deleteEstimate = useCallback(async (id: string) => {
        const estimate = estimates.find(e => e.id === id);
        setEstimates(prev => prev.filter(est => est.id !== id));
        if (user && isOnline) {
            await supabase.from('estimates').delete().eq('id', id);
        }

        if (estimate) {
            recordAction({
                type: 'estimate_deleted',
                entityId: id,
                entityType: 'estimate',
                before: estimate,
                changes: ['deleted']
            }, `Deleted estimate: ${estimate.name}`);
        }
    }, [user, isOnline, estimates, recordAction]);

    // ✨ Memoized get estimate
    const getEstimate = useCallback((id: string) => {
        return estimates.find(est => est.id === id);
    }, [estimates]);

    // ✨ Memoized duplicate estimate
    const duplicateEstimate = useCallback((id: string) => {
        const original = getEstimate(id);
        if (!original) return null;

        const now = new Date().toISOString();
        const duplicate: HistoryEstimate = {
            ...original,
            id: Date.now().toString(),
            name: `${original.name} (копия)`,
            created_at: now,
            updated_at: now,
            createdAt: now,
            updatedAt: now,
            author: user?.email || 'Guest',
            status: 'draft',
            user_id: user?.id
        };

        setEstimates(prev => [duplicate, ...prev].slice(0, MAX_HISTORY_SIZE));
        saveToCloud(duplicate);

        recordAction({
            type: 'estimate_created',
            entityId: duplicate.id,
            entityType: 'estimate',
            after: duplicate,
            changes: ['duplicated']
        }, `Duplicated estimate: ${original.name}`);

        return duplicate.id;
    }, [getEstimate, user, saveToCloud, recordAction]);

    // --- New Advanced History Implementation ---

    const undo = useCallback(() => {
        // Placeholder for undo logic
        return null;
    }, []);

    const redo = useCallback(() => {
        // Placeholder for redo logic
        return null;
    }, []);

    const clearHistory = useCallback(async (_filters?: HistoryFilters) => {
        setEntries([]);
        return 0;
    }, []);

    const createSnapshot = useCallback(async (_name: string, _options?: Record<string, unknown>) => {
        return 'snapshot-id';
    }, []);

    const restoreSnapshot = useCallback(async (_snapshotId: string) => {
        return { success: true };
    }, []);

    const deleteSnapshot = useCallback(async (_snapshotId: string) => {
        return true;
    }, []);

    const search = useCallback((query: string, _filters?: HistoryFilters) => {
        return entries.filter(e => e.description?.includes(query));
    }, [entries]);

    const filter = useCallback((_filters: HistoryFilters) => {
        return entries;
    }, [entries]);

    const getTimeline = useCallback((_startDate: Date, _endDate: Date) => {
        return { events: [], groups: {} };
    }, []);

    const getStats = useCallback(() => {
        return {
            totalActions: entries.length,
            byType: {} as Record<HistoryActionType, number>,
            byUser: {},
            byEntity: {},
            undoRate: 0
        };
    }, [entries]);

    const compareEntries = useCallback((_entryId1: string, _entryId2: string) => {
        return { diffs: [], summary: '' };
    }, []);

    const compareSnapshots = useCallback((_snapshotId1: string, _snapshotId2: string) => {
        return { diffs: [], summary: '' };
    }, []);

    const exportHistory = useCallback(async (_format: 'json' | 'csv' | 'html', _filters?: HistoryFilters) => {
        return { success: true };
    }, []);

    const importHistory = useCallback(async (_data: unknown) => {
        return { success: true, count: 0 };
    }, []);

    const startAutoRecording = useCallback(() => setIsRecording(true), []);
    const stopAutoRecording = useCallback(() => setIsRecording(false), []);
    const createAutoSnapshot = useCallback((_interval: number) => { }, []);

    const getLastAction = useCallback((entityId?: string) => {
        if (entityId) {
            return entries.find(e => e.action.entityId === entityId) || null;
        }
        return entries[0] || null;
    }, [entries]);

    const getActionChain = useCallback((_entryId: string) => [], []);
    const compressHistory = useCallback(async () => ({ originalSize: 0, compressedSize: 0, ratio: 0 }), []);

    const value: HistoryContextType = useMemo(() => ({
        entries,
        snapshots,
        currentIndex,
        maxEntries: MAX_HISTORY_SIZE,
        maxSnapshots: 100,
        isRecording,
        canUndo: false,
        canRedo: false,
        undoStack: [],
        redoStack: [],

        recordAction,
        undo,
        redo,
        clearHistory,
        createSnapshot,
        restoreSnapshot,
        deleteSnapshot,
        search,
        filter,
        getTimeline,
        getStats,
        compareEntries,
        compareSnapshots,
        exportHistory,
        importHistory,
        startAutoRecording,
        stopAutoRecording,
        createAutoSnapshot,
        getLastAction,
        getActionChain,
        compressHistory,

        // Legacy
        estimates,
        saveEstimate,
        updateEstimate,
        deleteEstimate,
        getEstimate,
        duplicateEstimate
    }), [
        entries, snapshots, currentIndex, isRecording,
        recordAction, undo, redo, clearHistory,
        createSnapshot, restoreSnapshot, deleteSnapshot,
        search, filter, getTimeline, getStats,
        compareEntries, compareSnapshots, exportHistory,
        importHistory, startAutoRecording, stopAutoRecording,
        createAutoSnapshot, getLastAction, getActionChain,
        compressHistory, estimates, saveEstimate,
        updateEstimate, deleteEstimate, getEstimate,
        duplicateEstimate
    ]);

    return (
        <HistoryContext.Provider value={value}>
            {children}
        </HistoryContext.Provider>
    );
}

export function useHistory() {
    const context = useContext(HistoryContext);
    if (!context) {
        throw new Error('useHistory must be used within HistoryProvider');
    }
    return context;
}