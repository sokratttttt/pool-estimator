'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const SyncContext = createContext();

export function SyncProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(null);

    // Проверка подключения к интернету
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Обновление времени последнего визита
    const updateLastSeen = async (email) => {
        try {
            await supabase
                .from('users')
                .update({ last_seen: new Date().toISOString() })
                .eq('email', email);
        } catch (error) {
            console.error('Error updating last seen:', error);
        }
    };

    // Проверка текущего пользователя - ОБЪЯВЛЯЕМ ПЕРЕД useEffect
    const checkUser = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                await updateLastSeen(session.user.email);
            }
        } catch (error) {
            console.error('Error checking user:', error);
        }
    }, []);

    // Проверка авторизации при загрузке
    useEffect(() => {
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
                updateLastSeen(session.user.email);
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [checkUser]);

    // Вход
    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            setUser(data.user);
            await updateLastSeen(email);
            toast.success('Вход выполнен успешно');
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Ошибка входа: ' + error.message);
            return { success: false, error: error.message };
        }
    };

    // Выход
    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            toast.success('Выход выполнен');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Ошибка выхода');
        }
    };

    const value = {
        user,
        isOnline,
        isSyncing,
        lastSync,
        login,
        logout,
    };

    return (
        <SyncContext.Provider value={value}>
            {children}
        </SyncContext.Provider>
    );
}

export function useSync() {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error('useSync must be used within SyncProvider');
    }
    return context;
}