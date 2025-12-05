'use client';
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { UIContextType, UITheme } from '@/types/ui';

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [theme, setTheme] = useState<UITheme>('dark');
    const [compactMode, setCompactMode] = useState(false);

    // Memoized toggle functions
    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    const toggleCompactMode = useCallback(() => {
        setCompactMode(prev => !prev);
    }, []);

    // Memoized context value
    const value: UIContextType = useMemo(() => ({
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        theme,
        setTheme,
        toggleTheme,
        compactMode,
        setCompactMode,
        toggleCompactMode
    }), [sidebarOpen, theme, compactMode, toggleSidebar, toggleTheme, toggleCompactMode]);

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within UIProvider');
    }
    return context;
}
