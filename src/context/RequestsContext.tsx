'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

import type {
    Request,
    RequestCreateData,
    RequestUpdateData,
    RequestFilters,
    RequestStats,
    RequestStatus,
    RequestsContextValue
} from '@/types/request';

// ============================================
// CONTEXT
// ============================================

const RequestsContext = createContext<RequestsContextValue | null>(null);

interface RequestsProviderProps {
    children: ReactNode;
}

export function RequestsProvider({ children }: RequestsProviderProps) {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<RequestStats | null>(null);

    // Fetch all requests with optional filters
    const fetchRequests = useCallback(async (filters: RequestFilters = {}): Promise<Request[]> => {
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

            const requestsData = (data as Request[]) || [];
            setRequests(requestsData);
            return requestsData;
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Ошибка загрузки заявок');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch statistics
    const fetchStats = useCallback(async (): Promise<RequestStats | null> => {
        try {
            const { data, error } = await supabase
                .from('requests_stats')
                .select('*')
                .single();

            if (error) throw error;

            const statsData = data as RequestStats;
            setStats(statsData);
            return statsData;
        } catch (error) {
            console.error('Error fetching stats:', error);
            return null;
        }
    }, []);

    // Create new request
    const createRequest = useCallback(async (requestData: RequestCreateData): Promise<Request | null> => {
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

            const newRequest = data as Request;
            setRequests(prev => [newRequest, ...prev]);
            toast.success('Заявка создана');
            await fetchStats();
            return newRequest;
        } catch (error) {
            console.error('Error creating request:', error);
            toast.error('Ошибка создания заявки');
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchStats]);

    // Update request
    const updateRequest = useCallback(async (id: string, updates: RequestUpdateData): Promise<Request | null> => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('requests')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            const updatedRequest = data as Request;
            setRequests(prev => prev.map(req => req.id === id ? updatedRequest : req));
            toast.success('Заявка обновлена');
            await fetchStats();
            return updatedRequest;
        } catch (error) {
            console.error('Error updating request:', error);
            toast.error('Ошибка обновления заявки');
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchStats]);

    // Delete request
    const deleteRequest = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('requests')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setRequests(prev => prev.filter(req => req.id !== id));
            toast.success('Заявка удалена');
            await fetchStats();
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
    const convertToEstimate = useCallback(async (
        requestId: string,
        estimateData: { id: string }
    ): Promise<Request | null> => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .update({
                    estimate_id: estimateData.id,
                    status: 'estimate_sent' as RequestStatus
                })
                .eq('id', requestId)
                .select()
                .single();

            if (error) throw error;

            const updatedRequest = data as Request;
            setRequests(prev => prev.map(req => req.id === requestId ? updatedRequest : req));
            toast.success('Смета создана и привязана к заявке');
            return updatedRequest;
        } catch (error) {
            console.error('Error converting to estimate:', error);
            toast.error('Ошибка создания сметы');
            return null;
        }
    }, []);

    // Bulk update status
    const bulkUpdateStatus = useCallback(async (ids: string[], status: RequestStatus): Promise<boolean> => {
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

    const value: RequestsContextValue = {
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

export function useRequests(): RequestsContextValue {
    const context = useContext(RequestsContext);
    if (!context) {
        throw new Error('useRequests must be used within RequestsProvider');
    }
    return context;
}
