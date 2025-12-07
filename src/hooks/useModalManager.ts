import { useState } from 'react';

type ModalName = 'save' | 'template' | 'gantt' | 'catalog';

interface ModalState {
    save: boolean;
    template: boolean;
    gantt: boolean;
    catalog: boolean;
}

interface UseModalManagerResult {
    modals: ModalState;
    openModal: (name: ModalName) => void;
    closeModal: (name: ModalName) => void;
    toggleModal: (name: ModalName) => void;
}

/**
 * Hook для управления модальными окнами
 */
export function useModalManager(): UseModalManagerResult {
    const [modals, setModals] = useState<ModalState>({
        save: false,
        template: false,
        gantt: false,
        catalog: false,
    });

    const openModal = (name: ModalName): void => {
        setModals(prev => ({ ...prev, [name]: true }));
    };

    const closeModal = (name: ModalName): void => {
        setModals(prev => ({ ...prev, [name]: false }));
    };

    const toggleModal = (name: ModalName): void => {
        setModals(prev => ({ ...prev, [name]: !prev[name] }));
    };

    return {
        modals,
        openModal,
        closeModal,
        toggleModal
    };
}
