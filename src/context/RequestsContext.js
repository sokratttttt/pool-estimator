'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const RequestsContext = createContext();

export function RequestsProvider({ children }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);

    // Fetch all requests with optional filters
    const fetchRequests = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            let query = supabase
                .from('requests')
                .select('*')
                .order('created_at', { ascending: false });

            // Apply filters
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            if (filters.manager) {
                query = query.eq('manager', filters.manager);
            }
            if (filters.forecast_status) {
                query = query.eq('forecast_status', filters.forecast_status);
            }
            if (filters.request_type) {
                query = query.eq('request_type', filters.request_type);
            }
            if (filters.search) {
                query = query.or(`client_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
            }
            if (filters.dateFrom) {
                query = query.gte('created_at', filters.dateFrom);
            }
            if (filters.dateTo) {
                query = query.lte('created_at', filters.dateTo);
            }

            const { data, error } = await query;

            if (error) throw error;

            setRequests(data || []);
            return data || [];
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Ошибка загрузки заявок');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch statistics
    const fetchStats = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('requests_stats')
                .select('*')
                .single();

            if (error) throw error;

            setStats(data);
            return data;
        } catch (error) {
            console.error('Error fetching stats:', error);
            return null;
        }
    }, []);

    // Create new request
    const createRequest = useCallback(async (requestData) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('requests')
                .insert([{
                    ...requestData,
                    created_by: user?.id
                }])
                .select()
                .single();

            if (error) throw error;

            setRequests(prev => [data, ...prev]);
            toast.success('Заявка создана');
            await fetchStats(); // Update stats
            return data;
        } catch (error) {
            console.error('Error creating request:', error);
            toast.error('Ошибка создания заявки');
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchStats]);

    // Update request
    const updateRequest = useCallback(async (id, updates) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('requests')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            setRequests(prev => prev.map(req => req.id === id ? data : req));
            toast.success('Заявка обновлена');
            await fetchStats(); // Update stats
            return data;
        } catch (error) {
            console.error('Error updating request:', error);
            toast.error('Ошибка обновления заявки');
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchStats]);

    // Delete request
    const deleteRequest = useCallback(async (id) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('requests')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setRequests(prev => prev.filter(req => req.id !== id));
            toast.success('Заявка удалена');
            await fetchStats(); // Update stats
            return true;
        } catch (error) {
            console.error('Error deleting request:', error);
            toast.error('Ошибка удаления заявки');
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchStats]);

    // Convert request to estimate
    const convertToEstimate = useCallback(async (requestId, estimateData) => {
        try {
            // Here you would create an estimate and link it
            // This is a placeholder - implement based on your estimate creation logic
            const { data, error } = await supabase
                .from('requests')
                .update({
                    estimate_id: estimateData.id,
                    status: 'estimate_sent'
                })
                .eq('id', requestId)
                .select()
                .single();

            if (error) throw error;

            setRequests(prev => prev.map(req => req.id === requestId ? data : req));
            toast.success('Смета создана и привязана к заявке');
            return data;
        } catch (error) {
            console.error('Error converting to estimate:', error);
            toast.error('Ошибка создания сметы');
            return null;
        }
    }, []);

    // Bulk update status
    const bulkUpdateStatus = useCallback(async (ids, status) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('requests')
                .update({ status })
                .in('id', ids);

            if (error) throw error;

            setRequests(prev => prev.map(req =>
                ids.includes(req.id) ? { ...req, status } : req
            ));
            toast.success(`Обновлено ${ids.length} заявок`);
            await fetchStats();
            return true;
        } catch (error) {
            console.error('Error bulk updating:', error);
            toast.error('Ошибка массового обновления');
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchStats]);

    const value = {
        requests,
        loading,
        stats,
        fetchRequests,
        fetchStats,
        createRequest,
        updateRequest,
        deleteRequest,
        convertToEstimate,
        bulkUpdateStatus
    };

    return (
        <RequestsContext.Provider value={value}>
            {children}
        </RequestsContext.Provider>
    );
}

export function useRequests() {
    const context = useContext(RequestsContext);
    if (!context) {
        throw new Error('useRequests must be used within RequestsProvider');
    }
    return context;
}
