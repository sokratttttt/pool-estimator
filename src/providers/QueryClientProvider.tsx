'use client';

import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
    children: ReactNode;
}

export default function QueryClientProvider({ children }: QueryProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Данные считаются свежими 5 минут
                        staleTime: 5 * 60 * 1000,
                        // Кеш хранится 30 минут
                        gcTime: 30 * 60 * 1000,
                        // Повторные попытки при ошибке
                        retry: 2,
                        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
                        // Не перезапрашивать при фокусе окна
                        refetchOnWindowFocus: false,
                    },
                    mutations: {
                        retry: 1,
                    },
                },
            })
    );

    return (
        <TanstackQueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} position="bottom" />
            )}
        </TanstackQueryClientProvider>
    );
}
