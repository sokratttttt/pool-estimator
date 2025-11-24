'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSync } from './SyncContext';
import { toast } from 'sonner';

const ClientContext = createContext();

export function ClientProvider({ children }) {
    const { user, isOnline } = useSync();
    const [clients, setClients] = useState([]);
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
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'clients' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setClients(prev => [payload.new, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setClients(prev => prev.map(c =>
                            c.id === payload.new.id ? payload.new : c
                        ));
                    } else if (payload.eventType === 'DELETE') {
                        setClients(prev => prev.filter(c => c.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const loadClients = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setClients(data || []);
        } catch (error) {
            console.error('Error loading clients:', error);
            toast.error('Не удалось загрузить клиентов');
        } finally {
            setIsLoading(false);
        }
    };

    const saveClient = async (clientData) => {
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

            setClients(prev => [data, ...prev]);
            toast.success('Клиент добавлен');
            return data;
        } catch (error) {
            console.error('Error saving client:', error);
            toast.error('Не удалось сохранить клиента');
            return null;
        }
    };

    const updateClient = async (id, updates) => {
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

            setClients(prev => prev.map(c => c.id === id ? data : c));
            toast.success('Клиент обновлен');
            return data;
        } catch (error) {
            console.error('Error updating client:', error);
            toast.error('Не удалось обновить клиента');
            return null;
        }
    };

    const deleteClient = async (id) => {
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

    const getClient = (id) => {
        return clients.find(c => c.id === id);
    };

    const searchClients = (query) => {
        const lowerQuery = query.toLowerCase();
        return clients.filter(client =>
            client.name?.toLowerCase().includes(lowerQuery) ||
            client.phone?.toLowerCase().includes(lowerQuery) ||
            client.email?.toLowerCase().includes(lowerQuery) ||
            client.company?.toLowerCase().includes(lowerQuery)
        );
    };

    return (
        <ClientContext.Provider value={{
            clients,
            isLoading,
            saveClient,
            updateClient,
            deleteClient,
            getClient,
            searchClients,
            loadClients
        }}>
            {children}
        </ClientContext.Provider>
    );
}

export function useClients() {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error('useClients must be used within ClientProvider');
    }
    return context;
}
