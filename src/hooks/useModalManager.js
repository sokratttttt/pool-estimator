import { useState } from 'react';

/**
 * Hook для управления модальными окнами
 * @returns {Object} Состояние и методы управления модалами
 */
export function useModalManager() {
    const [modals, setModals] = useState({
        save: false,
        template: false,
        gantt: false,
        catalog: false,
    });

    const openModal = (name) => {
        setModals(prev => ({ ...prev, [name]: true }));
    };

    const closeModal = (name) => {
        setModals(prev => ({ ...prev, [name]: false }));
    };

    const toggleModal = (name) => {
        setModals(prev => ({ ...prev, [name]: !prev[name] }));
    };

    return {
        modals,
        openModal,
        closeModal,
        toggleModal
    };
}
