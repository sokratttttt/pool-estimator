'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSync } from './SyncContext';
import { toast } from 'sonner';

const HistoryContext = createContext();

export function HistoryProvider({ children }) {
    const { user, isOnline } = useSync();
    const [estimates, setEstimates] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('mos-pool-history');
        if (saved) {
            try {
                setEstimates(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading history:', error);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save to localStorage whenever estimates change
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('mos-pool-history', JSON.stringify(estimates));
        }
    }, [estimates, isInitialized]);

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
    }, [user, isOnline, isInitialized]);

    const handleCloudUpdate = (record) => {
        setEstimates(prev => {
            const index = prev.findIndex(e => e.id === record.id);
            const newItem = { ...record.data, author: record.created_by }; // Ensure author is preserved

            if (index >= 0) {
                // Update only if cloud version is newer or different
                if (JSON.stringify(prev[index]) !== JSON.stringify(newItem)) {
                    const newEstimates = [...prev];
                    newEstimates[index] = newItem;
                    return newEstimates;
                }
                return prev;
            } else {
                return [newItem, ...prev];
            }
        });
    };

    const syncWithCloud = async () => {
        try {
            const { data: remoteEstimates, error } = await supabase
                .from('estimates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setEstimates(prev => {
                const merged = [...prev];
                const prevIds = new Set(prev.map(e => e.id));

                remoteEstimates.forEach(remote => {
                    const remoteEst = { ...remote.data, author: remote.created_by };
                    if (!prevIds.has(remote.id)) {
                        merged.push(remoteEst);
                    } else {
                        // Optional: Conflict resolution (server wins or timestamp check)
                        // For now, let's assume server is truth if we are syncing
                        const idx = merged.findIndex(e => e.id === remote.id);
                        // merged[idx] = remoteEst; // Uncomment to force server state
                    }
                });

                // Sort by date
                return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            });
        } catch (error) {
            console.error('Sync error:', error);
        }
    };

    const saveToCloud = async (estimate) => {
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
    };

    const saveEstimate = (name, selection, items, total) => {
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

        setEstimates(prev => [newEstimate, ...prev]);
        saveToCloud(newEstimate);
        return newEstimate.id;
    };

    const updateEstimate = (id, updates) => {
        setEstimates(prev => prev.map(est => {
            if (est.id === id) {
                const updated = { ...est, ...updates, updatedAt: new Date().toISOString() };
                saveToCloud(updated);
                return updated;
            }
            return est;
        }));
    };

    const deleteEstimate = async (id) => {
        setEstimates(prev => prev.filter(est => est.id !== id));
        if (user && isOnline) {
            await supabase.from('estimates').delete().eq('id', id);
        }
    };

    const getEstimate = (id) => {
        return estimates.find(est => est.id === id);
    };

    const duplicateEstimate = (id) => {
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

        setEstimates(prev => [duplicate, ...prev]);
        saveToCloud(duplicate);
        return duplicate.id;
    };

    return (
        <HistoryContext.Provider value={{
            estimates,
            saveEstimate,
            updateEstimate,
            deleteEstimate,
            getEstimate,
            duplicateEstimate,
        }}>
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
