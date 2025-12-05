'use client';

import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import type { ShortcutConfig } from '@/hooks/useGlobalShortcuts';
import { ShortcutsHelp } from '@/components/help/ShortcutsHelp';

// ============================================
// CONTEXT
// ============================================

interface ShortcutsContextType {
    showHelp: () => void;
    hideHelp: () => void;
    isHelpOpen: boolean;
    shortcuts: ShortcutConfig[];
}

const ShortcutsContext = createContext<ShortcutsContextType | null>(null);

export const useShortcuts = () => {
    const context = useContext(ShortcutsContext);
    if (!context) {
        throw new Error('useShortcuts must be used within GlobalShortcutsProvider');
    }
    return context;
};

// ============================================
// PROVIDER COMPONENT
// ============================================

interface GlobalShortcutsProviderProps {
    children: React.ReactNode;
}

export function GlobalShortcutsProvider({ children }: GlobalShortcutsProviderProps) {
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // Initialize global shortcuts
    const { shortcuts } = useGlobalShortcuts({
        onSearch: () => {
            // Focus search input if exists
            const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });

    // Add shortcut help toggle
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+? or Ctrl+/ to show shortcuts help
            if ((e.ctrlKey || e.metaKey) && (e.key === '?' || e.key === '/')) {
                e.preventDefault();
                setIsHelpOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Listen to custom event for opening templates
    useEffect(() => {
        const handleOpenTemplates = () => {
            // Dispatch to other components
            window.dispatchEvent(new CustomEvent('show-template-selector'));
        };

        window.addEventListener('open-templates', handleOpenTemplates);
        return () => window.removeEventListener('open-templates', handleOpenTemplates);
    }, []);

    const showHelp = useCallback(() => setIsHelpOpen(true), []);
    const hideHelp = useCallback(() => setIsHelpOpen(false), []);

    const value = useMemo(() => ({
        showHelp,
        hideHelp,
        isHelpOpen,
        shortcuts
    }), [showHelp, hideHelp, isHelpOpen, shortcuts]);

    return (
        <ShortcutsContext.Provider value={value}>
            {children}
            <ShortcutsHelp
                isOpen={isHelpOpen}
                onClose={hideHelp}
            />
        </ShortcutsContext.Provider>
    );
}

export default GlobalShortcutsProvider;
