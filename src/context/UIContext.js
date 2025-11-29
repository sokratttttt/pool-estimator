'use client';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [theme, setTheme] = useState('dark');
    const [compactMode, setCompactMode] = useState(false);

    // ✨ Memoized toggle functions
    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    const toggleCompactMode = useCallback(() => {
        setCompactMode(prev => !prev);
    }, []);

    // ✨ Memoized context value
    const value = useMemo(() => ({
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
