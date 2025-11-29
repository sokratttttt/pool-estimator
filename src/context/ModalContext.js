'use client';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
    const [modals, setModals] = useState([]);

    // Open modal
    const openModal = useCallback((id, props = {}) => {
        setModals(prev => {
            // Check if modal already exists
            const existing = prev.find(m => m.id === id);
            if (existing) {
                // Update props
                return prev.map(m => m.id === id ? { ...m, ...props, isOpen: true } : m);
            }
            // Add new modal
            return [...prev, { id, ...props, isOpen: true }];
        });
    }, []);

    // Close modal
    const closeModal = useCallback((id) => {
        setModals(prev => prev.map(m => m.id === id ? { ...m, isOpen: false } : m));

        // Remove after animation
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
    const toggleModal = useCallback((id, props = {}) => {
        setModals(prev => {
            const existing = prev.find(m => m.id === id);
            if (existing) {
                return prev.map(m => m.id === id ? { ...m, isOpen: !m.isOpen } : m);
            }
            return [...prev, { id, ...props, isOpen: true }];
        });
    }, []);

    // Check if modal is open
    const isModalOpen = useCallback((id) => {
        const modal = modals.find(m => m.id === id);
        return modal?.isOpen || false;
    }, [modals]);

    const value = useMemo(() => ({
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
