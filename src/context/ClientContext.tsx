'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useSync } from './SyncContext';
import { toast } from 'sonner';

import type {
    Client,
    ClientCreateData,
    ClientUpdateData,
    ClientContextValue
} from '@/types/client';

// ============================================
// CONTEXT
// ============================================

const ClientContext = createContext<ClientContextValue | null>(null);

interface ClientProviderProps {
    children: ReactNode;
}

interface SyncContextValue {
    user: { email: string; id: string } | null;
    isOnline: boolean;
}

// Supabase realtime payload types
interface RealtimePayload<T> {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: T;
    old: { id: string };
}

export function ClientProvider({ children }: ClientProviderProps) {
    const { user } = useSync() as SyncContextValue;
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load clients from Supabase
    useEffect(() => {
        if (user) {
            loadClients();
        }
    }, [user]);

    // Real-time subscription
    useEffect(() => {
        if (!user || !supabase) return;

        const channel = supabase
            .channel('clients-changes')
            .on(
                'postgres_changes' as const,
                { event: '*', schema: 'public', table: 'clients' },
                (payload: unknown) => {
                    const data = payload as RealtimePayload<Client>;
                    if (data.eventType === 'INSERT') {
                        setClients(prev => [data.new, ...prev]);
                    } else if (data.eventType === 'UPDATE') {
                        setClients(prev => prev.map(c =>
                            c.id === data.new.id ? data.new : c
                        ));
                    } else if (data.eventType === 'DELETE') {
                        setClients(prev => prev.filter(c => c.id !== data.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const loadClients = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setClients((data as Client[]) || []);
        } catch (error) {
            console.error('Error loading clients:', error);
            toast.error('Не удалось загрузить клиентов');
        } finally {
            setIsLoading(false);
        }
    };

    const saveClient = async (clientData: ClientCreateData): Promise<Client | null> => {
        if (!user) {
            toast.error('Необходима авторизация');
            return null;
        }

        try {
            const newClient = {
                ...clientData,
                created_by: user.email,
                updated_by: user.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('clients')
                .insert([newClient])
                .select()
                .single();

            if (error) throw error;

            const savedClient = data as Client;
            setClients(prev => [savedClient, ...prev]);
            toast.success('Клиент добавлен');
            return savedClient;
        } catch (error) {
            console.error('Error saving client:', error);
            toast.error('Не удалось сохранить клиента');
            return null;
        }
    };

    const updateClient = async (id: string, updates: ClientUpdateData): Promise<Client | null> => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .update({
                    ...updates,
                    updated_by: user?.email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            const updatedClient = data as Client;
            setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
            toast.success('Клиент обновлен');
            return updatedClient;
        } catch (error) {
            console.error('Error updating client:', error);
            toast.error('Не удалось обновить клиента');
            return null;
        }
    };

    const deleteClient = async (id: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setClients(prev => prev.filter(c => c.id !== id));
            toast.success('Клиент удален');
        } catch (error) {
            console.error('Error deleting client:', error);
            toast.error('Не удалось удалить клиента');
        }
    };

    const getClient = (id: string): Client | undefined => {
        return clients.find(c => c.id === id);
    };

    const searchClients = (query: string): Client[] => {
        const lowerQuery = query.toLowerCase();
        return clients.filter(client =>
            client.name?.toLowerCase().includes(lowerQuery) ||
            client.phone?.toLowerCase().includes(lowerQuery) ||
            client.email?.toLowerCase().includes(lowerQuery) ||
            client.company?.toLowerCase().includes(lowerQuery)
        );
    };

    const value: ClientContextValue = {
        clients,
        isLoading,
        saveClient,
        updateClient,
        deleteClient,
        getClient,
        searchClients,
        loadClients
    };

    return (
        <ClientContext.Provider value={value}>
            {children}
        </ClientContext.Provider>
    );
}

export function useClients(): ClientContextValue {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error('useClients must be used within ClientProvider');
    }
    return context;
}
