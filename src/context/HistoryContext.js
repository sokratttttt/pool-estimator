'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useSync } from './SyncContext';
import { toast } from 'sonner';

const HistoryContext = createContext();

const MAX_HISTORY_SIZE = 1000; // Limit history size to prevent memory issues

export function HistoryProvider({ children }) {
    const { user, isOnline } = useSync();
    const [estimates, setEstimates] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

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
    const handleCloudUpdate = useCallback((record) => {
        setEstimates(prev => {
            const index = prev.findIndex(e => e.id === record.id);
            const newItem = { ...record.data, author: record.created_by };

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

                remoteEstimates.forEach(remote => {
                    const remoteEst = { ...remote.data, author: remote.created_by };
                    if (!prevIds.has(remote.id)) {
                        merged.push(remoteEst);
                    }
                });

                return merged
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, MAX_HISTORY_SIZE);
            });
        } catch (error) {
            console.error('Sync error:', error);
        }
    }, []);

    // ✨ Memoized save to cloud
    const saveToCloud = useCallback(async (estimate) => {
        if (!user || !isOnline) return;

        try {
            const { error } = await supabase
                .from('estimates')
                .upsert({
                    id: estimate.id,
                    name: estimate.name,
                    client_name: estimate.clientInfo?.name,
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
    }, [user, isOnline, isInitialized, syncWithCloud, handleCloudUpdate]);

    // ✨ Memoized save estimate
    const saveEstimate = useCallback((name, selection, items, total) => {
        const newEstimate = {
            id: Date.now().toString(),
            name,
            selection,
            items,
            total,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            author: user?.email || 'Guest',
            status: 'draft'
        };

        setEstimates(prev => [newEstimate, ...prev].slice(0, MAX_HISTORY_SIZE));
        saveToCloud(newEstimate);
        return newEstimate.id;
    }, [user, saveToCloud]);

    // ✨ Memoized update estimate
    const updateEstimate = useCallback((id, updates) => {
        setEstimates(prev => prev.map(est => {
            if (est.id === id) {
                const updated = { ...est, ...updates, updatedAt: new Date().toISOString() };
                saveToCloud(updated);
                return updated;
            }
            return est;
        }));
    }, [saveToCloud]);

    // ✨ Memoized delete estimate
    const deleteEstimate = useCallback(async (id) => {
        setEstimates(prev => prev.filter(est => est.id !== id));
        if (user && isOnline) {
            await supabase.from('estimates').delete().eq('id', id);
        }
    }, [user, isOnline]);

    // ✨ Memoized get estimate
    const getEstimate = useCallback((id) => {
        return estimates.find(est => est.id === id);
    }, [estimates]);

    // ✨ Memoized duplicate estimate
    const duplicateEstimate = useCallback((id) => {
        const original = getEstimate(id);
        if (!original) return null;

        const duplicate = {
            ...original,
            id: Date.now().toString(),
            name: `${original.name} (копия)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            author: user?.email || 'Guest',
            status: 'draft'
        };

        setEstimates(prev => [duplicate, ...prev].slice(0, MAX_HISTORY_SIZE));
        saveToCloud(duplicate);
        return duplicate.id;
    }, [getEstimate, user, saveToCloud]);

    // ✨ Memoized context value
    const value = useMemo(() => ({
        estimates,
        saveEstimate,
        updateEstimate,
        deleteEstimate,
        getEstimate,
        duplicateEstimate,
    }), [estimates, saveEstimate, updateEstimate, deleteEstimate, getEstimate, duplicateEstimate]);

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
