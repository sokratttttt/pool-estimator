'use client';
import { useEffect } from 'react';
import { useSync } from '@/context/SyncContext';
import { useRouter } from 'next/navigation';
import LoginPage from '@/components/LoginPage';

export default function ProtectedRoute({ children }) {
    const { user } = useSync();
    const router = useRouter();

    useEffect(() => {
        if (user === null) {
            // Пользователь не авторизован
            // Показываем страницу входа
        }
    }, [user, router]);

    if (user === null) {
        return <LoginPage />;
    }

    return <>{children}</>;
}
