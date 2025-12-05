'use client';
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ModalContextType, ModalState } from '@/types/modal';

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [modals, setModals] = useState<ModalState[]>([]);

    // Open modal
    const openModal = useCallback((id: string, props: Record<string, any> = {}) => {
        setModals(prev => {
            const existing = prev.find(m => m.id === id);
            if (existing) {
                return prev.map(m => m.id === id ? { ...m, ...props, isOpen: true } : m);
            }
            return [...prev, { id, ...props, isOpen: true }];
        });
    }, []);

    // Close modal
    const closeModal = useCallback((id: string) => {
        setModals(prev => prev.map(m => m.id === id ? { ...m, isOpen: false } : m));

        setTimeout(() => {
            setModals(prev => prev.filter(m => m.id !== id));
        }, 300);
    }, []);

    // Close all modals
    const closeAllModals = useCallback(() => {
        setModals(prev => prev.map(m => ({ ...m, isOpen: false })));

        setTimeout(() => {
            setModals([]);
        }, 300);
    }, []);

    // Toggle modal
    const toggleModal = useCallback((id: string, props: Record<string, any> = {}) => {
        setModals(prev => {
            const existing = prev.find(m => m.id === id);
            if (existing) {
                return prev.map(m => m.id === id ? { ...m, isOpen: !m.isOpen } : m);
            }
            return [...prev, { id, ...props, isOpen: true }];
        });
    }, []);

    // Check if modal is open
    const isModalOpen = useCallback((id: string): boolean => {
        const modal = modals.find(m => m.id === id);
        return modal?.isOpen || false;
    }, [modals]);

    const value: ModalContextType = useMemo(() => ({
        modals,
        openModal,
        closeModal,
        closeAllModals,
        toggleModal,
        isModalOpen
    }), [modals, openModal, closeModal, closeAllModals, toggleModal, isModalOpen]);

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within ModalProvider');
    }
    return context;
}
