// TODO: Add proper TypeScript types for state
import { useState } from 'react';

/**
 * Hook для управления модальными окнами
 * @returns {Object} Состояние и методы управления модалами
 */
export function useModalManager(): any {
    const [modals, setModals] = useState({
        save: false,
        template: false,
        gantt: false,
        catalog: false,
    });

    const openModal = (name: any) => {
        setModals(prev => ({ ...prev, [name]: true }));
    };

    const closeModal = (name: any) => {
        setModals(prev => ({ ...prev, [name]: false }));
    };

    const toggleModal = (name: any) => {
        setModals(prev => ({ ...prev, [name]: !prev[name] }));
    };

    return {
        modals,
        openModal,
        closeModal,
        toggleModal
    };
}
